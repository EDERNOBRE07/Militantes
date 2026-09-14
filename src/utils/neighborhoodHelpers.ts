import { Neighborhood, StreetCheckIn, Militant, Team } from '../types';
import { StorageService } from '../services/storageService';
import { SAO_JOSE_KNOWN_STREETS } from './saoJoseStreetsGeo';

/**
 * Interface para agrupamento por militante
 */
export interface MilitantAuditGroup {
  militantId: string;
  militantName: string;
  matricula: string;
  avatar?: string;
  teamName: string;
  checkIns: StreetCheckIn[];
  totalAbordagens: number;
  totalComercio: number;
  totalSantinhos: number;
  totalMateriais: number;
}

/**
 * Verifica se um registro de check-in possui foto válida anexada
 * (seja no array photos direto ou no cofre de fotos via ID).
 */
export function checkInHasValidPhoto(chk: StreetCheckIn): boolean {
  if (Array.isArray(chk.photos) && chk.photos.length > 0) {
    const valid = chk.photos.some(
      p => typeof p === 'string' && p.trim() !== '' && p !== '[vault_photo]'
    );
    if (valid) return true;
  }
  const dbPhoto = StorageService.getPhotoForCheckIn(chk.id);
  if (dbPhoto && typeof dbPhoto === 'string' && dbPhoto.trim() !== '' && dbPhoto !== '[vault_photo]') {
    return true;
  }
  return false;
}

/**
 * Retorna todas as fotos válidas anexadas a um check-in de rua (sem duplicatas)
 */
export function getAllPhotosForCheckIn(chk: StreetCheckIn): string[] {
  const photos: string[] = [];
  const seen = new Set<string>();

  const add = (p: unknown) => {
    if (typeof p === 'string') {
      const trimmed = p.trim();
      if (trimmed && trimmed !== '[vault_photo]' && !trimmed.includes('unsplash.com') && !seen.has(trimmed)) {
        seen.add(trimmed);
        photos.push(trimmed);
      }
    }
  };

  // 1. Fotos diretas no array do checkin
  if (Array.isArray(chk.photos)) {
    chk.photos.forEach(add);
  }

  // 2. Fotos no cofre photoVaultCache
  try {
    const cachedVault = StorageService.photoVaultCache.get(String(chk.id));
    if (Array.isArray(cachedVault)) {
      cachedVault.forEach(add);
    }
  } catch {}

  // 3. Foto no storageService via ID
  try {
    const dbPhoto = StorageService.getPhotoForCheckIn(chk.id);
    if (dbPhoto) {
      add(dbPhoto);
    }
  } catch {}

  // Se após filtros não sobrou nenhuma (ou eram fotos unsplash padrão), verifica se tem alguma foto mesmo com unsplash
  if (photos.length === 0 && Array.isArray(chk.photos)) {
    chk.photos.forEach(p => {
      if (typeof p === 'string' && p.trim() && p.trim() !== '[vault_photo]' && !seen.has(p.trim())) {
        seen.add(p.trim());
        photos.push(p.trim());
      }
    });
  }

  return photos;
}

/**
 * Retorna a lista de fotos válidas de um check-in
 */
export function getValidPhotosForCheckIn(chk: StreetCheckIn): string[] {
  return getAllPhotosForCheckIn(chk);
}

