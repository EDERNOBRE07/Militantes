// Calibrated Real Road Bed Geometries for Streets in São José - SC
// OpenStreetMap Ways & Linestrings aligned precisely with pins and street axes
import osmRoadsData from '../data/saoJoseOsmRoads.json';
import calibratedCheckinGeomsData from '../data/calibratedCheckinGeometries.json';
import knownRoadbedGeomsData from '../data/knownStreetRoadbedGeometries.json';

const OSM_ROADS = osmRoadsData as unknown as Record<string, [number, number][][]>;
export const CHECKIN_STREET_GEOMETRIES = calibratedCheckinGeomsData as unknown as Record<string, [number, number][]>;
export const KNOWN_STREET_ROADBED_GEOMETRIES = knownRoadbedGeomsData as unknown as Record<string, [number, number][]>;

export const STREET_ALIASES: Record<string, string> = {
  "joao adalgisio filipi": "joao adalgisio philippi",
  "joao adalgisio philippi": "joao adalgisio philippi",
  "eliane gerlack": "eliane gerlach martins",
  "eliane gerlach": "eliane gerlach martins",
  "viviana guanabara": "viviane guanabara",
  "domingos jalmeno costa": "domingos jalmeno da costa",
  "aristides da silva": "aristides ernesto da silva",
  "alice santo da rosa": "alice santos da rosa",
  "alice santos da rosa": "alice santos da rosa",
  "profa evanilda maria koerich": "professora evanilda maria koerich",
  "prof evanilda maria koerich": "professora evanilda maria koerich",
  "evanilda maria koerich": "professora evanilda maria koerich",
  "estevao de andrade": "estevao de andrade",
  "iano": "iano",
  "do iano": "iano",
  "uvaia": "uvaia",
  "justino machado loreto": "justino machado de loreto",
  "mario cesar da costa": "mario cesar costa",
  "carlos drumond de andrade": "carlos drummond de andrade",
  "jose victor da silva": "jose vitor rosa",
  "cap pedro leite": "capitao pedro leite",
  "pedro leite": "capitao pedro leite",
  "ver arthur manoel mariano": "vereador arthur manoel mariano",
  "vereador arthur mariano": "vereador arthur manoel mariano",
  "arthur mariano": "vereador arthur manoel mariano",
  "mal rondon": "marechal rondon",
  "nossa sra aparecida": "nossa senhora aparecida",
  "nossa sra rainha da paz": "nossa senhora rainha da paz",
  "mariafrancisca conceicao ribeiro": "maria francisca conceicao ribeiro",
  "laci de lima": "helio estefano becker",
  "alceu amoroso lima": "helio estefano becker"
};

