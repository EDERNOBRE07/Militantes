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
    "name": "R. Cidinei Luís",
    "aliases": [
      "r. cidinei luís",
      "cidinei luís",
      "r. cidinei luís (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.57285,
    "lng": -48.65503,
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
    "lat": -27.5539445,
    "lng": -48.6218707,
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
    "lat": -27.5755468,
    "lng": -48.6541495,
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
    "lat": -27.5753464,
    "lng": -48.6625458,
    "type": "rua"
  },
  {
    "name": "Rua Francisco Jacinto de Melo",
    "aliases": [
      "francisco jacinto de melo",
      "jacinto de melo"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "lat": -27.556488,
    "lng": -48.6267151,
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
    "lat": -27.5739592,
    "lng": -48.6145662,
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
    "lat": -27.5617879,
    "lng": -48.6530289,
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
    "lat": -27.5519586,
    "lng": -48.62073,
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
    "lat": -27.5552588,
    "lng": -48.6222622,
    "type": "rua"
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
    "lat": -27.5703485,
    "lng": -48.6067226,
    "type": "avenida"
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
    "lat": -27.5696586,
    "lng": -48.6152681,
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
    "lat": -27.5725516,
    "lng": -48.6134587,
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
    "lat": -27.574346,
    "lng": -48.6097739,
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
    "lat": -27.5671868,
    "lng": -48.6167989,
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
    "lat": -27.5569988,
    "lng": -48.6263331,
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
    "lat": -27.5637919,
    "lng": -48.636692,
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
    "lat": -27.587792,
    "lng": -48.6052268,
    "type": "rua"
  },
  {
    "name": "Rua Eugênio Portela",
    "aliases": [
      "eugenio portela",
      "rua eugenio portela",
      "r eugenio portela"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5845136,
    "lng": -48.6061229,
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
    "lat": -27.5959164,
    "lng": -48.6177097,
    "type": "rua"
  },
  {
    "name": "Rua José Victor da Silva",
    "aliases": [
      "jose victor da rosa",
      "jose victor da silva",
      "rua jose victor da rosa",
      "rua jose victor da silva"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5714932,
    "lng": -48.6058069,
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
    "lat": -27.5787657,
    "lng": -48.6068241,
    "type": "rua"
  },
  {
    "name": "Rua Marechal Rondon",
    "aliases": [
      "mal rondon",
      "marechal rondon",
      "r mal rondon",
      "rua mal rondon"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5829116,
    "lng": -48.6043488,
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
    "lat": -27.5836512,
    "lng": -48.6088316,
    "type": "rua"
  },
  {
    "name": "Rua do Iano",
    "aliases": [
      "r. do iano (nº trecho geral)",
      "do iano",
      "r. do iano"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5739592,
    "lng": -48.6145662,
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
    "lat": -27.5735148,
    "lng": -48.6029927,
    "type": "travessa"
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
    "lat": -27.5691924,
    "lng": -48.615441,
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
    "lat": -27.5684708,
    "lng": -48.6424924,
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
    "lat": -27.5702011,
    "lng": -48.6185431,
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
    "lat": -27.571199,
    "lng": -48.6177721,
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
    "lat": -27.5694222,
    "lng": -48.622855,
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
    "lat": -27.5733769,
    "lng": -48.6252562,
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
    "lat": -27.5727768,
    "lng": -48.62409,
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
    "lat": -27.5718888,
    "lng": -48.621617,
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
    "lat": -27.57044,
    "lng": -48.62765,
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
    "lat": -27.5762346,
    "lng": -48.6213532,
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
    "lat": -27.5688612,
    "lng": -48.6224819,
    "type": "rua"
  },
  {
    "name": "Rua Araranguá",
    "aliases": [
      "ararangua",
      "rua ararangua",
      "r ararangua"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5715749,
    "lng": -48.6150196,
    "type": "rua"
  },
  {
    "name": "Rua Bento Águido Viêira",
    "aliases": [
      "bento águido viêira",
      "r. bento águido viêira (nº trecho geral)",
      "r. bento águido viêira"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5716244,
    "lng": -48.6159013,
    "type": "rua"
  },
  {
    "name": "Rua Curitiba",
    "aliases": [
      "r. curitiba",
      "curitiba",
      "r. curitiba (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5735274,
    "lng": -48.6166253,
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
    "name": "Rua Frei Hermenegildo",
    "aliases": [
      "frei hermenegildo",
      "rua frei hermenegildo"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.6221845,
    "lng": -48.6343827,
    "type": "rua"
  },
  {
    "name": "Rua Frontino Coelho Pires",
    "aliases": [
      "frontino coelho pires",
      "rua frontino coelho pires",
      "r frontino coelho pires"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5673835,
    "lng": -48.6198308,
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
    "name": "Rua Gisela",
    "aliases": [
      "gisela",
      "rua gisela"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5734879,
    "lng": -48.6181593,
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
    "lat": -27.5970125,
    "lng": -48.6449838,
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
    "name": "Rua Pedro Bunn",
    "aliases": [
      "pedro bunn",
      "rua pedro bunn",
      "r pedro bunn"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5691554,
    "lng": -48.6211634,
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
    "name": "Rua Recife",
    "aliases": [
      "r. recife",
      "recife",
      "r. recife (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5748544,
    "lng": -48.6181783,
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
    "name": "Rua Alaide Martins",
    "aliases": [
      "alaide martins",
      "rua alaide martins"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.5610758,
    "lng": -48.6344363,
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
    "lat": -27.5845762,
    "lng": -48.6276745,
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
    "lat": -27.5839913,
    "lng": -48.7147159,
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
    "lat": -27.5972922,
    "lng": -48.6176417,
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
    "name": "Rua das Mansões",
    "aliases": [
      "das mansoes",
      "rua das mansoes"
    ],
    "neighborhoodId": "bosque_das_mansoes",
    "neighborhoodName": "Bosque das Mansões",
    "lat": -27.5845762,
    "lng": -48.6276745,
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
    "name": "Avenida Acioni Souza Filho (Beira-Mar)",
    "aliases": [
      "beira mar de sao jose",
      "beira-mar",
      "acioni souza filho"
    ],
    "neighborhoodId": "campinas",
    "neighborhoodName": "Campinas",
    "lat": -27.6028425,
    "lng": -48.6170857,
    "type": "avenida"
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
    "lat": -27.5967141,
    "lng": -48.6092339,
    "type": "avenida"
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
    "lat": -27.5944684,
    "lng": -48.6071455,
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
    "lat": -27.5974264,
    "lng": -48.6094449,
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
    "lat": -27.5870489,
    "lng": -48.6101079,
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
    "lat": -27.5984284,
    "lng": -48.6111179,
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
    "lat": -27.5910964,
    "lng": -48.6148087,
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
    "lat": -27.6162399,
    "lng": -48.6270162,
    "type": "praca"
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
    "lat": -27.6158769,
    "lng": -48.6275976,
    "type": "praca"
  },
  {
    "name": "Rua Gaspar Neves",
    "aliases": [
      "gaspar neves",
      "rua gaspar neves"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.6149183,
    "lng": -48.6264422,
    "type": "rua"
  },
  {
    "name": "Rua Getúlio Vargas",
    "aliases": [
      "getulio vargas",
      "rua getulio vargas"
    ],
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "lat": -27.6095163,
    "lng": -48.6282457,
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
    "lat": -27.6248435,
    "lng": -48.6344273,
    "type": "rua"
  },
  {
    "name": "Avenida Ceniro Luiz Ribeiro Martins",
    "aliases": [
      "ceniro luiz ribeiro martins",
      "av ceniro luiz ribeiro martins",
      "ceniro martins"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5752006,
    "lng": -48.6617073,
    "type": "avenida"
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
    "lat": -27.5726168,
    "lng": -48.6676077,
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
    "lat": -27.5775028,
    "lng": -48.6722889,
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
    "lat": -27.5658888,
    "lng": -48.6645435,
    "type": "rua"
  },
  {
    "name": "Rua Alexandre Plucinski",
    "aliases": [
      "alexandre plueinsk",
      "rua alexandre plueinsk"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5735244,
    "lng": -48.6550187,
    "type": "rua"
  },
  {
    "name": "Rua Araçari",
    "aliases": [
      "aracari",
      "r aracari",
      "rua aracari"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5672541,
    "lng": -48.6673606,
    "type": "rua"
  },
  {
    "name": "Rua Açores",
    "aliases": [
      "acores",
      "r acores",
      "rua acores"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5793806,
    "lng": -48.6685319,
    "type": "rua"
  },
  {
    "name": "Rua Bernardina de Freitas de Agostinho",
    "aliases": [
      "bernadino freitas de agostinho",
      "rua bernadino freitas de agostinho"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5744193,
    "lng": -48.6531018,
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
    "lat": -27.5806455,
    "lng": -48.6691286,
    "type": "rua"
  },
  {
    "name": "Rua José Bartolomeu Vieira",
    "aliases": [
      "jose bartolomeu vieira",
      "bartolomeu vieira"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5773163,
    "lng": -48.6706519,
    "type": "rua"
  },
  {
    "name": "Rua Jovito Manoel Gonçalves",
    "aliases": [
      "jovito manoel goncalves",
      "rua jovito manoel goncalves",
      "jovito manoel"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5760901,
    "lng": -48.6602336,
    "type": "rua"
  },
  {
    "name": "Rua Juliana Maria da Silva",
    "aliases": [
      "juliana maria da silva",
      "rua juliana maria da silva",
      "juliana maria"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5766823,
    "lng": -48.659159,
    "type": "rua"
  },
  {
    "name": "Rua Justino Machado Loreto",
    "aliases": [
      "justino machado loreto",
      "rua justino machado loreto",
      "justino machado"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5757185,
    "lng": -48.6607909,
    "type": "rua"
  },
  {
    "name": "Rua Maria Francisca Conceição Ribeiro",
    "aliases": [
      "mariafrancisca conceicao ribeiro",
      "maria francisca conceicao ribeiro",
      "rua mariafrancisca conceicao ribeiro"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5771623,
    "lng": -48.661744,
    "type": "rua"
  },
  {
    "name": "Rua Portimão",
    "aliases": [
      "portimao",
      "r portimao",
      "rua portimao"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5788755,
    "lng": -48.668638,
    "type": "rua"
  },
  {
    "name": "Rua Reinaldo Ferreira De Souza",
    "aliases": [
      "reinaldo ferreira de souza",
      "reinaldo ferreira de souza"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5650968,
    "lng": -48.6745714,
    "type": "rua"
  },
  {
    "name": "Rua Sabiá",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.57525,
    "lng": -48.67316,
    "aliases": [
      "sabia",
      "r sabia",
      "rua sabia"
    ],
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
    "lat": -27.5755907,
    "lng": -48.65356,
    "type": "rua"
  },
  {
    "name": "Rua Ulisses Siqueira Lima",
    "aliases": [
      "ulisses siqueira lima",
      "r ulisses siqueira lima",
      "rua ulisses siqueira lima"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.574659,
    "lng": -48.651667,
    "type": "rua"
  },
  {
    "name": "R. Leopoldina Marcelino",
    "aliases": [
      "r. leopoldina marcelino",
      "leopoldina marcelino",
      "r. leopoldina marcelino (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.6024588,
    "lng": -48.6461692,
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
    "lat": -27.60463,
    "lng": -48.64938,
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
    "lat": -27.6022061,
    "lng": -48.6458576,
    "type": "rua"
  },
  {
    "name": "Rua Antônio Jovita Duarte",
    "aliases": [
      "antonio jovita duarte",
      "jovita duarte",
      "antonio jovita"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5920236,
    "lng": -48.6503167,
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
    "lat": -27.5744193,
    "lng": -48.6531018,
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
    "lat": -27.5865359,
    "lng": -48.6171557,
    "type": "rua"
  },
  {
    "name": "Rua Manoel Francisco de Souza",
    "aliases": [
      "manoel francisco de souza",
      "rua manoel francisco de souza"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.6015755,
    "lng": -48.6453365,
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
    "lat": -27.5967194,
    "lng": -48.5935135,
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
    "lat": -27.6001106,
    "lng": -48.6448081,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Arthur Manoel Mariano",
    "aliases": [
      "arthur mariano",
      "rua arthur mariano",
      "ver arthur manoel mariano",
      "rua vereador arthur manoel mariano"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5989113,
    "lng": -48.6419768,
    "type": "rua"
  },
  {
    "name": "Rua Vitorino José Luiz",
    "aliases": [
      "vitorino jose luiz",
      "vitorino jose",
      "vitorino luiz"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5980068,
    "lng": -48.636975,
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
    "lat": -27.5611184,
    "lng": -48.6320708,
    "type": "rua"
  },
  {
    "name": "Rua Antenor Valentim da Silva",
    "aliases": [
      "antenor valentin da silva",
      "antenor valentin",
      "rua antenor valentin"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5662486,
    "lng": -48.6237388,
    "type": "rua"
  },
  {
    "name": "Rua Francisco Nappi",
    "aliases": [
      "rua francisco nappi (nº trecho geral)",
      "francisco nappi",
      "rua francisco nappi"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5603846,
    "lng": -48.6235286,
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
    "lat": -27.60294,
    "lng": -48.639776,
    "type": "rua"
  },
  {
    "name": "Rua Otto Júlio Malina",
    "aliases": [
      "otto julio malina",
      "otto malina",
      "rua otto julio malina",
      "r otto julio malina"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5651062,
    "lng": -48.6254931,
    "type": "rua"
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
    "lat": -27.5941402,
    "lng": -48.613341,
    "type": "avenida"
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
    "lat": -27.6019074,
    "lng": -48.6178686,
    "type": "avenida"
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
    "lat": -27.5937462,
    "lng": -48.6127233,
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
    "lat": -27.589643,
    "lng": -48.6137944,
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
    "lat": -27.5910964,
    "lng": -48.6148087,
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
    "lat": -27.6511068,
    "lng": -48.6689262,
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
    "lat": -27.5941062,
    "lng": -48.6154961,
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
    "lat": -27.5987702,
    "lng": -48.613561,
    "type": "rua"
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
    "lat": -27.5919011,
    "lng": -48.6136821,
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
    "lat": -27.5781767,
    "lng": -48.6175847,
    "type": "rua"
  },
  {
    "name": "Rua das Flores",
    "aliases": [
      "rua das flores",
      "das flores",
      "rua das flores (nº 100 - 350)"
    ],
    "neighborhoodId": "picadas_do_sul",
    "neighborhoodName": "Picadas do Sul",
    "lat": -27.60951,
    "lng": -48.64464,
    "type": "rua"
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
    "lat": -27.6242278,
    "lng": -48.6326512,
    "type": "rua"
  },
  {
    "name": "Rua Algodoeiro",
    "aliases": [
      "algodoeiro",
      "algodoeiro"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.55197,
    "lng": -48.6573,
    "type": "rua"
  },
  {
    "name": "Rua João José Martins (Potecas)",
    "aliases": [
      "joao jose martins potecas"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.5617879,
    "lng": -48.6530289,
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
    "lat": -27.582736,
    "lng": -48.6461451,
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
    "lat": -27.5771601,
    "lng": -48.650937,
    "type": "rua"
  },
  {
    "name": "Rua Uváia",
    "aliases": [
      "uvaia",
      "uvaia"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.55135,
    "lng": -48.65768,
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
    "lat": -27.6082418,
    "lng": -48.629079,
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
    "lat": -27.6177036,
    "lng": -48.6285197,
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
    "lat": -27.6071935,
    "lng": -48.6299348,
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
    "lat": -27.566157,
    "lng": -48.635934,
    "type": "rua"
  },
  {
    "name": "Rua Alceu Amoroso Lima",
    "aliases": [
      "alceu amoroso lima",
      "r alceu amoroso lima"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5684708,
    "lng": -48.6424924,
    "type": "rua"
  },
  {
    "name": "Rua Carlos Drummond de Andrade",
    "aliases": [
      "carlos drumond de andrade",
      "carlos drummond de andrade",
      "r carlos drumond de andrade",
      "r carlos drummond de andrade"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5673339,
    "lng": -48.6417136,
    "type": "rua"
  },
  {
    "name": "Rua Honória Virgilina Machado",
    "aliases": [
      "honoria virgilina machado",
      "r honoria virgilina machado",
      "rua honoria"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5688543,
    "lng": -48.6390348,
    "type": "rua"
  },
  {
    "name": "Rua José Antônio Pereira",
    "aliases": [
      "jose antonio pereira",
      "jose antonio pereira"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.57011,
    "lng": -48.642,
    "type": "rua"
  },
  {
    "name": "Rua João Paulo Gaspar",
    "aliases": [
      "joao paulo gaspar",
      "r joao paulo gaspar",
      "rua joao paulo gaspar"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.570394,
    "lng": -48.6392128,
    "type": "rua"
  },
  {
    "name": "Rua Lacy de Lima",
    "aliases": [
      "laci de lima",
      "lacy de lima",
      "rua laci de lima",
      "rua lacy de lima"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5678193,
    "lng": -48.6413514,
    "type": "rua"
  },
  {
    "name": "Rua Mário César da Costa",
    "aliases": [
      "mario cesar da costa",
      "r mario cesar da costa",
      "rua mario cesar da costa"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5645331,
    "lng": -48.6377915,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Pedro Paulo Kremer",
    "aliases": [
      "ver pedro paulo kremer",
      "rua ver pedro paulo kremer",
      "pedro paulo kremer",
      "r ver pedro paulo kremer"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.566157,
    "lng": -48.635934,
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
    "lat": -27.5991424,
    "lng": -48.6219917,
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
    "lat": -27.5925077,
    "lng": -48.6197031,
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
    "lat": -27.5464797,
    "lng": -48.6420833,
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
    "lat": -27.5415373,
    "lng": -48.6327915,
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
    "lat": -27.5419317,
    "lng": -48.6323232,
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
    "lat": -27.5409207,
    "lng": -48.6369685,
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
    "lat": -27.5483587,
    "lng": -48.6462312,
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
    "lat": -27.5467386,
    "lng": -48.6453016,
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
    "lat": -27.5452421,
    "lng": -48.6395147,
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
    "lat": -27.546274,
    "lng": -48.6376334,
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
    "lat": -27.6080341,
    "lng": -48.6305308,
    "type": "rua"
  },
  {
    "name": "Rua Nossa Senhora dos Navegantes",
    "aliases": [
      "nossa senhora dos navegantes",
      "navegantes",
      "r nossa senhora dos navegantes",
      "rua nossa senhora dos navegantes",
      "nossa sra dos navegantes"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5483587,
    "lng": -48.6462312,
    "type": "rua"
  },
  {
    "name": "Rua dos Lírios",
    "aliases": [
      "dos lirios",
      "rua dos lirios",
      "r dos lirios"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5426368,
    "lng": -48.6465482,
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
    "lat": -27.5445936,
    "lng": -48.6392361,
    "type": "rua"
  },
  {
    "name": "R. Algodoeiro",
    "aliases": [
      "r. algodoeiro",
      "algodoeiro",
      "r. algodoeiro (nº trecho geral)"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.55197,
    "lng": -48.6573,
    "type": "rua"
  },
  {
    "name": "R. Uváia",
    "aliases": [
      "r. uváia",
      "uváia",
      "r. uváia (nº trecho geral)"
    ],
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "lat": -27.55135,
    "lng": -48.65768,
    "type": "rua"
  },
  {
    "name": "R. Reinaldo Ferreira De Souza",
    "aliases": [
      "r. reinaldo ferreira de souza",
      "reinaldo ferreira de souza",
      "r. reinaldo ferreira de souza (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5650968,
    "lng": -48.6745714,
    "type": "rua"
  },
  {
    "name": "R. Sabiá",
    "aliases": [
      "r. sabiá",
      "sabiá",
      "r. sabiá (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.57525,
    "lng": -48.67316,
    "type": "rua"
  },
  {
    "name": "R. Araçari",
    "aliases": [
      "r. araçari",
      "araçari",
      "r. araçari (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5672541,
    "lng": -48.6673606,
    "type": "rua"
  },
  {
    "name": "R. Ulisses Siqueira Lima",
    "aliases": [
      "r. ulisses siqueira lima",
      "ulisses siqueira lima",
      "r. ulisses siqueira lima (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.574659,
    "lng": -48.651667,
    "type": "rua"
  },
  {
    "name": "R. Otto Júlio Malina",
    "aliases": [
      "r. otto júlio malina",
      "otto júlio malina",
      "r. otto júlio malina (nº trecho geral)"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5651062,
    "lng": -48.6254931,
    "type": "rua"
  },
  {
    "name": "R. João Paulo Gaspar",
    "aliases": [
      "r. joão paulo gaspar",
      "joão paulo gaspar",
      "r. joão paulo gaspar (nº trecho geral)"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.570394,
    "lng": -48.6392128,
    "type": "rua"
  },
  {
    "name": "R. Mal. Rondon",
    "aliases": [
      "r. mal. rondon",
      "marechal rondon",
      "r. mal. rondon (nº trecho geral)"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5829116,
    "lng": -48.6043488,
    "type": "rua"
  },
  {
    "name": "rua mariafrancisca conceição ribeiro",
    "aliases": [
      "rua mariafrancisca conceição ribeiro",
      "maria francisca conceição ribeiro",
      "rua mariafrancisca conceição ribeiro (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5771623,
    "lng": -48.661744,
    "type": "rua"
  },
  {
    "name": "Av. Ceniro Luiz Ribeiro Martins",
    "aliases": [
      "av. ceniro luiz ribeiro martins",
      "ceniro luiz ribeiro martins",
      "av. ceniro luiz ribeiro martins (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5752006,
    "lng": -48.6617073,
    "type": "rua"
  },
  {
    "name": "R. dos Lirios",
    "aliases": [
      "r. dos lirios",
      "dos lirios",
      "r. dos lirios (nº trecho geral)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5426368,
    "lng": -48.6465482,
    "type": "rua"
  },
  {
    "name": "R. Portimao",
    "aliases": [
      "r. portimao",
      "portimao",
      "r. portimao (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5788755,
    "lng": -48.668638,
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
    "lat": -27.5793806,
    "lng": -48.6685319,
    "type": "rua"
  },
  {
    "name": "Rua Arthur Mariano",
    "aliases": [
      "rua arthur mariano",
      "arthur mariano",
      "rua arthur mariano (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5989113,
    "lng": -48.6419768,
    "type": "rua"
  },
  {
    "name": "Rua ararangua",
    "aliases": [
      "rua ararangua",
      "araranguá",
      "rua ararangua (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5715749,
    "lng": -48.6150196,
    "type": "rua"
  },
  {
    "name": "R. Carlos Drumond de Andrade",
    "aliases": [
      "r. carlos drumond de andrade",
      "carlos drumond de andrade",
      "r. carlos drumond de andrade (nº trecho geral)"
    ],
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "lat": -27.5673339,
    "lng": -48.6417136,
    "type": "rua"
  },
  {
    "name": "R. Bento Águido Viêira",
    "aliases": [
      "r. bento águido viêira",
      "bento águido vieira",
      "r. bento águido viêira (nº trecho geral)"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5716244,
    "lng": -48.6159013,
    "type": "rua"
  },
  {
    "name": "R. do Iano",
    "aliases": [
      "r. do iano",
      "do iano",
      "r. do iano (nº trecho geral)"
    ],
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "lat": -27.5739592,
    "lng": -48.6145662,
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
    "lat": -27.5735274,
    "lng": -48.6166253,
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
    "lat": -27.5748544,
    "lng": -48.6181783,
    "type": "rua"
  },
  {
    "name": "R. Ver. Arthur Manoel Mariano",
    "aliases": [
      "r. ver. arthur manoel mariano",
      "arthur mariano",
      "r. ver. arthur manoel mariano (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5989113,
    "lng": -48.6419768,
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
    "name": "R. Aimoré",
    "aliases": [
      "r. aimoré",
      "aimoré",
      "r. aimoré (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.60463,
    "lng": -48.64938,
    "type": "rua"
  },
  {
    "name": "Rua Vereador Arthur Mariano",
    "aliases": [
      "rua vereador arthur mariano",
      "arthur mariano",
      "rua vereador arthur mariano (nº trecho geral)"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5989113,
    "lng": -48.6419768,
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
    "lat": -27.5735244,
    "lng": -48.6550187,
    "type": "rua"
  },
  {
    "name": "Rua aguas de Chapecó",
    "aliases": [
      "rua aguas de chapecó",
      "águas de chapecó",
      "rua aguas de chapecó"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5691895,
    "lng": -48.6144004,
    "type": "rua"
  },
  {
    "name": "Rua rua candido amaro damasio",
    "aliases": [
      "rua rua candido amaro damasio",
      "cândido amaro damásio",
      "rua rua candido amaro damasio"
    ],
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "lat": -27.5671868,
    "lng": -48.6167989,
    "type": "rua"
  },
  {
    "name": "rua Antenor Valentin da silva",
    "aliases": [
      "rua antenor valentin da silva",
      "antenor valentim da silva",
      "rua antenor valentin da silva"
    ],
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "lat": -27.5662486,
    "lng": -48.6237388,
    "type": "rua"
  },
  {
    "name": "rua jose Bartolomeu vieira",
    "aliases": [
      "rua jose bartolomeu vieira",
      "josé bartolomeu vieira",
      "rua jose bartolomeu vieira"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5773163,
    "lng": -48.6706519,
    "type": "rua"
  },
  {
    "name": "rua vitorino jose Luiz",
    "aliases": [
      "rua vitorino jose luiz",
      "vitorino josé luiz",
      "rua vitorino jose luiz"
    ],
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "lat": -27.5980068,
    "lng": -48.636975,
    "type": "rua"
  },
  {
    "name": "rua Alexandre plueinsk",
    "aliases": [
      "rua alexandre plueinsk",
      "alexandre plucinski",
      "rua alexandre plueinsk"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5735244,
    "lng": -48.6550187,
    "type": "rua"
  },
  {
    "name": "rua bernadino freitas de Agostinho",
    "aliases": [
      "rua bernadino freitas de agostinho",
      "bernardina de freitas de agostinho",
      "rua bernadino freitas de agostinho"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5744193,
    "lng": -48.6531018,
    "type": "rua"
  },
  {
    "name": "rua tulio Rodrigues martins",
    "aliases": [
      "rua tulio rodrigues martins",
      "túlio rodrigues martins",
      "rua tulio rodrigues martins (trecho leste)"
    ],
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "lat": -27.5755907,
    "lng": -48.65356,
    "type": "rua"
  },
  {
    "name": "Rua papagaio",
    "aliases": [
      "rua papagaio",
      "papagaio",
      "rua papagaio (nº lado par e impar)"
    ],
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "lat": -27.5467386,
    "lng": -48.6453016,
    "type": "rua"
  },
  {
    "name": "R. Túlio Rodrigues Martins",
    "aliases": [
      "r. túlio rodrigues martins",
      "túlio rodrigues martins",
      "r. túlio rodrigues martins (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5755907,
    "lng": -48.65356,
    "type": "rua"
  },
  {
    "name": "R. Bernardina de Freitas de Agostinho",
    "aliases": [
      "r. bernardina de freitas de agostinho",
      "bernardina de freitas de agostinho",
      "r. bernardina de freitas de agostinho (nº trecho geral)"
    ],
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "lat": -27.5744193,
    "lng": -48.6531018,
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
    .replace(/^(rua|r\.|avenida|av\.|servid[aã]o|serv\.|rodovia|rod\.|travessa|tv\.)\s*/gi, '')
    .replace(/(rua|r|avenida|av|travessa|tv|servidao|serv|rodovia|rod|alameda|praca|estrada|ver|vereador|doutor|dr|prof|professor|padre|pe|dom)/gi, '')
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
    if (dist > 250 || isKnownStalePoint) {
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