function normalizeNeighborhoodString(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(distrito[^)]*\)/gi, '')
    .replace(/-\s*distrito.*/gi, '')
    .replace(/distrito.*/gi, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza e compara estritamente se um check-in pertence a determinado bairro.
 * Evita contaminação entre bairros com palavras parecidas (ex: Alto Forquilhas x Forquilhas x Forquilhinha).
 */
export function isCheckInInNeighborhood(chk: StreetCheckIn, bairro: Neighborhood): boolean {
  if (!bairro || !chk) return false;
  const bId = (bairro.id || '').toLowerCase().trim().replace(/-/g, '_');
  const bNorm = normalizeNeighborhoodString(bairro.name);

  // 1. Comparação direta de ID
  if (chk.neighborhoodId) {
    const cId = chk.neighborhoodId.toLowerCase().trim().replace(/-/g, '_');
    if (cId === bId) {
      return true;
    }
  }

  // 2. Comparação estrita por nome normalizado (sem substrings genéricas que vazem "Forquilhas" para "Alto Forquilhas")
  if (chk.neighborhoodName) {
    const cNorm = normalizeNeighborhoodString(chk.neighborhoodName);
    if (cNorm && (cNorm === bNorm || cNorm.replace(/\s+/g, '_') === bId)) {
      return true;
    }
  }

  // 3. Validação cruzada via base oficial de logradouros de São José se o check-in não tiver bairro explícito
  if (!chk.neighborhoodId && !chk.neighborhoodName && chk.streetName) {
    const sNorm = normalizeNeighborhoodString(chk.streetName);
    const matched = SAO_JOSE_KNOWN_STREETS.find(s => 
      normalizeNeighborhoodString(s.name) === sNorm ||
      s.aliases.some(a => normalizeNeighborhoodString(a) === sNorm)
    );
    if (matched) {
      const matchId = matched.neighborhoodId.toLowerCase().trim().replace(/-/g, '_');
      return matchId === bId;
    }
  }

  return false;
}

/**
 * Retorna todos os check-ins associados a um bairro específico
 */
export function getCheckInsForNeighborhood(bairro: Neighborhood, allCheckIns: StreetCheckIn[]): StreetCheckIn[] {
  if (!bairro || !Array.isArray(allCheckIns)) return [];
  return allCheckIns.filter(chk => isCheckInInNeighborhood(chk, bairro));
}

/**
 * Agrupa check-ins por militante de forma estável
 */
export function groupCheckInsByMilitant(
  checkIns: StreetCheckIn[],
  militants: Militant[],
  teams?: Team[]
): MilitantAuditGroup[] {
  const map = new Map<string, MilitantAuditGroup>();

  checkIns.forEach(chk => {
    const mId = chk.militantId || 'militante-sem-id';
    if (!map.has(mId)) {
      const mObj = militants.find(
        m => m.id === mId || m.name.toLowerCase() === (chk.militantName || '').toLowerCase()
      );
      const tObj = teams?.find(t => t.id === (chk.teamId || mObj?.teamId));
      map.set(mId, {
        militantId: mId,
        militantName: chk.militantName || mObj?.name || 'Militante',
        matricula: mObj?.matricula || '',
        avatar: mObj?.avatar,
        teamName: tObj?.name || 'Equipe de Campo',
        checkIns: [],
        totalAbordagens: 0,
        totalComercio: 0,
        totalSantinhos: 0,
        totalMateriais: 0
      });
    }

    const grp = map.get(mId)!;
    grp.checkIns.push(chk);
    const m = chk.materialsDelivered || ({} as any);
    grp.totalAbordagens += (m.abordagens || 0);
    grp.totalComercio += (m.comercio || 0);
    grp.totalSantinhos += (m.santinhos || 0);
    grp.totalMateriais += (m.santinhos || 0) + (m.adesivo_bola || 0) + (m.adesivo_parachoque || 0) + (m.colinhas || 0);
  });

  return Array.from(map.values()).sort((a, b) => b.checkIns.length - a.checkIns.length);
}

/**
 * Constrói o mapeamento sequencial de pins por militante:
 * REGRA DO USUÁRIO: "a numeração do pin, deve ser na sequência de lançamento,
 * todos de um militante, depois a sequência numérica deve continuar com o próximo militante."
 */
export function buildMilitantSequentialPinMap(
  bairroCheckIns: StreetCheckIn[],
  militants: Militant[],
  teams?: Team[]
): {
  pinMap: Record<string, number>;
  groups: MilitantAuditGroup[];
} {
  const groups = groupCheckInsByMilitant(bairroCheckIns, militants, teams);
  const pinMap: Record<string, number> = {};
  let currentPin = 1;

  groups.forEach(group => {
    // 1. Ordena as ruas deste militante por data/hora crescente de lançamento (primeiro lançado = menor pin)
    group.checkIns.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 2. Numera sequencialmente todos deste militante, e continua no próximo militante
    group.checkIns.forEach(chk => {
      pinMap[chk.id] = currentPin;
      pinMap[String(chk.id)] = currentPin;
      currentPin++;
    });
  });

  return { pinMap, groups };
}

/**
 * Regra estrita de negócio:
 * Um bairro só se qualifica para o relatório consolidado se possuir:
 * 1. Lançamentos de ruas registradas (check-ins > 0)
 * 2. E fotos anexadas de comprovação (pelo menos 1 foto anexada).
 */
export function doesNeighborhoodQualify(bairro: Neighborhood, allCheckIns: StreetCheckIn[]): boolean {
  const bCheckIns = getCheckInsForNeighborhood(bairro, allCheckIns);
  if (bCheckIns.length === 0) return false;
  return bCheckIns.some(chk => checkInHasValidPhoto(chk));
}

/**
 * Retorna apenas os bairros que contêm lançamentos de ruas e fotos anexadas
 */
export function getQualifyingNeighborhoods(neighborhoods: Neighborhood[], allCheckIns: StreetCheckIn[]): Neighborhood[] {
  if (!Array.isArray(neighborhoods)) return [];
  return neighborhoods.filter(n => doesNeighborhoodQualify(n, allCheckIns));
}
