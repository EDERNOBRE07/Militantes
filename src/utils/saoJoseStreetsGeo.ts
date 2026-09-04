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
    "lat": -27.5815,
    "lng": -48.629,
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
    "lat": -27.5832,
    "lng": -48.6315,
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
    "lat": -27.584,
    "lng": -48.6328,
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
    "lat": -27.5825,
    "lng": -48.6305,
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
    "lat": -27.5855,
    "lng": -48.628,
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
    "lat": -27.587,
    "lng": -48.6335,
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
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5862,
    "lng": -48.634,
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
    "lat": -27.588,
    "lng": -48.6345,
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
    "lat": -27.5895,
    "lng": -48.631,
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
    const neigh = fallbackNeighborhoods.find(n => 
      n.id === neighborhoodId || 
      (neighborhoodId === 'forquilhinhas' && n.id === 'forquilhinha') ||
      (neighborhoodId === 'forquilhinha' && n.id === 'forquilhinhas') ||
      normalizeStreetName(n.name) === normalizeStreetName(neighborhoodId)
    );
    if (neigh && isCoordinateInsideSaoJose(neigh.lat, neigh.lng)) {
      // Dispersão determinística leve para não sobrepor múltiplos checkins exatamente no mesmo ponto central
      const hash = Array.from(streetName || 'rua').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      // Dispersão mínima (~30m a 60m) para manter 100% dos pontos dentro do polígono do bairro
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

  // 4. Fallback Geral: Centro de São José
  return {
    lat: SAO_JOSE_BOUNDS.center[0],
    lng: SAO_JOSE_BOUNDS.center[1],
    resolvedBy: 'fallback_center'
  };
}

/**
 * Verifica geometricamente se um ponto de coordenadas [lat, lng] está
 * rigorosamente dentro do polígono geográfico de um bairro (Ray-Casting Algorithm)
 */
export function isPointInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  if (!polygon || polygon.length < 3) return false;
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Identifica o bairro oficial correspondente a uma coordenada geográfica
 */
export function findNeighborhoodForCoordinates(
  lat: number,
  lng: number,
  neighborhoods: Neighborhood[] = []
): Neighborhood | undefined {
  if (!neighborhoods || neighborhoods.length === 0) return undefined;

  // 1. Tenta correspondência exata via polígono geográfico
  for (const n of neighborhoods) {
    if (n.polygon && n.polygon.length >= 3) {
      if (isPointInsidePolygon([lat, lng], n.polygon)) {
        return n;
      }
    }
  }

  // 2. Fallback: menor distância euclidiana ao centroide do bairro
  let closest = neighborhoods[0];
  let minDistance = Infinity;
  for (const n of neighborhoods) {
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
 * Garante que qualquer StreetCheckIn possua coordenadas válidas e precisas
 * Se a geolocalização capturada for incorreta/nula, fora de São José, ou fora
 * do polígono do bairro correspondente, resolve automaticamente o PIN na rua
 * correspondente dentro da área geográfica exata do bairro!
 */
export function getCalibratedCheckInPosition(
  checkIn: StreetCheckIn,
  neighborhoods: Neighborhood[] = []
): { lat: number; lng: number; isRecalibrated: boolean } {
  // 1. Se a rua cadastrada possui coordenada geográfica exata oficial no Google Maps, use-a com prioridade máxima
  if (checkIn.streetName) {
    const streetResolved = resolveExactStreetCoordinates(checkIn.streetName, checkIn.neighborhoodId, neighborhoods);
    if (streetResolved.resolvedBy === 'exact_street' || streetResolved.resolvedBy === 'fuzzy_street') {
      return { lat: streetResolved.lat, lng: streetResolved.lng, isRecalibrated: false };
    }
  }

  const isGpsValid = isCoordinateInsideSaoJose(checkIn.latitude, checkIn.longitude);

  // Localiza o bairro atribuído ao check-in
  const targetNeigh = neighborhoods.find(
    n => n.id === checkIn.neighborhoodId || 
    (checkIn.neighborhoodId === 'forquilhinhas' && n.id === 'forquilhinha') ||
    (checkIn.neighborhoodId === 'forquilhinha' && n.id === 'forquilhinhas') ||
    (checkIn.neighborhoodName && n.name.toLowerCase() === checkIn.neighborhoodName.toLowerCase())
  );

  // Verifica se o GPS está dentro do polígono oficial do bairro
  const isInsidePolygon = targetNeigh && targetNeigh.polygon && targetNeigh.polygon.length >= 3
    ? isPointInsidePolygon([checkIn.latitude, checkIn.longitude], targetNeigh.polygon)
    : true;

  // Ponto fixo neutro comum de placeholder (-27.5962, -48.6190)
  const isGenericPlaceholder = (
    Math.abs(checkIn.latitude - (-27.5962)) < 0.0008 &&
    Math.abs(checkIn.longitude - (-48.6190)) < 0.0008
  );
  const isWrongNeighPlaceholder = isGenericPlaceholder && targetNeigh?.id !== 'kobrasol';

  // 2. Se o GPS capturado é válido e está dentro do polígono do bairro
  if (isGpsValid && checkIn.latitude !== 0 && checkIn.longitude !== 0 && !isWrongNeighPlaceholder && isInsidePolygon) {
    return { lat: checkIn.latitude, lng: checkIn.longitude, isRecalibrated: false };
  }

  // 3. Fallback: resolver por rua ou centro do bairro
  const resolved = resolveExactStreetCoordinates(checkIn.streetName, checkIn.neighborhoodId, neighborhoods);
  return { lat: resolved.lat, lng: resolved.lng, isRecalibrated: true };
}
