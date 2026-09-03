import { Neighborhood } from '../types';

/**
 * 28 Bairros Oficiais do Município de São José - Santa Catarina + Área Rural
 * Referência Cartográfica Oficial:
 * - "São José (SC) - Bairros (2020)": Atlas Escolar Digital de São José (SC)
 * - Coordenação: Prof. Paulo Amorim (IFSC Câmpus São José)
 * - Fontes Cartográficas: IBGE (2021) e PMSJ (2020)
 * - Datum: SIRGAS 2000 / EPSG: 4674
 * 
 * Lista Completa Oficial dos 28 Bairros da Legenda:
 * 1. Alto Forquilhas
 * 2. Areias
 * 3. Barreiros
 * 4. Bela Vista
 * 5. Bosque das Mansões
 * 6. Campinas
 * 7. Centro
 * 8. Colônia Santana
 * 9. Distrito Industrial
 * 10. Fazenda Santo Antônio
 * 11. Flor de Nápolis (Nº 1 no mapa)
 * 12. Forquilhas
 * 13. Forquilhinha
 * 14. Ipiranga
 * 15. Jardim Cidade de Florianópolis (Nº 2 no mapa)
 * 16. Jardim Santiago
 * 17. Kobrasol
 * 18. Nossa Senhora do Rosário
 * 19. Pedregal
 * 20. Picadas do Sul
 * 21. Ponta de Baixo
 * 22. Potecas
 * 23. Praia Comprida
 * 24. Real Parque
 * 25. Roçado
 * 26. São Luiz
 * 27. Serraria
 * 28. Sertão do Maruim
 * + Área Rural (zona sudoeste demarcada no mapa)
 */
