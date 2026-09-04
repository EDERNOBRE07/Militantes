import { Neighborhood, StreetCheckIn } from '../types';

/**
 * Bounding box for São José - SC (abrangendo todo o território municipal conforme PMSJ 2020 / IBGE 2021)
 */
export const SAO_JOSE_BOUNDS = {
  minLat: -27.6700,
  maxLat: -27.5100,
  minLng: -48.7650,
  maxLng: -48.5800,
  center: [-27.5950, -48.6450] as [number, number]
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
  {
    "name": "Rua Araçari",
    "aliases": ["aracari", "r aracari", "rua aracari"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5672434,
    "lng": -48.6700578,
    "type": "rua"
  },
  {
    "name": "Rua Ulisses Siqueira Lima",
    "aliases": ["ulisses siqueira lima", "r ulisses siqueira lima", "rua ulisses siqueira lima"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5746269,
    "lng": -48.6516576,
    "type": "rua"
  },
  {
    "name": "Rua Hon\u00f3ria Virgilina Machado",
    "aliases": ["honoria virgilina machado", "r honoria virgilina machado", "rua honoria"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5688543,
    "lng": -48.6390348,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Pedro Paulo Kremer",
    "aliases": ["ver pedro paulo kremer", "rua ver pedro paulo kremer", "pedro paulo kremer", "r ver pedro paulo kremer"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5659571,
    "lng": -48.6382016,
    "type": "rua"
  },
  {
    "name": "Rua M\u00e1rio C\u00e9sar da Costa",
    "aliases": ["mario cesar da costa", "r mario cesar da costa", "rua mario cesar da costa"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5663716,
    "lng": -48.6412376,
    "type": "rua"
  },
  {
    "name": "Rua Carlos Drummond de Andrade",
    "aliases": ["carlos drumond de andrade", "carlos drummond de andrade", "r carlos drumond de andrade", "r carlos drummond de andrade"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5673512,
    "lng": -48.6417422,
    "type": "rua"
  },
  {
    "name": "Rua Alceu Amoroso Lima",
    "aliases": ["alceu amoroso lima", "r alceu amoroso lima"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5682,
    "lng": -48.6385,
    "type": "rua"
  },
  {
    "name": "Rua Lacy de Lima",
    "aliases": ["laci de lima", "lacy de lima", "rua laci de lima", "rua lacy de lima"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5684,
    "lng": -48.6395,
    "type": "rua"
  },
  {
    "name": "Rua Jo\u00e3o Paulo Gaspar",
    "aliases": ["joao paulo gaspar", "r joao paulo gaspar", "rua joao paulo gaspar"],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.57022,
    "lng": -48.63868,
    "type": "rua"
  },
  {
    "name": "Rua Ararangu\u00e1",
    "aliases": ["ararangua", "rua ararangua", "r ararangua"],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5707628,
    "lng": -48.6156463,
    "type": "rua"
  },
  {
    "name": "Rua Pedro Bunn",
    "aliases": ["pedro bunn", "rua pedro bunn", "r pedro bunn"],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5696136,
    "lng": -48.621878,
    "type": "rua"
  },
  {
    "name": "Rua Frontino Coelho Pires",
    "aliases": ["frontino coelho pires", "rua frontino coelho pires", "r frontino coelho pires"],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.56738,
    "lng": -48.6198,
    "type": "rua"
  },
  {
    "name": "Rua Eug\u00eanio Portela",
    "aliases": ["eugenio portela", "rua eugenio portela", "r eugenio portela"],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5826033,
    "lng": -48.6050803,
    "type": "rua"
  },
  {
    "name": "Rua Jos\u00e9 Victor da Rosa",
    "aliases": ["jose victor da rosa", "jose victor da silva", "rua jose victor da rosa", "rua jose victor da silva"],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.576,
    "lng": -48.6045,
    "type": "rua"
  },
  {
    "name": "Rua Marechal Rondon",
    "aliases": ["mal rondon", "marechal rondon", "r mal rondon", "rua mal rondon"],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5832546,
    "lng": -48.6071024,
    "type": "rua"
  },
  {
    "name": "Rua Justino Machado Loreto",
    "aliases": ["justino machado loreto", "rua justino machado loreto", "justino machado"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.57573,
    "lng": -48.66082,
    "type": "rua"
  },
  {
    "name": "Rua Jovito Manoel Gon\u00e7alves",
    "aliases": ["jovito manoel goncalves", "rua jovito manoel goncalves", "jovito manoel"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5761,
    "lng": -48.6602,
    "type": "rua"
  },
  {
    "name": "Rua Juliana Maria da Silva",
    "aliases": ["juliana maria da silva", "rua juliana maria da silva", "juliana maria"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5771011,
    "lng": -48.6592698,
    "type": "rua"
  },
  {
    "name": "Rua Maria Francisca Concei\u00e7\u00e3o Ribeiro",
    "aliases": ["mariafrancisca conceicao ribeiro", "maria francisca conceicao ribeiro", "rua mariafrancisca conceicao ribeiro"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5768,
    "lng": -48.6599,
    "type": "rua"
  },
  {
    "name": "Avenida Ceniro Luiz Ribeiro Martins",
    "aliases": ["ceniro luiz ribeiro martins", "av ceniro luiz ribeiro martins", "ceniro martins"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5757929,
    "lng": -48.661112,
    "type": "avenida"
  },
  {
    "name": "Rua A\u00e7ores",
    "aliases": ["acores", "r acores", "rua acores"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5794143,
    "lng": -48.6710062,
    "type": "rua"
  },
  {
    "name": "Rua Portim\u00e3o",
    "aliases": ["portimao", "r portimao", "rua portimao"],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5789673,
    "lng": -48.6708845,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Francisco de Souza",
    "aliases": ["manoel francisco de souza", "rua manoel francisco de souza"],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5999,
    "lng": -48.6433,
    "type": "rua"
  },
  {
    "name": "Avenida Vereador Arthur Manoel Mariano",
    "aliases": ["arthur mariano", "rua arthur mariano", "ver arthur manoel mariano", "rua vereador arthur manoel mariano"],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5989777,
    "lng": -48.6448497,
    "type": "avenida"
  },
  {
    "name": "Rua dos L\u00edrios",
    "aliases": ["dos lirios", "rua dos lirios", "r dos lirios"],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5420953,
    "lng": -48.6456811,
    "type": "rua"
  },
  {
    "name": "Avenida Presidente Kennedy",
    "aliases": [
      "av presidente kennedy",
      "presidente kennedy",
      "av kennedy",
      "kennedy"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.5955,
    "lng": -48.6175,
    "type": "avenida"
  },
  {
    "name": "Avenida Lédio João Martins",
    "aliases": [
      "av ledio joao martins",
      "ledio joao martins",
      "av central kobrasol",
      "rua central"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.5945,
    "lng": -48.618,
    "type": "avenida"
  },
  {
    "name": "Rua Koesa",
    "aliases": [
      "rua koesa",
      "koesa",
      "r koesa"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.594,
    "lng": -48.6195,
    "type": "rua"
  },
  {
    "name": "Rua Emerson Ferrari",
    "aliases": [
      "rua emerson ferrari",
      "emerson ferrari"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.597,
    "lng": -48.616,
    "type": "rua"
  },
  {
    "name": "Rua Adhemar da Silva",
    "aliases": [
      "rua adhemar da silva",
      "adhemar da silva",
      "rua ademar da silva"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.5955,
    "lng": -48.6165,
    "type": "rua"
  },
  {
    "name": "Rua Delamar José da Silva",
    "aliases": [
      "rua delamar jose da silva",
      "delamar jose da silva",
      "delamar"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.593,
    "lng": -48.619,
    "type": "rua"
  },
  {
    "name": "Rua Brasilpinho",
    "aliases": [
      "rua brasilpinho",
      "brasilpinho"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.595,
    "lng": -48.617,
    "type": "rua"
  },
  {
    "name": "Rua Caetano José Ferreira",
    "aliases": [
      "caetano jose ferreira",
      "rua caetano"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.5935,
    "lng": -48.621,
    "type": "rua"
  },
  {
    "name": "Rua Capitão Augusto Vidal",
    "aliases": [
      "capitao augusto vidal",
      "augusto vidal"
    ],
    "neighborhoodId": "kobrasol",
    "neighborhoodName": "Kobrasol",
    "lat": -27.5968,
    "lng": -48.6215,
    "type": "rua"
  },
  {
    "name": "Avenida Brigadeiro da Silva Paes",
    "aliases": [
      "av brigadeiro silva paes",
      "brigadeiro da silva paes",
      "silva paes",
      "brigadeiro silva paes"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.596,
    "lng": -48.6105,
    "type": "avenida"
  },
  {
    "name": "Rua Altamiro Di Bernardi",
    "aliases": [
      "altamiro di bernardi",
      "altamiro bernardi",
      "r altamiro"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.5974,
    "lng": -48.6095,
    "type": "rua"
  },
  {
    "name": "Rua Coronel Américo",
    "aliases": [
      "coronel americo",
      "rua cel americo",
      "cel americo"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.5955,
    "lng": -48.6115,
    "type": "rua"
  },
  {
    "name": "Rua Cruz e Souza",
    "aliases": [
      "cruz e souza",
      "cruz e sousa",
      "rua cruz e souza"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.598,
    "lng": -48.611,
    "type": "rua"
  },
  {
    "name": "Rua José Ferreira",
    "aliases": [
      "jose ferreira",
      "rua jose ferreira"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.599,
    "lng": -48.612,
    "type": "rua"
  },
  {
    "name": "Avenida Governador Jorge Lacerda",
    "aliases": [
      "jorge lacerda",
      "gov jorge lacerda",
      "av jorge lacerda"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.593,
    "lng": -48.6125,
    "type": "avenida"
  },
  {
    "name": "Avenida Acioni Souza Filho (Beira-Mar)",
    "aliases": [
      "beira mar de sao jose",
      "beira-mar",
      "acioni souza filho"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.5965,
    "lng": -48.6085,
    "type": "avenida"
  },
  {
    "name": "Avenida Leoberto Leal",
    "aliases": [
      "av leoberto leal",
      "leoberto leal",
      "leoberto"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.574,
    "lng": -48.606,
    "type": "avenida"
  },
  {
    "name": "Rua Eugênio Portela",
    "aliases": [
      "eugenio portela",
      "rua eugenio portela"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5765,
    "lng": -48.604,
    "type": "rua"
  },
  {
    "name": "Rua José Victor da Rosa",
    "aliases": [
      "jose victor da rosa",
      "jose victor",
      "victor da rosa"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.578,
    "lng": -48.61,
    "type": "rua"
  },
  {
    "name": "Rua Cirilo Pedroso de Oliveira",
    "aliases": [
      "cirilo pedroso",
      "cirilo pedroso de oliveira"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.571,
    "lng": -48.607,
    "type": "rua"
  },
  {
    "name": "Rua São Ludgero",
    "aliases": [
      "sao ludgero",
      "rua sao ludgero"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5735,
    "lng": -48.603,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Loureiro",
    "aliases": [
      "manoel loureiro",
      "rua manoel loureiro"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.579,
    "lng": -48.606,
    "type": "rua"
  },
  {
    "name": "Rua Francisco Pedro Cunha",
    "aliases": [
      "francisco pedro cunha",
      "rua francisco pedro cunha"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.572,
    "lng": -48.609,
    "type": "rua"
  },
  {
    "name": "Rua Luiz Fagundes",
    "aliases": [
      "luiz fagundes",
      "rua luiz fagundes",
      "av luiz fagundes"
    ],
    "neighborhoodId": "praia_comprida",
    "neighborhoodName": "Praia Comprida",
    "lat": -27.6095,
    "lng": -48.622,
    "type": "rua"
  },
  {
    "name": "Rua Domingos Filomeno",
    "aliases": [
      "domingos filomeno",
      "rua domingos filomeno"
    ],
    "neighborhoodId": "praia_comprida",
    "neighborhoodName": "Praia Comprida",
    "lat": -27.611,
    "lng": -48.623,
    "type": "rua"
  },
  {
    "name": "Rua Homero de Miranda Gomes",
    "aliases": [
      "hospital regional",
      "homero de miranda gomes"
    ],
    "neighborhoodId": "praia_comprida",
    "neighborhoodName": "Praia Comprida",
    "lat": -27.6085,
    "lng": -48.6225,
    "type": "rua"
  },
  {
    "name": "Praça Hercílio Luz",
    "aliases": [
      "praca hercilio luz",
      "hercilio luz centro",
      "centro historico"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.6185,
    "lng": -48.6245,
    "type": "praca"
  },
  {
    "name": "Rua Getúlio Vargas",
    "aliases": [
      "getulio vargas",
      "rua getulio vargas"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.6175,
    "lng": -48.6255,
    "type": "rua"
  },
  {
    "name": "Rua Gaspar Neves",
    "aliases": [
      "gaspar neves",
      "rua gaspar neves"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.618,
    "lng": -48.624,
    "type": "rua"
  },
  {
    "name": "Praça Arnoldo de Souza",
    "aliases": [
      "arnoldo de souza",
      "praca arnoldo de souza"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.619,
    "lng": -48.624,
    "type": "praca"
  },
  {
    "name": "Rua Frederico Afonso",
    "aliases": [
      "frederico afonso",
      "rua frederico afonso",
      "estrada ponta de baixo"
    ],
    "neighborhoodId": "ponta_de_baixo",
    "neighborhoodName": "Ponta de Baixo",
    "lat": -27.632,
    "lng": -48.623,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Francisco de Souza",
    "aliases": [
      "rua manoel francisco de souza",
      "manoel francisco de souza",
      "manoel francisco"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5999,
    "lng": -48.6433,
    "type": "rua"
  },
  {
    "name": "Rua Allan Kardec",
    "aliases": [
      "rua allan kardec",
      "allan kardec",
      "kardec"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.6022,
    "lng": -48.6459,
    "type": "rua"
  },
  {
    "name": "Rua Aimoré",
    "aliases": [
      "rua aimore",
      "aimore",
      "rua aimores"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5956,
    "lng": -48.6479,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Arthur Manoel Mariano",
    "aliases": [
      "arthur manoel mariano",
      "arthur mariano",
      "rua arthur mariano",
      "vereador arthur mariano"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.599,
    "lng": -48.644,
    "type": "rua"
  },
  {
    "name": "Rua Princesa Isabel",
    "aliases": [
      "princesa isabel",
      "rua princesa isabel"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.604,
    "lng": -48.649,
    "type": "rua"
  },
  {
    "name": "Rua Prefeito Dib Cherem",
    "aliases": [
      "dib cherem",
      "prefeito dib cherem"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.606,
    "lng": -48.647,
    "type": "rua"
  },
  {
    "name": "Rua Luiz Gonzaga",
    "aliases": [
      "luiz gonzaga",
      "rua luiz gonzaga"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.605,
    "lng": -48.65,
    "type": "rua"
  },
  {
    "name": "Rua José Bartolomeu Vieira",
    "aliases": [
      "jose bartolomeu vieira",
      "bartolomeu vieira"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.6055,
    "lng": -48.654,
    "type": "rua"
  },
  {
    "name": "Rua Bernardino Freitas de Agostinho",
    "aliases": [
      "bernardino freitas de agostinho",
      "bernardino freitas"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.6035,
    "lng": -48.651,
    "type": "rua"
  },
  {
    "name": "Rua Antônio Jovita Duarte",
    "aliases": [
      "antonio jovita duarte",
      "jovita duarte",
      "antonio jovita"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.602,
    "lng": -48.672,
    "type": "rua"
  },
  {
    "name": "Rua Vitorino José Luiz",
    "aliases": [
      "vitorino jose luiz",
      "vitorino jose",
      "vitorino luiz"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.608,
    "lng": -48.665,
    "type": "rua"
  },
  {
    "name": "Rua Alexandre Plueinsk",
    "aliases": [
      "alexandre plueinsk",
      "rua alexandre plueinsk"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.6065,
    "lng": -48.668,
    "type": "rua"
  },
  {
    "name": "Rua Túlio Rodrigues Martins",
    "aliases": [
      "tulio rodrigues martins",
      "tulio rodrigues"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.605,
    "lng": -48.6635,
    "type": "rua"
  },
  {
    "name": "Rua João Amaral Rios",
    "aliases": [
      "joao amaral rios",
      "amaral rios"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.555,
    "lng": -48.618,
    "type": "rua"
  },
  {
    "name": "Rua Nossa Senhora dos Navegantes",
    "aliases": [
      "nossa senhora dos navegantes",
      "navegantes"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.558,
    "lng": -48.62,
    "type": "rua"
  },
  {
    "name": "Rua Francisco Inácio da Silva",
    "aliases": [
      "francisco inacio da silva",
      "francisco inacio"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.552,
    "lng": -48.619,
    "type": "rua"
  },
  {
    "name": "Rua São Pedro",
    "aliases": [
      "sao pedro",
      "rua sao pedro"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.583,
    "lng": -48.637,
    "type": "rua"
  },
  {
    "name": "Avenida das Torres",
    "aliases": [
      "av das torres",
      "avenida das torres",
      "das torres"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.581,
    "lng": -48.636,
    "type": "avenida"
  },
  {
    "name": "Rua Francisco Jacinto de Melo",
    "aliases": [
      "francisco jacinto de melo",
      "jacinto de melo"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.585,
    "lng": -48.639,
    "type": "rua"
  },
  {
    "name": "Rua Iano",
    "aliases": [
      "iano",
      "rua iano"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.586,
    "lng": -48.641,
    "type": "rua"
  },
  {
    "name": "Rua João José Martins",
    "aliases": [
      "joao jose martins",
      "rua joao jose martins"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.584,
    "lng": -48.636,
    "type": "rua"
  },
  {
    "name": "Rua Bosque das Mansões",
    "aliases": [
      "bosque das mansoes",
      "condominio bosque das mansoes"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.597,
    "lng": -48.635,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Lourival de Souza",
    "aliases": [
      "manoel lourival de souza",
      "manoel lourival"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.598,
    "lng": -48.636,
    "type": "rua"
  },
  {
    "name": "Rua das Mansões",
    "aliases": [
      "das mansoes",
      "rua das mansoes"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.596,
    "lng": -48.634,
    "type": "rua"
  },
  {
    "name": "Rua Alaide Martins",
    "aliases": [
      "alaide martins",
      "rua alaide martins"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.5975,
    "lng": -48.6355,
    "type": "rua"
  },
  {
    "name": "Rua Maria Bernardina da Silva",
    "aliases": [
      "maria bernardina da silva",
      "maria bernardina"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.599,
    "lng": -48.6365,
    "type": "rua"
  },
  {
    "name": "Rua Águas de Chapecó",
    "aliases": [
      "aguas de chapeco",
      "rua aguas de chapeco"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5691895,
    "lng": -48.6144004,
    "type": "rua"
  },
  {
    "name": "Rua Lagoa da Conceição",
    "aliases": [
      "lagoa da conceicao",
      "rua lagoa da conceicao"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5710684,
    "lng": -48.6214521,
    "type": "rua"
  },
  {
    "name": "Rua Pântano do Sul",
    "aliases": [
      "pantano do sul",
      "rua pantano do sul"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5704639,
    "lng": -48.620485,
    "type": "rua"
  },
  {
    "name": "Rua Daniela",
    "aliases": [
      "daniela",
      "rua daniela"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5710339,
    "lng": -48.6206547,
    "type": "rua"
  },
  {
    "name": "Rua Giancarlo Griss Costa",
    "aliases": [
      "giancarlo griss costa",
      "giancarlo griss"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5681,
    "lng": -48.6178,
    "type": "rua"
  },
  {
    "name": "Rua das Violetas",
    "aliases": [
      "das violetas",
      "rua das violetas",
      "violetas"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5693455,
    "lng": -48.6190888,
    "type": "rua"
  },
  {
    "name": "Rua dos Jasmins",
    "aliases": [
      "dos jasmins",
      "rua dos jasmins",
      "jasmins",
      "rua rua dos jasmins"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.5825622,
    "lng": -48.6286482,
    "type": "rua"
  },
  {
    "name": "Rua das Papoulas",
    "aliases": [
      "das papoulas",
      "rua das papoulas",
      "papoulas"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5672276,
    "lng": -48.6160472,
    "type": "rua"
  },
  {
    "name": "Rua Cândido Amaro Damásio",
    "aliases": [
      "candido amaro damasio",
      "rua candido amaro damasio",
      "candido amaro",
      "rua rua candido amaro damasio"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5671868,
    "lng": -48.6167989,
    "type": "rua"
  },
  {
    "name": "Rua Gisela",
    "aliases": [
      "gisela",
      "rua gisela"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.575,
    "lng": -48.626,
    "type": "rua"
  },
  {
    "name": "Rua Frei Hermenegildo",
    "aliases": [
      "frei hermenegildo",
      "rua frei hermenegildo"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.576,
    "lng": -48.624,
    "type": "rua"
  },
  {
    "name": "Rua José Bonifácio",
    "aliases": [
      "jose bonifacio",
      "rua jose bonifacio"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5745,
    "lng": -48.625,
    "type": "rua"
  },
  {
    "name": "Rua João Grumiche",
    "aliases": [
      "joao grumiche",
      "rua joao grumiche"
    ],
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "lat": -27.604,
    "lng": -48.629,
    "type": "rua"
  },
  {
    "name": "Rua Maria Mancio Rosa",
    "aliases": [
      "maria mancio rosa",
      "mancio rosa"
    ],
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "lat": -27.606,
    "lng": -48.631,
    "type": "rua"
  },
  {
    "name": "Rua Benjamin Gerlach",
    "aliases": [
      "benjamin gerlach",
      "rua benjamin gerlach"
    ],
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "lat": -27.621,
    "lng": -48.638,
    "type": "rua"
  },
  {
    "name": "Rua Cândido Amaro Damásio (Fazenda)",
    "aliases": [
      "candido amaro fazenda"
    ],
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "lat": -27.623,
    "lng": -48.636,
    "type": "rua"
  },
  {
    "name": "Rua Otto Júlio Malina",
    "aliases": [
      "otto julio malina",
      "otto malina",
      "rua otto julio malina"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.587,
    "lng": -48.633,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Joaquim dos Santos",
    "aliases": [
      "manoel joaquim dos santos",
      "manoel joaquim"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.588,
    "lng": -48.631,
    "type": "rua"
  },
  {
    "name": "Rua Antenor Valentin da Silva",
    "aliases": [
      "antenor valentin da silva",
      "antenor valentin",
      "rua antenor valentin"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.591,
    "lng": -48.6395,
    "type": "rua"
  },
  {
    "name": "Rua Kiliano Hames",
    "aliases": [
      "kiliano hames",
      "rua kiliano hames"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.597,
    "lng": -48.654,
    "type": "rua"
  },
  {
    "name": "Rua João José Martins (Potecas)",
    "aliases": [
      "joao jose martins potecas"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.5985,
    "lng": -48.656,
    "type": "rua"
  },
  {
    "name": "Rua Kilian Heck",
    "aliases": [
      "kilian heck",
      "rua kilian heck"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.596,
    "lng": -48.653,
    "type": "rua"
  },
  {
    "name": "Rua José Victor Da Silva",
    "aliases": [
      "rua josé victor da silva (nº trecho geral)",
      "rua josé victor da silva",
      "josé victor da silva"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.556819,
    "lng": -48.6286336,
    "type": "rua"
  },
  {
    "name": "R. Da Independência",
    "aliases": [
      "r. da independência",
      "r. da independência (nº trecho geral)",
      "da independência"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.556819,
    "lng": -48.6286336,
    "type": "rua"
  },
  {
    "name": "R. Marcelo Antônio Réis",
    "aliases": [
      "marcelo antônio réis",
      "r. marcelo antônio réis",
      "r. marcelo antônio réis (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.5544705,
    "lng": -48.624102,
    "type": "rua"
  },
  {
    "name": "R. José Clodovel De Souza",
    "aliases": [
      "r. josé clodovel de souza",
      "r. josé clodovel de souza (nº trecho geral)",
      "josé clodovel de souza"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5610606,
    "lng": -48.6347006,
    "type": "rua"
  },
  {
    "name": "R. Mario César Da Costa",
    "aliases": [
      "r. mario césar da costa",
      "mario césar da costa",
      "r. mario césar da costa (nº trecho geral)"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.566279,
    "lng": -48.6436604,
    "type": "rua"
  },
  {
    "name": "R. Veríssimo Rodrigues Fortuna",
    "aliases": [
      "r. veríssimo rodrigues fortuna",
      "veríssimo rodrigues fortuna",
      "r. veríssimo rodrigues fortuna (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5452057,
    "lng": -48.6421826,
    "type": "rua"
  },
  {
    "name": "R. Léo Augusto Da Silva",
    "aliases": [
      "r. léo augusto da silva",
      "léo augusto da silva",
      "r. léo augusto da silva (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5418858,
    "lng": -48.6348447,
    "type": "rua"
  },
  {
    "name": "R. Dos Lirios",
    "aliases": [
      "r. dos lirios",
      "dos lirios",
      "r. dos lirios (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5423867,
    "lng": -48.6486873,
    "type": "rua"
  },
  {
    "name": "R. Nelson Ferreira",
    "aliases": [
      "r. nelson ferreira (nº trecho geral)",
      "nelson ferreira",
      "r. nelson ferreira"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5410805,
    "lng": -48.6394808,
    "type": "rua"
  },
  {
    "name": "Servidão Passos Filho",
    "aliases": [
      "servidão passos filho (nº trecho geral)",
      "servidão passos filho",
      "passos filho"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5773119,
    "lng": -48.6077093,
    "type": "rua"
  },
  {
    "name": "R. Portimao",
    "aliases": [
      "portimao",
      "r. portimao (nº trecho geral)",
      "r. portimao"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5789673,
    "lng": -48.6708845,
    "type": "rua"
  },
  {
    "name": "R. Açores",
    "aliases": [
      "r. açores",
      "açores",
      "r. açores (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5794143,
    "lng": -48.6710062,
    "type": "rua"
  },
  {
    "name": "Rua Guimarães",
    "aliases": [
      "rua guimarães (nº trecho geral)",
      "guimarães",
      "rua guimarães"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5809,
    "lng": -48.6714349,
    "type": "rua"
  },
  {
    "name": "Rua Laci De Lima",
    "aliases": [
      "laci de lima",
      "rua laci de lima",
      "rua laci de lima (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "Rua Arthur Mariano",
    "aliases": [
      "rua arthur mariano",
      "rua arthur mariano (nº trecho geral)",
      "arthur mariano"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "Rua Ararangua",
    "aliases": [
      "ararangua",
      "rua ararangua",
      "rua ararangua (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "Rua Pedro Bunn",
    "aliases": [
      "rua pedro bunn",
      "rua pedro bunn (nº trecho geral)",
      "pedro bunn"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "Rua Frontino Coelho Pires",
    "aliases": [
      "frontino coelho pires",
      "rua frontino coelho pires (nº trecho geral)",
      "rua frontino coelho pires"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "R. Alceu Amoroso Lima",
    "aliases": [
      "r. alceu amoroso lima",
      "r. alceu amoroso lima (nº trecho geral)",
      "alceu amoroso lima"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.568264,
    "lng": -48.6452456,
    "type": "rua"
  },
  {
    "name": "R. Carlos Drumond De Andrade",
    "aliases": [
      "r. carlos drumond de andrade",
      "r. carlos drumond de andrade (nº trecho geral)",
      "carlos drumond de andrade"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5673734,
    "lng": -48.644302,
    "type": "rua"
  },
  {
    "name": "R. Bento Águido Viêira",
    "aliases": [
      "bento águido viêira",
      "r. bento águido viêira (nº trecho geral)",
      "r. bento águido viêira"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5726038,
    "lng": -48.6202047,
    "type": "rua"
  },
  {
    "name": "R. Cândido Amaro Damásio",
    "aliases": [
      "r. cândido amaro damásio (nº trecho geral)",
      "r. cândido amaro damásio",
      "cândido amaro damásio"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5695211,
    "lng": -48.6230496,
    "type": "rua"
  },
  {
    "name": "R. Valmir De Souza",
    "aliases": [
      "r. valmir de souza",
      "r. valmir de souza (nº trecho geral)",
      "valmir de souza"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5690957,
    "lng": -48.624882,
    "type": "rua"
  },
  {
    "name": "R. Antônio Basil Schroeder",
    "aliases": [
      "antônio basil schroeder",
      "r. antônio basil schroeder (nº trecho geral)",
      "r. antônio basil schroeder"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5746871,
    "lng": -48.6195935,
    "type": "rua"
  },
  {
    "name": "R. Maria Filomena Da Silva",
    "aliases": [
      "maria filomena da silva",
      "r. maria filomena da silva",
      "r. maria filomena da silva (nº trecho geral)"
    ],
    "neighborhoodId": "nossa_senhora_do_rosario",
    "neighborhoodName": "Nossa Senhora do Rosário",
    "lat": -27.576642,
    "lng": -48.6186365,
    "type": "rua"
  },
  {
    "name": "R. Do Iano",
    "aliases": [
      "r. do iano (nº trecho geral)",
      "do iano",
      "r. do iano"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5750948,
    "lng": -48.6190351,
    "type": "rua"
  },
  {
    "name": "R. Teresina",
    "aliases": [
      "r. teresina",
      "r. teresina (nº trecho geral)",
      "teresina"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5762214,
    "lng": -48.6239516,
    "type": "rua"
  },
  {
    "name": "R. Curitiba",
    "aliases": [
      "r. curitiba",
      "curitiba",
      "r. curitiba (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5733539,
    "lng": -48.6193541,
    "type": "rua"
  },
  {
    "name": "R. Recife",
    "aliases": [
      "r. recife",
      "recife",
      "r. recife (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5749317,
    "lng": -48.6206992,
    "type": "rua"
  },
  {
    "name": "R. Ver. Arthur Manoel Mariano",
    "aliases": [
      "ver. arthur manoel mariano",
      "r. ver. arthur manoel mariano",
      "r. ver. arthur manoel mariano (nº trecho geral)"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.5989777,
    "lng": -48.6448497,
    "type": "rua"
  },
  {
    "name": "R. Doná Lídia",
    "aliases": [
      "r. doná lídia",
      "r. doná lídia (nº trecho geral)",
      "doná lídia"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5415527,
    "lng": -48.6353586,
    "type": "rua"
  },
  {
    "name": "R. Honória Virgilina Machado",
    "aliases": [
      "r. honória virgilina machado",
      "honória virgilina machado",
      "r. honória virgilina machado (nº trecho geral)"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5688543,
    "lng": -48.6390348,
    "type": "rua"
  },
  {
    "name": "R. Ver. Pedro Paulo Kremer",
    "aliases": [
      "r. ver. pedro paulo kremer (nº trecho geral)",
      "ver. pedro paulo kremer",
      "r. ver. pedro paulo kremer"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5659571,
    "lng": -48.6382016,
    "type": "rua"
  },
  {
    "name": "Av. Brasil",
    "aliases": [
      "av. brasil (nº trecho geral)",
      "av. brasil",
      "brasil"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5706684,
    "lng": -48.6204173,
    "type": "rua"
  },
  {
    "name": "R. Blumenau",
    "aliases": [
      "r. blumenau (nº trecho geral)",
      "r. blumenau",
      "blumenau"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5702902,
    "lng": -48.6210497,
    "type": "rua"
  },
  {
    "name": "R. Ratones",
    "aliases": [
      "r. ratones",
      "ratones",
      "r. ratones (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5718347,
    "lng": -48.6241535,
    "type": "rua"
  },
  {
    "name": "R. Inglêses",
    "aliases": [
      "inglêses",
      "r. inglêses",
      "r. inglêses (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5733605,
    "lng": -48.6278682,
    "type": "rua"
  },
  {
    "name": "R. Jurerê",
    "aliases": [
      "r. jurerê (nº trecho geral)",
      "r. jurerê",
      "jurerê"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5726846,
    "lng": -48.6267501,
    "type": "rua"
  },
  {
    "name": "R. Santa Luzia",
    "aliases": [
      "santa luzia",
      "r. santa luzia (nº trecho geral)",
      "r. santa luzia"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5704415,
    "lng": -48.6276494,
    "type": "rua"
  },
  {
    "name": "R. Hidalgo Araújo",
    "aliases": [
      "r. hidalgo araújo",
      "r. hidalgo araújo (nº trecho geral)",
      "hidalgo araújo"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5683458,
    "lng": -48.6237371,
    "type": "rua"
  },
  {
    "name": "R. Anchieta",
    "aliases": [
      "anchieta",
      "r. anchieta",
      "r. anchieta (nº trecho geral)"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5693966,
    "lng": -48.6174209,
    "type": "rua"
  },
  {
    "name": "R. Braço Do Norte",
    "aliases": [
      "braço do norte",
      "r. braço do norte",
      "r. braço do norte (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5711939,
    "lng": -48.6203594,
    "type": "rua"
  },
  {
    "name": "R. Aimoré",
    "aliases": [
      "r. aimoré",
      "aimoré",
      "r. aimoré (nº trecho geral)"
    ],
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "lat": -27.6003234,
    "lng": -48.6509748,
    "type": "rua"
  },
  {
    "name": "Rua Francisco Nappi",
    "aliases": [
      "rua francisco nappi (nº trecho geral)",
      "francisco nappi",
      "rua francisco nappi"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6006904,
    "lng": -48.656407,
    "type": "rua"
  },
  {
    "name": "Rua Antônio Jovita Duarte",
    "aliases": [
      "rua antônio jovita duarte (nº trecho geral)",
      "antônio jovita duarte",
      "rua antônio jovita duarte"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6006904,
    "lng": -48.656407,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Arthur Mariano",
    "aliases": [
      "rua vereador arthur mariano (nº trecho geral)",
      "vereador arthur mariano",
      "rua vereador arthur mariano"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6006904,
    "lng": -48.656407,
    "type": "rua"
  },
  {
    "name": "R. Aimoré",
    "aliases": [
      "r. aimoré",
      "aimoré",
      "r. aimoré (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6006904,
    "lng": -48.656407,
    "type": "rua"
  },
  {
    "name": "R. Urano Pires",
    "aliases": [
      "urano pires",
      "r. urano pires",
      "r. urano pires (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5750729,
    "lng": -48.6650612,
    "type": "rua"
  },
  {
    "name": "R. Leopoldina Marcelino",
    "aliases": [
      "r. leopoldina marcelino",
      "leopoldina marcelino",
      "r. leopoldina marcelino (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6022455,
    "lng": -48.6483546,
    "type": "rua"
  },
  {
    "name": "Serv. Francisco Umbelino",
    "aliases": [
      "francisco umbelino",
      "serv. francisco umbelino",
      "serv. francisco umbelino (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5446229,
    "lng": -48.6418904,
    "type": "rua"
  },
  {
    "name": "R. Telmo Luiz Martins",
    "aliases": [
      "r. telmo luiz martins (nº trecho geral)",
      "r. telmo luiz martins",
      "telmo luiz martins"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5751295,
    "lng": -48.6567069,
    "type": "rua"
  },
  {
    "name": "R. Papagaio",
    "aliases": [
      "papagaio",
      "r. papagaio (nº trecho geral)",
      "r. papagaio"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5466594,
    "lng": -48.6479617,
    "type": "rua"
  },
  {
    "name": "R. Curió",
    "aliases": [
      "r. curió",
      "r. curió (nº trecho geral)",
      "curió"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.54669,
    "lng": -48.6444782,
    "type": "rua"
  },
  {
    "name": "R. Nossa Sra. Dos Navegantes",
    "aliases": [
      "nossa sra. dos navegantes",
      "r. nossa sra. dos navegantes",
      "r. nossa sra. dos navegantes (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5441439,
    "lng": -48.6421579,
    "type": "rua"
  },
  {
    "name": "R. Sabiá Do Campo",
    "aliases": [
      "r. sabiá do campo",
      "r. sabiá do campo (nº trecho geral)",
      "sabiá do campo"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.575254,
    "lng": -48.6731671,
    "type": "rua"
  },
  {
    "name": "R. Cap. Pedro Leite",
    "aliases": [
      "r. cap. pedro leite (nº trecho geral)",
      "cap. pedro leite",
      "r. cap. pedro leite"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5736983,
    "lng": -48.6115745,
    "type": "rua"
  },
  {
    "name": "R. Aveiro",
    "aliases": [
      "r. aveiro (nº trecho geral)",
      "aveiro",
      "r. aveiro"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5725041,
    "lng": -48.6708272,
    "type": "rua"
  },
  {
    "name": "R. Nossa Sra. Rainha Da Paz",
    "aliases": [
      "r. nossa sra. rainha da paz (nº trecho geral)",
      "r. nossa sra. rainha da paz",
      "nossa sra. rainha da paz"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5741592,
    "lng": -48.6740642,
    "type": "rua"
  },
  {
    "name": "R. Cidinei Luís",
    "aliases": [
      "r. cidinei luís",
      "cidinei luís",
      "r. cidinei luís (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5728693,
    "lng": -48.6576116,
    "type": "rua"
  },
  {
    "name": "R. Alexandre Plucinski",
    "aliases": [
      "r. alexandre plucinski",
      "alexandre plucinski",
      "r. alexandre plucinski (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.573405,
    "lng": -48.6578184,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Francisco De Souza",
    "aliases": [
      "manoel francisco de souza",
      "rua manoel francisco de souza"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6042,
    "lng": -48.653,
    "type": "rua"
  },
  {
    "name": "Rua Allan Kardec",
    "aliases": [
      "rua allan kardec",
      "allan kardec"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6078,
    "lng": -48.6552,
    "type": "rua"
  },
  {
    "name": "Rua Aimoré",
    "aliases": [
      "rua aimoré",
      "aimoré"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6095,
    "lng": -48.6515,
    "type": "rua"
  },
  {
    "name": "Rua Aguas De Chapecó",
    "aliases": [
      "rua aguas de chapecó",
      "aguas de chapecó"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5691895,
    "lng": -48.6144004,
    "type": "rua"
  },
  {
    "name": "Rua Pantano Do Sul",
    "aliases": [
      "rua pantano do sul",
      "pantano do sul"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5704639,
    "lng": -48.620485,
    "type": "rua"
  },
  {
    "name": "Rua Rua Dos Jasmins",
    "aliases": [
      "rua dos jasmins",
      "rua rua dos jasmins"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.5825622,
    "lng": -48.6286482,
    "type": "rua"
  },
  {
    "name": "Rua Rua Candido Amaro Damasio",
    "aliases": [
      "rua candido amaro damasio",
      "rua rua candido amaro damasio"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5671868,
    "lng": -48.6167989,
    "type": "rua"
  },
  {
    "name": "Rua Jose Bartolomeu Vieira",
    "aliases": [
      "jose bartolomeu vieira",
      "rua jose bartolomeu vieira"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6055,
    "lng": -48.654,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Arthur Manoel Mariano",
    "aliases": [
      "rua vereador arthur manoel mariano",
      "vereador arthur manoel mariano"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.602,
    "lng": -48.662,
    "type": "rua"
  },
  {
    "name": "Rua Vitorino Jose Luiz",
    "aliases": [
      "rua vitorino jose luiz",
      "vitorino jose luiz"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.608,
    "lng": -48.665,
    "type": "rua"
  },
  {
    "name": "Rua Bernadino Freitas De Agostinho",
    "aliases": [
      "bernadino freitas de agostinho",
      "rua bernadino freitas de agostinho"
    ],
    "neighborhoodId": "forquilhinhas",
    "neighborhoodName": "Forquilhinhas",
    "lat": -27.6035,
    "lng": -48.651,
    "type": "rua"
  },
  {
    "name": "Rua Tulio Rodrigues Martins",
    "aliases": [
      "tulio rodrigues martins",
      "rua tulio rodrigues martins",
      "rua tulio rodrigues martins (trecho leste)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.6052,
    "lng": -48.663,
    "type": "rua"
  },
  {
    "name": "Rua Papagaio",
    "aliases": [
      "papagaio",
      "rua papagaio",
      "rua papagaio (nº lado par e impar)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5466594,
    "lng": -48.6479617,
    "type": "rua"
  },
  {
    "name": "Rua Das Flores",
    "aliases": [
      "rua das flores",
      "das flores",
      "rua das flores (nº 100 - 350)"
    ],
    "neighborhoodId": "picadas_do_sul",
    "neighborhoodName": "Picadas do Sul",
    "lat": -27.625,
    "lng": -48.648,
    "type": "rua"
  },
  {
    "name": "R. Túlio Rodrigues Martins",
    "aliases": [
      "túlio rodrigues martins",
      "r. túlio rodrigues martins (nº trecho geral)",
      "r. túlio rodrigues martins"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5758955,
    "lng": -48.656204,
    "type": "rua"
  },
  {
    "name": "R. Bernardina De Freitas De Agostinho",
    "aliases": [
      "bernardina de freitas de agostinho",
      "r. bernardina de freitas de agostinho (nº trecho geral)",
      "r. bernardina de freitas de agostinho"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5744235,
    "lng": -48.6556691,
    "type": "rua"
  },
  {
    "name": "R. Ver. Arthur Manoel Mariano",
    "aliases": [
      "ver. arthur manoel mariano",
      "r. ver. arthur manoel mariano",
      "r. ver. arthur manoel mariano (nº trecho geral)"
    ],
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "lat": -27.5989777,
    "lng": -48.6448497,
    "type": "rua"
  }
];

/**
 * Normaliza strings para comparação fonética/textual de logradouros
 */
export function normalizeStreetName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '') // Remove sufixos como (nº Trecho Geral), etc.
    .replace(/^r\.\s*/g, '')
    .replace(/^av\.\s*/g, '')
    .replace(/^serv\.\s*/g, '')
    .replace(/^tv\.\s*/g, '')
    .replace(/^rod\.\s*/g, '')
    .replace(/(rua|avenida|av|travessa|servidao|servidão|rodovia|alameda|praca|praça|estrada|ver|vereador|doutor|dr|prof|professor|padre|pe|dom)/g, '')
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
  // Coordenadas perto de (0,0) ou fora de SC
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
    // 1. Busca Exata com prioridade no mesmo bairro
    if (neighborhoodId) {
      const matchInNeigh = SAO_JOSE_KNOWN_STREETS.find(s => {
        const isSameNeigh = s.neighborhoodId === neighborhoodId ||
          (neighborhoodId === 'forquilhinhas' && s.neighborhoodId === 'forquilhinha') ||
          (neighborhoodId === 'forquilhinha' && s.neighborhoodId === 'forquilhinhas');
        if (!isSameNeigh) return false;

        const normKnown = normalizeStreetName(s.name);
        if (normKnown === normInput) return true;
        return s.aliases.some(a => normalizeStreetName(a) === normInput);
      });

      if (matchInNeigh) {
        return { lat: matchInNeigh.lat, lng: matchInNeigh.lng, resolvedBy: 'exact_street' };
      }
    }

    // 2. Busca Exata no catálogo geral
    const exactMatch = SAO_JOSE_KNOWN_STREETS.find(s => {
      const normKnown = normalizeStreetName(s.name);
      if (normKnown === normInput) return true;
      return s.aliases.some(a => normalizeStreetName(a) === normInput);
    });

    if (exactMatch) {
      return { lat: exactMatch.lat, lng: exactMatch.lng, resolvedBy: 'exact_street' };
    }

    // 3. Busca Parcial com prioridade no mesmo bairro
    if (neighborhoodId) {
      const partialInNeigh = SAO_JOSE_KNOWN_STREETS.find(s => {
        const isSameNeigh = s.neighborhoodId === neighborhoodId ||
          (neighborhoodId === 'forquilhinhas' && s.neighborhoodId === 'forquilhinha') ||
          (neighborhoodId === 'forquilhinha' && s.neighborhoodId === 'forquilhinhas');
        if (!isSameNeigh) return false;

        const normKnown = normalizeStreetName(s.name);
        if (normInput.length >= 4 && normKnown.includes(normInput)) return true;
        if (normKnown.length >= 4 && normInput.includes(normKnown)) return true;
        return s.aliases.some(a => {
          const normA = normalizeStreetName(a);
          return (normInput.length >= 4 && normA.includes(normInput)) || (normA.length >= 4 && normInput.includes(normA));
        });
      });

      if (partialInNeigh) {
        return { lat: partialInNeigh.lat, lng: partialInNeigh.lng, resolvedBy: 'fuzzy_street' };
      }
    }

    // 4. Busca Parcial (contains) no catálogo geral
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

  // 5. Fallback: Centro do Bairro informado
  if (neighborhoodId && fallbackNeighborhoods.length > 0) {
    const neigh = fallbackNeighborhoods.find(n => 
      n.id === neighborhoodId || 
      (neighborhoodId === 'forquilhinhas' && n.id === 'forquilhinha') ||
      (neighborhoodId === 'forquilhinha' && n.id === 'forquilhinhas') ||
      normalizeStreetName(n.name) === normalizeStreetName(neighborhoodId)
    );
    if (neigh && isCoordinateInsideSaoJose(neigh.lat, neigh.lng)) {
      const hash = Array.from(streetName || 'rua').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      const radius = 0.00025 + (hash % 8) * 0.00003;
      const offsetLat = Math.sin(angle) * radius * 0.8;
      const offsetLng = Math.cos(angle) * radius;

      return {
        lat: Number((neigh.lat + offsetLat).toFixed(6)),
        lng: Number((neigh.lng + offsetLng).toFixed(6)),
        resolvedBy: 'neighborhood_center'
      };
    }
  }

  // 6. Centro padrão de São José
  return {
    lat: SAO_JOSE_CENTROID.lat,
    lng: SAO_JOSE_CENTROID.lng,
    resolvedBy: 'fallback_center'
  };
}

export const SAO_JOSE_CENTROID = {
  lat: -27.5950,
  lng: -48.6450
};

/**
 * Algoritmo Ray-Casting para verificar se uma coordenada está dentro de um polígono
 */
export function isPointInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  if (!polygon || polygon.length < 3) return true;
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Retorna as coordenadas calibradas e reais de um check-in de rua.
 * Respeita estritamente a localização geográfica real do Google Maps para cada PIN:
 * - Se a rua é R. Honória Virgilina Machado, alinha exatamente no ponto real de Google Maps (-27.5688543, -48.6390348)
 * - Se o check-in tem GPS real válido capturado no local (fora de placeholders e dentro de SJ), mantém o ponto exato
 * - Se era placeholder ou sem GPS, resolve pelo catálogo oficial de ruas da PMSJ / Google Maps
 */
/**
 * Retorna a distância em metros aproximada entre duas coordenadas geográficas
 */
export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111139;
  const dLng = (lng2 - lng1) * 111139 * Math.cos((lat1 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/**
 * Retorna as coordenadas calibradas e reais de um check-in de rua.
 * Respeita estritamente a localização geográfica real do Google Maps para cada PIN:
 * - Se a rua é R. Honória Virgilina Machado, alinha exatamente no ponto real de Google Maps (-27.5688543, -48.6390348)
 * - Se a rua possui correspondência no catálogo oficial de logradouros de São José (exact_street ou fuzzy_street):
 *   - Se o GPS gravado está a mais de 450 metros da rua ou pertence a grupos repetidos fixos (ex: ponto estático remoto), calibra para a coordenada oficial da rua.
 *   - Se o GPS gravado está a até 450 metros da rua, preserva a precisão do GPS de campo no local.
 * - Se não possui GPS válido ou era placeholder genérico, resolve pelo catálogo exato de ruas.
 */
export function getCalibratedCheckInPosition(
  checkIn: StreetCheckIn,
  neighborhoods: Neighborhood[] = []
): { lat: number; lng: number; isRecalibrated: boolean } {
  // Ponto fixo placeholder antigo de Kobrasol (-27.5962, -48.6190) ou zero/inválido
  const isGenericPlaceholder = (
    (Math.abs(checkIn.latitude - (-27.5962)) < 0.0008 && Math.abs(checkIn.longitude - (-48.6190)) < 0.0008) ||
    (checkIn.latitude === 0 && checkIn.longitude === 0) ||
    !isCoordinateInsideSaoJose(checkIn.latitude, checkIn.longitude)
  );

  // 1. Caso especial: R. Honória Virgilina Machado -> fixa nas coordenadas exatas de Google Maps
  const normStreet = normalizeStreetName(checkIn.streetName || '');
  if (normStreet.includes('honoria virgilina machado')) {
    return { lat: -27.5688543, lng: -48.6390348, isRecalibrated: false };
  }

  // 2. Tenta resolver a rua pelo catálogo de alta precisão
  const resolved = resolveExactStreetCoordinates(checkIn.streetName, checkIn.neighborhoodId, neighborhoods);

  // Se a rua foi encontrada no catálogo oficial com coordenadas específicas:
  if (resolved.resolvedBy === 'exact_street' || resolved.resolvedBy === 'fuzzy_street') {
    // Se era placeholder ou sem GPS, usa a coordenada oficial
    if (isGenericPlaceholder) {
      return { lat: resolved.lat, lng: resolved.lng, isRecalibrated: true };
    }

    // Verifica pontos estáticos repetidos conhecidos (onde o militante enviou check-ins em lote de outro ponto)
    const isKnownStalePoint = (
      // Ponto remoto repetido em Bela Vista / Real Parque
      (Math.abs(checkIn.latitude - (-27.568264)) < 0.0001 && Math.abs(checkIn.longitude - (-48.6452456)) < 0.0001) ||
      // Ponto remoto repetido em Barreiros / Real Parque
      (Math.abs(checkIn.latitude - (-27.566279)) < 0.0001 && Math.abs(checkIn.longitude - (-48.6436604)) < 0.0001) ||
      // Ponto de divisa que deslocava ruas do Ceniro Martins / Forquilhas
      (Math.abs(checkIn.latitude - (-27.5751295)) < 0.0002 && Math.abs(checkIn.longitude - (-48.6567015)) < 0.0002)
    );

    const dist = getDistanceMeters(checkIn.latitude, checkIn.longitude, resolved.lat, resolved.lng);

    // Se a distância for maior que 450 metros ou for um ponto estático repetido conhecido:
    // Deve alinhar na coordenada oficial real da rua!
    if (dist > 450 || isKnownStalePoint) {
      return { lat: resolved.lat, lng: resolved.lng, isRecalibrated: true };
    }

    // Se o militante estava a menos de 450 metros da rua, o GPS gravado é a posição exata de campo!
    return { lat: checkIn.latitude, lng: checkIn.longitude, isRecalibrated: false };
  }

  // 3. Se não tem correspondência direta no catálogo:
  if (!isGenericPlaceholder && isCoordinateInsideSaoJose(checkIn.latitude, checkIn.longitude)) {
    return { lat: checkIn.latitude, lng: checkIn.longitude, isRecalibrated: false };
  }

  // 4. Fallback para centro do bairro / centro de São José
  return { lat: resolved.lat, lng: resolved.lng, isRecalibrated: true };
}
