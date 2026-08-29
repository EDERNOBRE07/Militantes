import { Neighborhood } from '../types';

export interface ParsedWhatsAppLocation {
  success: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;
  extractedStreet?: string;
  extractedNumber?: string;
  suggestedNeighborhoodId?: string;
  suggestedNeighborhoodName?: string;
  sourceType?: 'whatsapp_link' | 'whatsapp_vcf' | 'whatsapp_txt' | 'whatsapp_gpx' | 'coordinates_text' | 'image_file';
  originalInput?: string;
  error?: string;
}

/**
 * Calculates the closest São José neighborhood to given coordinates
 */
export function findClosestNeighborhood(
  lat: number,
  lng: number,
  neighborhoods: Neighborhood[]
): Neighborhood | undefined {
  if (!neighborhoods || neighborhoods.length === 0) return undefined;
  
  let closest = neighborhoods[0];
  let minDistance = Infinity;

  for (const n of neighborhoods) {
    // Euclidean distance squared on lat/lng (sufficient for local municipal scale)
    const dLat = n.lat - lat;
    const dLng = n.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = n;
    }
  }

  return closest;
}

/**
 * Extracts coordinates and address clues from WhatsApp text, links, or vCard content
 */
export function parseWhatsAppLocationText(
  text: string,
  neighborhoods: Neighborhood[] = []
): ParsedWhatsAppLocation {
  if (!text || !text.trim()) {
    return {
      success: false,
      error: 'Texto ou link vazio. Cole o link ou envie o arquivo do WhatsApp.'
    };
  }

  const cleanText = text.trim();

  let lat: number | null = null;
  let lng: number | null = null;
  let sourceType: ParsedWhatsAppLocation['sourceType'] = 'whatsapp_link';

  // 1. WhatsApp VCF / vCard format (e.g. GEO:-27.5962;-48.6190 or item1.URL:https://maps.google.com/?q=-27.5962,-48.6190)
  const vcfGeoMatch = cleanText.match(/GEO:([+-]?\d+\.?\d*)[;,]([+-]?\d+\.?\d*)/i);
  if (vcfGeoMatch) {
    lat = parseFloat(vcfGeoMatch[1]);
    lng = parseFloat(vcfGeoMatch[2]);
    sourceType = 'whatsapp_vcf';
  }

  // 2. Google Maps / WhatsApp URLs with ?q=lat,lng or &q=lat,lng or ?ll=lat,lng
  if (lat === null || lng === null) {
    const qMatch = cleanText.match(/[?&](?:q|ll|query|daddr|saddr|loc:)=([+-]?\d+\.?\d+)[,; ]+([+-]?\d+\.?\d+)/i);
    if (qMatch) {
      lat = parseFloat(qMatch[1]);
      lng = parseFloat(qMatch[2]);
      sourceType = 'whatsapp_link';
    }
  }

  // 3. Google Maps place URLs with /@lat,lng, or /data=!3dlat!4dlng
  if (lat === null || lng === null) {
    const atMatch = cleanText.match(/@([+-]?\d+\.?\d+),([+-]?\d+\.?\d+)/i);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
      sourceType = 'whatsapp_link';
    } else {
      const data3d4dMatch = cleanText.match(/!3d([+-]?\d+\.?\d+)!4d([+-]?\d+\.?\d+)/i);
      if (data3d4dMatch) {
        lat = parseFloat(data3d4dMatch[1]);
        lng = parseFloat(data3d4dMatch[2]);
        sourceType = 'whatsapp_link';
      }
    }
  }

  // 4. Apple Maps / Waze / Geo URI (geo:lat,lng)
  if (lat === null || lng === null) {
    const geoMatch = cleanText.match(/geo:([+-]?\d+\.?\d+),([+-]?\d+\.?\d+)/i);
    if (geoMatch) {
      lat = parseFloat(geoMatch[1]);
      lng = parseFloat(geoMatch[2]);
      sourceType = 'whatsapp_link';
    }
  }

  // 5. KML / GPX XML tags (<coordinates>lng,lat</coordinates> or <wpt lat="" lon="">)
  if (lat === null || lng === null) {
    const gpxMatch = cleanText.match(/<wpt[^>]*lat=["']([+-]?\d+\.?\d+)["'][^>]*lon=["']([+-]?\d+\.?\d+)["']/i);
    if (gpxMatch) {
      lat = parseFloat(gpxMatch[1]);
      lng = parseFloat(gpxMatch[2]);
      sourceType = 'whatsapp_gpx';
    } else {
      const kmlMatch = cleanText.match(/<coordinates>\s*([+-]?\d+\.?\d+)\s*,\s*([+-]?\d+\.?\d+)/i);
      if (kmlMatch) {
        lng = parseFloat(kmlMatch[1]); // KML is lng,lat
        lat = parseFloat(kmlMatch[2]);
        sourceType = 'whatsapp_gpx';
      }
    }
  }

  // 6. Generic latitude and longitude numbers in text (e.g. -27.596200, -48.619000 or -27.5962 -48.6190)
  if (lat === null || lng === null) {
    const coordMatch = cleanText.match(/([+-]?\d{1,2}\.\d{3,10})[,\s\t]+([+-]?\d{1,3}\.\d{3,10})/);
    if (coordMatch) {
      const p1 = parseFloat(coordMatch[1]);
      const p2 = parseFloat(coordMatch[2]);
      
      // Heuristic check for southern hemisphere / Brazil coordinates (lat roughly -20 to -34, lng -40 to -55)
      if (p1 < 0 && p1 > -90 && p2 < 0 && p2 > -180) {
        lat = p1;
        lng = p2;
        sourceType = 'coordinates_text';
      } else if (p2 < 0 && p2 > -90 && p1 < 0 && p1 > -180) {
        lat = p2;
        lng = p1;
        sourceType = 'coordinates_text';
      } else {
        lat = p1;
        lng = p2;
        sourceType = 'coordinates_text';
      }
    }
  }

  // If still not found, return failure
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    return {
      success: false,
      originalInput: cleanText,
      error: 'Não foi possível extrair coordenadas válidas. Certifique-se de que o texto, link ou arquivo do WhatsApp contém um link do Google Maps ou coordenadas (ex: -27.5962, -48.6190).'
    };
  }

  // Validation bounds (roughly Santa Catarina / Greater Florianópolis / São José region or valid lat/lng)
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return {
      success: false,
      originalInput: cleanText,
      error: 'Coordenadas fora dos limites geográficos globais.'
    };
  }

  // Attempt to extract street name or house number from text (e.g. "Rua Koesa, 150", "Av. Leoberto Leal")
  let extractedStreet: string | undefined;
  let extractedNumber: string | undefined;
  let detectedNeighborhoodFromUrl: Neighborhood | undefined;

  // Google Maps /place/ path parsing (e.g. /place/R.+%C3%81guas+de+Chapec%C3%B3+-+Bela+Vista,+S%C3%A3o+Jos%C3%A9+-+SC,+88110-515)
  const placeMatch = cleanText.match(/\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    try {
      const decodedPlace = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      const parts = decodedPlace.split(/[-–—,]/).map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) {
        extractedStreet = parts[0];
      }
      for (const p of parts) {
        const foundNeigh = neighborhoods.find(n => 
          n.name.toLowerCase() === p.toLowerCase() || 
          p.toLowerCase().includes(n.name.toLowerCase())
        );
        if (foundNeigh) {
          detectedNeighborhoodFromUrl = foundNeigh;
          break;
        }
      }
    } catch (e) {
      console.warn('Error decoding Google Maps place:', e);
    }
  }

  if (!extractedStreet) {
    const streetPatterns = [
      /(?:Rua|R\.|Avenida|Av\.|Travessa|Tv\.|Alameda|Al\.|Rodovia|Rod\.)\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+?)(?:,\s*n?º?\s*(\d+)|,\s*bairro|,\s*São José|$|\n)/i,
      /(?:Rua|Avenida|Av\.|Rodovia)\s+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s]+)/i
    ];

    for (const pat of streetPatterns) {
      const match = cleanText.match(pat);
      if (match && match[1]) {
        extractedStreet = match[0].split(',')[0].trim();
        if (match[2]) {
          extractedNumber = match[2].trim();
        }
        break;
      }
    }
  }

  // Detect Closest São José Neighborhood or use URL matched neighborhood
  const closestNeighborhood = detectedNeighborhoodFromUrl || findClosestNeighborhood(lat, lng, neighborhoods);

  return {
    success: true,
    lat,
    lng,
    accuracy: 3.5,
    extractedStreet,
    extractedNumber,
    suggestedNeighborhoodId: closestNeighborhood?.id,
    suggestedNeighborhoodName: closestNeighborhood?.name,
    sourceType,
    originalInput: cleanText
  };
}