export const OFFICIAL_SAO_JOSE_NEIGHBORHOODS: Neighborhood[] = [
  {
    "id": "alto_forquilhas",
    "name": "Alto Forquilhas",
    "zone": "Distrito Forquilhinha",
    "population": 5200,
    "households": 1850,
    "votersEstimated": 4100,
    "completedStreets": 0,
    "totalStreets": 48,
    "priority": "Média",
    "lat": -27.552,
    "lng": -48.692,
    "officialColor": "#a881d8",
    "assignedTeamId": "team-fox",
    "targetMaterials": {
      "santinhos": 12000,
      "adesivos": 1500,
      "adesivo_bola": 600,
      "adesivo_parachoque": 300,
      "colinhas": 8000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.518,
        -48.705
      ],
      [
        -27.525,
        -48.665
      ],
      [
        -27.54,
        -48.65
      ],
      [
        -27.555,
        -48.652
      ],
      [
        -27.568,
        -48.646
      ],
      [
        -27.57,
        -48.654
      ],
      [
        -27.576,
        -48.668
      ],
      [
        -27.578,
        -48.685
      ],
      [
        -27.57,
        -48.72
      ],
      [
        -27.545,
        -48.73
      ]
    ]
  },
  {
    "id": "areias",
    "name": "Areias",
    "zone": "Distrito Barreiros",
    "population": 22300,
    "households": 8600,
    "votersEstimated": 17800,
    "completedStreets": 0,
    "totalStreets": 86,
    "priority": "Alta",
    "lat": -27.573,
    "lng": -48.636,
    "officialColor": "#ece657",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 40000,
      "adesivos": 4800,
      "adesivo_bola": 2200,
      "adesivo_parachoque": 1100,
      "colinhas": 26000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.562,
        -48.636
      ],
      [
        -27.566,
        -48.628
      ],
      [
        -27.574,
        -48.628
      ],
      [
        -27.58,
        -48.632
      ],
      [
        -27.583,
        -48.638
      ],
      [
        -27.578,
        -48.644
      ],
      [
        -27.568,
        -48.646
      ],
      [
        -27.555,
        -48.652
      ]
    ]
  },
  {
    "id": "barreiros",
    "name": "Barreiros",
    "zone": "Distrito Barreiros",
    "population": 27950,
    "households": 11200,
    "votersEstimated": 22800,
    "completedStreets": 0,
    "totalStreets": 114,
    "priority": "Alta",
    "lat": -27.575,
    "lng": -48.608,
    "officialColor": "#9884e8",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 50000,
      "adesivos": 6000,
      "adesivo_bola": 2800,
      "adesivo_parachoque": 1400,
      "colinhas": 32000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.566,
        -48.6
      ],
      [
        -27.574,
        -48.594
      ],
      [
        -27.585,
        -48.602
      ],
      [
        -27.589,
        -48.608
      ],
      [
        -27.584,
        -48.613
      ],
      [
        -27.574,
        -48.613
      ],
      [
        -27.569,
        -48.606
      ]
    ]
  },
  {
    "id": "bela_vista",
    "name": "Bela Vista",
    "zone": "Distrito Barreiros",
    "population": 14200,
    "households": 5400,
    "votersEstimated": 11600,
    "completedStreets": 0,
    "totalStreets": 64,
    "priority": "Alta",
    "lat": -27.568,
    "lng": -48.623,
    "officialColor": "#76e053",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 28000,
      "adesivos": 3200,
      "adesivo_bola": 1400,
      "adesivo_parachoque": 700,
      "colinhas": 18000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.562,
        -48.616
      ],
      [
        -27.565,
        -48.612
      ],
      [
        -27.572,
        -48.615
      ],
      [
        -27.575,
        -48.62
      ],
      [
        -27.574,
        -48.628
      ],
      [
        -27.566,
        -48.628
      ],
      [
        -27.564,
        -48.625
      ]
    ]
  },
  {
    "id": "bosque_das_mansoes",
    "name": "Bosque das Mansões",
    "zone": "Distrito Sede",
    "population": 4300,
    "households": 1450,
    "votersEstimated": 3600,
    "completedStreets": 0,
    "totalStreets": 32,
    "priority": "Média",
    "lat": -27.5965,
    "lng": -48.634,
    "officialColor": "#e860bc",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 9500,
      "adesivos": 1200,
      "adesivo_bola": 550,
      "adesivo_parachoque": 300,
      "colinhas": 6000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.593,
        -48.634
      ],
      [
        -27.592,
        -48.628
      ],
      [
        -27.596,
        -48.626
      ],
      [
        -27.6,
        -48.63
      ],
      [
        -27.601,
        -48.637
      ],
      [
        -27.596,
        -48.64
      ],
      [
        -27.592,
        -48.64
      ]
    ]
  },
  {
    "id": "campinas",
    "name": "Campinas",
    "zone": "Distrito Campinas",
    "population": 16800,
    "households": 7100,
    "votersEstimated": 14100,
    "completedStreets": 0,
    "totalStreets": 62,
    "priority": "Alta",
    "lat": -27.598,
    "lng": -48.61,
    "officialColor": "#e2579b",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 32000,
      "adesivos": 3800,
      "adesivo_bola": 1600,
      "adesivo_parachoque": 850,
      "colinhas": 20000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.589,
        -48.608
      ],
      [
        -27.585,
        -48.602
      ],
      [
        -27.596,
        -48.604
      ],
      [
        -27.604,
        -48.61
      ],
      [
        -27.606,
        -48.614
      ],
      [
        -27.599,
        -48.616
      ],
      [
        -27.592,
        -48.614
      ]
    ]
  },
  {
    "id": "centro",
    "name": "Centro",
    "zone": "Distrito Sede",
    "population": 8400,
    "households": 3200,
    "votersEstimated": 6850,
    "completedStreets": 0,
    "totalStreets": 48,
    "priority": "Média",
    "lat": -27.621,
    "lng": -48.625,
    "officialColor": "#7be7ec",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 18000,
      "adesivos": 2200,
      "adesivo_bola": 950,
      "adesivo_parachoque": 500,
      "colinhas": 12000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.616,
        -48.625
      ],
      [
        -27.618,
        -48.62
      ],
      [
        -27.624,
        -48.622
      ],
      [
        -27.626,
        -48.626
      ],
      [
        -27.622,
        -48.63
      ],
      [
        -27.617,
        -48.629
      ]
    ]
  },
  {
    "id": "colonia_santana",
    "name": "Colônia Santana",
    "zone": "Distrito Sede",
    "population": 5800,
    "households": 2100,
    "votersEstimated": 4600,
    "completedStreets": 0,
    "totalStreets": 34,
    "priority": "Baixa",
    "lat": -27.6,
    "lng": -48.73,
    "officialColor": "#66f0a4",
    "assignedTeamId": "team-fox",
    "targetMaterials": {
      "santinhos": 12000,
      "adesivos": 1400,
      "adesivo_bola": 600,
      "adesivo_parachoque": 300,
      "colinhas": 8000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.57,
        -48.72
      ],
      [
        -27.578,
        -48.685
      ],
      [
        -27.585,
        -48.69
      ],
      [
        -27.598,
        -48.695
      ],
      [
        -27.606,
        -48.708
      ],
      [
        -27.616,
        -48.718
      ],
      [
        -27.616,
        -48.745
      ],
      [
        -27.605,
        -48.756
      ],
      [
        -27.585,
        -48.745
      ]
    ]
  },
  {
    "id": "distrito_industrial",
    "name": "Distrito Industrial",
    "zone": "Distrito Sede",
    "population": 3200,
    "households": 1100,
    "votersEstimated": 2700,
    "completedStreets": 0,
    "totalStreets": 36,
    "priority": "Baixa",
    "lat": -27.63,
    "lng": -48.645,
    "officialColor": "#d29b76",
    "assignedTeamId": "team-eco",
    "targetMaterials": {
      "santinhos": 7000,
      "adesivos": 900,
      "adesivo_bola": 400,
      "adesivo_parachoque": 200,
      "colinhas": 4500
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.622,
        -48.638
      ],
      [
        -27.622,
        -48.644
      ],
      [
        -27.626,
        -48.65
      ],
      [
        -27.632,
        -48.652
      ],
      [
        -27.638,
        -48.646
      ],
      [
        -27.636,
        -48.638
      ],
      [
        -27.628,
        -48.636
      ]
    ]
  },
  {
    "id": "fazenda_santo_antonio",
    "name": "Fazenda Santo Antônio",
    "zone": "Distrito Sede",
    "population": 8900,
    "households": 3400,
    "votersEstimated": 7200,
    "completedStreets": 0,
    "totalStreets": 52,
    "priority": "Média",
    "lat": -27.625,
    "lng": -48.633,
    "officialColor": "#e8a8b8",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 18000,
      "adesivos": 2200,
      "adesivo_bola": 950,
      "adesivo_parachoque": 500,
      "colinhas": 12000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.62,
        -48.631
      ],
      [
        -27.616,
        -48.625
      ],
      [
        -27.617,
        -48.629
      ],
      [
        -27.622,
        -48.63
      ],
      [
        -27.627,
        -48.629
      ],
      [
        -27.632,
        -48.633
      ],
      [
        -27.628,
        -48.636
      ],
      [
        -27.622,
        -48.638
      ]
    ]
  },
  {
    "id": "flor_de_napolis",
    "name": "Flor de Nápolis",
    "zone": "Distrito Sede",
    "population": 9200,
    "households": 3500,
    "votersEstimated": 7500,
    "completedStreets": 0,
    "totalStreets": 46,
    "priority": "Média",
    "lat": -27.616,
    "lng": -48.637,
    "officialColor": "#f2927c",
    "officialNumber": 1,
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 19000,
      "adesivos": 2300,
      "adesivo_bola": 1000,
      "adesivo_parachoque": 550,
      "colinhas": 13000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.611,
        -48.631
      ],
      [
        -27.61,
        -48.623
      ],
      [
        -27.615,
        -48.626
      ],
      [
        -27.62,
        -48.631
      ],
      [
        -27.622,
        -48.638
      ],
      [
        -27.617,
        -48.643
      ],
      [
        -27.611,
        -48.644
      ],
      [
        -27.611,
        -48.636
      ]
    ]
  },
  {
    "id": "forquilhas",
    "name": "Forquilhas",
    "zone": "Distrito Forquilhinha",
    "population": 24100,
    "households": 9300,
    "votersEstimated": 19200,
    "completedStreets": 0,
    "totalStreets": 110,
    "priority": "Alta",
    "lat": -27.595,
    "lng": -48.675,
    "officialColor": "#e89f8c",
    "assignedTeamId": "team-eco",
    "targetMaterials": {
      "santinhos": 42000,
      "adesivos": 5200,
      "adesivo_bola": 2400,
      "adesivo_parachoque": 1200,
      "colinhas": 28000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.576,
        -48.668
      ],
      [
        -27.577,
        -48.656
      ],
      [
        -27.585,
        -48.65
      ],
      [
        -27.594,
        -48.654
      ],
      [
        -27.594,
        -48.658
      ],
      [
        -27.6,
        -48.66
      ],
      [
        -27.609,
        -48.662
      ],
      [
        -27.615,
        -48.659
      ],
      [
        -27.618,
        -48.675
      ],
      [
        -27.612,
        -48.692
      ],
      [
        -27.598,
        -48.695
      ],
      [
        -27.585,
        -48.69
      ],
      [
        -27.578,
        -48.685
      ]
    ]
  },
  {
    "id": "forquilhinha",
    "name": "Forquilhinha",
    "zone": "Distrito Forquilhinha",
    "population": 32400,
    "households": 12600,
    "votersEstimated": 25900,
    "completedStreets": 0,
    "totalStreets": 138,
    "priority": "Alta",
    "lat": -27.609,
    "lng": -48.654,
    "officialColor": "#72d2e8",
    "assignedTeamId": "team-eco",
    "targetMaterials": {
      "santinhos": 55000,
      "adesivos": 6800,
      "adesivo_bola": 3200,
      "adesivo_parachoque": 1600,
      "colinhas": 38000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.604,
        -48.652
      ],
      [
        -27.604,
        -48.645
      ],
      [
        -27.611,
        -48.644
      ],
      [
        -27.614,
        -48.649
      ],
      [
        -27.615,
        -48.659
      ],
      [
        -27.609,
        -48.662
      ],
      [
        -27.6,
        -48.66
      ]
    ]
  },
  {
    "id": "ipiranga",
    "name": "Ipiranga",
    "zone": "Distrito Barreiros",
    "population": 11500,
    "households": 4400,
    "votersEstimated": 9200,
    "completedStreets": 0,
    "totalStreets": 54,
    "priority": "Média",
    "lat": -27.586,
    "lng": -48.636,
    "officialColor": "#bebcd2",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 22000,
      "adesivos": 2600,
      "adesivo_bola": 1100,
      "adesivo_parachoque": 600,
      "colinhas": 14000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.58,
        -48.632
      ],
      [
        -27.583,
        -48.63
      ],
      [
        -27.59,
        -48.628
      ],
      [
        -27.593,
        -48.634
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.586,
        -48.642
      ],
      [
        -27.583,
        -48.638
      ]
    ]
  },
  {
    "id": "jardim_cidade_de_florianopolis",
    "name": "Jardim Cidade de Florianópolis",
    "zone": "Distrito Barreiros",
    "population": 8700,
    "households": 3350,
    "votersEstimated": 7100,
    "completedStreets": 0,
    "totalStreets": 46,
    "priority": "Média",
    "lat": -27.584,
    "lng": -48.624,
    "officialColor": "#aae08c",
    "officialNumber": 2,
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 18000,
      "adesivos": 2200,
      "adesivo_bola": 950,
      "adesivo_parachoque": 500,
      "colinhas": 12000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.574,
        -48.628
      ],
      [
        -27.575,
        -48.62
      ],
      [
        -27.583,
        -48.622
      ],
      [
        -27.586,
        -48.617
      ],
      [
        -27.59,
        -48.618
      ],
      [
        -27.593,
        -48.622
      ],
      [
        -27.59,
        -48.628
      ],
      [
        -27.583,
        -48.63
      ]
    ]
  },
  {
    "id": "jardim_santiago",
    "name": "Jardim Santiago",
    "zone": "Distrito Barreiros",
    "population": 3900,
    "households": 1420,
    "votersEstimated": 3100,
    "completedStreets": 0,
    "totalStreets": 26,
    "priority": "Baixa",
    "lat": -27.562,
    "lng": -48.607,
    "officialColor": "#e8e48a",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 8000,
      "adesivos": 1000,
      "adesivo_bola": 450,
      "adesivo_parachoque": 250,
      "colinhas": 5500
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.555,
        -48.608
      ],
      [
        -27.557,
        -48.602
      ],
      [
        -27.566,
        -48.6
      ],
      [
        -27.569,
        -48.606
      ],
      [
        -27.565,
        -48.612
      ],
      [
        -27.559,
        -48.611
      ]
    ]
  },
  {
    "id": "kobrasol",
    "name": "Kobrasol",
    "zone": "Distrito Campinas",
    "population": 18640,
    "households": 7850,
    "votersEstimated": 15400,
    "completedStreets": 0,
    "totalStreets": 68,
    "priority": "Alta",
    "lat": -27.596,
    "lng": -48.619,
    "officialColor": "#bfe85c",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 35000,
      "adesivos": 4000,
      "adesivo_bola": 1800,
      "adesivo_parachoque": 900,
      "colinhas": 22000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.59,
        -48.618
      ],
      [
        -27.592,
        -48.614
      ],
      [
        -27.599,
        -48.616
      ],
      [
        -27.606,
        -48.614
      ],
      [
        -27.606,
        -48.62
      ],
      [
        -27.601,
        -48.624
      ],
      [
        -27.593,
        -48.622
      ]
    ]
  },
  {
    "id": "nossa_senhora_do_rosario",
    "name": "Nossa Senhora do Rosário",
    "zone": "Distrito Barreiros",
    "population": 6800,
    "households": 2650,
    "votersEstimated": 5400,
    "completedStreets": 0,
    "totalStreets": 36,
    "priority": "Média",
    "lat": -27.58,
    "lng": -48.617,
    "officialColor": "#c06868",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 15000,
      "adesivos": 1800,
      "adesivo_bola": 800,
      "adesivo_parachoque": 400,
      "colinhas": 10000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.572,
        -48.615
      ],
      [
        -27.574,
        -48.613
      ],
      [
        -27.584,
        -48.613
      ],
      [
        -27.586,
        -48.617
      ],
      [
        -27.583,
        -48.622
      ],
      [
        -27.575,
        -48.62
      ]
    ]
  },
  {
    "id": "pedregal",
    "name": "Pedregal",
    "zone": "Distrito Barreiros",
    "population": 5600,
    "households": 2100,
    "votersEstimated": 4500,
    "completedStreets": 0,
    "totalStreets": 34,
    "priority": "Média",
    "lat": -27.589,
    "lng": -48.649,
    "officialColor": "#85c0e8",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 12000,
      "adesivos": 1500,
      "adesivo_bola": 650,
      "adesivo_parachoque": 350,
      "colinhas": 8000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.585,
        -48.65
      ],
      [
        -27.586,
        -48.642
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.592,
        -48.648
      ],
      [
        -27.594,
        -48.654
      ],
      [
        -27.588,
        -48.656
      ],
      [
        -27.585,
        -48.65
      ]
    ]
  },
  {
    "id": "picadas_do_sul",
    "name": "Picadas do Sul",
    "zone": "Distrito Sede",
    "population": 12400,
    "households": 4800,
    "votersEstimated": 9900,
    "completedStreets": 0,
    "totalStreets": 58,
    "priority": "Média",
    "lat": -27.62,
    "lng": -48.654,
    "officialColor": "#58d8c2",
    "assignedTeamId": "team-eco",
    "targetMaterials": {
      "santinhos": 24000,
      "adesivos": 2900,
      "adesivo_bola": 1300,
      "adesivo_parachoque": 650,
      "colinhas": 16000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.615,
        -48.659
      ],
      [
        -27.614,
        -48.649
      ],
      [
        -27.617,
        -48.643
      ],
      [
        -27.622,
        -48.644
      ],
      [
        -27.626,
        -48.65
      ],
      [
        -27.628,
        -48.661
      ],
      [
        -27.621,
        -48.664
      ]
    ]
  },
  {
    "id": "ponta_de_baixo",
    "name": "Ponta de Baixo",
    "zone": "Distrito Sede",
    "population": 4100,
    "households": 1600,
    "votersEstimated": 3400,
    "completedStreets": 0,
    "totalStreets": 28,
    "priority": "Baixa",
    "lat": -27.635,
    "lng": -48.624,
    "officialColor": "#5c6ee8",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 9000,
      "adesivos": 1100,
      "adesivo_bola": 500,
      "adesivo_parachoque": 250,
      "colinhas": 6000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.626,
        -48.626
      ],
      [
        -27.624,
        -48.622
      ],
      [
        -27.632,
        -48.616
      ],
      [
        -27.644,
        -48.62
      ],
      [
        -27.646,
        -48.628
      ],
      [
        -27.638,
        -48.632
      ],
      [
        -27.627,
        -48.629
      ]
    ]
  },
  {
    "id": "potecas",
    "name": "Potecas",
    "zone": "Distrito Forquilhinha",
    "population": 8100,
    "households": 3100,
    "votersEstimated": 6400,
    "completedStreets": 0,
    "totalStreets": 48,
    "priority": "Média",
    "lat": -27.598,
    "lng": -48.652,
    "officialColor": "#b284e8",
    "assignedTeamId": "team-fox",
    "targetMaterials": {
      "santinhos": 16000,
      "adesivos": 2000,
      "adesivo_bola": 900,
      "adesivo_parachoque": 450,
      "colinhas": 11000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.592,
        -48.648
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.596,
        -48.64
      ],
      [
        -27.602,
        -48.645
      ],
      [
        -27.604,
        -48.652
      ],
      [
        -27.6,
        -48.66
      ],
      [
        -27.594,
        -48.658
      ],
      [
        -27.594,
        -48.654
      ]
    ]
  },
  {
    "id": "praia_comprida",
    "name": "Praia Comprida",
    "zone": "Distrito Sede",
    "population": 7200,
    "households": 2850,
    "votersEstimated": 5900,
    "completedStreets": 0,
    "totalStreets": 42,
    "priority": "Média",
    "lat": -27.612,
    "lng": -48.622,
    "officialColor": "#d2c4e8",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 16000,
      "adesivos": 1900,
      "adesivo_bola": 850,
      "adesivo_parachoque": 450,
      "colinhas": 11000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.606,
        -48.62
      ],
      [
        -27.606,
        -48.614
      ],
      [
        -27.613,
        -48.616
      ],
      [
        -27.618,
        -48.62
      ],
      [
        -27.616,
        -48.625
      ],
      [
        -27.61,
        -48.623
      ]
    ]
  },
  {
    "id": "real_parque",
    "name": "Real Parque",
    "zone": "Distrito Barreiros",
    "population": 8300,
    "households": 3100,
    "votersEstimated": 6700,
    "completedStreets": 0,
    "totalStreets": 44,
    "priority": "Média",
    "lat": -27.58,
    "lng": -48.648,
    "officialColor": "#e878a8",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 17000,
      "adesivos": 2100,
      "adesivo_bola": 900,
      "adesivo_parachoque": 450,
      "colinhas": 11500
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.568,
        -48.646
      ],
      [
        -27.578,
        -48.644
      ],
      [
        -27.583,
        -48.638
      ],
      [
        -27.586,
        -48.642
      ],
      [
        -27.585,
        -48.65
      ],
      [
        -27.577,
        -48.656
      ],
      [
        -27.57,
        -48.654
      ]
    ]
  },
  {
    "id": "rocado",
    "name": "Roçado",
    "zone": "Distrito Sede",
    "population": 9800,
    "households": 3800,
    "votersEstimated": 7950,
    "completedStreets": 0,
    "totalStreets": 56,
    "priority": "Média",
    "lat": -27.606,
    "lng": -48.628,
    "officialColor": "#6ce8a2",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 20000,
      "adesivos": 2400,
      "adesivo_bola": 1100,
      "adesivo_parachoque": 550,
      "colinhas": 14000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.596,
        -48.626
      ],
      [
        -27.601,
        -48.624
      ],
      [
        -27.606,
        -48.62
      ],
      [
        -27.61,
        -48.623
      ],
      [
        -27.611,
        -48.631
      ],
      [
        -27.607,
        -48.634
      ],
      [
        -27.6,
        -48.63
      ]
    ]
  },
  {
    "id": "sao_luiz",
    "name": "São Luiz",
    "zone": "Distrito Sede",
    "population": 5100,
    "households": 1950,
    "votersEstimated": 4200,
    "completedStreets": 0,
    "totalStreets": 32,
    "priority": "Média",
    "lat": -27.607,
    "lng": -48.639,
    "officialColor": "#9cd264",
    "assignedTeamId": "team-delta",
    "targetMaterials": {
      "santinhos": 11000,
      "adesivos": 1350,
      "adesivo_bola": 600,
      "adesivo_parachoque": 300,
      "colinhas": 7500
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.601,
        -48.637
      ],
      [
        -27.6,
        -48.63
      ],
      [
        -27.607,
        -48.634
      ],
      [
        -27.611,
        -48.636
      ],
      [
        -27.611,
        -48.644
      ],
      [
        -27.604,
        -48.645
      ],
      [
        -27.602,
        -48.645
      ]
    ]
  },
  {
    "id": "serraria",
    "name": "Serraria",
    "zone": "Distrito Barreiros",
    "population": 19800,
    "households": 7500,
    "votersEstimated": 15900,
    "completedStreets": 0,
    "totalStreets": 92,
    "priority": "Alta",
    "lat": -27.55,
    "lng": -48.628,
    "officialColor": "#aee894",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 38000,
      "adesivos": 4600,
      "adesivo_bola": 2100,
      "adesivo_parachoque": 1050,
      "colinhas": 25000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.532,
        -48.632
      ],
      [
        -27.536,
        -48.618
      ],
      [
        -27.545,
        -48.608
      ],
      [
        -27.558,
        -48.608
      ],
      [
        -27.562,
        -48.616
      ],
      [
        -27.564,
        -48.625
      ],
      [
        -27.562,
        -48.636
      ],
      [
        -27.555,
        -48.652
      ],
      [
        -27.54,
        -48.65
      ]
    ]
  },
  {
    "id": "sertao_do_maruim",
    "name": "Sertão do Maruim",
    "zone": "Distrito Sede",
    "population": 7100,
    "households": 2750,
    "votersEstimated": 5700,
    "completedStreets": 0,
    "totalStreets": 42,
    "priority": "Média",
    "lat": -27.626,
    "lng": -48.692,
    "officialColor": "#e8b84e",
    "assignedTeamId": "team-eco",
    "targetMaterials": {
      "santinhos": 15000,
      "adesivos": 1800,
      "adesivo_bola": 800,
      "adesivo_parachoque": 400,
      "colinhas": 10000
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.612,
        -48.692
      ],
      [
        -27.618,
        -48.675
      ],
      [
        -27.621,
        -48.664
      ],
      [
        -27.628,
        -48.661
      ],
      [
        -27.638,
        -48.666
      ],
      [
        -27.644,
        -48.678
      ],
      [
        -27.642,
        -48.705
      ],
      [
        -27.63,
        -48.715
      ],
      [
        -27.616,
        -48.718
      ],
      [
        -27.606,
        -48.708
      ]
    ]
  },
  {
    "id": "area_rural",
    "name": "Área Rural",
    "zone": "Distrito Sede",
    "population": 1400,
    "households": 480,
    "votersEstimated": 1100,
    "completedStreets": 0,
    "totalStreets": 18,
    "priority": "Baixa",
    "lat": -27.635,
    "lng": -48.73,
    "officialColor": "#f0cca8",
    "assignedTeamId": "team-fox",
    "targetMaterials": {
      "santinhos": 4000,
      "adesivos": 500,
      "adesivo_bola": 250,
      "adesivo_parachoque": 120,
      "colinhas": 2500
    },
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0
    },
    "polygon": [
      [
        -27.616,
        -48.745
      ],
      [
        -27.616,
        -48.718
      ],
      [
        -27.63,
        -48.715
      ],
      [
        -27.642,
        -48.705
      ],
      [
        -27.652,
        -48.712
      ],
      [
        -27.655,
        -48.742
      ],
      [
        -27.635,
        -48.755
      ]
    ]
  }
];
