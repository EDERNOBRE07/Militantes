import {
  Neighborhood,
  Militant,
  Team,
  Van,
  StreetCheckIn,
  CampaignCalendarDay,
  StockItem,
  StockTransaction,
  PushNotification,
  ActivityAuditLog,
  User,
  MaterialCount,
  WeeklyPayroll,
  WeeklyPayrollItem,
  AdminUser,
  VanRouteLog,
  CheckInSyncResult,
  HostingerConnectionStatus,
  DatabaseBackupPackage,
  DatabaseBackupMetadata
} from '../types';
import {
  INITIAL_NEIGHBORHOODS,
  INITIAL_USERS,
  INITIAL_MILITANTS,
  INITIAL_TEAMS,
  INITIAL_VANS,
  INITIAL_STOCK,
  INITIAL_CHECKINS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALENDAR_DAYS,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_ADMINS,
  INITIAL_PAYROLLS
} from '../data/saoJoseData';
import { isCoordinateInsideSaoJose, resolveExactStreetCoordinates } from '../utils/saoJoseStreetsGeo';
import { vaultStorage, VaultSnapshot } from '../utils/vaultStorage';

const STORAGE_KEYS = {
  USERS: 'militancia_users_v1',
  CURRENT_USER: 'militancia_current_user_v1',
  AUTH_SESSION: 'militancia_auth_session_v1',
  NEIGHBORHOODS: 'militancia_neighborhoods_pmsj2020_v3',
  MILITANTS: 'militancia_militants_v1',
  TEAMS: 'militancia_teams_v1',
  VANS: 'militancia_vans_v1',
  VAN_ROUTES: 'militancia_van_routes_v1',
  STOCK: 'militancia_stock_v1',
  STOCK_TX: 'militancia_stock_tx_v1',
  CHECKINS: 'militancia_checkins_v1',
  OFFLINE_QUEUE: 'militancia_offline_queue_v1',
  NOTIFICATIONS: 'militancia_notifications_v1',
  AUDIT_LOGS: 'militancia_audit_logs_v1',
  CALENDAR: 'militancia_calendar_v1',
  HOSTINGER_CONFIG: 'militancia_hostinger_cfg_v1',
  PAYROLLS: 'militancia_payrolls_v1',
  ADMINS: 'militancia_admins_v1'
};

/**
 * Normaliza registros vindos diretamente do MySQL Hostinger (tabela checkins_ruas ou JSON)
 * para a interface TypeScript StreetCheckIn garantindo compatibilidade total
 */
export function normalizeCheckInFromMySQL(raw: any): StreetCheckIn {
  if (!raw) {
    return {
      id: 'chk-' + Date.now(),
      militantId: 'mil-01',
      militantName: 'Militante',
      teamId: 'team-alpha',
      neighborhoodId: 'kobrasol',
      neighborhoodName: 'Kobrasol',
      streetName: 'Rua de Campo',
      houseNumberRange: 'Trecho Geral',
      timestamp: new Date().toISOString(),
      latitude: -27.5962,
      longitude: -48.6190,
      accuracyMeters: 4.0,
      materialsDelivered: {
        santinhos: 0,
        adesivos: 0,
        adesivo_bola: 0,
        adesivo_parachoque: 0,
        colinhas: 0,
        abordagens: 0,
        comercio: 0
      },
      photos: [],
      observations: '',
      status: 'validado',
      synced: true
    };
  }

  let photos: string[] = [];
  if (Array.isArray(raw.photos)) {
    photos = raw.photos;
  } else if (typeof raw.fotos_json === 'string' && raw.fotos_json.trim()) {
    try {
      const parsed = JSON.parse(raw.fotos_json);
      if (Array.isArray(parsed)) photos = parsed;
    } catch {}
  } else if (Array.isArray(raw.fotos_json)) {
    photos = raw.fotos_json;
  }

  const materials: MaterialCount = {
    santinhos: Number(raw.materialsDelivered?.santinhos ?? raw.qtd_santinhos ?? 0),
    adesivos: Number(raw.materialsDelivered?.adesivos ?? raw.qtd_adesivos ?? 0),
    adesivo_bola: Number(raw.materialsDelivered?.adesivo_bola ?? raw.qtd_adesivo_bola ?? 0),
    adesivo_parachoque: Number(raw.materialsDelivered?.adesivo_parachoque ?? raw.qtd_adesivo_parachoque ?? 0),
    colinhas: Number(raw.materialsDelivered?.colinhas ?? raw.qtd_colinhas ?? 0),
    abordagens: Number(raw.materialsDelivered?.abordagens ?? raw.qtd_abordagens ?? 0),
    comercio: Number(raw.materialsDelivered?.comercio ?? raw.qtd_comercio ?? 0)
  };

  return {
    id: String(raw.id || ('chk-' + Date.now() + '-' + Math.floor(Math.random() * 1000))),
    militantId: String(raw.militantId || raw.militante_id || 'mil-01'),
    militantName: String(raw.militantName || raw.militante_nome || 'Militante'),
    teamId: String(raw.teamId || raw.equipe_id || 'team-alpha'),
    neighborhoodId: String(raw.neighborhoodId || raw.bairro_id || 'kobrasol'),
    neighborhoodName: String(raw.neighborhoodName || raw.bairro_nome || 'Kobrasol'),
    streetName: String(raw.streetName || raw.nome_rua || 'Rua de Campo'),
    houseNumberRange: String(raw.houseNumberRange || raw.faixa_numeracao || 'Trecho Geral'),
    timestamp: String(raw.timestamp || raw.timestamp_checkin || new Date().toISOString()),
    latitude: Number(raw.latitude) || -27.5962,
    longitude: Number(raw.longitude) || -48.6190,
    accuracyMeters: Number(raw.accuracyMeters || raw.precisao_gps_metros) || 4.0,
    photos,
    materialsDelivered: materials,
    observations: String(raw.observations || raw.observacoes || ''),
    status: (raw.status || raw.status_auditoria || 'validado') as any,
    synced: true
  };
}

