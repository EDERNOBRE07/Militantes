import { Neighborhood, StreetCheckIn } from '../types';
import { StorageService } from '../services/storageService';

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
 * Retorna a lista de fotos válidas de um check-in
 */
export function getValidPhotosForCheckIn(chk: StreetCheckIn): string[] {
  const directPhotos = (chk.photos || []).filter(
    p => typeof p === 'string' && p.trim() !== '' && p !== '[vault_photo]'
  );
  if (directPhotos.length > 0) {
    return directPhotos;
  }
  const dbPhoto = StorageService.getPhotoForCheckIn(chk.id);
  if (dbPhoto && typeof dbPhoto === 'string' && dbPhoto.trim() !== '' && dbPhoto !== '[vault_photo]') {
    return [dbPhoto];
  }
  return [];
}

/**
 * Normaliza e compara se um check-in pertence a determinado bairro
 */
export function isCheckInInNeighborhood(chk: StreetCheckIn, bairro: Neighborhood): boolean {
  if (!bairro || !chk) return false;
  const bId = (bairro.id || '').toLowerCase().trim();
  const bName = (bairro.name || '').toLowerCase().trim();
  
  if (chk.neighborhoodId && chk.neighborhoodId.toLowerCase().trim() === bId) {
    return true;
  }
  if (chk.neighborhoodName) {
    const cName = chk.neighborhoodName.toLowerCase().trim();
    if (cName === bName || cName.includes(bName) || bName.includes(cName)) {
      return true;
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