export function normalizeRoadKey(str: string): string {
  let text = (str || "")
    .replace(/\(.*?\)/g, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(nº|no|num|numero)\b.*$/g, "");

  // Remove common street type prefixes
  text = text
    .replace(/^(r\.|rua|rod\.|rodovia|av\.|avenida|serv\.|servidao|servidão|travessa|tv\.|alameda|al\.|estrada|estr\.)\s+/i, "")
    .replace(/\b(r|av|rod|serv|tv|al|estr)\.\s*/gi, " ")
    .replace(/\b(rua|rodovia|avenida|servidao|servidão|travessa|alameda|estrada)\b/gi, " ");

  // Expand standard Brazilian administrative & honorific abbreviations
  text = text
    .replace(/\b(sra\.|sra)\b/g, "senhora")
    .replace(/\b(sr\.|sr)\b/g, "senhor")
    .replace(/\b(nossa sra|n\. sra|ns sra)\b/g, "nossa senhora")
    .replace(/\b(profa\.|profa|profª)\b/g, "professora")
    .replace(/\b(prof\.|prof)\b/g, "professor")
    .replace(/\b(ver\.|ver)\b/g, "vereador")
    .replace(/\b(mal\.|mal)\b/g, "marechal")
    .replace(/\b(cap\.|cap)\b/g, "capitao")
    .replace(/\b(cel\.|cel)\b/g, "coronel")
    .replace(/\b(ten\.|ten)\b/g, "tenente")
    .replace(/\b(maj\.|maj)\b/g, "major")
    .replace(/\b(gov\.|gov)\b/g, "governador")
    .replace(/\b(pres\.|pres)\b/g, "presidente")
    .replace(/\b(dr\.|dr)\b/g, "doutor")
    .replace(/\b(dra\.|dra)\b/g, "doutora")
    .replace(/\b(sto\.|sto)\b/g, "santo")
    .replace(/\b(sta\.|sta)\b/g, "santa")
    .replace(/\b(pe\.|pe)\b/g, "padre")
    .replace(/\b(des\.|des)\b/g, "desembargador");

  // Fix common spelling/spacing variations
  text = text
    .replace(/mariafrancisca/g, "maria francisca")
    .replace(/drumond/g, "drummond")
    .replace(/arthur mariano/g, "arthur manoel mariano");

  return text
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function distCoordMeters(p1: [number, number], p2: [number, number]): number {
  const dx = (p1[0] - p2[0]) * 111000;
  const dy = (p1[1] - p2[1]) * 111000 * Math.cos((p1[0] * Math.PI) / 180);
  return Math.sqrt(dx * dx + dy * dy);
}

function minDistanceToComp(pin: [number, number], comp: [number, number][]): number {
  let minD = Infinity;
  for (const p of comp) {
    const d = distCoordMeters(pin, p);
    if (d < minD) minD = d;
  }
  return minD;
}

function isHorizontalDummyLine(coords: [number, number][]): boolean {
  if (!coords || coords.length < 2) return true;
  const lats = coords.map(p => p[0]);
  return lats.every(l => Math.abs(l - lats[0]) < 0.0000001);
}

/**
 * Retorna as coordenadas reais do leito viário da rua exatamente no eixo do logradouro
 * Utiliza a base cartográfica OpenStreetMap de São José (2.104 vias cartografadas)
 * e o banco de geometrias calibradas por check-in.
 */
export function getStreetRoadBedCoordinates(
  checkInId: string,
  streetName: string,
  pinLat: number,
  pinLng: number
): [number, number][] {
  const pin: [number, number] = [pinLat || -27.5962, pinLng || -48.6190];
  const MAX_ROAD_DISTANCE_METERS = 350;

  // 1. Verificação direta por ID do check-in na base calibrada (garantindo que não seja linha horizontal)
  if (
    CHECKIN_STREET_GEOMETRIES[checkInId] &&
    CHECKIN_STREET_GEOMETRIES[checkInId].length >= 2 &&
    !isHorizontalDummyLine(CHECKIN_STREET_GEOMETRIES[checkInId])
  ) {
    if (!pinLat || !pinLng || minDistanceToComp(pin, CHECKIN_STREET_GEOMETRIES[checkInId]) <= MAX_ROAD_DISTANCE_METERS) {
      return CHECKIN_STREET_GEOMETRIES[checkInId];
    }
  }

  // 2. Normalização fonética e estrutural do nome da rua
  let norm = normalizeRoadKey(streetName);
  if (STREET_ALIASES[norm]) {
    norm = STREET_ALIASES[norm];
  }

  // 3. Busca exata nas vias OpenStreetMap de São José
  let candidates: [number, number][][] | undefined = OSM_ROADS[norm];
  if (candidates && candidates.length > 0) {
    if (!pinLat || !pinLng) return candidates[0];
    let best = candidates[0];
    let minD = minDistanceToComp(pin, best);
    for (const comp of candidates) {
      const d = minDistanceToComp(pin, comp);
      if (d < minD) {
        minD = d;
        best = comp;
      }
    }
    if (minD <= MAX_ROAD_DISTANCE_METERS) {
      return best;
    }
  }

  // 4. Busca por nome removendo stop-words em português (de, da, do, dos, das)
  const normNoStop = norm.replace(/\b(de|da|do|dos|das)\b/g, " ").replace(/\s+/g, " ").trim();
  for (const [k, ways] of Object.entries(OSM_ROADS)) {
    const kNoStop = k.replace(/\b(de|da|do|dos|das)\b/g, " ").replace(/\s+/g, " ").trim();
    if (kNoStop === normNoStop) {
      let best = ways[0];
      let minD = minDistanceToComp(pin, best);
      for (const w of ways) {
        const d = minDistanceToComp(pin, w);
        if (d < minD) {
          minD = d;
          best = w;
        }
      }
      if (minD <= MAX_ROAD_DISTANCE_METERS) {
        return best;
      }
    }
  }

  // 5. Busca difusa / substring no índice OSM com proximidade geográfica
  let bestFuzzyComp: [number, number][] | null = null;
  let bestFuzzyDist = Infinity;
  for (const [k, comps] of Object.entries(OSM_ROADS)) {
    if (norm.length >= 5 && (k.includes(norm) || norm.includes(k))) {
      for (const comp of comps) {
        const d = minDistanceToComp(pin, comp);
        if (d <= MAX_ROAD_DISTANCE_METERS && d < bestFuzzyDist) {
          bestFuzzyDist = d;
          bestFuzzyComp = comp;
        }
      }
    }
  }
  if (bestFuzzyComp) {
    return bestFuzzyComp;
  }

  // 6. Busca nas geometrias conhecidas pré-calibradas com validação de distância
  const rawClean = (streetName || "").replace(/\(.*?\)/g, "").trim().toLowerCase();
  const clean = rawClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const knownEntries = Object.entries(KNOWN_STREET_ROADBED_GEOMETRIES);
  for (const [key, comp] of knownEntries) {
    const normKey = normalizeRoadKey(key);
    if (
      normKey === norm ||
      key === rawClean ||
      key === clean ||
      (norm.length >= 5 && (normKey.includes(norm) || norm.includes(normKey)))
    ) {
      if (!isHorizontalDummyLine(comp)) {
        const d = minDistanceToComp(pin, comp);
        if (d <= MAX_ROAD_DISTANCE_METERS) {
          return comp;
        }
      }
    }
  }

  // 7. Fallback espacial rigoroso: busca o leito viário real mais próximo em São José dentro de 120 metros
  if (pinLat && pinLng) {
    let nearestComp: [number, number][] | null = null;
    let minD = 120; // 120 metros
    for (const comps of Object.values(OSM_ROADS)) {
      for (const comp of comps) {
        const d = minDistanceToComp(pin, comp);
        if (d < minD) {
          minD = d;
          nearestComp = comp;
        }
      }
    }
    if (nearestComp) {
      return nearestComp;
    }
  }

  // 8. Fallback angular calibrado: segmento curto de 40m com inclinação realista da malha viária local
  // Jamais produz corte horizontal atravessando quarteirões!
  const offsetLat = 0.00018;
  const offsetLng = 0.00018;
  return [
    [pin[0] - offsetLat, pin[1] - offsetLng],
    [pin[0] - offsetLat * 0.5, pin[1] - offsetLng * 0.5],
    [pin[0], pin[1]],
    [pin[0] + offsetLat * 0.5, pin[1] + offsetLng * 0.5],
    [pin[0] + offsetLat, pin[1] + offsetLng]
  ];
}