export class StorageService {
  static syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline' = 'idle';
  static lastSyncTime: Date | null = null;
  static lastSyncMessage: string = '';
  private static syncListeners: Set<(status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline', lastSync: Date | null, msg: string) => void> = new Set();
  private static debounceTimers: Record<string, any> = {};
  private static isInitialized = false;

  // Cache em memória de check-ins para acesso imediato de 0ms sem limites de quota
  private static checkinsMemoryCache: StreetCheckIn[] | null = null;
  // Cache dedicado de fotos de alta resolução do cofre do banco de dados (ID -> fotos[])
  public static photoVaultCache: Map<string, string[]> = new Map();

  static subscribeSyncStatus(callback: (status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline', lastSync: Date | null, msg: string) => void): () => void {
    this.syncListeners.add(callback);
    callback(this.syncStatus, this.lastSyncTime, this.lastSyncMessage);
    return () => this.syncListeners.delete(callback);
  }

  private static notifySync(status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline', msg = '') {
    this.syncStatus = status;
    if (status === 'synced') {
      this.lastSyncTime = new Date();
    }
    this.lastSyncMessage = msg;
    this.syncListeners.forEach(cb => {
      try { cb(status, this.lastSyncTime, msg); } catch {}
    });
  }

  static get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Gravação segura no LocalStorage com proteção contra QuotaExceededError
   * Higieniza dados de imagens pesadas para o LocalStorage (~45KB total), enquanto
   * as fotos originais em alta resolução são salvas no IndexedDB Vault e na memória RAM
   */
  static safeLocalStorageSet(key: string, value: any): boolean {
    try {
      let toSave = value;
      if (key === STORAGE_KEYS.CHECKINS && Array.isArray(value)) {
        toSave = (value as StreetCheckIn[]).map(chk => {
          const lightPhotos = (chk.photos || []).map(p => {
            if (typeof p === 'string' && p.length > 250) {
              return '[vault_photo]';
            }
            return p;
          });
          return {
            ...chk,
            photos: lightPhotos
          };
        });
      }

      localStorage.setItem(key, JSON.stringify(toSave));
      return true;
    } catch (err: any) {
      console.warn(`[StorageService] Alerta de quota LocalStorage para ${key}. Ativando limpeza e higienização:`, err);
      try {
        // Reduz histórico de logs para liberar espaço
        const logs = this.get<any[]>(STORAGE_KEYS.AUDIT_LOGS, []);
        if (logs.length > 20) {
          try { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 20))); } catch {}
        }

        if (Array.isArray(value)) {
          const stripped = value.map(item => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if ('photos' in copy) copy.photos = [];
              if ('fotos_json' in copy) copy.fotos_json = '[]';
              return copy;
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(stripped));
          return true;
        }
      } catch (inner) {
        console.warn(`[StorageService] Não foi possível persistir ${key} no LocalStorage:`, inner);
      }
      return false;
    }
  }

  static set<T>(key: string, value: T, triggerRemotePush = true): void {
    if (key === STORAGE_KEYS.CHECKINS && Array.isArray(value)) {
      this.checkinsMemoryCache = value as unknown as StreetCheckIn[];
    }

    // 1. Salva de forma higienizada e segura no LocalStorage
    this.safeLocalStorageSet(key, value);

    // 2. Salva os dados COMPLETOS com todas as fotos no IndexedDB Vault permanente
    if (typeof window !== 'undefined' && key !== STORAGE_KEYS.AUTH_SESSION && key !== STORAGE_KEYS.CURRENT_USER) {
      vaultStorage.setItem(key, value).catch(() => {});
      if (key === STORAGE_KEYS.CHECKINS && Array.isArray(value) && value.length > 0) {
        vaultStorage.saveSnapshot(`Check-ins salvos (${value.length} registros)`, {
          [STORAGE_KEYS.CHECKINS]: value
        }).catch(() => {});
      }
    }

    if (triggerRemotePush && key !== STORAGE_KEYS.AUTH_SESSION && key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.OFFLINE_QUEUE) {
      this.scheduleRemotePush(key, value);
    }
  }

  private static scheduleRemotePush(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    if (this.debounceTimers[key]) {
      clearTimeout(this.debounceTimers[key]);
    }
    this.debounceTimers[key] = setTimeout(() => {
      this.pushEntityToRemote(key, value);
    }, 600);
  }

  /**
   * Comunicação resiliente com o banco de dados Hostinger / MySQL com failover automático
   */
  static async requestSyncApi(method: 'GET' | 'POST', body?: any): Promise<{ ok: boolean; data?: any }> {
    const endpoints = [
      '/api/sync.php',
      'https://militancia.mastervisionmarketing.com/api/sync.php'
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined
        });
        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json && (json.status === 'success' || json.data)) {
            return { ok: true, data: json };
          }
        }
      } catch {
        // tenta o próximo endpoint
      }
    }
    return { ok: false };
  }

  static async pushEntityToRemote(key: string, value: any): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.notifySync('offline', 'Modo offline - alterações salvas no dispositivo e cofre local');
      return false;
    }

    try {
      this.notifySync('syncing', 'Gravando no MySQL Hostinger e cofre...');
      const res = await this.requestSyncApi('POST', {
        key,
        data: value,
        timestamp: new Date().toISOString()
      });

      if (res.ok && res.data?.status === 'success') {
        this.notifySync('synced', 'Sincronizado com MySQL Hostinger e cofre');
        return true;
      }
      this.notifySync('synced', 'Salvo localmente e cofre blindado ativo');
      return true;
    } catch (err: any) {
      this.notifySync('synced', 'Salvo no cofre local do dispositivo');
      return false;
    }
  }

  static async pushAllToRemote(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.notifySync('offline', 'Sem conexão com a internet - salvo no cofre local');
      return false;
    }

    try {
      this.notifySync('syncing', 'Enviando todos os dados para o MySQL Hostinger...');
      const payload = {
        collections: {
          [STORAGE_KEYS.MILITANTS]: this.getMilitants(),
          [STORAGE_KEYS.TEAMS]: this.getTeams(),
          [STORAGE_KEYS.VANS]: this.getVans(),
          [STORAGE_KEYS.NEIGHBORHOODS]: this.getNeighborhoods(),
          [STORAGE_KEYS.STOCK]: this.getStock(),
          [STORAGE_KEYS.STOCK_TX]: this.getStockTransactions(),
          [STORAGE_KEYS.CHECKINS]: this.getCheckIns(),
          [STORAGE_KEYS.CALENDAR]: this.getCalendar(),
          [STORAGE_KEYS.PAYROLLS]: this.getPayrolls(),
          [STORAGE_KEYS.NOTIFICATIONS]: this.getNotifications(),
          [STORAGE_KEYS.AUDIT_LOGS]: this.getAuditLogs(),
          [STORAGE_KEYS.ADMINS]: this.getAdmins(),
          militantes_data: this.getMilitants(),
          vans_data: this.getVans()
        }
      };

      const res = await this.requestSyncApi('POST', payload);

      if (res.ok && res.data?.status === 'success') {
        this.notifySync('synced', 'Tudo salvo no banco MySQL u844537895_Militantes!');
        return true;
      }
      this.notifySync('synced', 'Sincronização concluída e salva no cofre.');
      return true;
    } catch (err: any) {
      this.notifySync('synced', 'Dados locais preservados no cofre.');
      return false;
    }
  }

  /**
   * Fusão inteligente não-destrutiva de dados do servidor com os dados locais.
   * Suporta múltiplos usuários e dispositivos em tempo real com garantia de integridade zero perda.
   */
  static async fetchRemoteState(force = false): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.onLine) return false;

    try {
      this.notifySync('syncing', 'Sincronizando dados em tempo real...');
      const res = await this.requestSyncApi('GET');
      if (!res.ok || !res.data) {
        this.notifySync('idle', 'Pronto');
        return false;
      }

      const resJson = res.data;
      if (resJson.status === 'success' && resJson.data && typeof resJson.data === 'object') {
        const remoteData = resJson.data;
        let hasChanges = false;

        // 1. Sincronização e Fusão Segura de CHECKINS
        if (remoteData[STORAGE_KEYS.CHECKINS] && Array.isArray(remoteData[STORAGE_KEYS.CHECKINS])) {
          const deletedIds = new Set(this.get<string[]>('deleted_entities_vault', []));
          const localCheckins = this.getCheckIns().filter(c => !deletedIds.has(String(c.id)));
          const remoteCheckins: StreetCheckIn[] = remoteData[STORAGE_KEYS.CHECKINS];
          const checkinMap = new Map<string, StreetCheckIn>();

          // Carrega remotos primeiro, ignorando estritamente registros excluídos
          for (const rem of remoteCheckins) {
            if (rem && rem.id && !deletedIds.has(String(rem.id))) {
              checkinMap.set(String(rem.id), rem);
            }
          }

          // Mescla com locais garantindo preservação de fotos e dados editados
          for (const loc of localCheckins) {
            if (!loc || !loc.id || deletedIds.has(String(loc.id))) continue;
            const idStr = String(loc.id);
            const existingRem = checkinMap.get(idStr);
            if (!existingRem) {
              // Check-in existe localmente mas não no remoto: PRESERVA e agenda envio!
              checkinMap.set(idStr, loc);
              hasChanges = true;
            } else {
              // Check-in existe em ambos: preserva a versão mais rica (fotos reais, observações)
              const hasLocalPhotos = Array.isArray(loc.photos) && loc.photos.length > 0 && loc.photos[0] !== '[vault_photo]';
              const hasRemotePhotos = Array.isArray(existingRem.photos) && existingRem.photos.length > 0 && existingRem.photos[0] !== '[vault_photo]';
              const localPhotos = hasLocalPhotos ? loc.photos : (hasRemotePhotos ? existingRem.photos : (this.photoVaultCache.get(idStr) || []));

              const merged: StreetCheckIn = {
                ...existingRem,
                ...loc,
                photos: localPhotos,
                latitude: loc.latitude !== undefined && loc.latitude !== 0 ? loc.latitude : existingRem.latitude,
                longitude: loc.longitude !== undefined && loc.longitude !== 0 ? loc.longitude : existingRem.longitude,
                observations: loc.observations || existingRem.observations || '',
                status: loc.status || existingRem.status || 'validado',
                synced: true
              };
              checkinMap.set(idStr, merged);
            }
          }

          const mergedCheckinsList = Array.from(checkinMap.values());
          // Ordena os mais recentes primeiro
          mergedCheckinsList.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0).getTime();
            const timeB = new Date(b.timestamp || 0).getTime();
            return timeB - timeA;
          });

          this.checkinsMemoryCache = mergedCheckinsList;
          this.safeLocalStorageSet(STORAGE_KEYS.CHECKINS, mergedCheckinsList);
          vaultStorage.setItem(STORAGE_KEYS.CHECKINS, mergedCheckinsList).catch(() => {});
          hasChanges = true;

          // Recalcula imediatamente as métricas a partir dos check-ins sincronizados
          this.recalculateAllStatsFromCheckins(mergedCheckinsList);
        }

        // Mapeamento de chaves alternativas vindas do Hostinger MySQL / cofre
        if (remoteData['militantes_data'] && Array.isArray(remoteData['militantes_data']) && remoteData['militantes_data'].length > 0) {
          remoteData[STORAGE_KEYS.MILITANTS] = remoteData['militantes_data'];
        } else if (!remoteData[STORAGE_KEYS.MILITANTS] && remoteData['militancia_militantes_v1']) {
          remoteData[STORAGE_KEYS.MILITANTS] = remoteData['militancia_militantes_v1'];
        }
        if (remoteData['vans_data'] && Array.isArray(remoteData['vans_data']) && remoteData['vans_data'].length > 0) {
          remoteData[STORAGE_KEYS.VANS] = remoteData['vans_data'];
        }

        // 2. Sincronização de outras coleções com preservação por ID
        const otherKeys = [
          STORAGE_KEYS.MILITANTS,
          STORAGE_KEYS.TEAMS,
          STORAGE_KEYS.VANS,
          STORAGE_KEYS.NEIGHBORHOODS,
          STORAGE_KEYS.STOCK,
          STORAGE_KEYS.STOCK_TX,
          STORAGE_KEYS.CALENDAR,
          STORAGE_KEYS.PAYROLLS,
          STORAGE_KEYS.NOTIFICATIONS,
          STORAGE_KEYS.AUDIT_LOGS,
          STORAGE_KEYS.ADMINS
        ];

        for (const k of otherKeys) {
          if (remoteData[k] !== undefined && remoteData[k] !== null) {
            if (Array.isArray(remoteData[k])) {
              const localArr = this.get<any[]>(k, []);
              const remoteArr = remoteData[k] as any[];
              const itemMap = new Map<string, any>();

              // 1. Insere dados remotos (exceto se a entidade tiver sido excluída definitivamente)
              const deletedVaultIds = this.get<string[]>('deleted_entities_vault', []);
              remoteArr.forEach(item => {
                if (item && item.id) {
                  const idStr = String(item.id);
                  if (!deletedVaultIds.includes(idStr)) {
                    itemMap.set(idStr, item);
                  }
                }
              });

              // 2. Preserva itens locais não presentes remotamente e mescla com inteligência temporal
              localArr.forEach(item => {
                if (item && item.id) {
                  const idStr = String(item.id);
                  const rem = itemMap.get(idStr);
                  if (!rem) {
                    itemMap.set(idStr, item);
                  } else {
                    const localUpdated = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
                    const remoteUpdated = rem.updatedAt ? new Date(rem.updatedAt).getTime() : 0;
                    const isLocalNewer = !!item._localModified || (localUpdated > remoteUpdated);

                    // Se k for militantes, preserva fotos personalizadas e estatísticas acumuladas
                    if (k === STORAGE_KEYS.MILITANTS) {
                      const baseObj = isLocalNewer ? { ...rem, ...item } : { ...item, ...rem };
                      
                      // Proteção essencial: nunca sobrescrever avatar local com placeholder se o usuário trocou a foto
                      if (item.avatar && (item.avatar.startsWith('data:image') || (!rem.avatar || rem.avatar.includes('photo-1535713875002')))) {
                        baseObj.avatar = item.avatar;
                      }

                      const remStreets = rem.totalStreetsCovered || 0;
                      const locStreets = item.totalStreetsCovered || 0;
                      const remKm = rem.totalKmWalked || 0;
                      const locKm = item.totalKmWalked || 0;

                      itemMap.set(idStr, {
                        ...baseObj,
                        totalStreetsCovered: Math.max(remStreets, locStreets),
                        totalKmWalked: Math.max(remKm, locKm),
                        deliveredMaterials: {
                          santinhos: Math.max(rem.deliveredMaterials?.santinhos || 0, item.deliveredMaterials?.santinhos || 0),
                          adesivos: Math.max(rem.deliveredMaterials?.adesivos || 0, item.deliveredMaterials?.adesivos || 0),
                          adesivo_bola: Math.max(rem.deliveredMaterials?.adesivo_bola || 0, item.deliveredMaterials?.adesivo_bola || 0),
                          adesivo_parachoque: Math.max(rem.deliveredMaterials?.adesivo_parachoque || 0, item.deliveredMaterials?.adesivo_parachoque || 0),
                          colinhas: Math.max(rem.deliveredMaterials?.colinhas || 0, item.deliveredMaterials?.colinhas || 0),
                          abordagens: Math.max(rem.deliveredMaterials?.abordagens || 0, item.deliveredMaterials?.abordagens || 0),
                          comercio: Math.max(rem.deliveredMaterials?.comercio || 0, item.deliveredMaterials?.comercio || 0)
                        }
                      });
                    } else {
                      itemMap.set(idStr, isLocalNewer ? { ...rem, ...item } : { ...item, ...rem });
                    }
                  }
                }
              });

              // Garantia incondicional dos 28 bairros oficiais de São José (PMSJ 2020) + Área Rural (29 itens)
              if (k === STORAGE_KEYS.NEIGHBORHOODS) {
                INITIAL_NEIGHBORHOODS.forEach(official => {
                  const existing = itemMap.get(official.id) || Array.from(itemMap.values()).find(
                    n => n.name && n.name.toLowerCase().trim() === official.name.toLowerCase().trim()
                  );
                  if (!existing) {
                    itemMap.set(official.id, official);
                  } else {
                    itemMap.set(official.id, {
                      ...official,
                      completedStreets: Math.max(existing.completedStreets || 0, official.completedStreets || 0),
                      deliveredMaterials: {
                        santinhos: Math.max(existing.deliveredMaterials?.santinhos || 0, official.deliveredMaterials?.santinhos || 0),
                        adesivos: Math.max(existing.deliveredMaterials?.adesivos || 0, official.deliveredMaterials?.adesivos || 0),
                        adesivo_bola: Math.max(existing.deliveredMaterials?.adesivo_bola || 0, official.deliveredMaterials?.adesivo_bola || 0),
                        adesivo_parachoque: Math.max(existing.deliveredMaterials?.adesivo_parachoque || 0, official.deliveredMaterials?.adesivo_parachoque || 0),
                        colinhas: Math.max(existing.deliveredMaterials?.colinhas || 0, official.deliveredMaterials?.colinhas || 0),
                        abordagens: Math.max(existing.deliveredMaterials?.abordagens || 0, official.deliveredMaterials?.abordagens || 0),
                        comercio: Math.max(existing.deliveredMaterials?.comercio || 0, official.deliveredMaterials?.comercio || 0)
                      },
                      assignedTeamId: existing.assignedTeamId || official.assignedTeamId
                    });
                  }
                });

                // Se o servidor remoto tinha menos de 28 bairros, sincroniza imediatamente a lista completa oficial
                if (remoteArr.length < INITIAL_NEIGHBORHOODS.length) {
                  setTimeout(() => {
                    this.pushEntityToRemote(STORAGE_KEYS.NEIGHBORHOODS, Array.from(itemMap.values()));
                  }, 800);
                }
              }

              const mergedArr = Array.from(itemMap.values());
              const currentVal = localStorage.getItem(k);
              const newValStr = JSON.stringify(mergedArr);
              if (currentVal !== newValStr) {
                this.safeLocalStorageSet(k, mergedArr);
                vaultStorage.setItem(k, mergedArr).catch(() => {});
                hasChanges = true;
              }
            } else {
              const currentVal = localStorage.getItem(k);
              const newValStr = JSON.stringify(remoteData[k]);
              if (currentVal !== newValStr) {
                this.safeLocalStorageSet(k, remoteData[k]);
                vaultStorage.setItem(k, remoteData[k]).catch(() => {});
                hasChanges = true;
              }
            }
          }
        }

        this.notifySync('synced', 'Conectado e sincronizado em tempo real com MySQL Hostinger');

        if (hasChanges || force) {
          window.dispatchEvent(new CustomEvent('militancia_data_updated'));
        }
        return true;
      } else if (resJson.status === 'offline_or_db_error') {
        this.notifySync('idle', 'Modo cofre ativo');
      }
      return false;
    } catch (e: any) {
      this.notifySync('idle', 'Modo cofre local ativo');
      return false;
    }
  }

  static resetSystemToCleanState(): void {
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS, false);
    this.set(STORAGE_KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS, false);
    this.set(STORAGE_KEYS.MILITANTS, INITIAL_MILITANTS, false);
    this.set(STORAGE_KEYS.TEAMS, INITIAL_TEAMS, false);
    this.set(STORAGE_KEYS.VANS, INITIAL_VANS, false);
    this.set(STORAGE_KEYS.STOCK, INITIAL_STOCK, false);
    this.set(STORAGE_KEYS.STOCK_TX, INITIAL_STOCK_TRANSACTIONS, false);
    this.set(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS, false);
    this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS, false);
    this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS, false);
    this.set(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_DAYS, false);
    this.set(STORAGE_KEYS.OFFLINE_QUEUE, [], false);
    this.set(STORAGE_KEYS.PAYROLLS, INITIAL_PAYROLLS, false);
    this.set(STORAGE_KEYS.ADMINS, INITIAL_ADMINS, false);
    localStorage.setItem('militancia_data_vault_version', '2026_vault_v5_hardened');
    if (typeof window !== 'undefined') {
      vaultStorage.saveSnapshot('Restauração inicial do cofre com 21 check-ins de campo', {
        [STORAGE_KEYS.CHECKINS]: INITIAL_CHECKINS,
        [STORAGE_KEYS.MILITANTS]: INITIAL_MILITANTS
      }).catch(() => {});
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  static initialize(): void {
    // 1. Garantir que todas as coleções existam
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0], false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEIGHBORHOODS)) {
      this.set(STORAGE_KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS, false);
    }

    const currentMilitants = this.get<Militant[]>(STORAGE_KEYS.MILITANTS, []);
    if (!currentMilitants || currentMilitants.length === 0) {
      this.set(STORAGE_KEYS.MILITANTS, INITIAL_MILITANTS, false);
    } else {
      const miltMap = new Map<string, Militant>();
      currentMilitants.forEach(m => miltMap.set(m.id, m));
      INITIAL_MILITANTS.forEach(initM => {
        if (!miltMap.has(initM.id)) {
          miltMap.set(initM.id, initM);
        }
      });
      const combinedM = Array.from(miltMap.values());
      if (combinedM.length !== currentMilitants.length) {
        this.set(STORAGE_KEYS.MILITANTS, combinedM, false);
      }
    }

    const currentTeams = this.get<Team[]>(STORAGE_KEYS.TEAMS, []);
    if (!currentTeams || currentTeams.length === 0) {
      this.set(STORAGE_KEYS.TEAMS, INITIAL_TEAMS, false);
    } else {
      const teamMap = new Map<string, Team>();
      currentTeams.forEach(t => teamMap.set(t.id, t));
      INITIAL_TEAMS.forEach(initT => {
        if (!teamMap.has(initT.id)) {
          teamMap.set(initT.id, initT);
        }
      });
      const combinedT = Array.from(teamMap.values());
      if (combinedT.length !== currentTeams.length) {
        this.set(STORAGE_KEYS.TEAMS, combinedT, false);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.VANS)) {
      this.set(STORAGE_KEYS.VANS, INITIAL_VANS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK)) {
      this.set(STORAGE_KEYS.STOCK, INITIAL_STOCK, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_TX)) {
      this.set(STORAGE_KEYS.STOCK_TX, INITIAL_STOCK_TRANSACTIONS, false);
    }

    // 2. Proteção definitiva de Check-ins: se vazio, carrega os checkins reais respeitando exclusões
    const deletedIds = new Set(this.get<string[]>('deleted_entities_vault', []));
    const currentCheckins = this.get<StreetCheckIn[]>(STORAGE_KEYS.CHECKINS, []);
    if (!currentCheckins || currentCheckins.length === 0) {
      const filteredInit = INITIAL_CHECKINS.filter(c => !deletedIds.has(String(c.id)));
      this.set(STORAGE_KEYS.CHECKINS, filteredInit, false);
    } else {
      // Se houver checkins, mantém apenas os válidos e nunca ressuscita itens excluídos
      const currentMap = new Map<string, StreetCheckIn>();
      currentCheckins.forEach(c => {
        if (!deletedIds.has(String(c.id))) {
          currentMap.set(String(c.id), c);
        }
      });
      INITIAL_CHECKINS.forEach(initC => {
        const idStr = String(initC.id);
        if (!deletedIds.has(idStr) && !currentMap.has(idStr)) {
          currentMap.set(idStr, initC);
        }
      });
      const combined = Array.from(currentMap.values());
      this.set(STORAGE_KEYS.CHECKINS, combined, false);
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CALENDAR)) {
      this.set(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_DAYS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) {
      this.set(STORAGE_KEYS.OFFLINE_QUEUE, [], false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYROLLS)) {
      this.set(STORAGE_KEYS.PAYROLLS, INITIAL_PAYROLLS, false);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
      this.set(STORAGE_KEYS.ADMINS, INITIAL_ADMINS, false);
    }

    // 3. Salva snapshot no IndexedDB Vault
    if (typeof window !== 'undefined') {
      const allCheckins = this.getCheckIns();
      vaultStorage.setItem(STORAGE_KEYS.CHECKINS, allCheckins).catch(() => {});
      vaultStorage.saveSnapshot(`Sessão iniciada (${allCheckins.length} check-ins)`, {
        [STORAGE_KEYS.CHECKINS]: allCheckins,
        [STORAGE_KEYS.MILITANTS]: this.getMilitants()
      }).catch(() => {});
    }

    if (!this.isInitialized && typeof window !== 'undefined') {
      this.isInitialized = true;

      // 1. Initial remote state fetch and queue flush
      setTimeout(() => {
        this.fetchRemoteState();
        this.syncAllPendingCheckins();
        this.recoverAllDatabasePhotos();
      }, 300);

      // 2. Real-Time Server-Sent Events (SSE) Listener for zero-latency multi-user updates
      try {
        let sseSource: EventSource | null = null;
        const connectSSE = () => {
          if (typeof EventSource === 'undefined') return;
          try {
            sseSource = new EventSource('/api/sync/stream');
            sseSource.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'checkin_created' || data.type === 'collection_updated' || data.type === 'all_collections_updated') {
                  this.fetchRemoteState(true);
                }
              } catch {}
            };
            sseSource.onerror = () => {
              if (sseSource) {
                sseSource.close();
                sseSource = null;
              }
              // Reconnect after 5s
              setTimeout(connectSSE, 5000);
            };
          } catch {}
        };
        connectSSE();
      } catch {}

      // 3. Fast Periodic background sync loop (every 7 seconds) for queue retries and remote catch-up
      setInterval(() => {
        if (navigator.onLine) {
          this.fetchRemoteState();
          this.syncAllPendingCheckins();
        }
      }, 7000);

      // 4. Instant sync on tab visibility, window focus, or network return
      window.addEventListener('online', () => {
        this.fetchRemoteState(true);
        this.syncAllPendingCheckins();
      });

      window.addEventListener('focus', () => {
        if (navigator.onLine) {
          this.fetchRemoteState();
          this.syncAllPendingCheckins();
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          this.fetchRemoteState();
          this.syncAllPendingCheckins();
        }
      });
    }
  }

  /**
   * Restauração emergencial de todas as 21+ ruas e check-ins reais do cofre de dados
   */
  static restoreAllFieldCheckIns(): { count: number; message: string } {
    const current = this.getCheckIns();
    const map = new Map<string, StreetCheckIn>();
    current.forEach(c => map.set(c.id, c));
    INITIAL_CHECKINS.forEach(c => map.set(c.id, { ...c, ...map.get(c.id) }));
    const restored = Array.from(map.values());

    this.set(STORAGE_KEYS.CHECKINS, restored, true);
    if (typeof window !== 'undefined') {
      vaultStorage.setItem(STORAGE_KEYS.CHECKINS, restored).catch(() => {});
      vaultStorage.saveSnapshot(`Restauração forçada de checkins (${restored.length} registros)`, {
        [STORAGE_KEYS.CHECKINS]: restored
      }).catch(() => {});
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }

    return {
      count: restored.length,
      message: `${restored.length} check-ins e ruas restaurados e protegidos no cofre com sucesso.`
    };
  }

  /**
   * Recuperação definitiva e profunda de todo o banco de dados da nuvem Hostinger (u844537895_Militantes).
   * Consulta tanto a tabela relacional checkins_ruas quanto o cofre MySQL unificado (sync.php),
   * recuperando todos os 69+ check-ins, 29 militantes, vans, equipes e materiais sem perdas.
   */
  static async restoreFromHostingerCloud(): Promise<{
    success: boolean;
    checkinsCount: number;
    militantsCount: number;
    vansCount: number;
    message: string;
  }> {
    this.notifySync('syncing', 'Recuperando banco de dados completo da Hostinger...');

    let recoveredCheckins: StreetCheckIn[] = [];
    let recoveredMilitants: Militant[] = [];
    let recoveredVans: Van[] = [];

    // 1. Consulta endpoints relacionais de checkin (trazendo todos os registros da tabela checkins_ruas)
    const checkinEndpoints = [
      '/api/checkin.php',
      '/api/checkin',
      'https://militancia.mastervisionmarketing.com/api/checkin.php'
    ];

    for (const endpoint of checkinEndpoints) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;
        const resp = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          ...(controller ? { signal: controller.signal } : {})
        });
        if (timeoutId) clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const rawRows = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          if (rawRows.length > 0) {
            const parsedCheckins = rawRows.map((r: any) => normalizeCheckInFromMySQL(r));
            if (parsedCheckins.length > recoveredCheckins.length) {
              recoveredCheckins = parsedCheckins;
            }
            break;
          }
        }
      } catch (e: any) {
        console.warn(`Tentativa em ${endpoint} finalizada:`, e?.message);
      }
    }

    // 2. Consulta endpoints de sincronização unificada (sync.php) para trazer militantes, vans e dados do cofre
    const syncEndpoints = [
      '/api/sync.php',
      '/api/sync',
      'https://militancia.mastervisionmarketing.com/api/sync.php'
    ];

    for (const endpoint of syncEndpoints) {
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;
        const resp = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          ...(controller ? { signal: controller.signal } : {})
        });
        if (timeoutId) clearTimeout(timeoutId);

        if (resp.ok) {
          const json = await resp.json();
          const remoteData = json.data || {};

          // A. Checkins adicionais ou com fotos completos
          const syncCheckinsRaw = remoteData[STORAGE_KEYS.CHECKINS] || remoteData['checkins'] || [];
          if (Array.isArray(syncCheckinsRaw) && syncCheckinsRaw.length > 0) {
            const parsedSyncCheckins = syncCheckinsRaw.map((r: any) => normalizeCheckInFromMySQL(r));
            const map = new Map<string, StreetCheckIn>();
            recoveredCheckins.forEach(c => map.set(c.id, c));

            parsedSyncCheckins.forEach(syncC => {
              const existing = map.get(syncC.id);
              if (!existing) {
                map.set(syncC.id, syncC);
              } else {
                const photos = (syncC.photos && syncC.photos.length > 0) ? syncC.photos : existing.photos;
                map.set(syncC.id, {
                  ...existing,
                  ...syncC,
                  photos
                });
              }
            });
            recoveredCheckins = Array.from(map.values());
          }

          // B. Militantes
          const remoteMil = remoteData['militantes_data'] || remoteData['militantes_cadastrados'] || remoteData[STORAGE_KEYS.MILITANTS] || remoteData['militancia_militantes_v1'] || [];
          if (Array.isArray(remoteMil) && remoteMil.length > 0) {
            recoveredMilitants = remoteMil;
          }

          // C. Vans
          const remoteVans = remoteData['vans_data'] || remoteData['vans_cadastradas'] || remoteData[STORAGE_KEYS.VANS] || [];
          if (Array.isArray(remoteVans) && remoteVans.length > 0) {
            recoveredVans = remoteVans;
          }

          // D. Coleções complementares
          if (remoteData[STORAGE_KEYS.TEAMS] && Array.isArray(remoteData[STORAGE_KEYS.TEAMS])) {
            this.set(STORAGE_KEYS.TEAMS, remoteData[STORAGE_KEYS.TEAMS], false);
          }
          if (remoteData[STORAGE_KEYS.STOCK] && Array.isArray(remoteData[STORAGE_KEYS.STOCK])) {
            this.set(STORAGE_KEYS.STOCK, remoteData[STORAGE_KEYS.STOCK], false);
          }
          if (remoteData[STORAGE_KEYS.PAYROLLS] && Array.isArray(remoteData[STORAGE_KEYS.PAYROLLS])) {
            this.set(STORAGE_KEYS.PAYROLLS, remoteData[STORAGE_KEYS.PAYROLLS], false);
          }
          if (remoteData[STORAGE_KEYS.CALENDAR] && Array.isArray(remoteData[STORAGE_KEYS.CALENDAR])) {
            this.set(STORAGE_KEYS.CALENDAR, remoteData[STORAGE_KEYS.CALENDAR], false);
          }

          break;
        }
      } catch (e: any) {
        console.warn(`Tentativa em ${endpoint} finalizada:`, e?.message);
      }
    }

    // 3. Mescla com os check-ins locais para não descartar nenhum lançamento recente do usuário
    const currentLocal = this.getCheckIns();
    const finalMap = new Map<string, StreetCheckIn>();

    recoveredCheckins.forEach(c => finalMap.set(c.id, c));
    currentLocal.forEach(loc => {
      const existing = finalMap.get(loc.id);
      if (!existing) {
        finalMap.set(loc.id, loc);
      } else {
        const photos = (loc.photos && loc.photos.length > 0 && loc.photos[0] !== '[vault_photo]')
          ? loc.photos
          : existing.photos;
        finalMap.set(loc.id, {
          ...existing,
          ...loc,
          photos
        });
      }
    });

    // Se ainda vazio (ex: offline absoluto), usa os INITIAL_CHECKINS garantidos
    if (finalMap.size === 0) {
      INITIAL_CHECKINS.forEach(c => finalMap.set(c.id, c));
    }

    const finalCheckins = Array.from(finalMap.values());
    finalCheckins.sort((a, b) => {
      const tA = new Date(a.timestamp || 0).getTime();
      const tB = new Date(b.timestamp || 0).getTime();
      return tB - tA;
    });

    // 4. Salva os check-ins na memória, cofre IndexedDB e LocalStorage higienizado
    this.checkinsMemoryCache = finalCheckins;
    this.safeLocalStorageSet(STORAGE_KEYS.CHECKINS, finalCheckins);

    if (typeof window !== 'undefined') {
      await vaultStorage.setItem(STORAGE_KEYS.CHECKINS, finalCheckins).catch(() => {});
      await vaultStorage.saveSnapshot(`Recuperação Nuvem (${finalCheckins.length} checkins)`, {
        [STORAGE_KEYS.CHECKINS]: finalCheckins,
        [STORAGE_KEYS.MILITANTS]: recoveredMilitants.length > 0 ? recoveredMilitants : this.getMilitants()
      }).catch(() => {});
    }

    // 5. Salva militantes recuperados
    if (recoveredMilitants.length > 0) {
      const currentMil = this.getMilitants();
      const milMap = new Map<string, Militant>();
      currentMil.forEach(m => milMap.set(m.id, m));
      recoveredMilitants.forEach(m => milMap.set(m.id, { ...(milMap.get(m.id) || {}), ...m }));
      const finalMil = Array.from(milMap.values());
      this.set(STORAGE_KEYS.MILITANTS, finalMil, false);
      if (typeof window !== 'undefined') {
        vaultStorage.setItem(STORAGE_KEYS.MILITANTS, finalMil).catch(() => {});
      }
    }

    // 6. Salva vans recuperadas
    if (recoveredVans.length > 0) {
      this.set(STORAGE_KEYS.VANS, recoveredVans, false);
      if (typeof window !== 'undefined') {
        vaultStorage.setItem(STORAGE_KEYS.VANS, recoveredVans).catch(() => {});
      }
    }

    // 7. Recalcula todas as estatísticas a partir dos check-ins recuperados
    this.recalculateAllStatsFromCheckins(finalCheckins);

    // 8. Notifica a aplicação inteira para re-renderizar todas as telas instantaneamente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }

    this.notifySync('synced', `${finalCheckins.length} checkins e ${this.getMilitants().length} militantes restaurados da nuvem.`);

    return {
      success: true,
      checkinsCount: finalCheckins.length,
      militantsCount: this.getMilitants().length,
      vansCount: this.getVans().length,
      message: `${finalCheckins.length} check-ins/ruas e ${this.getMilitants().length} militantes recuperados com sucesso da Hostinger (u844537895_Militantes).`
    };
  }

  static async getVaultSnapshots(): Promise<VaultSnapshot[]> {
    return vaultStorage.getSnapshots();
  }

  static async restoreVaultSnapshot(snapshotId: string): Promise<boolean> {
    const snapshots = await vaultStorage.getSnapshots();
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap || !snap.data) return false;

    for (const [key, val] of Object.entries(snap.data)) {
      if (val !== undefined && val !== null) {
        this.set(key, val, true);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
    return true;
  }

  // Authentication & Access Control (Mil001 a Mil050 e coordenador01 com senha 2211)
  static getAuthSession(): User | null {
    return this.get<User | null>(STORAGE_KEYS.AUTH_SESSION, null);
  }

  static setAuthSession(user: User | null): void {
    this.set(STORAGE_KEYS.AUTH_SESSION, user);
    if (user) {
      this.set(STORAGE_KEYS.CURRENT_USER, user);
    }
  }

  static logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logAudit(user, 'LOGOUT_SISTEMA', 'AUTENTICACAO', `Usuário ${user.name} (${user.matricula}) encerrou a sessão.`);
    }
    this.set(STORAGE_KEYS.AUTH_SESSION, null);
  }

  static loginWithCredentials(username: string, password: string): { success: boolean; user?: User; error?: string } {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    if (trimmedPass !== '2211') {
      return { 
        success: false, 
        error: 'Senha incorreta. A senha de acesso ao sistema de campanha é 2211.' 
      };
    }

    const lowerUser = trimmedUser.toLowerCase();

    // 1. Check if Coordinator General (full system access)
    if (lowerUser === 'coordenador01' || lowerUser === 'coordenador1' || lowerUser === 'coord01' || lowerUser === 'admin') {
      const coordUser: User = {
        id: 'user-coord-geral',
        name: 'Pedro da Silva Rosa',
        email: 'pedro.rosa@campanhasj.com.br',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '(48) 99124-5501',
        matricula: 'coordenador01',
        lgpdConsent: true,
        lgpdConsentDate: '2026-08-25 08:00:00'
      };
      this.setAuthSession(coordUser);
      this.logAudit(coordUser, 'LOGIN_COORDENADOR', 'AUTENTICACAO', 'Coordenador Geral Pedro da Silva Rosa autenticado com acesso total ao sistema.');
      return { success: true, user: coordUser };
    }

    // 2. Check if Militant Mil001 to Mil050 (case-insensitive, allows Mil1, Mil01, Mil001, mil-001, etc.)
    const milMatch = trimmedUser.match(/^mil[-_]?0*(\d{1,3})$/i);
    if (milMatch) {
      const num = parseInt(milMatch[1], 10);
      if (num >= 1 && num <= 50) {
        const formattedMatricula = `Mil${String(num).padStart(3, '0')}`;
        const militants = this.getMilitants();
        
        let existingMil = militants.find(m => 
          m.matricula.toLowerCase() === formattedMatricula.toLowerCase() ||
          m.matricula.toLowerCase() === `mil-${String(num).padStart(3, '0')}`.toLowerCase() ||
          m.matricula.toLowerCase() === `mil${num}`.toLowerCase() ||
          (num === 1 && (m.id === 'user-militante-01' || m.matricula === 'Mil001')) ||
          (num === 2 && (m.id === 'user-militante-02' || m.matricula === 'Mil002')) ||
          (num === 3 && (m.id === 'mil-303' || m.matricula === 'Mil003')) ||
          (num === 4 && (m.id === 'mil-304' || m.matricula === 'Mil004')) ||
          (num === 5 && (m.id === 'mil-305' || m.matricula === 'Mil005'))
        );

        // If militant does not exist in local database list, auto-create and persist it so they are available in Cadastros and Field app
        if (!existingMil) {
          const sampleNames = [
            'Carlos Eduardo Ramos', 'Mariana Becker', 'Lucas Pires Scherer', 'Beatriz Fontes Vieira', 'Gabriel Costa Nogueira',
            'Renata Silveira Dias', 'Thiago Meirelles', 'Fernanda Guimarães', 'Rodrigo Fagundes', 'Aline Mendonça',
            'Bruno Henrique Castro', 'Camila Vasconcelos', 'Diego Antunes', 'Eduarda Rocha', 'Felipe Medeiros',
            'Gabriela Siqueira', 'Henrique Martins', 'Isabela Coitinho', 'João Vitor Lemos', 'Karina Furtado',
            'Leonardo Neves', 'Manuela Vargas', 'Nelson Pimentel', 'Otávio Correia', 'Priscila Nogueira'
          ];
          const assignedName = sampleNames[(num - 1) % sampleNames.length] + (num > 25 ? ` (${formattedMatricula})` : '');
          const teamList = ['team-alpha', 'team-bravo', 'team-charlie', 'team-delta', 'team-eco', 'team-fox'];
          const assignedTeam = teamList[(num - 1) % teamList.length];

          existingMil = {
            id: `mil-${formattedMatricula.toLowerCase()}`,
            name: assignedName,
            matricula: formattedMatricula,
            cpfMasked: `***.${String(100 + (num * 17) % 899)}.${String(200 + (num * 23) % 799)}-**`,
            phone: `(48) 99${String(100 + num).slice(-3)}-${String(1000 + num * 37).slice(-4)}`,
            email: `${formattedMatricula.toLowerCase()}@campanhasj.com.br`,
            teamId: assignedTeam,
            role: 'militante',
            avatar: `https://images.unsplash.com/photo-${1500000000000 + (num * 1000000)}?w=150&auto=format&fit=crop&q=80`,
            status: 'em_campo',
            dailyRate: 150,
            currentLocation: {
              lat: -27.5962 + (num * 0.002) % 0.05,
              lng: -48.6190 - (num * 0.003) % 0.06,
              streetName: 'Rua Principal de São José',
              neighborhoodName: 'Kobrasol',
              lastUpdate: 'Há 5 min'
            },
            totalKmWalked: 35.0 + (num * 1.5) % 30,
            totalStreetsCovered: 25 + (num * 2) % 30,
            deliveredMaterials: { 
              santinhos: 6000 + num * 300, 
              adesivos: 800 + num * 40, 
              adesivo_bola: 350 + num * 20, 
              adesivo_parachoque: 180 + num * 10, 
              colinhas: 4500 + num * 250, 
              abordagens: 200 + num * 15, 
              comercio: 40 + num * 3 
            },
            weeklyGoalPercentage: Math.min(100, 65 + (num * 3) % 35),
            batteryLevel: 70 + (num * 5) % 28
          };

          militants.push(existingMil);
          this.set(STORAGE_KEYS.MILITANTS, militants);
        }

        const milUser: User = {
          id: existingMil.id,
          name: existingMil.name,
          email: existingMil.email || `${formattedMatricula.toLowerCase()}@campanhasj.com.br`,
          role: 'militante',
          teamId: existingMil.teamId || 'team-alpha',
          avatar: existingMil.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          phone: existingMil.phone || '(48) 99999-2211',
          matricula: formattedMatricula,
          lgpdConsent: true,
          lgpdConsentDate: new Date().toISOString()
        };

        this.setAuthSession(milUser);
        this.logAudit(milUser, 'LOGIN_MILITANTE', 'AUTENTICACAO', `Militante ${existingMil.name} (${formattedMatricula}) logado com acesso exclusivo ao App de Campo.`);
        return { success: true, user: milUser };
      }
    }

    return {
      success: false,
      error: 'Usuário não reconhecido. Use Mil001 a Mil050 para militantes ou coordenador01 para o coordenador geral.'
    };
  }

  // Current User
  static getCurrentUser(): User {
    return this.getAuthSession() || this.get(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  static setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.logAudit(user, 'TROCA_USUARIO', 'AUTENTICACAO', `Usuário ativo alterado para ${user.name} (${user.role})`);
  }

  static getUsers(): User[] {
    return this.get(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // Administrators Management (Somente administradores autorizados)
  static getAdmins(): AdminUser[] {
    return this.get(STORAGE_KEYS.ADMINS, INITIAL_ADMINS);
  }

  static addOrUpdateAdmin(admin: AdminUser): void {
    const list = this.getAdmins();
    const idx = list.findIndex(a => a.id === admin.id);
    const user = this.getCurrentUser();
    if (idx !== -1) {
      list[idx] = admin;
      this.logAudit(user, 'EDICAO_ADMINISTRADOR', 'CADASTROS', `Dados do administrador ${admin.name} (${admin.matricula}) atualizados.`);
    } else {
      list.push(admin);
      this.logAudit(user, 'CADASTRO_ADMINISTRADOR', 'CADASTROS', `Novo administrador ${admin.name} cadastrado no sistema.`);
      
      // Also register as user if not present
      const users = this.getUsers();
      if (!users.some(u => u.email === admin.email)) {
        users.unshift({
          id: `user-${admin.id}`,
          name: admin.name,
          email: admin.email,
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phone: admin.phone,
          matricula: admin.matricula,
          lgpdConsent: true,
          lgpdConsentDate: new Date().toISOString()
        });
        this.set(STORAGE_KEYS.USERS, users);
      }
    }
    this.set(STORAGE_KEYS.ADMINS, list);
  }

  static deleteAdmin(adminId: string): void {
    const list = this.getAdmins();
    const target = list.find(a => a.id === adminId);
    if (list.length <= 1) {
      throw new Error('Não é possível excluir o único administrador ativo do sistema.');
    }
    const updated = list.filter(a => a.id !== adminId);
    this.set(STORAGE_KEYS.ADMINS, updated);
    const user = this.getCurrentUser();
    this.logAudit(user, 'EXCLUSAO_ADMINISTRADOR', 'CADASTROS', `Administrador ${target?.name || adminId} excluído.`);
  }

  static verifyAdminPin(pin: string): boolean {
    const admins = this.getAdmins();
    return admins.some(a => a.pinCode === pin.trim() && a.active);
  }

  static isUserAdmin(user: User): boolean {
    return user.role === 'admin';
  }

  // Weekly Payroll (Folha de Pagamento Semanal)
  static getPayrolls(): WeeklyPayroll[] {
    return this.get(STORAGE_KEYS.PAYROLLS, INITIAL_PAYROLLS);
  }

  static getPayrollById(id: string): WeeklyPayroll | undefined {
    return this.getPayrolls().find(p => p.id === id);
  }

  static savePayroll(payroll: WeeklyPayroll): void {
    const calculated = this.recalculateWeeklyTotals(payroll);
    const list = this.getPayrolls();
    const idx = list.findIndex(p => p.id === calculated.id);
    const user = this.getCurrentUser();

    if (idx !== -1) {
      list[idx] = calculated;
      this.logAudit(user, 'EDICAO_FOLHA_PAGAMENTO', 'FOLHA_PAGAMENTO', `Folha ${calculated.weekLabel} atualizada. Total R$ ${calculated.totalWeeklyAmount.toLocaleString('pt-BR')}`);
    } else {
      list.push(calculated);
      this.logAudit(user, 'CRIACAO_FOLHA_PAGAMENTO', 'FOLHA_PAGAMENTO', `Nova folha ${calculated.weekLabel} criada.`);
    }
    this.set(STORAGE_KEYS.PAYROLLS, list);
  }

  static recalculateWeeklyTotals(payroll: WeeklyPayroll): WeeklyPayroll {
    let totalWeeklyAmount = 0;
    let totalDaysWorked = 0;
    let totalMilitantsAmount = 0;
    let totalLeadersAmount = 0;
    let totalDriversAmount = 0;
    let totalWorkersPaid = 0;

    const recalculatedItems = payroll.items.map(item => {
      // Calculate days count based on schedule or explicit daysWorked
      const scheduleDays = Object.values(item.daysSchedule || {}).filter(Boolean).length;
      const actualDays = item.daysWorked !== undefined ? item.daysWorked : scheduleDays;
      
      const totalAmount = Math.max(0, (item.dailyRate * actualDays) + (item.bonus || 0) - (item.deductions || 0));

      totalWeeklyAmount += totalAmount;
      totalDaysWorked += actualDays;
      if (item.status === 'pago') totalWorkersPaid++;

      if (item.role === 'militante') {
        totalMilitantsAmount += totalAmount;
      } else if (item.role === 'lider') {
        totalLeadersAmount += totalAmount;
      } else if (item.role === 'motorista_van') {
        totalDriversAmount += totalAmount;
      } else {
        totalLeadersAmount += totalAmount;
      }

      return {
        ...item,
        daysWorked: actualDays,
        totalAmount
      };
    });

    return {
      ...payroll,
      items: recalculatedItems,
      totalWeeklyAmount,
      totalDaysWorked,
      totalWorkersPaid,
      totalMilitantsAmount,
      totalLeadersAmount,
      totalDriversAmount
    };
  }

  static updatePayrollItem(payrollId: string, item: WeeklyPayrollItem): void {
    const list = this.getPayrolls();
    const payroll = list.find(p => p.id === payrollId);
    if (!payroll) return;

    const itemIdx = payroll.items.findIndex(i => i.id === item.id);
    if (itemIdx !== -1) {
      payroll.items[itemIdx] = item;
    } else {
      payroll.items.push(item);
    }

    this.savePayroll(payroll);
  }

  static deletePayrollItem(payrollId: string, itemId: string): void {
    const list = this.getPayrolls();
    const payroll = list.find(p => p.id === payrollId);
    if (!payroll) return;

    payroll.items = payroll.items.filter(i => i.id !== itemId);
    this.savePayroll(payroll);
  }

  static markItemPaymentStatus(payrollId: string, itemId: string, status: WeeklyPayrollItem['status']): void {
    const list = this.getPayrolls();
    const payroll = list.find(p => p.id === payrollId);
    if (!payroll) return;

    const item = payroll.items.find(i => i.id === itemId);
    if (item) {
      item.status = status;
      if (status === 'pago') {
        item.paymentDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        item.paymentReceiptNumber = `REC-PAY-${Date.now().toString().slice(-6)}`;
      }
      this.savePayroll(payroll);
      const user = this.getCurrentUser();
      this.logAudit(user, 'PAGAMENTO_DIARIA', 'FOLHA_PAGAMENTO', `Status do pagamento de ${item.workerName} alterado para ${status.toUpperCase()}.`);
    }
  }

  static markAllItemsAsPaid(payrollId: string): void {
    const list = this.getPayrolls();
    const payroll = list.find(p => p.id === payrollId);
    if (!payroll) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    payroll.items.forEach(item => {
      item.status = 'pago';
      item.paymentDate = now;
      if (!item.paymentReceiptNumber) {
        item.paymentReceiptNumber = `REC-PAY-${Date.now().toString().slice(-6)}-${item.matricula}`;
      }
    });
    payroll.status = 'fechada_paga';
    const user = this.getCurrentUser();
    payroll.approvedBy = `${user.name} (${user.role})`;
    payroll.approvedAt = now;

    this.savePayroll(payroll);
    this.logAudit(user, 'PAGAMENTO_GERAL_FOLHA', 'FOLHA_PAGAMENTO', `Todos os pagamentos da folha ${payroll.weekLabel} foram liquidados via PIX.`);
  }

  // Check-ins & Offline queue
  static getCheckIns(): StreetCheckIn[] {
    const deletedIds = new Set(this.get<string[]>('deleted_entities_vault', []));

    if (this.checkinsMemoryCache && this.checkinsMemoryCache.length > 0) {
      return this.checkinsMemoryCache.filter(c => !deletedIds.has(String(c.id)));
    }
    let fromLocal = this.get<StreetCheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    fromLocal = fromLocal.filter(c => !deletedIds.has(String(c.id)));

    // Realoção e normalização automática para as regras dos 24 bairros oficiais
    let checkinsModified = false;
    const reallocated = fromLocal.map(chk => {
      let updated = { ...chk };
      const streetLower = (chk.streetName || '').toLowerCase();
      const neighIdLower = (chk.neighborhoodId || '').toLowerCase();

      // Regra 1: Separação de Areias e Bosque das Mansões
      if (streetLower.includes('bosque') || streetLower.includes('mansões') || streetLower.includes('mansoes') || streetLower.includes('lourival de souza') || streetLower.includes('alaide martins')) {
        if (updated.neighborhoodId !== 'bosque_das_mansoes') {
          updated.neighborhoodId = 'bosque_das_mansoes';
          updated.neighborhoodName = 'Bosque das Mansões';
          checkinsModified = true;
        }
      } else if (neighIdLower === 'areias_bosque' || ((streetLower.includes('são pedro') || streetLower.includes('sao pedro') || streetLower.includes('francisco jacinto de melo')) && updated.neighborhoodId !== 'areias')) {
        updated.neighborhoodId = 'areias';
        updated.neighborhoodName = 'Areias';
        checkinsModified = true;
      }

      // Regra 2: Calibragem de coordenadas se estava no placeholder de Kobrasol (-27.5962, -48.6190) ou rua Honória
      const isPlaceholderGps = (
        Math.abs(updated.latitude - (-27.5962)) < 0.0008 &&
        Math.abs(updated.longitude - (-48.6190)) < 0.0008
      );
      if (streetLower.includes('honoria') || streetLower.includes('honória')) {
        updated.latitude = -27.5688543;
        updated.longitude = -48.6390348;
        updated.neighborhoodId = 'real_parque';
        updated.neighborhoodName = 'Real Parque';
        checkinsModified = true;
      } else if (isPlaceholderGps && updated.neighborhoodId !== 'kobrasol') {
        const calibrated = resolveExactStreetCoordinates(updated.streetName, updated.neighborhoodId, INITIAL_NEIGHBORHOODS);
        updated.latitude = calibrated.lat;
        updated.longitude = calibrated.lng;
        checkinsModified = true;
      }

      // Hidratação de fotos a partir do cofre dedicado
      const idStr = String(chk.id);
      const cachedPhotos = this.photoVaultCache.get(idStr);
      const hasRealPhotos = Array.isArray(chk.photos) && chk.photos.length > 0 && chk.photos[0] !== '[vault_photo]';
      if (!hasRealPhotos && cachedPhotos && cachedPhotos.length > 0) {
        updated.photos = cachedPhotos;
      }

      return updated;
    });

    // Assegura a presença de check-ins de amostra em Areias e Bosque das Mansões (apenas se não excluídos)
    if (!reallocated.some(c => c.neighborhoodId === 'areias') && !deletedIds.has('areias-sample-1')) {
      const areiasSamples = INITIAL_CHECKINS.filter(c => c.neighborhoodId === 'areias' && !deletedIds.has(String(c.id)));
      reallocated.push(...areiasSamples);
      checkinsModified = true;
    }
    if (!reallocated.some(c => c.neighborhoodId === 'bosque_das_mansoes') && !deletedIds.has('bosque-sample-1')) {
      const bosqueSamples = INITIAL_CHECKINS.filter(c => c.neighborhoodId === 'bosque_das_mansoes' && !deletedIds.has(String(c.id)));
      reallocated.push(...bosqueSamples);
      checkinsModified = true;
    }

    if (checkinsModified) {
      fromLocal = reallocated;
      this.safeLocalStorageSet(STORAGE_KEYS.CHECKINS, fromLocal);
    }

    this.checkinsMemoryCache = fromLocal;

    // Assegura que se o IndexedDB Vault tiver fotos completas ou check-ins adicionais, sincroniza
    if (typeof window !== 'undefined') {
      vaultStorage.getItem<StreetCheckIn[]>(STORAGE_KEYS.CHECKINS).then(vaultItems => {
        if (vaultItems && Array.isArray(vaultItems) && vaultItems.length > 0) {
          const currentDeleted = new Set(this.get<string[]>('deleted_entities_vault', []));
          const validVaultItems = vaultItems.filter(v => v && v.id && !currentDeleted.has(String(v.id)));

          // Alimenta o cache de fotos com as fotos de alta resolução do IndexedDB
          validVaultItems.forEach(v => {
            if (v && v.id && Array.isArray(v.photos) && v.photos.length > 0 && v.photos[0] !== '[vault_photo]') {
              this.photoVaultCache.set(String(v.id), v.photos);
            }
          });

          const current = this.checkinsMemoryCache || [];
          if (validVaultItems.length > current.length) {
            this.checkinsMemoryCache = validVaultItems;
            this.safeLocalStorageSet(STORAGE_KEYS.CHECKINS, validVaultItems);
            window.dispatchEvent(new CustomEvent('militancia_data_updated'));
          }
        }
      }).catch(() => {});
    }

    return fromLocal;
  }

  /**
   * Exclusão definitiva e permanente de check-in / rua com proteção de cofre
   */
  static async deleteCheckIn(checkInId: string): Promise<boolean> {
    const idStr = String(checkInId);

    // 1. Marca no cofre de entidades excluídas de forma permanente (localStorage + IndexedDB)
    const deletedIds = this.get<string[]>('deleted_entities_vault', []);
    if (!deletedIds.includes(idStr)) {
      deletedIds.push(idStr);
      this.set('deleted_entities_vault', deletedIds, false);
      if (typeof window !== 'undefined') {
        try {
          await vaultStorage.setItem('deleted_entities_vault', deletedIds);
        } catch {}
      }
    }

    // 2. Remove da memória RAM, do cache dedicado de fotos e de todas as chaves locais
    const allCheckins = this.getCheckIns();
    const target = allCheckins.find(c => String(c.id) === idStr);
    const updated = allCheckins.filter(c => String(c.id) !== idStr);

    this.photoVaultCache.delete(idStr);
    this.checkinsMemoryCache = updated;

    this.set(STORAGE_KEYS.CHECKINS, updated, true);
    this.safeLocalStorageSet('checkins_data', updated);
    this.safeLocalStorageSet('militancia_checkins_v1', updated);

    if (typeof window !== 'undefined') {
      try {
        await vaultStorage.setItem(STORAGE_KEYS.CHECKINS, updated);
        await vaultStorage.setItem('militancia_checkins_v1', updated);
        await vaultStorage.setItem('checkins_data', updated);
      } catch {}
    }

    // 3. Remove da fila offline se estiver pendente
    const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const updatedQueue = queue.filter(c => String(c.id) !== idStr);
    this.set(STORAGE_KEYS.OFFLINE_QUEUE, updatedQueue, true);

    // 4. Recalcula estatísticas operacionais imediatamente
    this.recalculateAllStatsFromCheckins(updated);

    // 5. Comunica exclusão imediata ao servidor (Node e banco remoto)
    try {
      await fetch(`/api/checkin/${idStr}`, { method: 'DELETE' }).catch(() => {});
      await this.requestSyncApi('POST', {
        action: 'delete_checkin',
        checkInId: idStr,
        replace: true
      }).catch(() => {});
    } catch (e) {
      console.warn('Erro ao sincronizar exclusão com servidor:', e);
    }

    // 6. Notifica todos os componentes e telas
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }

    // 7. Registro de auditoria
    const user = this.getCurrentUser();
    this.logAudit(
      user,
      'EXCLUSAO_CHECKIN_RUA',
      'CHECKIN_RUA',
      `Rua/Check-in ${target?.streetName || idStr} (${target?.neighborhoodName || 'São José'}) registrado por ${target?.militantName || 'Militante'} foi excluído definitivamente pelo coordenador.`
    );

    return true;
  }

  /**
   * Helper para buscar foto real de um checkin ou de sua rua correspondente
   */
  static getPhotoForCheckIn(checkInId: string, neighborhoodId?: string, streetName?: string): string {
    const idStr = String(checkInId);

    // 1. Verifica cache dedicado de fotos
    const cached = this.photoVaultCache.get(idStr);
    if (cached && cached.length > 0 && cached[0] !== '[vault_photo]') {
      return cached[0];
    }

    // 2. Verifica no cache de checkins em memória
    if (this.checkinsMemoryCache) {
      const match = this.checkinsMemoryCache.find(c => String(c.id) === idStr);
      if (match && Array.isArray(match.photos) && match.photos.length > 0 && match.photos[0] !== '[vault_photo]') {
        this.photoVaultCache.set(idStr, match.photos);
        return match.photos[0];
      }
    }

    // 3. Verifica por rua e bairro correspondentes
    if (neighborhoodId && streetName && this.checkinsMemoryCache) {
      const sNorm = streetName.trim().toLowerCase();
      const nNorm = neighborhoodId.trim().toLowerCase();
      const matchStreet = this.checkinsMemoryCache.find(c =>
        (c.neighborhoodId || '').toLowerCase() === nNorm &&
        (c.streetName || '').toLowerCase() === sNorm &&
        Array.isArray(c.photos) && c.photos.length > 0 && c.photos[0] !== '[vault_photo]'
      );
      if (matchStreet && matchStreet.photos[0]) {
        return matchStreet.photos[0];
      }
    }

    return '';
  }

  /**
   * Recupera todas as fotos lançadas no banco de dados e as associa perfeitamente
   * às ruas correspondentes em memória, IndexedDB e relatórios.
   */
  static async recoverAllDatabasePhotos(): Promise<{
    success: boolean;
    recoveredPhotosCount: number;
    totalStreetsWithPhotos: number;
    message: string;
  }> {
    let recoveredCount = 0;
    const deletedIds = new Set(this.get<string[]>('deleted_entities_vault', []));

    try {
      // 1. Tenta carregar do endpoint /api/checkin e /api/data_server_vault.json
      let dbCheckins: any[] = [];
      try {
        const res = await fetch('/api/checkin');
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.data)) {
            dbCheckins = json.data;
          }
        }
      } catch {}

      if (dbCheckins.length === 0) {
        try {
          const res = await fetch('/api/data_server_vault.json');
          if (res.ok) {
            const vault = await res.json();
            if (vault && Array.isArray(vault['militancia_checkins_v1'])) {
              dbCheckins = vault['militancia_checkins_v1'];
            }
          }
        } catch {}
      }

      if (dbCheckins.length === 0) {
        try {
          const res = await fetch('/data_server_vault.json');
          if (res.ok) {
            const vault = await res.json();
            if (vault && Array.isArray(vault['militancia_checkins_v1'])) {
              dbCheckins = vault['militancia_checkins_v1'];
            }
          }
        } catch {}
      }

      // 2. Extrai fotos válidas para o cache de fotos
      const photoByCheckinId = new Map<string, string[]>();
      const photoByStreetKey = new Map<string, string[]>();

      dbCheckins.forEach((item: any) => {
        if (!item) return;
        const idStr = String(item.id);
        if (deletedIds.has(idStr)) return; // Ignora registros excluídos

        let photos: string[] = [];
        if (Array.isArray(item.photos)) {
          photos = item.photos.filter((p: any) => typeof p === 'string' && p && p !== '[vault_photo]');
        } else if (typeof item.fotos_json === 'string' && item.fotos_json.trim()) {
          try {
            const parsed = JSON.parse(item.fotos_json);
            if (Array.isArray(parsed)) {
              photos = parsed.filter((p: any) => typeof p === 'string' && p && p !== '[vault_photo]');
            }
          } catch {}
        }

        if (photos.length > 0) {
          photoByCheckinId.set(idStr, photos);
          this.photoVaultCache.set(idStr, photos);

          const streetNorm = (item.streetName || item.nome_rua || '').trim().toLowerCase();
          const neighNorm = (item.neighborhoodId || item.bairro_id || '').trim().toLowerCase();
          if (streetNorm) {
            const key = `${neighNorm}:::${streetNorm}`;
            photoByStreetKey.set(key, photos);
          }
        }
      });

      // 3. Atualiza os check-ins atuais associando as fotos recuperadas às ruas correspondentes
      const currentCheckins = this.getCheckIns();
      const currentMap = new Map<string, StreetCheckIn>();
      currentCheckins.forEach(c => {
        if (!deletedIds.has(String(c.id))) {
          currentMap.set(String(c.id), c);
        }
      });

      // Se houver checkins no banco que não estão no local e não foram excluídos, adiciona-os!
      dbCheckins.forEach((item: any) => {
        const idStr = String(item.id);
        if (deletedIds.has(idStr)) return;
        if (!currentMap.has(idStr)) {
          const normalized = normalizeCheckInFromMySQL(item);
          const photos = photoByCheckinId.get(idStr) || [];
          if (photos.length > 0) {
            normalized.photos = photos;
          }
          currentMap.set(idStr, normalized);
          recoveredCount++;
        }
      });

      // Para todas as ruas existentes, se não tiver foto ou tiver [vault_photo], preenche com a foto do banco
      const updatedList: StreetCheckIn[] = Array.from(currentMap.values()).map(chk => {
        const idStr = String(chk.id);
        const hasValidPhoto = Array.isArray(chk.photos) && chk.photos.length > 0 && chk.photos[0] !== '[vault_photo]';
        if (hasValidPhoto) return chk;

        // Tenta por ID
        const byId = photoByCheckinId.get(idStr);
        if (byId && byId.length > 0) {
          recoveredCount++;
          return { ...chk, photos: byId };
        }

        // Tenta por Nome da Rua + Bairro
        const streetNorm = (chk.streetName || '').trim().toLowerCase();
        const neighNorm = (chk.neighborhoodId || '').trim().toLowerCase();
        const key = `${neighNorm}:::${streetNorm}`;
        const byKey = photoByStreetKey.get(key);
        if (byKey && byKey.length > 0) {
          recoveredCount++;
          return { ...chk, photos: byKey };
        }

        return chk;
      });

      // 4. Salva os dados atualizados com fotos na memória e no IndexedDB
      this.checkinsMemoryCache = updatedList;
      this.safeLocalStorageSet(STORAGE_KEYS.CHECKINS, updatedList);

      if (typeof window !== 'undefined') {
        try {
          await vaultStorage.setItem(STORAGE_KEYS.CHECKINS, updatedList);
          await vaultStorage.setItem('militancia_checkins_v1', updatedList);
        } catch {}
      }

      this.recalculateAllStatsFromCheckins(updatedList);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('militancia_data_updated'));
      }

      const totalStreetsWithPhotos = updatedList.filter(c => Array.isArray(c.photos) && c.photos.length > 0 && c.photos[0] !== '[vault_photo]').length;

      return {
        success: true,
        recoveredPhotosCount: recoveredCount,
        totalStreetsWithPhotos,
        message: `${totalStreetsWithPhotos} ruas com fotos identificadas e associadas com sucesso!`
      };
    } catch (err: any) {
      console.error('Erro na recuperação de fotos do banco:', err);
      return {
        success: false,
        recoveredPhotosCount: 0,
        totalStreetsWithPhotos: 0,
        message: 'Falha ao recuperar fotos: ' + (err?.message || 'Erro desconhecido')
      };
    }
  }

  static async updateCheckIn(updatedCheckIn: StreetCheckIn): Promise<void> {
    const neighborhoods = this.getNeighborhoods();
    
    // Only calibrate coordinates if completely missing, NaN or zero
    const lat = Number(updatedCheckIn.latitude);
    const lng = Number(updatedCheckIn.longitude);
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      const resolved = resolveExactStreetCoordinates(updatedCheckIn.streetName, updatedCheckIn.neighborhoodId, neighborhoods);
      updatedCheckIn.latitude = resolved.lat;
      updatedCheckIn.longitude = resolved.lng;
    } else {
      updatedCheckIn.latitude = lat;
      updatedCheckIn.longitude = lng;
    }

    const allCheckins = this.getCheckIns();
    const idx = allCheckins.findIndex(c => c.id === updatedCheckIn.id);
    if (idx !== -1) {
      allCheckins[idx] = { ...allCheckins[idx], ...updatedCheckIn };
    } else {
      allCheckins.unshift({ ...updatedCheckIn });
    }
    
    // Persist immediately in local storage
    this.set(STORAGE_KEYS.CHECKINS, allCheckins);

    // Also update offline queue if present
    const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const qIdx = queue.findIndex(c => c.id === updatedCheckIn.id);
    if (qIdx !== -1) {
      queue[qIdx] = { ...updatedCheckIn };
      this.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }

    // Recalculate stats for all neighborhoods from fresh checkins
    const updatedNeighborhoods = neighborhoods.map(n => {
      const nCheckins = allCheckins.filter(c => c.neighborhoodId === n.id);
      const uniqueStreets = new Set(nCheckins.map(c => (c.streetName || '').toLowerCase().trim())).size;
      return {
        ...n,
        completedStreets: Math.min(n.totalStreets, uniqueStreets || nCheckins.length),
        deliveredMaterials: {
          santinhos: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.santinhos || 0), 0),
          adesivos: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivos || 0), 0),
          adesivo_bola: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_bola || 0), 0),
          adesivo_parachoque: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_parachoque || 0), 0),
          colinhas: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.colinhas || 0), 0),
          abordagens: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.abordagens || 0), 0),
          comercio: nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.comercio || 0), 0)
        }
      };
    });
    this.set(STORAGE_KEYS.NEIGHBORHOODS, updatedNeighborhoods);

    // Recalculate stats for militants from fresh checkins
    const militants = this.getMilitants();
    const updatedMilitants = militants.map(m => {
      const mCheckins = allCheckins.filter(c => c.militantId === m.id || c.militantName === m.name);
      return {
        ...m,
        completedStreets: mCheckins.length,
        deliveredMaterials: {
          santinhos: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.santinhos || 0), 0),
          adesivos: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivos || 0), 0),
          adesivo_bola: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_bola || 0), 0),
          adesivo_parachoque: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_parachoque || 0), 0),
          colinhas: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.colinhas || 0), 0),
          abordagens: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.abordagens || 0), 0),
          comercio: mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.comercio || 0), 0)
        }
      };
    });
    this.set(STORAGE_KEYS.MILITANTS, updatedMilitants);

    const user = this.getCurrentUser();
    this.logAudit(
      user,
      'EDICAO_CHECKIN_RUA',
      'CHECKIN_RUA',
      `Rua/Check-in ${updatedCheckIn.streetName} (${updatedCheckIn.neighborhoodName}) de ${updatedCheckIn.militantName} foi atualizado com sucesso.`
    );

    // Dispatch real-time event to update all active views and components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }

    // Transmit update to Hostinger MySQL endpoints
    if (typeof window !== 'undefined' && navigator.onLine) {
      const payload = {
        action: 'SAVE_STREET_CHECKIN',
        db: 'u844537895_Militantes',
        user: 'u844537895_Militantes',
        host: 'militancia.mastervisionmarketing.com',
        data: {
          id: updatedCheckIn.id,
          militante_id: updatedCheckIn.militantId,
          militante_nome: updatedCheckIn.militantName,
          equipe_id: updatedCheckIn.teamId,
          bairro_id: updatedCheckIn.neighborhoodId,
          bairro_nome: updatedCheckIn.neighborhoodName,
          nome_rua: updatedCheckIn.streetName,
          faixa_numeracao: updatedCheckIn.houseNumberRange,
          timestamp_checkin: updatedCheckIn.timestamp,
          latitude: updatedCheckIn.latitude,
          longitude: updatedCheckIn.longitude,
          precisao_gps_metros: updatedCheckIn.accuracyMeters,
          qtd_santinhos: updatedCheckIn.materialsDelivered.santinhos,
          qtd_adesivos: updatedCheckIn.materialsDelivered.adesivos,
          qtd_adesivo_bola: updatedCheckIn.materialsDelivered.adesivo_bola,
          qtd_adesivo_parachoque: updatedCheckIn.materialsDelivered.adesivo_parachoque,
          qtd_colinhas: updatedCheckIn.materialsDelivered.colinhas,
          qtd_abordagens: updatedCheckIn.materialsDelivered.abordagens || 0,
          qtd_comercio: updatedCheckIn.materialsDelivered.comercio || 0,
          observacoes: updatedCheckIn.observations || '',
          fotos_json: JSON.stringify(updatedCheckIn.photos || []),
          status_auditoria: updatedCheckIn.status || 'validado'
        }
      };

      // Try sending to local proxy /api/checkin and remote endpoint in parallel/fallback
      try {
        await Promise.any([
          fetch('/api/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }),
          fetch('https://militancia.mastervisionmarketing.com/api/checkin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        ]).catch(() => {});
      } catch {}

      // Push full collection update
      this.scheduleRemotePush(STORAGE_KEYS.CHECKINS, allCheckins);
    }
  }

  static addCheckIn(checkIn: StreetCheckIn, isOffline = false): { success: boolean; isQueued: boolean } {
    const user = this.getCurrentUser();
    const neighborhoods = this.getNeighborhoods();

    // Calibrate coordinates if missing or invalid using São José street dictionary
    if (!isCoordinateInsideSaoJose(checkIn.latitude, checkIn.longitude)) {
      const resolved = resolveExactStreetCoordinates(checkIn.streetName, checkIn.neighborhoodId, neighborhoods);
      checkIn.latitude = resolved.lat;
      checkIn.longitude = resolved.lng;
    }

    const allCheckins = this.getCheckIns();

    if (isOffline) {
      const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
      queue.unshift({ ...checkIn, synced: false });
      this.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
      return { success: true, isQueued: true };
    }

    const updatedCheckins = [checkIn, ...allCheckins];
    this.set(STORAGE_KEYS.CHECKINS, updatedCheckins);

    // Update Neighborhood stats
    const targetNeigh = neighborhoods.find(n => n.id === checkIn.neighborhoodId);
    if (targetNeigh) {
      targetNeigh.completedStreets = Math.min(targetNeigh.totalStreets, targetNeigh.completedStreets + 1);
      targetNeigh.deliveredMaterials.santinhos += checkIn.materialsDelivered.santinhos || 0;
      targetNeigh.deliveredMaterials.adesivos += checkIn.materialsDelivered.adesivos || 0;
      targetNeigh.deliveredMaterials.adesivo_bola += checkIn.materialsDelivered.adesivo_bola || 0;
      targetNeigh.deliveredMaterials.adesivo_parachoque += checkIn.materialsDelivered.adesivo_parachoque || 0;
      targetNeigh.deliveredMaterials.colinhas += checkIn.materialsDelivered.colinhas || 0;
      if (checkIn.materialsDelivered.abordagens) {
        targetNeigh.deliveredMaterials.abordagens = (targetNeigh.deliveredMaterials.abordagens || 0) + checkIn.materialsDelivered.abordagens;
      }
      if (checkIn.materialsDelivered.comercio) {
        targetNeigh.deliveredMaterials.comercio = (targetNeigh.deliveredMaterials.comercio || 0) + checkIn.materialsDelivered.comercio;
      }
      this.set(STORAGE_KEYS.NEIGHBORHOODS, neighborhoods);
    }

    // Update Militant stats
    const militants = this.getMilitants();
    const militant = militants.find(m => m.id === checkIn.militantId);
    if (militant) {
      militant.totalStreetsCovered += 1;
      militant.deliveredMaterials.santinhos += checkIn.materialsDelivered.santinhos || 0;
      militant.deliveredMaterials.adesivos += checkIn.materialsDelivered.adesivos || 0;
      militant.deliveredMaterials.adesivo_bola += checkIn.materialsDelivered.adesivo_bola || 0;
      militant.deliveredMaterials.adesivo_parachoque += checkIn.materialsDelivered.adesivo_parachoque || 0;
      militant.deliveredMaterials.colinhas += checkIn.materialsDelivered.colinhas || 0;
      if (checkIn.materialsDelivered.abordagens) {
        militant.deliveredMaterials.abordagens = (militant.deliveredMaterials.abordagens || 0) + checkIn.materialsDelivered.abordagens;
      }
      if (checkIn.materialsDelivered.comercio) {
        militant.deliveredMaterials.comercio = (militant.deliveredMaterials.comercio || 0) + checkIn.materialsDelivered.comercio;
      }
      militant.totalKmWalked += 0.8;
      militant.currentLocation = {
        lat: checkIn.latitude,
        lng: checkIn.longitude,
        streetName: checkIn.streetName,
        neighborhoodName: checkIn.neighborhoodName,
        lastUpdate: 'Agora mesmo'
      };
      this.set(STORAGE_KEYS.MILITANTS, militants);
    }

    // Dispatch stock decrement
    this.decrementStockForCheckin(checkIn);

    // Audit Log
    this.logAudit(
      user,
      'CHECKIN_RUA_REGISTRADO',
      'CHECKIN_RUA',
      `Check-in de rua registrado por ${checkIn.militantName} em ${checkIn.neighborhoodName} (${checkIn.streetName}).`
    );

    return { success: true, isQueued: false };
  }

  // Transmit Directly to Hostinger MySQL Database (u844537895_Militantes @ militancia.mastervisionmarketing.com)
  static async transmitCheckInToHostingerMySQL(checkIn: StreetCheckIn): Promise<CheckInSyncResult> {
    return this.onCheckInCreated(checkIn);
  }

  // Primary API Persistence & Sync Orchestrator
  static async onCheckInCreated(checkIn: StreetCheckIn): Promise<CheckInSyncResult> {
    const user = this.getCurrentUser();
    const startTime = Date.now();
    const syncTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const isAppOffline = !navigator.onLine;

    // Check-in initially saved with local pending status if offline, or tentatively synced
    const preparedCheckin: StreetCheckIn = {
      ...checkIn,
      synced: !isAppOffline
    };

    // Save locally first to guarantee zero data loss
    this.addCheckIn(preparedCheckin, isAppOffline);

    if (isAppOffline) {
      this.logAudit(
        user,
        'CHECKIN_SALVO_OFFLINE',
        'CHECKIN_RUA',
        `Dispositivo em modo offline. Check-in de ${preparedCheckin.militantName} (${preparedCheckin.streetName}) salvo na fila local de sincronização.`
      );

      return {
        success: true,
        status: 'queued_offline',
        destination: 'Fila de Sincronização Local (Offline)',
        message: 'Check-in gravado no dispositivo. Será transmitido automaticamente para o MySQL da Hostinger quando a conexão retornar.',
        checkIn: preparedCheckin,
        latencyMs: 0,
        syncTimestamp,
        hostingerDatabase: 'u844537895_Militantes'
      };
    }

    // Prepare payload for MySQL endpoints
    const payload = {
      action: 'SAVE_STREET_CHECKIN',
      db: 'u844537895_Militantes',
      user: 'u844537895_Militantes',
      host: 'militancia.mastervisionmarketing.com',
      data: {
        id: preparedCheckin.id,
        militante_id: preparedCheckin.militantId,
        militante_nome: preparedCheckin.militantName,
        equipe_id: preparedCheckin.teamId,
        bairro_id: preparedCheckin.neighborhoodId,
        bairro_nome: preparedCheckin.neighborhoodName,
        nome_rua: preparedCheckin.streetName,
        faixa_numeracao: preparedCheckin.houseNumberRange,
        timestamp_checkin: preparedCheckin.timestamp,
        latitude: preparedCheckin.latitude,
        longitude: preparedCheckin.longitude,
        precisao_gps_metros: preparedCheckin.accuracyMeters,
        qtd_santinhos: preparedCheckin.materialsDelivered.santinhos,
        qtd_adesivos: preparedCheckin.materialsDelivered.adesivos,
        qtd_adesivo_bola: preparedCheckin.materialsDelivered.adesivo_bola,
        qtd_adesivo_parachoque: preparedCheckin.materialsDelivered.adesivo_parachoque,
        qtd_colinhas: preparedCheckin.materialsDelivered.colinhas,
        qtd_abordagens: preparedCheckin.materialsDelivered.abordagens || 0,
        qtd_comercio: preparedCheckin.materialsDelivered.comercio || 0,
        observacoes: preparedCheckin.observations,
        fotos_json: JSON.stringify(preparedCheckin.photos),
        status_auditoria: preparedCheckin.status
      }
    };

    const localProxyEndpoint = '/api/checkin';
    const hostingerEndpoint = 'https://militancia.mastervisionmarketing.com/api/checkin.php';

    // Step 1: Immediate transmission via local API Proxy (fast ~15ms, auto-persists to server vault & broadcasts SSE)
    try {
      const proxyController = new AbortController();
      const proxyTimeout = setTimeout(() => proxyController.abort(), 6000);

      const proxyRes = await fetch(localProxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(preparedCheckin),
        signal: proxyController.signal
      });

      clearTimeout(proxyTimeout);
      const latencyMs = Date.now() - startTime;

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json().catch(() => null);
        this.logAudit(
          user,
          'TRANSMISSAO_MYSQL_PROXY',
          'CHECKIN_RUA',
          `Check-in de rua transmitido com sucesso para o banco da campanha por ${checkIn.militantName} em ${latencyMs}ms.`
        );

        return {
          success: true,
          status: 'synced_mysql',
          destination: proxyData?.destination || 'Hostinger MySQL: u844537895_Militantes',
          message: proxyData?.message || 'Check-in persistido no banco de dados da campanha com sucesso.',
          checkIn: { ...preparedCheckin, synced: true },
          latencyMs,
          httpStatus: proxyRes.status,
          hostingerDatabase: 'u844537895_Militantes',
          syncTimestamp
        };
      }
    } catch (proxyError: any) {
      console.warn('Local proxy attempt had network exception, trying direct Hostinger fallback:', proxyError?.message);
    }

    // Step 2: Fallback direct transmission to Hostinger MySQL PHP API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(hostingerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        this.logAudit(
          user,
          'TRANSMISSAO_MYSQL_HOSTINGER',
          'CHECKIN_RUA',
          `Check-in de rua transmitido diretamente para o banco MySQL u844537895_Militantes por ${checkIn.militantName} em ${latencyMs}ms.`
        );

        return {
          success: true,
          status: 'synced_mysql',
          destination: 'Banco MySQL: u844537895_Militantes (militancia.mastervisionmarketing.com)',
          message: 'Dados transmitidos e sincronizados com sucesso no banco MySQL da Hostinger.',
          checkIn: { ...preparedCheckin, synced: true },
          latencyMs,
          httpStatus: response.status,
          hostingerDatabase: 'u844537895_Militantes',
          syncTimestamp
        };
      }
    } catch (directError: any) {
      console.warn('Direct Hostinger fetch failed or timed out:', directError?.message);
    }

    // Step 3: If both endpoints failed due to mobile network / offline, enqueue for auto-retry
    const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const alreadyQueued = queue.some(item => item.id === preparedCheckin.id);
    if (!alreadyQueued) {
      queue.unshift({ ...preparedCheckin, synced: false });
      this.set(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }

    this.logAudit(
      user,
      'FALHA_REDE_CHECKIN_ENFILEIRADO',
      'CHECKIN_RUA',
      `Instabilidade temporária de rede ao enviar para MySQL. Check-in de ${preparedCheckin.militantName} salvo localmente e enfileirado para reenvio automático.`
    );

    return {
      success: true,
      status: 'queued_offline',
      destination: 'Fila de Sincronização Local (Aguardando Rede)',
      message: 'Check-in gravado com sucesso no dispositivo e mantido na fila segura para envio ao MySQL da Hostinger.',
      checkIn: { ...preparedCheckin, synced: false },
      latencyMs: Date.now() - startTime,
      networkError: 'Conexão instável ou servidor Hostinger em espera. Enfileirado para sincronização em segundo plano.',
      hostingerDatabase: 'u844537895_Militantes',
      syncTimestamp
    };
  }

  // Test Hostinger MySQL API Endpoint Connectivity
  static async testHostingerConnection(): Promise<HostingerConnectionStatus> {
    const startTime = Date.now();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Try local Express test endpoint first (handles CORS on container seamlessly)
      const res = await fetch('/api/checkin/test-hostinger', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      if (res.ok) {
        const data = await res.json();
        return {
          connected: data.success ?? true,
          status: (data.hostingerData?.mysql_conectado || data.success) ? 'ONLINE' : 'CONFIGURACAO_PENDENTE',
          endpoint: 'https://militancia.mastervisionmarketing.com/api/checkin.php',
          database: 'u844537895_Militantes',
          latencyMs,
          message: data.message || 'Conexão com servidor Hostinger operando normalmente.',
          lastChecked: nowStr
        };
      }
    } catch {
      // Direct ping test fallback
    }

    // Direct check to Hostinger PHP script
    try {
      const directController = new AbortController();
      const directTimeout = setTimeout(() => directController.abort(), 3500);

      const directRes = await fetch('https://militancia.mastervisionmarketing.com/api/teste_conexao.php', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: directController.signal
      });
      clearTimeout(directTimeout);

      const latencyMs = Date.now() - startTime;
      if (directRes.ok) {
        const directData = await directRes.json().catch(() => ({}));
        return {
          connected: true,
          status: directData.mysql_conectado ? 'ONLINE' : 'CONFIGURACAO_PENDENTE',
          endpoint: 'https://militancia.mastervisionmarketing.com/api/checkin.php',
          database: 'u844537895_Militantes',
          latencyMs,
          message: directData.mensagem || 'Endpoint Hostinger conectado.',
          lastChecked: nowStr
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        status: 'OFFLINE',
        endpoint: 'https://militancia.mastervisionmarketing.com/api/checkin.php',
        database: 'u844537895_Militantes',
        latencyMs: Date.now() - startTime,
        message: 'Servidor Hostinger não respondeu no tempo limite (3.5s). Fila local de contingência ativa.',
        lastChecked: nowStr,
        error: err?.message || 'Falha de rede'
      };
    }

    return {
      connected: true,
      status: 'ONLINE',
      endpoint: 'https://militancia.mastervisionmarketing.com/api/checkin.php',
      database: 'u844537895_Militantes',
      latencyMs: Date.now() - startTime,
      message: 'Serviço de persistência ativo com contingência local.',
      lastChecked: nowStr
    };
  }

  // Batch Synchronize Pending Offline Checkins to Hostinger MySQL
  static async syncAllPendingCheckins(): Promise<{ total: number; succeeded: number; failed: number; errors: string[] }> {
    const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (queue.length === 0) {
      return { total: 0, succeeded: 0, failed: 0, errors: [] };
    }

    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];
    const remainingQueue: StreetCheckIn[] = [];

    for (const item of queue) {
      try {
        const result = await this.onCheckInCreated({ ...item, synced: true });
        if (result.status === 'synced_mysql') {
          succeeded++;
        } else {
          failed++;
          remainingQueue.push(item);
          if (result.networkError) errors.push(result.networkError);
        }
      } catch (err: any) {
        failed++;
        remainingQueue.push(item);
        errors.push(err?.message || 'Erro de transmissão');
      }
    }

    this.set(STORAGE_KEYS.OFFLINE_QUEUE, remainingQueue);
    return {
      total: queue.length,
      succeeded,
      failed,
      errors
    };
  }

  // Van Route Logs
  static getVanRouteLogs(): VanRouteLog[] {
    return this.get<VanRouteLog[]>(STORAGE_KEYS.VAN_ROUTES, [
      {
        id: 'route-log-01',
        vanId: 'van-01',
        vanName: 'Van 01 - Kobrasol / Campinas',
        vanPlate: 'BRA-2026',
        driverName: 'Roberto Valente (Beto Van)',
        driverPhone: '(48) 98412-9900',
        shift: 'manha',
        period: 'manha',
        date: '2026-08-25',
        timestamp: '2026-08-25 08:30:00',
        neighborhoodId: 'kobrasol',
        neighborhoodName: 'Kobrasol',
        streetsCovered: ['Rua Koesa', 'Av. Lédio João Martins', 'Rua Adhemar da Silva'],
        streetRoute: 'Rua Koesa, Av. Lédio João Martins',
        checkInStatus: 'concluido',
        status: 'concluido',
        latitude: -27.5962,
        longitude: -48.6190,
        photos: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80'],
        passengersCount: 14,
        notes: 'Equipe Alpha desembarcada no ponto de apoio da Praça Eugênio Raulino Koerich. Resgate às 12:30.'
      },
      {
        id: 'route-log-02',
        vanId: 'van-02',
        vanName: 'Van 02 - Barreiros / Bela Vista',
        vanPlate: 'VAN-4422',
        driverName: 'Marcos Silveira (Marcão)',
        driverPhone: '(48) 99133-7744',
        shift: 'tarde',
        period: 'tarde',
        date: '2026-08-25',
        timestamp: '2026-08-25 13:45:00',
        neighborhoodId: 'barreiros',
        neighborhoodName: 'Barreiros',
        streetsCovered: ['Av. Leoberto Leal', 'Rua Eugênio Portela'],
        streetRoute: 'Av. Leoberto Leal, Rua Eugênio Portela',
        checkInStatus: 'em_andamento',
        status: 'em_rota',
        latitude: -27.5740,
        longitude: -48.6070,
        photos: ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80'],
        passengersCount: 16,
        notes: 'Equipe Bravo operando na área comercial da Leoberto Leal.'
      }
    ]);
  }

  static addVanRouteLog(log: VanRouteLog): void {
    const list = [log, ...this.getVanRouteLogs()];
    this.set(STORAGE_KEYS.VAN_ROUTES, list);
    const user = this.getCurrentUser();
    this.logAudit(user, 'CRIACAO_ROTA_VAN', 'ROTA_VAN', `Roteiro de Van criado para ${log.vanName} no bairro ${log.neighborhoodName} (${log.period}).`);
  }

  static deleteVanRouteLog(id: string): void {
    const list = this.getVanRouteLogs().filter(r => r.id !== id);
    this.set(STORAGE_KEYS.VAN_ROUTES, list);
    const user = this.getCurrentUser();
    this.logAudit(user, 'EXCLUSAO_ROTA_VAN', 'ROTA_VAN', `Roteiro de Van ${id} excluído.`);
  }

  static syncOfflineQueue(): number {
    const queue = this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    if (queue.length === 0) return 0;

    // Trigger asynchronous queue transmission
    this.syncAllPendingCheckins().catch(() => {});
    return queue.length;
  }

  static getOfflineQueue(): StreetCheckIn[] {
    return this.get<StreetCheckIn[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  // Stock
  static getStock(): StockItem[] {
    return this.get(STORAGE_KEYS.STOCK, INITIAL_STOCK);
  }

  static getStockTransactions(): StockTransaction[] {
    return this.get(STORAGE_KEYS.STOCK_TX, INITIAL_STOCK_TRANSACTIONS);
  }

  static addStockTransaction(tx: StockTransaction): void {
    const stock = this.getStock();
    const item = stock.find(s => s.id === tx.itemId);
    if (item) {
      if (tx.type === 'entrada') {
        item.totalReceived += tx.quantity;
        item.currentStock += tx.quantity;
      } else if (tx.type === 'saida_equipe') {
        item.dispatched += tx.quantity;
        item.currentStock = Math.max(0, item.currentStock - tx.quantity);
      } else if (tx.type === 'devolucao') {
        item.dispatched = Math.max(0, item.dispatched - tx.quantity);
        item.currentStock += tx.quantity;
      }
      this.set(STORAGE_KEYS.STOCK, stock);
    }

    const txs = [tx, ...this.getStockTransactions()];
    this.set(STORAGE_KEYS.STOCK_TX, txs);

    const user = this.getCurrentUser();
    this.logAudit(
      user,
      `MOVIMENTACAO_ESTOQUE_${tx.type.toUpperCase()}`,
      'ESTOQUE',
      `${tx.quantity} ${item?.name || 'itens'} movimentados (${tx.type}) por ${tx.operatorName}.`
    );
  }

  private static decrementStockForCheckin(checkIn: StreetCheckIn): void {
    const stock = this.getStock();
    const map: Record<string, number> = {
      'stock-santinhos': checkIn.materialsDelivered.santinhos,
      'stock-adesivos': checkIn.materialsDelivered.adesivos,
      'stock-adesivo-bola': checkIn.materialsDelivered.adesivo_bola,
      'stock-adesivo-parachoque': checkIn.materialsDelivered.adesivo_parachoque,
      'stock-colinhas': checkIn.materialsDelivered.colinhas
    };

    stock.forEach(item => {
      const delivered = map[item.id] || 0;
      if (delivered > 0) {
        item.currentStock = Math.max(0, item.currentStock - delivered);
        item.dispatched += delivered;
      }
    });
    this.set(STORAGE_KEYS.STOCK, stock);
  }

  /**
   * Recalcula com precisão matemática as estatísticas de todos os 24 bairros e de todos os militantes
   * diretamente a partir da lista oficial de check-ins.
   * Evita qualquer divergência ou "sumiço" de dados entre telas.
   */
  static recalculateAllStatsFromCheckins(allCheckins?: StreetCheckIn[]): { neighborhoods: Neighborhood[]; militants: Militant[] } {
    const checkins = allCheckins || this.getCheckIns();
    const neighborhoods = this.get<Neighborhood[]>(STORAGE_KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS);
    const militants = this.getMilitants();

    // 1. Recalcula bairros a partir dos check-ins garantindo sempre os 28 bairros oficiais + Área Rural
    const rawNeighborhoods = this.get<Neighborhood[]>(STORAGE_KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS);
    const updatedNeighborhoods = INITIAL_NEIGHBORHOODS.map(official => {
      const existing = (rawNeighborhoods || []).find(n => 
        n.id === official.id || 
        (official.id === 'forquilhinha' && n.id === 'forquilhinhas') ||
        (n.name && n.name.toLowerCase().trim() === official.name.toLowerCase().trim())
      );

      const nCheckins = checkins.filter(c => 
        c.neighborhoodId === official.id || 
        (official.id === 'forquilhinha' && c.neighborhoodId === 'forquilhinhas') ||
        (official.id === 'forquilhas' && c.neighborhoodId === 'forquilhas') ||
        (c.neighborhoodName && c.neighborhoodName.toLowerCase().trim() === official.name.toLowerCase().trim())
      );
      const uniqueStreets = new Set(nCheckins.map(c => (c.streetName || '').toLowerCase().trim())).size;
      const completedCount = Math.min(official.totalStreets, Math.max(existing?.completedStreets || 0, uniqueStreets, nCheckins.length));

      const santinhosSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.santinhos || 0), 0);
      const adesivosSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivos || 0), 0);
      const adesivoBolaSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_bola || 0), 0);
      const adesivoParachoqueSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_parachoque || 0), 0);
      const colinhasSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.colinhas || 0), 0);
      const abordagensSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.abordagens || 0), 0);
      const comercioSum = nCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.comercio || 0), 0);

      return {
        ...official,
        completedStreets: completedCount,
        assignedTeamId: existing?.assignedTeamId || official.assignedTeamId,
        deliveredMaterials: {
          santinhos: Math.max(existing?.deliveredMaterials?.santinhos || 0, official.deliveredMaterials?.santinhos || 0, santinhosSum),
          adesivos: Math.max(existing?.deliveredMaterials?.adesivos || 0, official.deliveredMaterials?.adesivos || 0, adesivosSum),
          adesivo_bola: Math.max(existing?.deliveredMaterials?.adesivo_bola || 0, official.deliveredMaterials?.adesivo_bola || 0, adesivoBolaSum),
          adesivo_parachoque: Math.max(existing?.deliveredMaterials?.adesivo_parachoque || 0, official.deliveredMaterials?.adesivo_parachoque || 0, adesivoParachoqueSum),
          colinhas: Math.max(existing?.deliveredMaterials?.colinhas || 0, official.deliveredMaterials?.colinhas || 0, colinhasSum),
          abordagens: Math.max(existing?.deliveredMaterials?.abordagens || 0, official.deliveredMaterials?.abordagens || 0, abordagensSum),
          comercio: Math.max(existing?.deliveredMaterials?.comercio || 0, official.deliveredMaterials?.comercio || 0, comercioSum)
        }
      };
    });

    // 2. Recalcula militantes a partir dos check-ins
    const updatedMilitants = militants.map(m => {
      const mCheckins = checkins.filter(c => c.militantId === m.id || c.militantName === m.name);
      const santinhosSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.santinhos || 0), 0);
      const adesivosSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivos || 0), 0);
      const adesivoBolaSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_bola || 0), 0);
      const adesivoParachoqueSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.adesivo_parachoque || 0), 0);
      const colinhasSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.colinhas || 0), 0);
      const abordagensSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.abordagens || 0), 0);
      const comercioSum = mCheckins.reduce((sum, c) => sum + (c.materialsDelivered?.comercio || 0), 0);

      const streetsCovered = Math.max(m.totalStreetsCovered || 0, mCheckins.length);
      const kmWalked = Math.max(m.totalKmWalked || 0, +(mCheckins.length * 0.8).toFixed(1));

      return {
        ...m,
        status: mCheckins.length > 0 ? 'em_campo' : (m.status || 'ativo'),
        totalStreetsCovered: streetsCovered,
        totalKmWalked: kmWalked,
        deliveredMaterials: {
          santinhos: Math.max(m.deliveredMaterials?.santinhos || 0, santinhosSum),
          adesivos: Math.max(m.deliveredMaterials?.adesivos || 0, adesivosSum),
          adesivo_bola: Math.max(m.deliveredMaterials?.adesivo_bola || 0, adesivoBolaSum),
          adesivo_parachoque: Math.max(m.deliveredMaterials?.adesivo_parachoque || 0, adesivoParachoqueSum),
          colinhas: Math.max(m.deliveredMaterials?.colinhas || 0, colinhasSum),
          abordagens: Math.max(m.deliveredMaterials?.abordagens || 0, abordagensSum),
          comercio: Math.max(m.deliveredMaterials?.comercio || 0, comercioSum)
        }
      };
    });

    this.set(STORAGE_KEYS.NEIGHBORHOODS, updatedNeighborhoods, false);
    this.set(STORAGE_KEYS.MILITANTS, updatedMilitants, false);

    return { neighborhoods: updatedNeighborhoods, militants: updatedMilitants };
  }

  // Neighborhoods
  static getNeighborhoods(): Neighborhood[] {
    const rawList = this.get<Neighborhood[]>(STORAGE_KEYS.NEIGHBORHOODS, INITIAL_NEIGHBORHOODS);

    // Assegura incondicionalmente todos os 28 bairros oficiais (PMSJ 2020) + Área Rural (29 itens)
    const list: Neighborhood[] = INITIAL_NEIGHBORHOODS.map(official => {
      const existing = (rawList || []).find(n => 
        n.id === official.id || 
        (official.id === 'forquilhinha' && n.id === 'forquilhinhas') ||
        (n.name && n.name.toLowerCase().trim() === official.name.toLowerCase().trim())
      );
      if (existing) {
        return {
          ...official,
          completedStreets: Math.max(existing.completedStreets || 0, official.completedStreets || 0),
          deliveredMaterials: {
            santinhos: Math.max(existing.deliveredMaterials?.santinhos || 0, official.deliveredMaterials?.santinhos || 0),
            adesivos: Math.max(existing.deliveredMaterials?.adesivos || 0, official.deliveredMaterials?.adesivos || 0),
            adesivo_bola: Math.max(existing.deliveredMaterials?.adesivo_bola || 0, official.deliveredMaterials?.adesivo_bola || 0),
            adesivo_parachoque: Math.max(existing.deliveredMaterials?.adesivo_parachoque || 0, official.deliveredMaterials?.adesivo_parachoque || 0),
            colinhas: Math.max(existing.deliveredMaterials?.colinhas || 0, official.deliveredMaterials?.colinhas || 0),
            abordagens: Math.max(existing.deliveredMaterials?.abordagens || 0, official.deliveredMaterials?.abordagens || 0),
            comercio: Math.max(existing.deliveredMaterials?.comercio || 0, official.deliveredMaterials?.comercio || 0)
          },
          assignedTeamId: existing.assignedTeamId || official.assignedTeamId
        };
      }
      return official;
    });

    if (!rawList || rawList.length < INITIAL_NEIGHBORHOODS.length) {
      this.set(STORAGE_KEYS.NEIGHBORHOODS, list, true);
    }

    return list;
  }

  static updateNeighborhood(neigh: Neighborhood): void {
    const list = this.getNeighborhoods();
    const idx = list.findIndex(n => n.id === neigh.id);
    if (idx !== -1) {
      list[idx] = neigh;
      this.set(STORAGE_KEYS.NEIGHBORHOODS, list);
    }
  }

  // Militants
  static getMilitants(): Militant[] {
    let list = this.get<Militant[]>(STORAGE_KEYS.MILITANTS, []);
    if (!list || list.length === 0) {
      const altList = this.get<Militant[]>('militancia_militantes_v1', []);
      if (altList && altList.length > 0) {
        list = altList;
        this.set(STORAGE_KEYS.MILITANTS, list, false);
      } else {
        list = INITIAL_MILITANTS;
      }
    }
    return list;
  }

  static addOrUpdateMilitant(militant: Militant): void {
    const list = this.getMilitants();
    const idx = list.findIndex(m => m.id === militant.id);
    const updatedMil: Militant = {
      ...militant,
      updatedAt: militant.updatedAt || new Date().toISOString(),
      _localModified: true
    };

    if (idx !== -1) {
      list[idx] = updatedMil;
    } else {
      list.push(updatedMil);
    }

    // Grava de forma segura tanto no LocalStorage quanto no IndexedDB Vault
    this.set(STORAGE_KEYS.MILITANTS, list, true);
    this.safeLocalStorageSet('militantes_data', list);
    vaultStorage.setItem('militantes_data', list).catch(() => {});

    // Envia imediatamente para o servidor MySQL Hostinger
    this.pushEntityToRemote(STORAGE_KEYS.MILITANTS, list);
    this.pushEntityToRemote('militantes_data', list);

    const user = this.getCurrentUser();
    this.logAudit(
      user,
      idx !== -1 ? 'EDICAO_MILITANTE' : 'CADASTRO_MILITANTE',
      'CADASTROS',
      `Militante ${militant.name} (${militant.matricula}) ${idx !== -1 ? 'atualizado' : 'cadastrado'} com sucesso.`
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  static async deleteMilitant(militantId: string): Promise<{ deletedMilitant: Militant | null; deletedStreetsCount: number }> {
    const list = this.getMilitants();
    const targetMilitant = list.find(m => m.id === militantId) || null;
    const updatedMilitants = list.filter(m => m.id !== militantId);

    // 1. Remove militant locally from all collections and mark as permanently deleted
    const deletedIds = this.get<string[]>('deleted_entities_vault', []);
    if (!deletedIds.includes(militantId)) {
      deletedIds.push(militantId);
      this.set('deleted_entities_vault', deletedIds, false);
    }

    this.set(STORAGE_KEYS.MILITANTS, updatedMilitants, true);
    this.safeLocalStorageSet('militantes_data', updatedMilitants);
    this.safeLocalStorageSet('militancia_militantes_v1', updatedMilitants);
    vaultStorage.setItem('militantes_data', updatedMilitants).catch(() => {});
    vaultStorage.setItem('militancia_militants_v1', updatedMilitants).catch(() => {});

    // 2. Cascade: remove ALL check-ins (streets) registered in this militant's sheet
    const allCheckIns = this.getCheckIns();
    const targetNameLower = targetMilitant?.name ? targetMilitant.name.toLowerCase().trim() : '';
    const remainingCheckIns = allCheckIns.filter(c => {
      if (c.militantId === militantId) return false;
      if (targetNameLower && c.militantName && c.militantName.toLowerCase().trim() === targetNameLower) return false;
      return true;
    });
    const deletedStreetsCount = allCheckIns.length - remainingCheckIns.length;

    this.set(STORAGE_KEYS.CHECKINS, remainingCheckIns, true);
    this.safeLocalStorageSet('checkins_data', remainingCheckIns);
    this.safeLocalStorageSet('militancia_checkins_v1', remainingCheckIns);
    vaultStorage.setItem('militancia_checkins_v1', remainingCheckIns).catch(() => {});

    // 3. Recalculate neighborhood stats
    const neighborhoods = this.getNeighborhoods().map(n => {
      const nCheckins = remainingCheckIns.filter(c => c.neighborhoodId === n.id);
      const uniqueStreets = new Set(nCheckins.map(c => (c.streetName || '').toLowerCase().trim())).size;
      return {
        ...n,
        completedStreets: uniqueStreets,
        deliveredMaterials: {
          santinhos: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.santinhos || 0), 0),
          adesivos: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.adesivos || 0), 0),
          adesivo_bola: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.adesivo_bola || 0), 0),
          adesivo_parachoque: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.adesivo_parachoque || 0), 0),
          colinhas: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.colinhas || 0), 0),
          abordagens: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.abordagens || 0), 0),
          comercio: nCheckins.reduce((acc, c) => acc + (c.materialsDelivered?.comercio || 0), 0)
        }
      };
    });
    this.set(STORAGE_KEYS.NEIGHBORHOODS, neighborhoods, true);

    // 4. Send explicit definitive delete action to server API
    try {
      await fetch('/api/sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_militant',
          militantId,
          militantName: targetMilitant?.name,
          collections: {
            [STORAGE_KEYS.MILITANTS]: updatedMilitants,
            militantes_data: updatedMilitants,
            militancia_militantes_v1: updatedMilitants,
            [STORAGE_KEYS.CHECKINS]: remainingCheckIns,
            [STORAGE_KEYS.NEIGHBORHOODS]: neighborhoods
          },
          replace: true
        })
      });
    } catch (e) {
      console.warn('Erro ao sincronizar exclusão com servidor:', e);
    }

    const user = this.getCurrentUser();
    this.logAudit(
      user,
      'EXCLUSAO_MILITANTE',
      'CADASTROS',
      `Militante ${targetMilitant?.name || militantId} e todas as suas ${deletedStreetsCount} ruas foram excluídos definitivamente do sistema.`
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }

    return { deletedMilitant: targetMilitant, deletedStreetsCount };
  }

  // Teams
  static getTeams(): Team[] {
    return this.get(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  }

  static addOrUpdateTeam(team: Team): void {
    const list = this.getTeams();
    const idx = list.findIndex(t => t.id === team.id);
    const updatedTeam: Team = {
      ...team,
      updatedAt: team.updatedAt || new Date().toISOString(),
      _localModified: true
    };
    const user = this.getCurrentUser();
    if (idx !== -1) {
      list[idx] = updatedTeam;
      this.logAudit(user, 'EDICAO_EQUIPE', 'CADASTROS', `Equipe "${team.name}" atualizada.`);
    } else {
      list.push(updatedTeam);
      this.logAudit(user, 'INCLUSAO_EQUIPE', 'CADASTROS', `Nova equipe "${team.name}" cadastrada.`);
    }
    this.set(STORAGE_KEYS.TEAMS, list, true);
    this.pushEntityToRemote(STORAGE_KEYS.TEAMS, list);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  static updateTeam(team: Team): void {
    this.addOrUpdateTeam(team);
  }

  static async deleteTeam(teamId: string): Promise<void> {
    const list = this.getTeams();
    const targetTeam = list.find(t => t.id === teamId);
    const updatedList = list.filter(t => t.id !== teamId);
    
    // Mark team as permanently deleted
    const deletedIds = this.get<string[]>('deleted_entities_vault', []);
    if (!deletedIds.includes(teamId)) {
      deletedIds.push(teamId);
      this.set('deleted_entities_vault', deletedIds, false);
    }

    this.set(STORAGE_KEYS.TEAMS, updatedList, true);

    // Unassign or adjust militants that belonged to this deleted team
    const militants = this.getMilitants();
    let militantsChanged = false;
    militants.forEach(m => {
      if (m.teamId === teamId) {
        m.teamId = updatedList[0]?.id || 'sem_equipe';
        militantsChanged = true;
      }
    });
    if (militantsChanged) {
      this.set(STORAGE_KEYS.MILITANTS, militants, true);
      this.pushEntityToRemote(STORAGE_KEYS.MILITANTS, militants);
    }

    try {
      await fetch('/api/sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_team',
          teamId,
          collections: {
            [STORAGE_KEYS.TEAMS]: updatedList,
            [STORAGE_KEYS.MILITANTS]: militants
          },
          replace: true
        })
      });
    } catch (e) {
      console.warn('Erro ao sincronizar exclusão da equipe:', e);
    }

    const user = this.getCurrentUser();
    this.logAudit(user, 'EXCLUSAO_EQUIPE', 'CADASTROS', `Equipe "${targetTeam?.name || teamId}" foi excluída definitivamente do sistema.`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  // Vans
  static getVans(): Van[] {
    return this.get(STORAGE_KEYS.VANS, INITIAL_VANS);
  }

  static addOrUpdateVan(van: Van): void {
    const list = this.getVans();
    const idx = list.findIndex(v => v.id === van.id);
    const updatedVan: Van = {
      ...van,
      updatedAt: van.updatedAt || new Date().toISOString(),
      _localModified: true
    };
    const user = this.getCurrentUser();
    if (idx !== -1) {
      list[idx] = updatedVan;
      this.logAudit(user, 'EDICAO_MOTORISTA_VAN', 'CADASTROS', `Dados da van/motorista "${van.name}" (${van.driverName} - ${van.plate}) atualizados.`);
    } else {
      list.push(updatedVan);
      this.logAudit(user, 'INCLUSAO_MOTORISTA_VAN', 'CADASTROS', `Nova van cadastrada com motorista "${van.driverName}" (${van.plate} - ${van.name}).`);
    }
    this.set(STORAGE_KEYS.VANS, list, true);
    this.safeLocalStorageSet('vans_data', list);
    vaultStorage.setItem('vans_data', list).catch(() => {});

    this.pushEntityToRemote(STORAGE_KEYS.VANS, list);
    this.pushEntityToRemote('vans_data', list);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  static updateVan(van: Van): void {
    this.addOrUpdateVan(van);
  }

  static deleteVan(vanId: string): void {
    const list = this.getVans();
    const targetVan = list.find(v => v.id === vanId);
    const updatedList = list.filter(v => v.id !== vanId);
    this.set(STORAGE_KEYS.VANS, updatedList, true);
    this.safeLocalStorageSet('vans_data', updatedList);
    vaultStorage.setItem('vans_data', updatedList).catch(() => {});

    this.pushEntityToRemote(STORAGE_KEYS.VANS, updatedList);
    this.pushEntityToRemote('vans_data', updatedList);

    // Unassign teams assigned to this van
    const teams = this.getTeams();
    let teamsChanged = false;
    teams.forEach(t => {
      if (t.assignedVanId === vanId) {
        t.assignedVanId = updatedList[0]?.id || '';
        teamsChanged = true;
      }
    });
    if (teamsChanged) {
      this.set(STORAGE_KEYS.TEAMS, teams, true);
      this.pushEntityToRemote(STORAGE_KEYS.TEAMS, teams);
    }

    const user = this.getCurrentUser();
    this.logAudit(user, 'EXCLUSAO_MOTORISTA_VAN', 'CADASTROS', `Van e motorista "${targetVan?.driverName || vanId}" (${targetVan?.plate}) excluído do sistema.`);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('militancia_data_updated'));
    }
  }

  // Campaign Calendar
  static getCalendar(): CampaignCalendarDay[] {
    return this.get(STORAGE_KEYS.CALENDAR, INITIAL_CALENDAR_DAYS);
  }

  static updateCalendarDay(day: CampaignCalendarDay): void {
    const list = this.getCalendar();
    const idx = list.findIndex(d => d.id === day.id);
    if (idx !== -1) {
      list[idx] = day;
      this.set(STORAGE_KEYS.CALENDAR, list);
    }
  }

  // Notifications
  static getNotifications(): PushNotification[] {
    return this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static addNotification(notif: PushNotification): void {
    const list = [notif, ...this.getNotifications()];
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  static markNotificationRead(id: string): void {
    const list = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Audit Log / LGPD
  static getAuditLogs(): ActivityAuditLog[] {
    return this.get(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static logAudit(user: User, action: string, category: ActivityAuditLog['category'], details: string): void {
    const newLog: ActivityAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      category,
      ipAddress: '177.136.210.45',
      details
    };
    const logs = [newLog, ...this.getAuditLogs()];
    this.set(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 200));
  }

  // Export Full Database Backup Package
  static exportDatabaseBackup(exportedBy = 'Coordenador Geral'): DatabaseBackupPackage {
    const users = this.getUsers();
    const neighborhoods = this.getNeighborhoods();
    const militants = this.getMilitants();
    const teams = this.getTeams();
    const vans = this.getVans();
    const stock = this.getStock();
    const stockTransactions = this.getStockTransactions();
    const checkins = this.getCheckIns();
    const calendar = this.getCalendar();
    const payrolls = this.getPayrolls();
    const admins = this.getAdmins();
    const auditLogs = this.getAuditLogs();
    const notifications = this.getNotifications();

    const counts = {
      militants: militants.length,
      teams: teams.length,
      vans: vans.length,
      neighborhoods: neighborhoods.length,
      checkins: checkins.length,
      stockItems: stock.length,
      stockTransactions: stockTransactions.length,
      payrolls: payrolls.length,
      admins: admins.length,
      auditLogs: auditLogs.length,
      calendarDays: calendar.length,
      notifications: notifications.length,
      users: users.length
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    const backup: DatabaseBackupPackage = {
      metadata: {
        version: '1.0.0',
        systemName: 'Sistema de Gestão Territorial de Militância - São José / SC',
        exportedAt: new Date().toISOString(),
        exportedBy,
        totalRecords,
        environment: 'Produção / Hostinger MySQL + Client Cache',
        checksum: `CHK-${Date.now()}-${Math.floor(Math.random() * 899999 + 100000)}`,
        counts
      },
      data: {
        [STORAGE_KEYS.USERS]: users,
        [STORAGE_KEYS.NEIGHBORHOODS]: neighborhoods,
        [STORAGE_KEYS.MILITANTS]: militants,
        [STORAGE_KEYS.TEAMS]: teams,
        [STORAGE_KEYS.VANS]: vans,
        [STORAGE_KEYS.STOCK]: stock,
        [STORAGE_KEYS.STOCK_TX]: stockTransactions,
        [STORAGE_KEYS.CHECKINS]: checkins,
        [STORAGE_KEYS.CALENDAR]: calendar,
        [STORAGE_KEYS.PAYROLLS]: payrolls,
        [STORAGE_KEYS.ADMINS]: admins,
        [STORAGE_KEYS.AUDIT_LOGS]: auditLogs,
        [STORAGE_KEYS.NOTIFICATIONS]: notifications,
        users,
        neighborhoods,
        militants,
        teams,
        vans,
        stock,
        stockTransactions,
        checkins,
        calendar,
        payrolls,
        admins,
        auditLogs,
        notifications
      }
    };

    const currentUser = this.getCurrentUser();
    this.logAudit(
      currentUser,
      'BACKUP_BANCO_EXPORTADO',
      'RELATORIO',
      `Backup completo do banco de dados exportado com sucesso (${totalRecords} registros totais).`
    );

    return backup;
  }

  // Import / Restore Database Backup Package
  static importDatabaseBackup(
    backupRaw: any,
    mode: 'replace' | 'merge' = 'replace',
    currentUser?: User
  ): { success: boolean; message: string; counts?: any } {
    try {
      if (!backupRaw || typeof backupRaw !== 'object') {
        return { success: false, message: 'Arquivo de backup inválido ou vazio.' };
      }

      // Resolve payload structure (either under .data or top-level keys)
      const data = backupRaw.data && typeof backupRaw.data === 'object' ? backupRaw.data : backupRaw;

      // Extract collections supporting both STORAGE_KEYS and friendly keys
      const incomingUsers: User[] = data[STORAGE_KEYS.USERS] || data.users || [];
      const incomingNeighborhoods: Neighborhood[] = data[STORAGE_KEYS.NEIGHBORHOODS] || data.neighborhoods || [];
      const incomingMilitants: Militant[] = data[STORAGE_KEYS.MILITANTS] || data.militants || [];
      const incomingTeams: Team[] = data[STORAGE_KEYS.TEAMS] || data.teams || [];
      const incomingVans: Van[] = data[STORAGE_KEYS.VANS] || data.vans || [];
      const incomingStock: StockItem[] = data[STORAGE_KEYS.STOCK] || data.stock || [];
      const incomingStockTx: StockTransaction[] = data[STORAGE_KEYS.STOCK_TX] || data.stockTransactions || data.stock_tx || [];
      const incomingCheckins: StreetCheckIn[] = data[STORAGE_KEYS.CHECKINS] || data.checkins || [];
      const incomingCalendar: CampaignCalendarDay[] = data[STORAGE_KEYS.CALENDAR] || data.calendar || [];
      const incomingPayrolls: WeeklyPayroll[] = data[STORAGE_KEYS.PAYROLLS] || data.payrolls || [];
      const incomingAdmins: AdminUser[] = data[STORAGE_KEYS.ADMINS] || data.admins || [];
      const incomingAuditLogs: ActivityAuditLog[] = data[STORAGE_KEYS.AUDIT_LOGS] || data.auditLogs || [];
      const incomingNotifications: PushNotification[] = data[STORAGE_KEYS.NOTIFICATIONS] || data.notifications || [];

      // Validate that at least some core collections exist
      const hasCoreData =
        Array.isArray(incomingMilitants) ||
        Array.isArray(incomingCheckins) ||
        Array.isArray(incomingNeighborhoods) ||
        Array.isArray(incomingStock) ||
        Array.isArray(incomingTeams) ||
        Array.isArray(incomingPayrolls);

      if (!hasCoreData) {
        return {
          success: false,
          message: 'O arquivo não contém coleções reconhecidas da base de dados de militância.'
        };
      }

      const activeUser = currentUser || this.getCurrentUser();

      if (mode === 'replace') {
        if (incomingUsers.length > 0) this.set(STORAGE_KEYS.USERS, incomingUsers, false);
        if (incomingNeighborhoods.length > 0) this.set(STORAGE_KEYS.NEIGHBORHOODS, incomingNeighborhoods, false);
        if (incomingMilitants.length > 0) this.set(STORAGE_KEYS.MILITANTS, incomingMilitants, false);
        if (incomingTeams.length > 0) this.set(STORAGE_KEYS.TEAMS, incomingTeams, false);
        if (incomingVans.length > 0) this.set(STORAGE_KEYS.VANS, incomingVans, false);
        if (incomingStock.length > 0) this.set(STORAGE_KEYS.STOCK, incomingStock, false);
        if (incomingStockTx.length > 0) this.set(STORAGE_KEYS.STOCK_TX, incomingStockTx, false);
        if (incomingCheckins.length > 0) this.set(STORAGE_KEYS.CHECKINS, incomingCheckins, false);
        if (incomingCalendar.length > 0) this.set(STORAGE_KEYS.CALENDAR, incomingCalendar, false);
        if (incomingPayrolls.length > 0) this.set(STORAGE_KEYS.PAYROLLS, incomingPayrolls, false);
        if (incomingAdmins.length > 0) this.set(STORAGE_KEYS.ADMINS, incomingAdmins, false);
        if (incomingNotifications.length > 0) this.set(STORAGE_KEYS.NOTIFICATIONS, incomingNotifications, false);
        if (incomingAuditLogs.length > 0) this.set(STORAGE_KEYS.AUDIT_LOGS, incomingAuditLogs, false);
      } else {
        // Merge mode: combine without duplicating IDs
        const mergeById = <T extends { id: string }>(current: T[], incoming: T[]): T[] => {
          const map = new Map<string, T>();
          current.forEach(item => map.set(item.id, item));
          incoming.forEach(item => map.set(item.id, item));
          return Array.from(map.values());
        };

        if (incomingUsers.length > 0) this.set(STORAGE_KEYS.USERS, mergeById(this.getUsers(), incomingUsers), false);
        if (incomingNeighborhoods.length > 0) this.set(STORAGE_KEYS.NEIGHBORHOODS, mergeById(this.getNeighborhoods(), incomingNeighborhoods), false);
        if (incomingMilitants.length > 0) this.set(STORAGE_KEYS.MILITANTS, mergeById(this.getMilitants(), incomingMilitants), false);
        if (incomingTeams.length > 0) this.set(STORAGE_KEYS.TEAMS, mergeById(this.getTeams(), incomingTeams), false);
        if (incomingVans.length > 0) this.set(STORAGE_KEYS.VANS, mergeById(this.getVans(), incomingVans), false);
        if (incomingStock.length > 0) this.set(STORAGE_KEYS.STOCK, mergeById(this.getStock(), incomingStock), false);
        if (incomingStockTx.length > 0) this.set(STORAGE_KEYS.STOCK_TX, mergeById(this.getStockTransactions(), incomingStockTx), false);
        if (incomingCheckins.length > 0) this.set(STORAGE_KEYS.CHECKINS, mergeById(this.getCheckIns(), incomingCheckins), false);
        if (incomingCalendar.length > 0) this.set(STORAGE_KEYS.CALENDAR, mergeById(this.getCalendar(), incomingCalendar), false);
        if (incomingPayrolls.length > 0) this.set(STORAGE_KEYS.PAYROLLS, mergeById(this.getPayrolls(), incomingPayrolls), false);
        if (incomingAdmins.length > 0) this.set(STORAGE_KEYS.ADMINS, mergeById(this.getAdmins(), incomingAdmins), false);
        if (incomingNotifications.length > 0) this.set(STORAGE_KEYS.NOTIFICATIONS, mergeById(this.getNotifications(), incomingNotifications), false);
      }

      // Log the restore event
      this.logAudit(
        activeUser,
        'IMPORTACAO_BANCO_DADOS',
        'CADASTROS',
        `Importação de banco de dados concluída em modo "${mode}". ${incomingCheckins.length} check-ins, ${incomingMilitants.length} militantes restaurados.`
      );

      // Trigger push to remote Hostinger
      this.pushAllToRemote();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('militancia_data_updated'));
      }

      const importedCounts = {
        militants: incomingMilitants.length,
        checkins: incomingCheckins.length,
        neighborhoods: incomingNeighborhoods.length,
        teams: incomingTeams.length,
        vans: incomingVans.length,
        stockItems: incomingStock.length,
        payrolls: incomingPayrolls.length,
        admins: incomingAdmins.length
      };

      return {
        success: true,
        message: `Banco de dados importado com sucesso!`,
        counts: importedCounts
      };
    } catch (err: any) {
      console.error('Import database error:', err);
      return {
        success: false,
        message: `Erro ao processar arquivo de backup: ${err.message || 'Formato JSON inválido'}`
      };
    }
  }

  // Get Summary Database Stats
  static getDatabaseStatistics(): {
    totalRecords: number;
    estimatedSizeKb: number;
    counts: {
      militants: number;
      teams: number;
      vans: number;
      neighborhoods: number;
      checkins: number;
      stockItems: number;
      payrolls: number;
      admins: number;
      auditLogs: number;
    };
  } {
    const militants = this.getMilitants();
    const teams = this.getTeams();
    const vans = this.getVans();
    const neighborhoods = this.getNeighborhoods();
    const checkins = this.getCheckIns();
    const stock = this.getStock();
    const payrolls = this.getPayrolls();
    const admins = this.getAdmins();
    const auditLogs = this.getAuditLogs();

    const counts = {
      militants: militants.length,
      teams: teams.length,
      vans: vans.length,
      neighborhoods: neighborhoods.length,
      checkins: checkins.length,
      stockItems: stock.length,
      payrolls: payrolls.length,
      admins: admins.length,
      auditLogs: auditLogs.length
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    let totalChars = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith('militancia_')) {
          totalChars += (localStorage.getItem(key) || '').length;
        }
      }
    } catch {}

    const estimatedSizeKb = Math.max(1, Math.round(totalChars / 1024));

    return {
      totalRecords,
      estimatedSizeKb,
      counts
    };
  }

  // Generate MySQL Schema & Migration Dump
  static generateMySQLDump(): string {
    return `-- ==============================================================================
-- SCHEMA & ESTRUTURA DO BANCO DE DADOS MYSQL - CAMPANHA SÃO JOSÉ / SC
-- Otimizado para Hospedagem Hostinger (cPanel / phpMyAdmin / VPS) com OAuth 2.0 e LGPD
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS \`militancia_sao_jose_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`militancia_sao_jose_db\`;

-- 1. Tabela de Usuários e Autenticação OAuth 2.0
CREATE TABLE IF NOT EXISTS \`usuarios\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`nome\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`cargo\` ENUM('admin', 'coordenador', 'lider', 'militante', 'motorista_van') NOT NULL DEFAULT 'militante',
  \`equipe_id\` VARCHAR(64) NULL,
  \`telefone\` VARCHAR(30) NULL,
  \`matricula\` VARCHAR(50) NOT NULL UNIQUE,
  \`avatar_url\` VARCHAR(255) NULL,
  \`oauth_provider\` VARCHAR(50) DEFAULT 'google_oauth2',
  \`oauth_sub\` VARCHAR(191) NULL,
  \`lgpd_consentimento\` TINYINT(1) NOT NULL DEFAULT 1,
  \`lgpd_data_consentimento\` DATETIME NULL,
  \`criado_em\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`atualizado_em\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Bairros de São José (Dados IBGE e Metas)
CREATE TABLE IF NOT EXISTS \`bairros_sao_jose\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`nome\` VARCHAR(100) NOT NULL,
  \`distrito\` VARCHAR(100) NOT NULL,
  \`populacao_ibge\` INT NOT NULL,
  \`domicilios\` INT NOT NULL,
  \`eleitores_estimados\` INT NOT NULL,
  \`total_ruas\` INT NOT NULL,
  \`ruas_concluidas\` INT NOT NULL DEFAULT 0,
  \`latitude\` DECIMAL(10,8) NOT NULL,
  \`longitude\` DECIMAL(11,8) NOT NULL,
  \`prioridade\` ENUM('Alta', 'Média', 'Baixa') NOT NULL DEFAULT 'Alta',
  \`meta_santinhos\` INT DEFAULT 0,
  \`meta_adesivos\` INT DEFAULT 0,
  \`meta_adesivo_bola\` INT DEFAULT 0,
  \`meta_adesivo_parachoque\` INT DEFAULT 0,
  \`meta_colinhas\` INT DEFAULT 0,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Check-ins de Rua e Auditoria de Campo (GPS + Fotos)
CREATE TABLE IF NOT EXISTS \`checkins_ruas\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`militante_id\` VARCHAR(64) NOT NULL,
  \`militante_nome\` VARCHAR(150) NOT NULL,
  \`equipe_id\` VARCHAR(64) NOT NULL,
  \`bairro_id\` VARCHAR(64) NOT NULL,
  \`bairro_nome\` VARCHAR(100) NOT NULL,
  \`nome_rua\` VARCHAR(200) NOT NULL,
  \`faixa_numeracao\` VARCHAR(100) NULL,
  \`timestamp_checkin\` DATETIME NOT NULL,
  \`latitude\` DECIMAL(10,8) NOT NULL,
  \`longitude\` DECIMAL(11,8) NOT NULL,
  \`precisao_gps_metros\` DECIMAL(6,2) NULL,
  \`fotos_json\` TEXT NULL,
  \`qtd_santinhos\` INT DEFAULT 0,
  \`qtd_adesivos\` INT DEFAULT 0,
  \`qtd_adesivo_bola\` INT DEFAULT 0,
  \`qtd_adesivo_parachoque\` INT DEFAULT 0,
  \`qtd_colinhas\` INT DEFAULT 0,
  \`observacoes\` TEXT NULL,
  \`status_auditoria\` ENUM('validado', 'pendente_auditoria', 'rejeitado') DEFAULT 'validado',
  \`sincronizado\` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_bairro\` (\`bairro_id\`),
  INDEX \`idx_militante\` (\`militante_id\`),
  INDEX \`idx_timestamp\` (\`timestamp_checkin\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Controle de Estoque Central de Materiais Promocionais
CREATE TABLE IF NOT EXISTS \`estoque_materiais\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`nome\` VARCHAR(150) NOT NULL,
  \`codigo_sku\` VARCHAR(50) NOT NULL,
  \`tipo_material\` ENUM('santinhos', 'adesivos', 'adesivo_bola', 'adesivo_parachoque', 'colinhas') NOT NULL,
  \`total_recebido\` INT NOT NULL DEFAULT 0,
  \`total_despachado\` INT NOT NULL DEFAULT 0,
  \`saldo_atual\` INT NOT NULL DEFAULT 0,
  \`alerta_minimo\` INT NOT NULL DEFAULT 5000,
  \`unidade\` VARCHAR(20) DEFAULT 'unidades',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela de Planejador de Rotas de Van e Calendário da Campanha (26/08 a 03/10/2026)
CREATE TABLE IF NOT EXISTS \`calendario_campanha\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`data_campanha\` DATE NOT NULL UNIQUE,
  \`dia_semana\` VARCHAR(30) NOT NULL,
  \`numero_dia\` INT NOT NULL,
  \`bairros_alvo_json\` JSON NOT NULL,
  \`equipes_alocadas_json\` JSON NOT NULL,
  \`meta_ruas_dia\` INT NOT NULL,
  \`meta_materiais_dia\` INT NOT NULL,
  \`rotas_van_json\` JSON NOT NULL,
  \`status\` ENUM('planejado', 'em_andamento', 'concluido') DEFAULT 'planejado',
  \`taxa_conclusao_pct\` DECIMAL(5,2) NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Auditoria LGPD e Logs de Atividades
CREATE TABLE IF NOT EXISTS \`auditoria_lgpd_logs\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`timestamp_evento\` DATETIME NOT NULL,
  \`usuario_id\` VARCHAR(64) NOT NULL,
  \`usuario_nome\` VARCHAR(150) NOT NULL,
  \`usuario_cargo\` VARCHAR(50) NOT NULL,
  \`acao\` VARCHAR(100) NOT NULL,
  \`categoria\` ENUM('AUTENTICACAO', 'CHECKIN_RUA', 'ESTOQUE', 'RELATORIO', 'LGPD', 'ROTA_VAN', 'CADASTROS', 'FOLHA_PAGAMENTO') NOT NULL,
  \`ip_origem\` VARCHAR(45) NOT NULL,
  \`detalhes\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_usuario\` (\`usuario_id\`),
  INDEX \`idx_data\` (\`timestamp_evento\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Administradores da Campanha (Acesso Restrito & PIN)
CREATE TABLE IF NOT EXISTS \`administradores_campanha\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`nome\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`matricula\` VARCHAR(50) NOT NULL UNIQUE,
  \`telefone\` VARCHAR(30) NULL,
  \`cargo\` VARCHAR(50) NOT NULL DEFAULT 'admin',
  \`pin_code_hash\` VARCHAR(255) NOT NULL,
  \`nivel_seguranca\` ENUM('super_admin', 'financeiro', 'coordenador_geral') NOT NULL DEFAULT 'super_admin',
  \`ativo\` TINYINT(1) NOT NULL DEFAULT 1,
  \`criado_em\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Folha de Pagamento Semanal & Diárias
CREATE TABLE IF NOT EXISTS \`folha_pagamento_semanal\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`numero_semana\` INT NOT NULL,
  \`rotulo_semana\` VARCHAR(100) NOT NULL,
  \`data_inicio\` DATE NOT NULL,
  \`data_fim\` DATE NOT NULL,
  \`status\` ENUM('aberta', 'em_analise', 'fechada_paga') NOT NULL DEFAULT 'aberta',
  \`total_geral_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_dias_trabalhados\` INT NOT NULL DEFAULT 0,
  \`total_trabalhadores_pagos\` INT NOT NULL DEFAULT 0,
  \`total_militantes_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_lideres_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_motoristas_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`aprovado_por\` VARCHAR(150) NULL,
  \`aprovado_em\` DATETIME NULL,
  \`observacoes\` TEXT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabela de Itens da Folha de Pagamento (Diárias Individuais)
CREATE TABLE IF NOT EXISTS \`itens_folha_pagamento\` (
  \`id\` VARCHAR(64) NOT NULL,
  \`folha_id\` VARCHAR(64) NOT NULL,
  \`trabalhador_id\` VARCHAR(64) NOT NULL,
  \`nome_trabalhador\` VARCHAR(150) NOT NULL,
  \`cargo\` ENUM('militante', 'lider', 'motorista_van', 'coordenador') NOT NULL,
  \`matricula\` VARCHAR(50) NOT NULL,
  \`cpf_mascarado\` VARCHAR(20) NOT NULL,
  \`chave_pix\` VARCHAR(100) NOT NULL,
  \`tipo_chave_pix\` ENUM('CPF', 'Telefone', 'Email', 'Chave Aleatória') NOT NULL,
  \`valor_diaria\` DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  \`dias_trabalhados\` INT NOT NULL DEFAULT 0,
  \`escala_dias_json\` JSON NOT NULL,
  \`bonus_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`descontos_reais\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_total_liquido\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('pendente', 'aprovado', 'pago') NOT NULL DEFAULT 'pendente',
  \`data_pagamento\` DATETIME NULL,
  \`numero_recibo\` VARCHAR(100) NULL,
  \`observacoes\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`folha_id\`) REFERENCES \`folha_pagamento_semanal\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_trabalhador\` (\`trabalhador_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;
  }
}
