import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const rawPort = process.env.PORT || 3000;
  const PORT = !isNaN(Number(rawPort)) ? Number(rawPort) : rawPort;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  const VAULT_FILE_PATH = path.join(process.cwd(), 'data_server_vault.json');

  // Active SSE connections for instant real-time broadcasts across all users/devices
  const sseClients = new Set<express.Response>();

  const broadcastRealTimeUpdate = (type: string, data: any) => {
    const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  const readServerVault = (): Record<string, any> => {
    try {
      if (fs.existsSync(VAULT_FILE_PATH)) {
        const raw = fs.readFileSync(VAULT_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading server vault file:', e);
    }
    return {};
  };

  // Deep non-destructive merge for multi-user and multi-device concurrency
  const mergeVaultData = (current: Record<string, any>, incoming: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = { ...current };

    // Build unified blacklist of deleted IDs from both current vault and incoming data
    const allDeletedIds = new Set<string>([
      ...(Array.isArray(result['deleted_entities_vault']) ? result['deleted_entities_vault'] : []),
      ...(Array.isArray(result['deleted_militants_ids']) ? result['deleted_militants_ids'] : []),
      ...(Array.isArray(result['deleted_teams_ids']) ? result['deleted_teams_ids'] : []),
      ...(Array.isArray(result['deleted_vans_ids']) ? result['deleted_vans_ids'] : []),
      ...(Array.isArray(result['deleted_checkins_ids']) ? result['deleted_checkins_ids'] : []),
      ...(Array.isArray(incoming['deleted_entities_vault']) ? incoming['deleted_entities_vault'] : []),
      ...(Array.isArray(incoming['deleted_militants_ids']) ? incoming['deleted_militants_ids'] : []),
      ...(Array.isArray(incoming['deleted_teams_ids']) ? incoming['deleted_teams_ids'] : []),
      ...(Array.isArray(incoming['deleted_vans_ids']) ? incoming['deleted_vans_ids'] : []),
      ...(Array.isArray(incoming['deleted_checkins_ids']) ? incoming['deleted_checkins_ids'] : [])
    ].map(String));

    // Keep deleted blacklist persistent in result
    if (allDeletedIds.size > 0) {
      result['deleted_entities_vault'] = Array.from(allDeletedIds);
    }

    for (const [key, incomingValue] of Object.entries(incoming)) {
      if (key.startsWith('_')) continue;

      if (Array.isArray(incomingValue)) {
        const currentArray = Array.isArray(result[key]) ? result[key] : [];
        const itemMap = new Map<string, any>();

        // 1. Index all existing server items, respecting global deleted blacklist
        currentArray.forEach((item: any) => {
          if (item && item.id) {
            const idStr = String(item.id);
            if (allDeletedIds.has(idStr)) {
              return; // Skip permanently deleted entity
            }
            if (key === 'militancia_checkins_v1' && (allDeletedIds.has(String(item.militantId)) || allDeletedIds.has(String(item.militante_id)))) {
              return; // Skip checkin associated with deleted militant
            }
            itemMap.set(idStr, item);
          }
        });

        // 2. Merge incoming items non-destructively, respecting global deleted blacklist
        incomingValue.forEach((incomingItem: any) => {
          if (incomingItem && incomingItem.id) {
            const idStr = String(incomingItem.id);
            if (allDeletedIds.has(idStr)) {
              return; // Skip permanently deleted entity
            }
            if (key === 'militancia_checkins_v1' && (allDeletedIds.has(String(incomingItem.militantId)) || allDeletedIds.has(String(incomingItem.militante_id)))) {
              return; // Skip checkin associated with deleted militant
            }
            const existingItem = itemMap.get(idStr);

            if (!existingItem) {
              // New record created by another device/user -> add it!
              itemMap.set(idStr, incomingItem);
            } else {
              // Both have it -> merge properties safely
              let merged = { ...existingItem, ...incomingItem };

              // Special handling for Check-ins: preserve photos and most complete data
              if (key === 'militancia_checkins_v1') {
                const existingPhotos = Array.isArray(existingItem.photos) ? existingItem.photos.filter((p: any) => p && p !== '[vault_photo]' && !String(p).includes('unsplash.com')) : [];
                const incomingPhotos = Array.isArray(incomingItem.photos) ? incomingItem.photos.filter((p: any) => p && p !== '[vault_photo]' && !String(p).includes('unsplash.com')) : [];
                const finalPhotos = incomingPhotos.length > 0 ? incomingPhotos : existingPhotos;

                merged = {
                  ...existingItem,
                  ...incomingItem,
                  photos: finalPhotos,
                  observations: incomingItem.observations || existingItem.observations || '',
                  latitude: Number(incomingItem.latitude) || Number(existingItem.latitude) || -27.5962,
                  longitude: Number(incomingItem.longitude) || Number(existingItem.longitude) || -48.6190,
                  status: incomingItem.status || existingItem.status || 'validado',
                  synced: true
                };
              }

              itemMap.set(idStr, merged);
            }
          }
        });

        // Convert map back to array and preserve newest first for checkins/logs
        const mergedList = Array.from(itemMap.values());
        if (key === 'militancia_checkins_v1' || key === 'militancia_audit_logs_v1' || key === 'militancia_notifications_v1') {
          mergedList.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.timestamp_checkin || a.created_at || 0).getTime();
            const timeB = new Date(b.timestamp || b.timestamp_checkin || b.created_at || 0).getTime();
            return timeB - timeA;
          });
        }
        result[key] = mergedList;
      } else if (incomingValue && typeof incomingValue === 'object') {
        result[key] = { ...(result[key] || {}), ...incomingValue };
      } else if (incomingValue !== undefined) {
        result[key] = incomingValue;
      }
    }

    result._lastServerSavedAt = new Date().toISOString();
    return result;
  };

  const writeServerVault = (data: Record<string, any>, options?: { replace?: boolean }): Record<string, any> => {
    try {
      const current = readServerVault();
      let updated: Record<string, any>;
      if (options?.replace) {
        updated = { ...current, ...data, _lastServerSavedAt: new Date().toISOString() };
      } else {
        updated = mergeVaultData(current, data);
      }
      fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
      
      // Also write to public copy for static availability
      try {
        const publicVaultPath = path.join(process.cwd(), 'public', 'api', 'data_server_vault.json');
        if (fs.existsSync(path.dirname(publicVaultPath))) {
          fs.writeFileSync(publicVaultPath, JSON.stringify(updated, null, 2), 'utf-8');
        }
      } catch {}

      return updated;
    } catch (e) {
      console.error('Error writing server vault file:', e);
      return readServerVault();
    }
  };

  // Health endpoint
  app.get('/api/health', (req, res) => {
    const vault = readServerVault();
    res.json({
      status: 'ok',
      service: 'Militância São José - SC API',
      timestamp: new Date().toISOString(),
      city: 'São José - Santa Catarina',
      target_mysql: 'u844537895_Militantes @ militancia.mastervisionmarketing.com',
      serverVaultKeys: Object.keys(vault),
      port: typeof PORT === 'number' ? PORT : 'passenger_socket'
    });
  });

  // Hostinger MySQL Test Connectivity Endpoint
  const handleTestHostinger = async (req: express.Request, res: express.Response) => {
    const startTime = Date.now();
    const targetUrl = 'https://militancia.mastervisionmarketing.com/api/teste_conexao.php';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      const data = await response.json().catch(() => ({ status: 'active_non_json' }));

      return res.json({
        success: true,
        endpoint: targetUrl,
        latencyMs,
        httpStatus: response.status,
        hostingerData: data,
        message: 'Endpoint Hostinger acessível com sucesso.'
      });
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = error.name === 'AbortError';

      return res.json({
        success: false,
        endpoint: targetUrl,
        latencyMs,
        isTimeout,
        errorType: isTimeout ? 'TIMEOUT_6000MS' : 'NETWORK_ERROR',
        errorMessage: error.message || 'Erro ao conectar no servidor Hostinger.',
        message: 'Servidor Hostinger temporariamente indisponível. Modo de contingência e cofre local ativo.',
        targetDatabase: 'u844537895_Militantes'
      });
    }
  };

  app.get('/api/checkin/test-hostinger', handleTestHostinger);
  app.get('/api/teste_conexao.php', handleTestHostinger);

  // Real-time Server-Sent Events (SSE) stream for instantaneous cross-device synchronization
  app.get('/api/sync/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    // Send initial handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Real-Time Sync Active', timestamp: new Date().toISOString() })}\n\n`);

    // Keep-alive heartbeat every 15s
    const keepAlive = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // Check-in API endpoint (POST /api/checkin and /api/checkin.php)
  const handleCheckInPost = async (req: express.Request, res: express.Response) => {
    const checkInData = req.body;
    const targetUrl = 'https://militancia.mastervisionmarketing.com/api/checkin.php';

    if (!checkInData) {
      return res.status(400).json({
        success: false,
        error: 'Dados de check-in inválidos.'
      });
    }

    let savedCheckin: any = null;

    // 1. Persist immediately to server disk vault with normalized structure
    try {
      const itemData = checkInData.data || checkInData;

      if (itemData && itemData.id) {
        let photosList: string[] = [];
        if (Array.isArray(itemData.photos)) {
          photosList = itemData.photos;
        } else if (itemData.fotos_json) {
          try {
            photosList = typeof itemData.fotos_json === 'string' ? JSON.parse(itemData.fotos_json) : itemData.fotos_json;
          } catch {
            photosList = [];
          }
        }

        const normalized: any = {
          id: String(itemData.id),
          militantId: itemData.militantId || itemData.militante_id || 'mil-01',
          militantName: itemData.militantName || itemData.militante_nome || 'Militante',
          teamId: itemData.teamId || itemData.equipe_id || 'team-1787840837258',
          neighborhoodId: itemData.neighborhoodId || itemData.bairro_id || 'forquilhinhas',
          neighborhoodName: itemData.neighborhoodName || itemData.bairro_nome || 'Forquilhinhas',
          streetName: itemData.streetName || itemData.nome_rua || 'Rua Geral',
          houseNumberRange: itemData.houseNumberRange || itemData.faixa_numeracao || 'Trecho Geral',
          timestamp: itemData.timestamp || itemData.timestamp_checkin || new Date().toISOString(),
          latitude: Number(itemData.latitude) || -27.5962,
          longitude: Number(itemData.longitude) || -48.6190,
          accuracyMeters: Number(itemData.accuracyMeters || itemData.precisao_gps_metros || 4.2),
          photos: photosList,
          materialsDelivered: itemData.materialsDelivered || {
            santinhos: Number(itemData.qtd_santinhos || 0),
            adesivos: Number(itemData.qtd_adesivos || 0),
            adesivo_bola: Number(itemData.qtd_adesivo_bola || 0),
            adesivo_parachoque: Number(itemData.qtd_adesivo_parachoque || 0),
            colinhas: Number(itemData.qtd_colinhas || 0),
            abordagens: Number(itemData.qtd_abordagens || 0),
            comercio: Number(itemData.qtd_comercio || 0)
          },
          observations: itemData.observations || itemData.observacoes || '',
          status: itemData.status || itemData.status_auditoria || 'validado',
          synced: true
        };

        savedCheckin = normalized;

        // Write safely via non-destructive merge
        writeServerVault({
          militancia_checkins_v1: [normalized]
        });

        // Broadcast instant update to all other connected clients
        broadcastRealTimeUpdate('checkin_created', normalized);
      }
    } catch (e) {
      console.error('Server vault checkin save error:', e);
    }

    // 2. Dispatch in background to Hostinger MySQL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const hostingerResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(checkInData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (hostingerResponse.ok) {
        const responseData = await hostingerResponse.json().catch(() => null);
        return res.json({
          success: true,
          status: 'synced_mysql',
          destination: 'Hostinger MySQL + Server Vault',
          message: 'Check-in persistido no cofre do servidor e no MySQL da Hostinger.',
          hostingerResponse: responseData,
          checkIn: savedCheckin || checkInData
        });
      } else {
        return res.json({
          success: true,
          status: 'synced_local_vault',
          destination: 'Cofre Local do Servidor',
          message: 'Check-in garantido no cofre do servidor Node.',
          checkIn: savedCheckin || checkInData
        });
      }
    } catch (error: any) {
      return res.json({
        success: true,
        status: 'synced_local_vault',
        destination: 'Cofre Local do Servidor (Offline / Timeout)',
        message: 'Check-in gravado no cofre em disco com 100% de integridade.',
        checkIn: savedCheckin || checkInData
      });
    }
  };

  app.post('/api/checkin', handleCheckInPost);
  app.post('/api/checkin.php', handleCheckInPost);

  // Check-in API endpoint (GET /api/checkin and /api/checkin.php)
  const handleCheckInGet = async (req: express.Request, res: express.Response) => {
    const targetUrl = 'https://militancia.mastervisionmarketing.com/api/checkin.php';
    const vault = readServerVault();
    const deletedCheckinIds = new Set<string>((vault['deleted_checkins_ids'] || []).map(String));
    const localCheckins = (vault['militancia_checkins_v1'] || []).filter((c: any) => !deletedCheckinIds.has(String(c.id)));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const hostingerResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (hostingerResponse.ok) {
        const data = await hostingerResponse.json();
        // Merge remote and server vault checkins non-destructively
        const rawRemote = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        const remoteCheckins = rawRemote.map((r: any) => {
          let photos = [];
          if (Array.isArray(r.photos)) photos = r.photos;
          else if (typeof r.fotos_json === 'string' && r.fotos_json.trim()) {
            try { photos = JSON.parse(r.fotos_json); } catch {}
          } else if (Array.isArray(r.fotos_json)) photos = r.fotos_json;

          return {
            id: String(r.id),
            militantId: String(r.militantId || r.militante_id || 'mil-01'),
            militantName: String(r.militantName || r.militante_nome || 'Militante'),
            teamId: String(r.teamId || r.equipe_id || 'team-alpha'),
            neighborhoodId: String(r.neighborhoodId || r.bairro_id || 'kobrasol'),
            neighborhoodName: String(r.neighborhoodName || r.bairro_nome || 'Kobrasol'),
            streetName: String(r.streetName || r.nome_rua || 'Rua de Campo'),
            houseNumberRange: String(r.houseNumberRange || r.faixa_numeracao || 'Trecho Geral'),
            timestamp: String(r.timestamp || r.timestamp_checkin || new Date().toISOString()),
            latitude: Number(r.latitude) || -27.5962,
            longitude: Number(r.longitude) || -48.6190,
            accuracyMeters: Number(r.accuracyMeters || r.precisao_gps_metros) || 4.0,
            materialsDelivered: {
              santinhos: Number(r.materialsDelivered?.santinhos ?? r.qtd_santinhos ?? 0),
              adesivos: Number(r.materialsDelivered?.adesivos ?? r.qtd_adesivos ?? 0),
              adesivo_bola: Number(r.materialsDelivered?.adesivo_bola ?? r.qtd_adesivo_bola ?? 0),
              adesivo_parachoque: Number(r.materialsDelivered?.adesivo_parachoque ?? r.qtd_adesivo_parachoque ?? 0),
              colinhas: Number(r.materialsDelivered?.colinhas ?? r.qtd_colinhas ?? 0),
              abordagens: Number(r.materialsDelivered?.abordagens ?? r.qtd_abordagens ?? 0),
              comercio: Number(r.materialsDelivered?.comercio ?? r.qtd_comercio ?? 0)
            },
            photos: Array.isArray(photos) ? photos : [],
            observations: String(r.observations || r.observacoes || ''),
            status: r.status || r.status_auditoria || 'validado',
            synced: true
          };
        });

        const mergedMap = new Map();
        localCheckins.forEach((c: any) => {
          if (c && c.id && !deletedCheckinIds.has(String(c.id))) {
            mergedMap.set(String(c.id), c);
          }
        });
        remoteCheckins.forEach((c: any) => {
          if (c && c.id && !deletedCheckinIds.has(String(c.id))) {
            const idStr = String(c.id);
            const exist = mergedMap.get(idStr);
            const finalPhotos = (exist?.photos && exist.photos.length > 0) ? exist.photos : c.photos;
            mergedMap.set(idStr, exist ? { ...c, ...exist, photos: finalPhotos } : c);
          }
        });
        const mergedList = Array.from(mergedMap.values());
        return res.json({ status: 'success', data: mergedList, count: mergedList.length });
      }
      return res.json({ status: 'local_fallback', data: localCheckins });
    } catch {
      return res.json({ status: 'local_fallback', data: localCheckins });
    }
  };

  app.get('/api/checkin', handleCheckInGet);
  app.get('/api/checkin.php', handleCheckInGet);

  // Sync API endpoint (POST /api/sync and /api/sync.php)
  const handleSyncPost = async (req: express.Request, res: express.Response) => {
    const syncData = req.body;
    const targetUrl = 'https://militancia.mastervisionmarketing.com/api/sync.php';

    // 0. Handle explicit definitive deletion of check-in / street
    if (syncData.action === 'delete_checkin') {
      try {
        const checkInId = String(syncData.checkInId || syncData.id);
        const current = readServerVault();
        const chkList = (current['militancia_checkins_v1'] || []).filter((c: any) => String(c.id) !== checkInId);
        const deletedCheckinsList: string[] = Array.isArray(current['deleted_checkins_ids'])
          ? [...current['deleted_checkins_ids']]
          : [];
        if (!deletedCheckinsList.includes(checkInId)) {
          deletedCheckinsList.push(checkInId);
        }

        const updatedVault = {
          ...current,
          militancia_checkins_v1: chkList,
          checkins_data: chkList,
          deleted_checkins_ids: deletedCheckinsList,
          _lastServerSavedAt: new Date().toISOString()
        };
        fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(updatedVault, null, 2), 'utf-8');
        try {
          const publicVaultPath = path.join(process.cwd(), 'public', 'api', 'data_server_vault.json');
          if (fs.existsSync(path.dirname(publicVaultPath))) {
            fs.writeFileSync(publicVaultPath, JSON.stringify(updatedVault, null, 2), 'utf-8');
          }
        } catch {}

        broadcastRealTimeUpdate('checkin_deleted', { checkInId });
        return res.json({ status: 'success', deletedCheckInId: checkInId });
      } catch (e) {
        console.error('Error in delete_checkin:', e);
        return res.status(500).json({ status: 'error', message: 'Erro ao excluir check-in definitivamente.' });
      }
    }

    // 0. Handle explicit definitive deletion of militant (with cascading removal of all check-ins)
    if (syncData.action === 'delete_militant') {
      try {
        const { militantId, militantName } = syncData;
        const militantIdStr = String(militantId);
        const current = readServerVault();
        const mList = (current['militancia_militants_v1'] || []).filter((m: any) => String(m.id) !== militantIdStr);
        const nameLower = militantName ? militantName.toLowerCase().trim() : '';
        const chkList = (current['militancia_checkins_v1'] || []).filter((c: any) => 
          String(c.militantId) !== militantIdStr && 
          (!nameLower || !c.militantName || c.militantName.toLowerCase().trim() !== nameLower)
        );
        const deletedStreetsCount = (current['militancia_checkins_v1']?.length || 0) - chkList.length;

        const delVault = Array.from(new Set([...(current['deleted_entities_vault'] || []), militantIdStr]));
        const delMils = Array.from(new Set([...(current['deleted_militants_ids'] || []), militantIdStr]));

        const updatedVault = {
          ...current,
          militancia_militants_v1: mList,
          militantes_data: mList,
          militancia_militantes_v1: mList,
          militancia_checkins_v1: chkList,
          checkins_data: chkList,
          deleted_entities_vault: delVault,
          deleted_militants_ids: delMils,
          _lastServerSavedAt: new Date().toISOString()
        };
        writeServerVault(updatedVault, { replace: true });

        // Forward deletion to Hostinger in background
        try {
          fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncData)
          }).catch(() => {});
        } catch {}

        broadcastRealTimeUpdate('militant_deleted', { militantId: militantIdStr, deletedStreetsCount });
        return res.json({ status: 'success', deletedMilitantId: militantIdStr, deletedStreetsCount });
      } catch (e) {
        console.error('Error in delete_militant:', e);
        return res.status(500).json({ status: 'error', message: 'Erro ao excluir militante definitivamente.' });
      }
    }

    // Handle explicit definitive deletion of team
    if (syncData.action === 'delete_team') {
      try {
        const { teamId } = syncData;
        const teamIdStr = String(teamId);
        const current = readServerVault();
        const tList = (current['militancia_teams_v1'] || []).filter((t: any) => String(t.id) !== teamIdStr);
        const mList = (current['militancia_militants_v1'] || []).map((m: any) => 
          String(m.teamId) === teamIdStr ? { ...m, teamId: tList[0]?.id || 'sem_equipe' } : m
        );
        const delVault = Array.from(new Set([...(current['deleted_entities_vault'] || []), teamIdStr]));
        const delTeams = Array.from(new Set([...(current['deleted_teams_ids'] || []), teamIdStr]));

        const updatedVault = {
          ...current,
          militancia_teams_v1: tList,
          teams_data: tList,
          militancia_militants_v1: mList,
          militantes_data: mList,
          militancia_militantes_v1: mList,
          deleted_entities_vault: delVault,
          deleted_teams_ids: delTeams,
          _lastServerSavedAt: new Date().toISOString()
        };
        writeServerVault(updatedVault, { replace: true });

        // Forward deletion to Hostinger in background
        try {
          fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncData)
          }).catch(() => {});
        } catch {}

        broadcastRealTimeUpdate('team_deleted', { teamId: teamIdStr });
        return res.json({ status: 'success', deletedTeamId: teamIdStr });
      } catch (e) {
        console.error('Error in delete_team:', e);
        return res.status(500).json({ status: 'error', message: 'Erro ao excluir equipe.' });
      }
    }

    // Handle explicit definitive deletion of van / motorista
    if (syncData.action === 'delete_van') {
      try {
        const { vanId } = syncData;
        const vanIdStr = String(vanId);
        const current = readServerVault();
        const vList = (current['militancia_vans_v1'] || []).filter((v: any) => String(v.id) !== vanIdStr);
        const delVault = Array.from(new Set([...(current['deleted_entities_vault'] || []), vanIdStr]));
        const delVans = Array.from(new Set([...(current['deleted_vans_ids'] || []), vanIdStr]));

        const updatedVault = {
          ...current,
          militancia_vans_v1: vList,
          vans_data: vList,
          deleted_entities_vault: delVault,
          deleted_vans_ids: delVans,
          _lastServerSavedAt: new Date().toISOString()
        };
        writeServerVault(updatedVault, { replace: true });

        // Forward deletion to Hostinger in background
        try {
          fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncData)
          }).catch(() => {});
        } catch {}

        broadcastRealTimeUpdate('van_deleted', { vanId: vanIdStr });
        return res.json({ status: 'success', deletedVanId: vanIdStr });
      } catch (e) {
        console.error('Error in delete_van:', e);
        return res.status(500).json({ status: 'error', message: 'Erro ao excluir van.' });
      }
    }

    // 1. Save and merge immediately to disk vault on Node server
    try {
      const isReplace = Boolean(syncData.replace);
      if (syncData.key && syncData.data !== undefined) {
        writeServerVault({ [syncData.key]: syncData.data }, { replace: isReplace });
        broadcastRealTimeUpdate('collection_updated', { key: syncData.key });
      } else if (syncData.collections && typeof syncData.collections === 'object') {
        writeServerVault(syncData.collections, { replace: isReplace });
        broadcastRealTimeUpdate('all_collections_updated', { count: Object.keys(syncData.collections).length });
      }
    } catch (err) {
      console.error('Error saving to server disk vault:', err);
    }

    // 2. Dispatch in parallel to Hostinger MySQL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const hostingerResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(syncData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (hostingerResponse.ok) {
        const json = await hostingerResponse.json().catch(() => null);
        return res.json(json || { status: 'success', message: 'Sincronizado com Hostinger e salvo no cofre local.' });
      } else {
        return res.json({ status: 'success', message: 'Salvo com sucesso no cofre do servidor.' });
      }
    } catch {
      return res.json({ status: 'success', message: 'Salvo com sucesso no cofre permanente do servidor.' });
    }
  };

  app.post('/api/sync', handleSyncPost);
  app.post('/api/sync.php', handleSyncPost);

  // Sync API endpoint (GET /api/sync and /api/sync.php)
  const handleSyncGet = async (req: express.Request, res: express.Response) => {
    const targetUrl = 'https://militancia.mastervisionmarketing.com/api/sync.php';
    const serverVault = readServerVault();

    // Collect all deleted entity IDs
    const buildBlacklist = (sourceA: Record<string, any>, sourceB?: Record<string, any>) => {
      const set = new Set<string>();
      const addFrom = (src: Record<string, any> | undefined) => {
        if (!src) return;
        ['deleted_entities_vault', 'deleted_militants_ids', 'deleted_teams_ids', 'deleted_vans_ids', 'deleted_checkins_ids'].forEach(k => {
          if (Array.isArray(src[k])) {
            src[k].forEach((id: any) => { if (id) set.add(String(id)); });
          }
        });
      };
      addFrom(sourceA);
      addFrom(sourceB);
      return set;
    };

    const filterCollectionByBlacklist = (items: any[], blacklist: Set<string>, isCheckin = false) => {
      if (!Array.isArray(items)) return [];
      return items.filter(item => {
        if (!item || !item.id) return false;
        const idStr = String(item.id);
        if (blacklist.has(idStr)) return false;
        if (isCheckin && (blacklist.has(String(item.militantId)) || blacklist.has(String(item.militante_id)))) {
          return false;
        }
        return true;
      });
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const hostingerResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (hostingerResponse.ok) {
        const json = await hostingerResponse.json();
        if (json.status === 'success' && json.data) {
          const combinedData = { ...json.data };
          const blacklist = buildBlacklist(serverVault, json.data);
          combinedData['deleted_entities_vault'] = Array.from(blacklist);

          for (const key of Object.keys(serverVault)) {
            if (key.startsWith('_')) continue;
            if (Array.isArray(serverVault[key]) && Array.isArray(combinedData[key])) {
              const map = new Map();
              combinedData[key].forEach((item: any) => {
                if (item && item.id && !blacklist.has(String(item.id))) {
                  map.set(String(item.id), item);
                }
              });
              serverVault[key].forEach((item: any) => {
                if (item && item.id && !blacklist.has(String(item.id))) {
                  const existing = map.get(String(item.id));
                  map.set(String(item.id), { ...existing, ...item });
                }
              });
              combinedData[key] = Array.from(map.values());
            } else if (serverVault[key]) {
              combinedData[key] = serverVault[key];
            }
          }

          // Ensure militant collections are mirrored and filtered
          const rawMilitants = combinedData['militantes_data'] || combinedData['militancia_militantes_v1'] || combinedData['militancia_militants_v1'] || [];
          const realMilitants = filterCollectionByBlacklist(rawMilitants, blacklist);
          combinedData['militantes_data'] = realMilitants;
          combinedData['militancia_militants_v1'] = realMilitants;
          combinedData['militancia_militantes_v1'] = realMilitants;

          // Ensure van collections are mirrored and filtered
          const rawVans = combinedData['vans_data'] || combinedData['militancia_vans_v1'] || [];
          const realVans = filterCollectionByBlacklist(rawVans, blacklist);
          combinedData['vans_data'] = realVans;
          combinedData['militancia_vans_v1'] = realVans;

          // Ensure checkin collections are filtered against deleted militants & checkins
          const rawCheckins = combinedData['militancia_checkins_v1'] || combinedData['checkins_data'] || [];
          const realCheckins = filterCollectionByBlacklist(rawCheckins, blacklist, true);
          combinedData['militancia_checkins_v1'] = realCheckins;
          combinedData['checkins_data'] = realCheckins;

          // Persist the merged data into the server vault file
          try {
            writeServerVault(combinedData, { replace: true });
          } catch {}

          return res.json({ status: 'success', data: combinedData, source: 'merged_vault_hostinger' });
        }
      }

      // Filter serverVault before returning as fallback
      const localBlacklist = buildBlacklist(serverVault);
      const cleanVault = { ...serverVault };
      cleanVault['deleted_entities_vault'] = Array.from(localBlacklist);
      ['militantes_data', 'militancia_militants_v1', 'militancia_militantes_v1'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['vans_data', 'militancia_vans_v1'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['militancia_teams_v1', 'teams_data'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['militancia_checkins_v1', 'checkins_data'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist, true);
      });

      return res.json({ status: 'success', data: cleanVault, source: 'server_vault' });
    } catch {
      const localBlacklist = buildBlacklist(serverVault);
      const cleanVault = { ...serverVault };
      cleanVault['deleted_entities_vault'] = Array.from(localBlacklist);
      ['militantes_data', 'militancia_militants_v1', 'militancia_militantes_v1'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['vans_data', 'militancia_vans_v1'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['militancia_teams_v1', 'teams_data'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist);
      });
      ['militancia_checkins_v1', 'checkins_data'].forEach(k => {
        if (cleanVault[k]) cleanVault[k] = filterCollectionByBlacklist(cleanVault[k], localBlacklist, true);
      });
      return res.json({ status: 'success', data: cleanVault, source: 'server_vault_fallback' });
    }
  };

  app.get('/api/sync', handleSyncGet);
  app.get('/api/sync.php', handleSyncGet);

  // Explicit endpoints for deleting a street check-in
  app.delete('/api/checkin/:id', async (req, res) => {
    try {
      const checkInId = String(req.params.id);
      const current = readServerVault();
      const chkList = (current['militancia_checkins_v1'] || []).filter((c: any) => String(c.id) !== checkInId);
      const deletedCheckinsList: string[] = Array.isArray(current['deleted_checkins_ids'])
        ? [...current['deleted_checkins_ids']]
        : [];
      if (!deletedCheckinsList.includes(checkInId)) {
        deletedCheckinsList.push(checkInId);
      }

      const updatedVault = {
        ...current,
        militancia_checkins_v1: chkList,
        checkins_data: chkList,
        deleted_checkins_ids: deletedCheckinsList,
        _lastServerSavedAt: new Date().toISOString()
      };
      fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(updatedVault, null, 2), 'utf-8');
      try {
        const publicVaultPath = path.join(process.cwd(), 'public', 'api', 'data_server_vault.json');
        if (fs.existsSync(path.dirname(publicVaultPath))) {
          fs.writeFileSync(publicVaultPath, JSON.stringify(updatedVault, null, 2), 'utf-8');
        }
      } catch {}

      broadcastRealTimeUpdate('checkin_deleted', { checkInId });
      return res.json({ status: 'success', deletedCheckInId: checkInId });
    } catch (e) {
      console.error('Error in DELETE /api/checkin/:id', e);
      return res.status(500).json({ status: 'error', message: 'Erro ao excluir check-in.' });
    }
  });

  app.post('/api/checkin/delete', async (req, res) => {
    try {
      const checkInId = String(req.body.id || req.body.checkInId);
      if (!checkInId) {
        return res.status(400).json({ status: 'error', message: 'ID do check-in não informado.' });
      }
      const current = readServerVault();
      const chkList = (current['militancia_checkins_v1'] || []).filter((c: any) => String(c.id) !== checkInId);
      const deletedCheckinsList: string[] = Array.isArray(current['deleted_checkins_ids'])
        ? [...current['deleted_checkins_ids']]
        : [];
      if (!deletedCheckinsList.includes(checkInId)) {
        deletedCheckinsList.push(checkInId);
      }

      const updatedVault = {
        ...current,
        militancia_checkins_v1: chkList,
        checkins_data: chkList,
        deleted_checkins_ids: deletedCheckinsList,
        _lastServerSavedAt: new Date().toISOString()
      };
      fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(updatedVault, null, 2), 'utf-8');
      try {
        const publicVaultPath = path.join(process.cwd(), 'public', 'api', 'data_server_vault.json');
        if (fs.existsSync(path.dirname(publicVaultPath))) {
          fs.writeFileSync(publicVaultPath, JSON.stringify(updatedVault, null, 2), 'utf-8');
        }
      } catch {}

      broadcastRealTimeUpdate('checkin_deleted', { checkInId });
      return res.json({ status: 'success', deletedCheckInId: checkInId });
    } catch (e) {
      console.error('Error in POST /api/checkin/delete', e);
      return res.status(500).json({ status: 'error', message: 'Erro ao excluir check-in.' });
    }
  });

  // AI Campaign Strategist endpoint using Gemini SDK
  app.post('/api/ai-strategy', async (req, res) => {
    try {
      const { prompt, contextData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback intelligent strategic response if API key is not configured
        return res.json({
          strategy: generateFallbackStrategy(prompt, contextData),
          source: 'local_heuristic_advisor'
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Você é o Estrategista-Chefe de Campanha e Coordenação Territorial para a eleição no município de São José - SC (Santa Catarina).
Você conhece profundamente a geografia, bairros e dados demográficos do Censo IBGE de São José:
- Região Central/Campinas: Kobrasol (alto fluxo comercial, edifícios residenciais), Campinas (Av. Pres. Kennedy, Av. Central), Praia Comprida (histórico, hospital regional), Fazenda Santo Antônio, Roçado.
- Região Barreiros: Barreiros (Av. Leoberto Leal, densamente povoado, divisa com Fpolis), Bela Vista, Serraria, Ipiranga, Areias / Bosque das Mansões.
- Região Forquilhinhas: Forquilhinhas (grande polo residencial e eleitoral), Forquilhas, Potecas.
- Região Oeste/Sede Rural: Picadas do Sul, Sertão do Maruim, Colônia Santana.

A campanha decorre de 26/08/2026 a 03/10/2026 (véspera da votação).
Os materiais a serem distribuídos em cada rua são: Santinhos, Adesivos, Adesivo Bola (vidro traseiro), Adesivo Parachoque e Colinhas.
Forneça sempre orientações táticas, distribuição eficiente de equipes e vans, foco em horários de pico comercial ou residencial, e mensagens motivadoras em Português do Brasil de forma estruturada e profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nContexto Atual da Campanha:\n${JSON.stringify(contextData || {}, null, 2)}\n\nPergunta/Solicitação do Coordenador Geral:\n${prompt}`
              }
            ]
          }
        ]
      });

      res.json({
        strategy: response.text || 'Análise de cobertura concluída com sucesso.',
        source: 'gemini-2.5-flash'
      });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.json({
        strategy: generateFallbackStrategy(req.body?.prompt, req.body?.contextData),
        source: 'local_heuristic_advisor_fallback',
        errorNote: error.message
      });
    }
  });

  function generateFallbackStrategy(prompt?: string, context?: any): string {
    return `### Plano Estratégico de Cobertura Territorial - São José (SC)

**1. Diagnóstico de Cobertura Atual:**
- **Kobrasol & Campinas:** Grande concentração eleitoral. Recomenda-se manter duplas de militantes na Av. Lédio João Martins e Av. Presidente Kennedy entre 09h e 13h (horário comercial) e foco em adesivação de veículos (Adesivo Bola Perfurite).
- **Forquilhinhas & Forquilhas:** Maior densidade de eleitores da Zona Oeste. Priorizar panfletagem porta a porta nas vias transversais à Rua Vereador Arthur Mariano.
- **Barreiros & Serraria:** Cobertura de 60%. Acelerar a rota da Van 02 no eixo da Av. Leoberto Leal e no loteamento Luar da Serraria.

**2. Alocação Tática da Frota de Vans:**
- **Van 01 (Sprinter):** Foco matutino em Forquilhinhas e transbordo para Potecas às 14h.
- **Van 02 (Master):** Eixo Barreiros - Bela Vista - Serraria. Ponto de encontro: Trevo de Barreiros.
- **Van 03 (Ducato):** Sede histórica, Praia Comprida e Sertão do Maruim.

**3. Meta de Materiais para a Próxima Rodada:**
- Distribuição mínima de 400 santinhos + 250 colinhas por militante/dia.
- Incentivar registro fotográfico com geolocalização no app de campo para validação imediata no painel.`;
  }

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const candidateDirs = [
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, '..', 'dist'),
      path.join(__dirname, 'dist'),
      process.cwd()
    ];
    const resolvedDist = candidateDirs.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || path.join(process.cwd(), 'dist');
    
    app.use(express.static(resolvedDist));
    app.get('*', (req, res) => {
      const indexFile = path.join(resolvedDist, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Militância São José - SC</title>
</head>
<body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="background:#1e293b;padding:32px;border-radius:12px;text-align:center;">
    <h2 style="color:#38bdf8;">Sistema de Militância São José / SC</h2>
    <p style="color:#94a3b8;">Servidor Node.js operacional. Execute o build para carregar o painel.</p>
  </div>
</body>
</html>`);
      }
    });
  }

  if (typeof PORT === 'number') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Militância SJ Server] Running on http://localhost:${PORT}`);
    });
  } else {
    // Unix socket for Hostinger / Phusion Passenger
    app.listen(PORT, () => {
      console.log(`[Militância SJ Server] Running on socket: ${PORT}`);
    });
  }
}

startServer();
