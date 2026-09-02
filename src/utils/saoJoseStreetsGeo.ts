import { Neighborhood, StreetCheckIn } from '../types';

/**
 * Bounding box for São José - SC
 */
export const SAO_JOSE_BOUNDS = {
  minLat: -27.6800,
  maxLat: -27.5200,
  minLng: -48.7400,
  maxLng: -48.5800,
  center: [-27.6136, -48.6366] as [number, number]
};

/**
 * Extensa base de dados de ruas e coordenadas reais do município de São José / SC
 */
export interface KnownStreetLocation {
  name: string;
  aliases: string[];
  neighborhoodId: string;
  neighborhoodName: string;
  lat: number;
  lng: number;
  type?: 'avenida' | 'rua' | 'rodovia' | 'travessa' | 'praca';
}

export const SAO_JOSE_KNOWN_STREETS: KnownStreetLocation[] = [
  // KOBRASOL
  {
    name: 'Avenida Presidente Kennedy',
    aliases: ['av presidente kennedy', 'presidente kennedy', 'av kennedy', 'kennedy'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5960,
    lng: -48.6210,
    type: 'avenida'
  },
  {
    name: 'Avenida Lédio João Martins',
    aliases: ['av ledio joao martins', 'ledio joao martins', 'av central kobrasol', 'rua central'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5945,
    lng: -48.6180,
    type: 'avenida'
  },
  {
    name: 'Rua Koesa',
    aliases: ['rua koesa', 'koesa', 'r koesa'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5940,
    lng: -48.6195,
    type: 'rua'
  },
  {
    name: 'Rua Emerson Ferrari',
    aliases: ['rua emerson ferrari', 'emerson ferrari'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5970,
    lng: -48.6160,
    type: 'rua'
  },
  {
    name: 'Rua Adhemar da Silva',
    aliases: ['rua adhemar da silva', 'adhemar da silva', 'rua ademar da silva'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5955,
    lng: -48.6165,
    type: 'rua'
  },
  {
    name: 'Rua Delamar José da Silva',
    aliases: ['rua delamar jose da silva', 'delamar jose da silva', 'delamar'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5930,
    lng: -48.6190,
    type: 'rua'
  },
  {
    name: 'Rua Brasilpinho',
    aliases: ['rua brasilpinho', 'brasilpinho'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5950,
    lng: -48.6170,
    type: 'rua'
  },
  {
    name: 'Rua Caetano José Ferreira',
    aliases: ['caetano jose ferreira', 'rua caetano'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5935,
    lng: -48.6215,
    type: 'rua'
  },
  {
    name: 'Rua Capitão Augusto Vidal',
    aliases: ['capitao augusto vidal', 'augusto vidal'],
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    lat: -27.5968,
    lng: -48.6225,
    type: 'rua'
  },

  // CAMPINAS
  {
    name: 'Avenida Brigadeiro da Silva Paes',
    aliases: ['av brigadeiro da silva paes', 'brigadeiro da silva paes', 'silva paes', 'av silva paes'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.6025,
    lng: -48.6255,
    type: 'avenida'
  },
  {
    name: 'Rua Altamiro Di Bernardi',
    aliases: ['rua altamiro di bernardi', 'altamiro di bernardi', 'di bernardi'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.6005,
    lng: -48.6240,
    type: 'rua'
  },
  {
    name: 'Rua Coronel Américo',
    aliases: ['rua coronel americo', 'coronel americo'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.5985,
    lng: -48.6275,
    type: 'rua'
  },
  {
    name: 'Rua Cruz e Souza',
    aliases: ['rua cruz e souza', 'cruz e souza'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.6015,
    lng: -48.6285,
    type: 'rua'
  },
  {
    name: 'Rua José Ferreira',
    aliases: ['rua jose ferreira', 'jose ferreira'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.6035,
    lng: -48.6265,
    type: 'rua'
  },
  {
    name: 'Avenida Governador Jorge Lacerda',
    aliases: ['av governador jorge lacerda', 'jorge lacerda', 'av jorge lacerda'],
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    lat: -27.6040,
    lng: -48.6220,
    type: 'avenida'
  },

  // BARREIROS
  {
    name: 'Avenida Leoberto Leal',
    aliases: ['av leoberto leal', 'leoberto leal', 'av leoberto'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5740,
    lng: -48.6070,
    type: 'avenida'
  },
  {
    name: 'Rua Eugênio Portela',
    aliases: ['rua eugenio portela', 'eugenio portela'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5765,
    lng: -48.6040,
    type: 'rua'
  },
  {
    name: 'Rua José Victor da Rosa',
    aliases: ['rua jose victor da rosa', 'jose victor da rosa', 'jose victor'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5780,
    lng: -48.6100,
    type: 'rua'
  },
  {
    name: 'Rua Cirilo Pedroso de Oliveira',
    aliases: ['rua cirilo pedroso de oliveira', 'cirilo pedroso'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5710,
    lng: -48.6090,
    type: 'rua'
  },
  {
    name: 'Rua São Ludgero',
    aliases: ['rua sao ludgero', 'sao ludgero'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5735,
    lng: -48.6030,
    type: 'rua'
  },
  {
    name: 'Rua Manoel Loureiro',
    aliases: ['rua manoel loureiro', 'manoel loureiro'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5790,
    lng: -48.6060,
    type: 'rua'
  },
  {
    name: 'Rua Francisco Pedro Cunha',
    aliases: ['francisco pedro cunha', 'rua francisco pedro cunha'],
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    lat: -27.5720,
    lng: -48.6120,
    type: 'rua'
  },

  // PRAIA COMPRIDA & CENTRO HISTÓRICO
  {
    name: 'Rua Luiz Fagundes',
    aliases: ['rua luiz fagundes', 'luiz fagundes', 'luis fagundes'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Praia Comprida',
    lat: -27.6185,
    lng: -48.6240,
    type: 'rua'
  },
  {
    name: 'Rua Getúlio Vargas',
    aliases: ['rua getulio vargas', 'getulio vargas'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Praia Comprida',
    lat: -27.6140,
    lng: -48.6290,
    type: 'rua'
  },
  {
    name: 'Rua Domingos Filomeno',
    aliases: ['rua domingos filomeno', 'domingos filomeno'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Praia Comprida',
    lat: -27.6170,
    lng: -48.6230,
    type: 'rua'
  },
  {
    name: 'Rua Gaspar Neves',
    aliases: ['rua gaspar neves', 'gaspar neves'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Centro Histórico / Praia Comprida',
    lat: -27.6150,
    lng: -48.6310,
    type: 'rua'
  },
  {
    name: 'Praça Arnoldo de Souza',
    aliases: ['praca arnoldo de souza', 'praca centro historico', 'centro historico'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Centro Histórico',
    lat: -27.6145,
    lng: -48.6300,
    type: 'praca'
  },
  {
    name: 'Rua Frederico Afonso',
    aliases: ['rua frederico afonso', 'frederico afonso'],
    neighborhoodId: 'praia_comprida',
    neighborhoodName: 'Pontal / Praia Comprida',
    lat: -27.6290,
    lng: -48.6280,
    type: 'rua'
  },

  // FORQUILHINHAS & FORQUILHAS
  {
    name: 'Rua Vereador Arthur Manoel Mariano',
    aliases: ['rua vereador arthur manoel mariano', 'arthur manoel mariano', 'arthur mariano', 'ver arthur mariano'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6030,
    lng: -48.6620,
    type: 'rua'
  },
  {
    name: 'Rua Antônio Jovita Duarte',
    aliases: ['rua antonio jovita duarte', 'antonio jovita duarte', 'jovita duarte'],
    neighborhoodId: 'forquilhas',
    neighborhoodName: 'Forquilhas',
    lat: -27.6110,
    lng: -48.6750,
    type: 'rua'
  },
  {
    name: 'Rua Princesa Isabel',
    aliases: ['rua princesa isabel', 'princesa isabel'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6055,
    lng: -48.6600,
    type: 'rua'
  },
  {
    name: 'Rua Prefeito Dib Cherem',
    aliases: ['rua prefeito dib cherem', 'dib cherem'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6010,
    lng: -48.6680,
    type: 'rua'
  },
  {
    name: 'Rua Luiz Gonzaga',
    aliases: ['rua luiz gonzaga', 'luiz gonzaga'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6065,
    lng: -48.6670,
    type: 'rua'
  },

  // SERRARIA
  {
    name: 'Rua João Amaral Rios',
    aliases: ['rua joao amaral rios', 'joao amaral rios'],
    neighborhoodId: 'serraria',
    neighborhoodName: 'Serraria',
    lat: -27.5550,
    lng: -48.6150,
    type: 'rua'
  },
  {
    name: 'Rua Nossa Senhora dos Navegantes',
    aliases: ['rua nossa senhora dos navegantes', 'nossa senhora dos navegantes', 'navegantes'],
    neighborhoodId: 'serraria',
    neighborhoodName: 'Serraria',
    lat: -27.5590,
    lng: -48.6200,
    type: 'rua'
  },
  {
    name: 'Rua Francisco Inácio da Silva',
    aliases: ['rua francisco inacio da silva', 'francisco inacio'],
    neighborhoodId: 'serraria',
    neighborhoodName: 'Serraria',
    lat: -27.5520,
    lng: -48.6180,
    type: 'rua'
  },

  // AREIAS & BOSQUE DAS MANSÕES
  {
    name: 'Rua São Pedro',
    aliases: ['rua sao pedro', 'sao pedro'],
    neighborhoodId: 'areias',
    neighborhoodName: 'Areias',
    lat: -27.5890,
    lng: -48.6380,
    type: 'rua'
  },
  {
    name: 'Avenida das Torres',
    aliases: ['av das torres', 'avenida das torres', 'av torres', 'torres'],
    neighborhoodId: 'areias',
    neighborhoodName: 'Areias / Bela Vista / Serraria',
    lat: -27.5780,
    lng: -48.6290,
    type: 'avenida'
  },
  {
    name: 'Rua Francisco Jacinto de Melo',
    aliases: ['rua francisco jacinto de melo', 'francisco jacinto de melo', 'francisco jacinto'],
    neighborhoodId: 'areias',
    neighborhoodName: 'Areias',
    lat: -27.5850,
    lng: -48.6360,
    type: 'rua'
  },
  {
    name: 'Rua Iano',
    aliases: ['rua iano', 'iano'],
    neighborhoodId: 'areias',
    neighborhoodName: 'Areias',
    lat: -27.5910,
    lng: -48.6430,
    type: 'rua'
  },

  // BELA VISTA
  {
    name: 'Rua Gisela',
    aliases: ['rua gisela', 'gisela'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5720,
    lng: -48.6320,
    type: 'rua'
  },
  {
    name: 'Rua Frei Hermenegildo',
    aliases: ['rua frei hermenegildo', 'frei hermenegildo'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5680,
    lng: -48.6350,
    type: 'rua'
  },
  {
    name: 'Rua José Bonifácio',
    aliases: ['rua jose bonifacio', 'jose bonifacio'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5745,
    lng: -48.6300,
    type: 'rua'
  },

  // ROÇADO
  {
    name: 'Rua João Grumiche',
    aliases: ['rua joao grumiche', 'joao grumiche', 'grumiche'],
    neighborhoodId: 'rocado',
    neighborhoodName: 'Roçado',
    lat: -27.6090,
    lng: -48.6370,
    type: 'rua'
  },
  {
    name: 'Rua Maria Mancio Rosa',
    aliases: ['rua maria mancio rosa', 'maria mancio rosa', 'mancio rosa'],
    neighborhoodId: 'rocado',
    neighborhoodName: 'Roçado',
    lat: -27.6070,
    lng: -48.6410,
    type: 'rua'
  },

  // FAZENDA SANTO ANTÔNIO
  {
    name: 'Rua Cândido Amaro Damásio',
    aliases: ['rua candido amaro damasio', 'candido amaro damasio', 'candido amaro'],
    neighborhoodId: 'fazenda_santo_antonio',
    neighborhoodName: 'Fazenda Santo Antônio',
    lat: -27.6240,
    lng: -48.6410,
    type: 'rua'
  },
  {
    name: 'Rua Benjamin Gerlach',
    aliases: ['rua benjamin gerlach', 'benjamin gerlach'],
    neighborhoodId: 'fazenda_santo_antonio',
    neighborhoodName: 'Fazenda Santo Antônio',
    lat: -27.6210,
    lng: -48.6440,
    type: 'rua'
  },

  // IPIRANGA
  {
    name: 'Rua Otto Júlio Malina',
    aliases: ['rua otto julio malina', 'otto julio malina', 'otto malina'],
    neighborhoodId: 'ipiranga',
    neighborhoodName: 'Ipiranga',
    lat: -27.5830,
    lng: -48.6240,
    type: 'rua'
  },
  {
    name: 'Rua Manoel Joaquim dos Santos',
    aliases: ['rua manoel joaquim dos santos', 'manoel joaquim dos santos', 'manoel joaquim'],
    neighborhoodId: 'ipiranga',
    neighborhoodName: 'Ipiranga',
    lat: -27.5810,
    lng: -48.6200,
    type: 'rua'
  },

  // POTECAS
  {
    name: 'Rua João José Martins',
    aliases: ['rua joao jose martins', 'joao jose martins'],
    neighborhoodId: 'potecas',
    neighborhoodName: 'Potecas',
    lat: -27.6190,
    lng: -48.6820,
    type: 'rua'
  },
  {
    name: 'Rua Kilian Heck',
    aliases: ['rua kilian heck', 'kilian heck'],
    neighborhoodId: 'potecas',
    neighborhoodName: 'Potecas',
    lat: -27.6230,
    lng: -48.6870,
    type: 'rua'
  },

  // RUAS CADASTRADAS PELAS EQUIPES DE CAMPO (DAIANA, LUCIANO, MILENA)
  {
    name: 'Rua Manoel Francisco de Souza',
    aliases: ['rua manoel francisco de souza', 'manoel francisco de souza', 'manoel francisco'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6042,
    lng: -48.6530,
    type: 'rua'
  },
  {
    name: 'Rua Allan Kardec',
    aliases: ['rua allan kardec', 'allan kardec', 'kardec'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6078,
    lng: -48.6552,
    type: 'rua'
  },
  {
    name: 'Rua Aimoré',
    aliases: ['rua aimore', 'aimore', 'rua aimoré'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6095,
    lng: -48.6515,
    type: 'rua'
  },
  {
    name: 'Rua Águas de Chapecó',
    aliases: ['rua aguas de chapeco', 'aguas de chapeco', 'aguas de chapecó'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5815,
    lng: -48.6290,
    type: 'rua'
  },
  {
    name: 'Rua Lagoa da Conceição',
    aliases: ['rua lagoa da conceicao', 'lagoa da conceicao', 'lagoa da conceição'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5832,
    lng: -48.6315,
    type: 'rua'
  },
  {
    name: 'Rua Pântano do Sul',
    aliases: ['rua pantano do sul', 'pantano do sul', 'pântano do sul'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5840,
    lng: -48.6328,
    type: 'rua'
  },
  {
    name: 'Rua Daniela',
    aliases: ['rua daniela', 'daniela'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5825,
    lng: -48.6305,
    type: 'rua'
  },
  {
    name: 'Rua Giancarlo Griss Costa',
    aliases: ['rua giancarlo griss costa', 'giancarlo griss costa', 'giancarlo griss'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5855,
    lng: -48.6280,
    type: 'rua'
  },
  {
    name: 'Rua das Violetas',
    aliases: ['rua das violetas', 'das violetas', 'violetas'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5870,
    lng: -48.6335,
    type: 'rua'
  },
  {
    name: 'Rua dos Jasmins',
    aliases: ['rua rua dos jasmins', 'rua dos jasmins', 'dos jasmins', 'jasmins'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5862,
    lng: -48.6340,
    type: 'rua'
  },
  {
    name: 'Rua das Papoulas',
    aliases: ['rua das papoulas', 'das papoulas', 'papoulas'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5880,
    lng: -48.6345,
    type: 'rua'
  },
  {
    name: 'Rua Cândido Amaro Damásio',
    aliases: ['rua rua candido amaro damasio', 'candido amaro damasio', 'candido amaro'],
    neighborhoodId: 'bela_vista',
    neighborhoodName: 'Bela Vista',
    lat: -27.5895,
    lng: -48.6310,
    type: 'rua'
  },
  {
    name: 'Rua Antenor Valentin da Silva',
    aliases: ['rua antenor valentin da silva', 'antenor valentin da silva', 'antenor valentin'],
    neighborhoodId: 'ipiranga',
    neighborhoodName: 'Ipiranga',
    lat: -27.5910,
    lng: -48.6395,
    type: 'rua'
  },
  {
    name: 'Rua José Bartolomeu Vieira',
    aliases: ['rua jose bartolomeu vieira', 'jose bartolomeu vieira', 'bartolomeu vieira'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6055,
    lng: -48.6540,
    type: 'rua'
  },
  {
    name: 'Rua Vitorino José Luiz',
    aliases: ['rua vitorino jose luiz', 'vitorino jose luiz', 'vitorino luiz'],
    neighborhoodId: 'forquilhas',
    neighborhoodName: 'Forquilhas',
    lat: -27.6080,
    lng: -48.6650,
    type: 'rua'
  },
  {
    name: 'Rua Alexandre Plueinsk',
    aliases: ['rua alexandre plueinsk', 'alexandre plueinsk', 'alexandre plucinski'],
    neighborhoodId: 'forquilhas',
    neighborhoodName: 'Forquilhas',
    lat: -27.6065,
    lng: -48.6680,
    type: 'rua'
  },
  {
    name: 'Rua Bernardino Freitas de Agostinho',
    aliases: ['rua bernadino freitas de agostinho', 'bernadino freitas de agostinho', 'bernardino freitas'],
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    lat: -27.6035,
    lng: -48.6510,
    type: 'rua'
  },
  {
    name: 'Rua Túlio Rodrigues Martins',
    aliases: ['rua tulio rodrigues martins', 'tulio rodrigues martins', 'tulio martins'],
    neighborhoodId: 'forquilhas',
    neighborhoodName: 'Forquilhas',
    lat: -27.6050,
    lng: -48.6635,
    type: 'rua'
  }
];

/**
 * Normaliza strings para comparação fonética/textual
 */
export function normalizeStreetName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(rua|avenida|av|travessa|servidao|rodovia|alameda|praca|estrada|r\.|av\.)\b/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifica se uma coordenada está dentro dos limites geográficos reais de São José - SC
 */
export function isCoordinateInsideSaoJose(lat?: number, lng?: number): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  // Coordenadas perto de (0,0) ou fora do estado de SC
  if (Math.abs(lat) < 1 || Math.abs(lng) < 1) return false;

  return (
    lat >= SAO_JOSE_BOUNDS.minLat &&
    lat <= SAO_JOSE_BOUNDS.maxLat &&
    lng >= SAO_JOSE_BOUNDS.minLng &&
    lng <= SAO_JOSE_BOUNDS.maxLng
  );
}

/**
 * Localiza a coordenada EXATA de uma rua em São José pelo nome ou bairro
 */
export function resolveExactStreetCoordinates(
  streetName: string,
  neighborhoodId?: string,
  fallbackNeighborhoods: Neighborhood[] = []
): { lat: number; lng: number; resolvedBy: 'exact_street' | 'fuzzy_street' | 'neighborhood_center' | 'fallback_center' } {
  const normInput = normalizeStreetName(streetName);

  if (normInput) {
    // 1. Busca Exata no catálogo de ruas
    const exactMatch = SAO_JOSE_KNOWN_STREETS.find(s => {
      const normKnown = normalizeStreetName(s.name);
      if (normKnown === normInput) return true;
      return s.aliases.some(a => normalizeStreetName(a) === normInput);
    });

    if (exactMatch) {
      return { lat: exactMatch.lat, lng: exactMatch.lng, resolvedBy: 'exact_street' };
    }

    // 2. Busca Parcial (contains) no catálogo
    const partialMatch = SAO_JOSE_KNOWN_STREETS.find(s => {
      const normKnown = normalizeStreetName(s.name);
      if (normInput.length >= 4 && normKnown.includes(normInput)) return true;
      if (normKnown.length >= 4 && normInput.includes(normKnown)) return true;
      return s.aliases.some(a => {
        const normA = normalizeStreetName(a);
        return (normInput.length >= 4 && normA.includes(normInput)) || (normA.length >= 4 && normInput.includes(normA));
      });
    });

    if (partialMatch) {
      return { lat: partialMatch.lat, lng: partialMatch.lng, resolvedBy: 'fuzzy_street' };
    }
  }

  // 3. Fallback: Centro do Bairro informado
  if (neighborhoodId && fallbackNeighborhoods.length > 0) {
    const neigh = fallbackNeighborhoods.find(n => n.id === neighborhoodId || normalizeStreetName(n.name) === normalizeStreetName(neighborhoodId));
    if (neigh && isCoordinateInsideSaoJose(neigh.lat, neigh.lng)) {
      // Dispersão determinística leve para não sobrepor múltiplos checkins exatamente no mesmo ponto central
      const hash = Array.from(streetName || 'rua').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      const radius = 0.0018 + (hash % 12) * 0.00015; // ~180-350m
      const offsetLat = Math.sin(angle) * radius * 0.8;
      const offsetLng = Math.cos(angle) * radius;

      return {
        lat: Number((neigh.lat + offsetLat).toFixed(6)),
        lng: Number((neigh.lng + offsetLng).toFixed(6)),
        resolvedBy: 'neighborhood_center'
      };
    }
  }

  // 4. Fallback Geral: Centro de São José
  return {
    lat: SAO_JOSE_BOUNDS.center[0],
    lng: SAO_JOSE_BOUNDS.center[1],
    resolvedBy: 'fallback_center'
  };
}

/**
 * Garante que qualquer StreetCheckIn possua coordenadas válidas e precisas
 * Se a geolocalização capturada for incorreta/nula ou fora de São José,
 * resolve automaticamente o PIN na rua correspondente!
 */
export function getCalibratedCheckInPosition(
  checkIn: StreetCheckIn,
  neighborhoods: Neighborhood[] = []
): { lat: number; lng: number; isRecalibrated: boolean } {
  const isGpsValid = isCoordinateInsideSaoJose(checkIn.latitude, checkIn.longitude);

  // Se o GPS é válido e não está travado em coordenada padrão neutra
  if (isGpsValid && checkIn.latitude !== 0 && checkIn.longitude !== 0) {
    // Se o GPS está dentro do município, verificar se há rua conhecida muito discrepante
    return { lat: checkIn.latitude, lng: checkIn.longitude, isRecalibrated: false };
  }

  // GPS ausente ou inválido -> resolver pelo nome da rua cadastrada
  const resolved = resolveExactStreetCoordinates(checkIn.streetName, checkIn.neighborhoodId, neighborhoods);
  return { lat: resolved.lat, lng: resolved.lng, isRecalibrated: true };
}