/**
 * Reads a file (vCard .vcf, text file, .txt, .gpx, .kml or image) and parses location
 */
export async function parseWhatsAppLocationFile(
  file: File,
  neighborhoods: Neighborhood[] = []
): Promise<ParsedWhatsAppLocation> {
  return new Promise((resolve) => {
    // If it's a text-based file (.vcf, .txt, .kml, .gpx, .json, .csv)
    if (
      file.name.endsWith('.vcf') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.kml') ||
      file.name.endsWith('.gpx') ||
      file.name.endsWith('.json') ||
      file.type.startsWith('text/')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        const parsed = parseWhatsAppLocationText(textContent, neighborhoods);
        if (file.name.endsWith('.vcf')) {
          parsed.sourceType = 'whatsapp_vcf';
        } else if (file.name.endsWith('.gpx') || file.name.endsWith('.kml')) {
          parsed.sourceType = 'whatsapp_gpx';
        } else {
          parsed.sourceType = 'whatsapp_txt';
        }
        resolve(parsed);
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Falha ao ler o arquivo selecionado.'
        });
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      // For images, we can check if there are GPS tags in text or filename, or return fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        // Some cameras store GPS in binary text
        const match = textContent.match(/GPSLatitude.*?([+-]?\d+\.?\d*)/);
        if (match) {
          const parsed = parseWhatsAppLocationText(textContent, neighborhoods);
          parsed.sourceType = 'image_file';
          resolve(parsed);
        } else {
          // Check filename for coordinates (e.g. IMG_-27.5962_-48.6190.jpg)
          const nameParsed = parseWhatsAppLocationText(file.name, neighborhoods);
          if (nameParsed.success) {
            nameParsed.sourceType = 'image_file';
            resolve(nameParsed);
          } else {
            resolve({
              success: false,
              error: 'A imagem não contém coordenadas de GPS legíveis. Experimente copiar e colar o link da localização enviado no WhatsApp.'
            });
          }
        }
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Erro ao processar imagem.'
        });
      };
      reader.readAsText(file.slice(0, 65536)); // Read header for EXIF/metadata
    } else {
      // Fallback: try reading as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        resolve(parseWhatsAppLocationText(text, neighborhoods));
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Formato de arquivo não suportado.'
        });
      };
      reader.readAsText(file);
    }
  });
}
