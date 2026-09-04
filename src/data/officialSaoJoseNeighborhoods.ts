import { Neighborhood } from '../types';

/**
 * 28 Bairros Oficiais do Município de São José (Lei Complementar PMSJ 2020) + Área Rural (29 Bairros/Territórios)
 * Reconstruído com fidelidade geográfica geométrica 1:1 conforme desenho original da PMSJ (bairros_low.jpg).
 */
export const OFFICIAL_SAO_JOSE_NEIGHBORHOODS: Neighborhood[] = [
  {
    "id": "alto_forquilhas",
    "name": "Alto Forquilhas",
    "zone": "Distrito Forquilhas",
    "population": 4120,
    "households": 1450,
    "votersEstimated": 3100,
    "completedStreets": 0,
    "totalStreets": 28,
    "priority": "Média",
    "lat": -27.55,
    "lng": -48.692,
    "officialColor": "#a881d8",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 12000,
      "adesivos": 1500,
      "adesivo_bola": 700,
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
        -27.512,
        -48.74
      ],
      [
        -27.514,
        -48.71
      ],
      [
        -27.522,
        -48.675
      ],
      [
        -27.535,
        -48.65
      ],
      [
        -27.545,
        -48.65
      ],
      [
        -27.568,
        -48.65
      ],
      [
        -27.575,
        -48.67
      ],
      [
        -27.578,
        -48.695
      ],
      [
        -27.572,
        -48.72
      ],
      [
        -27.56,
        -48.735
      ],
      [
        -27.545,
        -48.745
      ],
      [
        -27.525,
        -48.742
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
    "lat": -27.572,
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
        -48.648
      ],
      [
        -27.562,
        -48.628
      ],
      [
        -27.568,
        -48.62
      ],
      [
        -27.575,
        -48.62
      ],
      [
        -27.577,
        -48.63
      ],
      [
        -27.578,
        -48.64
      ],
      [
        -27.575,
        -48.652
      ],
      [
        -27.565,
        -48.65
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
    "lat": -27.577,
    "lng": -48.606,
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
        -27.568,
        -48.618
      ],
      [
        -27.568,
        -48.603
      ],
      [
        -27.576,
        -48.598
      ],
      [
        -27.585,
        -48.594
      ],
      [
        -27.588,
        -48.598
      ],
      [
        -27.588,
        -48.612
      ],
      [
        -27.578,
        -48.612
      ],
      [
        -27.574,
        -48.615
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
    "lat": -27.585,
    "lng": -48.621,
    "officialColor": "#76e053",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 25000,
      "adesivos": 3000,
      "adesivo_bola": 1400,
      "adesivo_parachoque": 700,
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
        -27.582,
        -48.628
      ],
      [
        -27.582,
        -48.618
      ],
      [
        -27.588,
        -48.615
      ],
      [
        -27.59,
        -48.628
      ]
    ]
  },
  {
    "id": "bosque_das_mansoes",
    "name": "Bosque das Mansões",
    "zone": "Distrito Sede",
    "population": 3450,
    "households": 1120,
    "votersEstimated": 2750,
    "completedStreets": 0,
    "totalStreets": 18,
    "priority": "Média",
    "lat": -27.595,
    "lng": -48.632,
    "officialColor": "#e860bc",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 8000,
      "adesivos": 1000,
      "adesivo_bola": 500,
      "adesivo_parachoque": 250,
      "colinhas": 5000
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
        -48.638
      ],
      [
        -27.59,
        -48.624
      ],
      [
        -27.598,
        -48.624
      ],
      [
        -27.598,
        -48.634
      ],
      [
        -27.6,
        -48.64
      ]
    ]
  },
  {
    "id": "campinas",
    "name": "Campinas",
    "zone": "Distrito Sede",
    "population": 18450,
    "households": 7900,
    "votersEstimated": 15200,
    "completedStreets": 0,
    "totalStreets": 82,
    "priority": "Alta",
    "lat": -27.596,
    "lng": -48.61,
    "officialColor": "#e2579b",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 35000,
      "adesivos": 4200,
      "adesivo_bola": 2000,
      "adesivo_parachoque": 1000,
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
        -27.588,
        -48.612
      ],
      [
        -27.588,
        -48.598
      ],
      [
        -27.595,
        -48.603
      ],
      [
        -27.604,
        -48.608
      ],
      [
        -27.604,
        -48.618
      ],
      [
        -27.592,
        -48.62
      ]
    ]
  },
  {
    "id": "centro",
    "name": "Centro",
    "zone": "Distrito Histórico",
    "population": 7800,
    "households": 2900,
    "votersEstimated": 6400,
    "completedStreets": 0,
    "totalStreets": 42,
    "priority": "Média",
    "lat": -27.625,
    "lng": -48.624,
    "officialColor": "#6ae0e8",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 18000,
      "adesivos": 2200,
      "adesivo_bola": 1000,
      "adesivo_parachoque": 500,
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
        -27.622,
        -48.626
      ],
      [
        -27.622,
        -48.62
      ],
      [
        -27.63,
        -48.622
      ],
      [
        -27.63,
        -48.628
      ]
    ]
  },
  {
    "id": "colonia_santana",
    "name": "Colônia Santana",
    "zone": "Distrito Rural / Oeste",
    "population": 5200,
    "households": 1800,
    "votersEstimated": 4100,
    "completedStreets": 0,
    "totalStreets": 32,
    "priority": "Média",
    "lat": -27.595,
    "lng": -48.728,
    "officialColor": "#5ae89e",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 14000,
      "adesivos": 1800,
      "adesivo_bola": 800,
      "adesivo_parachoque": 400,
      "colinhas": 9000
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
        -48.745
      ],
      [
        -27.572,
        -48.72
      ],
      [
        -27.578,
        -48.695
      ],
      [
        -27.59,
        -48.69
      ],
      [
        -27.604,
        -48.685
      ],
      [
        -27.618,
        -48.712
      ],
      [
        -27.615,
        -48.735
      ],
      [
        -27.608,
        -48.756
      ],
      [
        -27.585,
        -48.758
      ]
    ]
  },
  {
    "id": "distrito_industrial",
    "name": "Distrito Industrial",
    "zone": "Distrito Sul",
    "population": 3100,
    "households": 850,
    "votersEstimated": 2400,
    "completedStreets": 0,
    "totalStreets": 26,
    "priority": "Média",
    "lat": -27.634,
    "lng": -48.646,
    "officialColor": "#c8885c",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 10000,
      "adesivos": 1400,
      "adesivo_bola": 700,
      "adesivo_parachoque": 350,
      "colinhas": 6500
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
        -27.628,
        -48.66
      ],
      [
        -27.628,
        -48.642
      ],
      [
        -27.632,
        -48.636
      ],
      [
        -27.64,
        -48.634
      ],
      [
        -27.642,
        -48.65
      ],
      [
        -27.638,
        -48.658
      ]
    ]
  },
  {
    "id": "fazenda_santo_antonio",
    "name": "Fazenda Santo Antônio",
    "zone": "Distrito Sede",
    "population": 8600,
    "households": 3100,
    "votersEstimated": 7100,
    "completedStreets": 0,
    "totalStreets": 44,
    "priority": "Média",
    "lat": -27.625,
    "lng": -48.633,
    "officialColor": "#deb0cc",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 20000,
      "adesivos": 2400,
      "adesivo_bola": 1100,
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
        -27.62,
        -48.64
      ],
      [
        -27.62,
        -48.628
      ],
      [
        -27.622,
        -48.624
      ],
      [
        -27.632,
        -48.628
      ],
      [
        -27.632,
        -48.64
      ]
    ]
  },
  {
    "id": "flor_de_napolis",
    "name": "Flor de Nápolis",
    "zone": "Distrito Sede",
    "population": 7100,
    "households": 2600,
    "votersEstimated": 5800,
    "completedStreets": 0,
    "totalStreets": 36,
    "priority": "Média",
    "lat": -27.616,
    "lng": -48.634,
    "officialColor": "#f07e6c",
    "officialNumber": 1,
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 16000,
      "adesivos": 2000,
      "adesivo_bola": 900,
      "adesivo_parachoque": 450,
      "colinhas": 10500
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
        -48.63
      ],
      [
        -27.612,
        -48.638
      ],
      [
        -27.62,
        -48.64
      ],
      [
        -27.62,
        -48.628
      ]
    ]
  },
  {
    "id": "forquilhas",
    "name": "Forquilhas",
    "zone": "Distrito Forquilhas",
    "population": 31200,
    "households": 12400,
    "votersEstimated": 25400,
    "completedStreets": 0,
    "totalStreets": 128,
    "priority": "Alta",
    "lat": -27.592,
    "lng": -48.672,
    "officialColor": "#e89280",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 55000,
      "adesivos": 6500,
      "adesivo_bola": 3000,
      "adesivo_parachoque": 1500,
      "colinhas": 35000
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
        -48.65
      ],
      [
        -27.575,
        -48.67
      ],
      [
        -27.578,
        -48.695
      ],
      [
        -27.59,
        -48.69
      ],
      [
        -27.604,
        -48.685
      ],
      [
        -27.61,
        -48.675
      ],
      [
        -27.615,
        -48.662
      ],
      [
        -27.603,
        -48.66
      ],
      [
        -27.592,
        -48.658
      ],
      [
        -27.585,
        -48.655
      ],
      [
        -27.575,
        -48.652
      ]
    ]
  },
  {
    "id": "forquilhinha",
    "name": "Forquilhinha",
    "zone": "Distrito Forquilhas",
    "population": 17800,
    "households": 6800,
    "votersEstimated": 14500,
    "completedStreets": 0,
    "totalStreets": 74,
    "priority": "Alta",
    "lat": -27.608,
    "lng": -48.652,
    "officialColor": "#58cae8",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 32000,
      "adesivos": 3800,
      "adesivo_bola": 1800,
      "adesivo_parachoque": 900,
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
        -27.603,
        -48.66
      ],
      [
        -27.602,
        -48.642
      ],
      [
        -27.612,
        -48.638
      ],
      [
        -27.614,
        -48.648
      ],
      [
        -27.615,
        -48.662
      ]
    ]
  },
  {
    "id": "ipiranga",
    "name": "Ipiranga",
    "zone": "Distrito Barreiros",
    "population": 13900,
    "households": 5100,
    "votersEstimated": 11200,
    "completedStreets": 0,
    "totalStreets": 58,
    "priority": "Alta",
    "lat": -27.585,
    "lng": -48.635,
    "officialColor": "#bebcd2",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 24000,
      "adesivos": 2800,
      "adesivo_bola": 1300,
      "adesivo_parachoque": 650,
      "colinhas": 15000
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
        -27.578,
        -48.64
      ],
      [
        -27.577,
        -48.63
      ],
      [
        -27.584,
        -48.628
      ],
      [
        -27.59,
        -48.628
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.584,
        -48.64
      ]
    ]
  },
  {
    "id": "jardim_cidade_de_florianopolis",
    "name": "Jardim Cidade de Florianópolis",
    "zone": "Distrito Barreiros",
    "population": 8900,
    "households": 3300,
    "votersEstimated": 7200,
    "completedStreets": 0,
    "totalStreets": 38,
    "priority": "Média",
    "lat": -27.58,
    "lng": -48.622,
    "officialColor": "#aae08c",
    "officialNumber": 2,
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 19000,
      "adesivos": 2300,
      "adesivo_bola": 1050,
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
        -27.575,
        -48.625
      ],
      [
        -27.574,
        -48.618
      ],
      [
        -27.582,
        -48.618
      ],
      [
        -27.584,
        -48.628
      ]
    ]
  },
  {
    "id": "jardim_santiago",
    "name": "Jardim Santiago",
    "zone": "Distrito Barreiros",
    "population": 6200,
    "households": 2300,
    "votersEstimated": 5000,
    "completedStreets": 0,
    "totalStreets": 28,
    "priority": "Média",
    "lat": -27.563,
    "lng": -48.61,
    "officialColor": "#5b9dd9",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 14000,
      "adesivos": 1700,
      "adesivo_bola": 800,
      "adesivo_parachoque": 400,
      "colinhas": 9000
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
        -48.628
      ],
      [
        -27.562,
        -48.615
      ],
      [
        -27.56,
        -48.605
      ],
      [
        -27.568,
        -48.603
      ],
      [
        -27.568,
        -48.618
      ]
    ]
  },
  {
    "id": "kobrasol",
    "name": "Kobrasol",
    "zone": "Distrito Sede",
    "population": 15600,
    "households": 7200,
    "votersEstimated": 13100,
    "completedStreets": 0,
    "totalStreets": 68,
    "priority": "Alta",
    "lat": -27.607,
    "lng": -48.616,
    "officialColor": "#bfe85c",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 30000,
      "adesivos": 3600,
      "adesivo_bola": 1700,
      "adesivo_parachoque": 850,
      "colinhas": 19000
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
        -48.622
      ],
      [
        -27.604,
        -48.608
      ],
      [
        -27.61,
        -48.612
      ],
      [
        -27.61,
        -48.622
      ]
    ]
  },
  {
    "id": "nossa_senhora_do_rosario",
    "name": "Nossa Senhora do Rosário",
    "zone": "Distrito Barreiros",
    "population": 10400,
    "households": 3900,
    "votersEstimated": 8500,
    "completedStreets": 0,
    "totalStreets": 46,
    "priority": "Alta",
    "lat": -27.588,
    "lng": -48.617,
    "officialColor": "#b84860",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 22000,
      "adesivos": 2600,
      "adesivo_bola": 1200,
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
        -27.585,
        -48.622
      ],
      [
        -27.585,
        -48.614
      ],
      [
        -27.592,
        -48.613
      ],
      [
        -27.592,
        -48.622
      ]
    ]
  },
  {
    "id": "pedregal",
    "name": "Pedregal",
    "zone": "Distrito Forquilhas",
    "population": 5800,
    "households": 2100,
    "votersEstimated": 4600,
    "completedStreets": 0,
    "totalStreets": 28,
    "priority": "Média",
    "lat": -27.588,
    "lng": -48.648,
    "officialColor": "#85c0e8",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 13000,
      "adesivos": 1600,
      "adesivo_bola": 750,
      "adesivo_parachoque": 380,
      "colinhas": 8500
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
        -48.655
      ],
      [
        -27.584,
        -48.64
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.592,
        -48.658
      ]
    ]
  },
  {
    "id": "picadas_do_sul",
    "name": "Picadas do Sul",
    "zone": "Distrito Sede",
    "population": 9400,
    "households": 3500,
    "votersEstimated": 7700,
    "completedStreets": 0,
    "totalStreets": 48,
    "priority": "Alta",
    "lat": -27.621,
    "lng": -48.653,
    "officialColor": "#4cd0b8",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 21000,
      "adesivos": 2500,
      "adesivo_bola": 1200,
      "adesivo_parachoque": 600,
      "colinhas": 13500
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
        -48.662
      ],
      [
        -27.614,
        -48.648
      ],
      [
        -27.62,
        -48.64
      ],
      [
        -27.628,
        -48.642
      ],
      [
        -27.628,
        -48.66
      ]
    ]
  },
  {
    "id": "ponta_de_baixo",
    "name": "Ponta de Baixo",
    "zone": "Distrito Histórico",
    "population": 4600,
    "households": 1650,
    "votersEstimated": 3750,
    "completedStreets": 0,
    "totalStreets": 28,
    "priority": "Média",
    "lat": -27.638,
    "lng": -48.624,
    "officialColor": "#4a60d8",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 11000,
      "adesivos": 1300,
      "adesivo_bola": 600,
      "adesivo_parachoque": 300,
      "colinhas": 7000
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
        -27.63,
        -48.628
      ],
      [
        -27.63,
        -48.622
      ],
      [
        -27.636,
        -48.62
      ],
      [
        -27.644,
        -48.618
      ],
      [
        -27.65,
        -48.622
      ],
      [
        -27.648,
        -48.628
      ],
      [
        -27.64,
        -48.632
      ],
      [
        -27.633,
        -48.632
      ]
    ]
  },
  {
    "id": "potecas",
    "name": "Potecas",
    "zone": "Distrito Forquilhas",
    "population": 11300,
    "households": 4200,
    "votersEstimated": 9200,
    "completedStreets": 0,
    "totalStreets": 54,
    "priority": "Alta",
    "lat": -27.597,
    "lng": -48.651,
    "officialColor": "#b284e8",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 22000,
      "adesivos": 2700,
      "adesivo_bola": 1300,
      "adesivo_parachoque": 650,
      "colinhas": 14500
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
        -48.658
      ],
      [
        -27.592,
        -48.64
      ],
      [
        -27.602,
        -48.642
      ],
      [
        -27.603,
        -48.66
      ]
    ]
  },
  {
    "id": "praia_comprida",
    "name": "Praia Comprida",
    "zone": "Distrito Histórico",
    "population": 8300,
    "households": 3200,
    "votersEstimated": 6800,
    "completedStreets": 0,
    "totalStreets": 40,
    "priority": "Média",
    "lat": -27.615,
    "lng": -48.62,
    "officialColor": "#c8c4e8",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 18000,
      "adesivos": 2200,
      "adesivo_bola": 1000,
      "adesivo_parachoque": 500,
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
        -27.61,
        -48.622
      ],
      [
        -27.61,
        -48.612
      ],
      [
        -27.618,
        -48.615
      ],
      [
        -27.622,
        -48.62
      ],
      [
        -27.622,
        -48.626
      ],
      [
        -27.612,
        -48.628
      ]
    ]
  },
  {
    "id": "real_parque",
    "name": "Real Parque",
    "zone": "Distrito Barreiros",
    "population": 6900,
    "households": 2500,
    "votersEstimated": 5600,
    "completedStreets": 0,
    "totalStreets": 34,
    "priority": "Média",
    "lat": -27.58,
    "lng": -48.647,
    "officialColor": "#e878a8",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 15000,
      "adesivos": 1800,
      "adesivo_bola": 850,
      "adesivo_parachoque": 420,
      "colinhas": 9500
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
        -27.575,
        -48.652
      ],
      [
        -27.578,
        -48.64
      ],
      [
        -27.584,
        -48.64
      ],
      [
        -27.585,
        -48.655
      ]
    ]
  },
  {
    "id": "rocado",
    "name": "Roçado",
    "zone": "Distrito Sede",
    "population": 8700,
    "households": 3300,
    "votersEstimated": 7100,
    "completedStreets": 0,
    "totalStreets": 42,
    "priority": "Média",
    "lat": -27.605,
    "lng": -48.627,
    "officialColor": "#6ce8a2",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 19000,
      "adesivos": 2300,
      "adesivo_bola": 1100,
      "adesivo_parachoque": 550,
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
        -27.598,
        -48.634
      ],
      [
        -27.598,
        -48.624
      ],
      [
        -27.61,
        -48.622
      ],
      [
        -27.612,
        -48.63
      ],
      [
        -27.604,
        -48.633
      ]
    ]
  },
  {
    "id": "sao_luiz",
    "name": "São Luiz",
    "zone": "Distrito Sede",
    "population": 6800,
    "households": 2500,
    "votersEstimated": 5500,
    "completedStreets": 0,
    "totalStreets": 36,
    "priority": "Média",
    "lat": -27.606,
    "lng": -48.636,
    "officialColor": "#9cd264",
    "assignedTeamId": "team-bravo",
    "targetMaterials": {
      "santinhos": 15000,
      "adesivos": 1800,
      "adesivo_bola": 850,
      "adesivo_parachoque": 420,
      "colinhas": 9500
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
        -27.6,
        -48.64
      ],
      [
        -27.598,
        -48.634
      ],
      [
        -27.612,
        -48.63
      ],
      [
        -27.613,
        -48.638
      ],
      [
        -27.604,
        -48.642
      ]
    ]
  },
  {
    "id": "serraria",
    "name": "Serraria",
    "zone": "Distrito Barreiros",
    "population": 20400,
    "households": 7800,
    "votersEstimated": 16500,
    "completedStreets": 0,
    "totalStreets": 82,
    "priority": "Alta",
    "lat": -27.548,
    "lng": -48.628,
    "officialColor": "#aee894",
    "assignedTeamId": "team-charlie",
    "targetMaterials": {
      "santinhos": 38000,
      "adesivos": 4500,
      "adesivo_bola": 2100,
      "adesivo_parachoque": 1050,
      "colinhas": 24000
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
        -27.53,
        -48.65
      ],
      [
        -27.528,
        -48.625
      ],
      [
        -27.532,
        -48.608
      ],
      [
        -27.542,
        -48.61
      ],
      [
        -27.552,
        -48.612
      ],
      [
        -27.562,
        -48.615
      ],
      [
        -27.563,
        -48.63
      ],
      [
        -27.562,
        -48.648
      ],
      [
        -27.545,
        -48.65
      ]
    ]
  },
  {
    "id": "sertao_do_maruim",
    "name": "Sertão do Maruim",
    "zone": "Distrito Sul",
    "population": 9800,
    "households": 3600,
    "votersEstimated": 8000,
    "completedStreets": 0,
    "totalStreets": 48,
    "priority": "Alta",
    "lat": -27.624,
    "lng": -48.686,
    "officialColor": "#e8b040",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 22000,
      "adesivos": 2600,
      "adesivo_bola": 1250,
      "adesivo_parachoque": 620,
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
        -27.604,
        -48.685
      ],
      [
        -27.61,
        -48.675
      ],
      [
        -27.615,
        -48.662
      ],
      [
        -27.628,
        -48.66
      ],
      [
        -27.638,
        -48.658
      ],
      [
        -27.644,
        -48.675
      ],
      [
        -27.645,
        -48.7
      ],
      [
        -27.635,
        -48.718
      ],
      [
        -27.618,
        -48.712
      ]
    ]
  },
  {
    "id": "area_rural",
    "name": "Área Rural",
    "zone": "Distrito Rural / Oeste",
    "population": 2900,
    "households": 980,
    "votersEstimated": 2350,
    "completedStreets": 0,
    "totalStreets": 24,
    "priority": "Média",
    "lat": -27.632,
    "lng": -48.735,
    "officialColor": "#e4bc90",
    "assignedTeamId": "team-alpha",
    "targetMaterials": {
      "santinhos": 8000,
      "adesivos": 1000,
      "adesivo_bola": 500,
      "adesivo_parachoque": 250,
      "colinhas": 5000
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
        -27.608,
        -48.756
      ],
      [
        -27.615,
        -48.735
      ],
      [
        -27.618,
        -48.712
      ],
      [
        -27.635,
        -48.718
      ],
      [
        -27.648,
        -48.73
      ],
      [
        -27.654,
        -48.75
      ],
      [
        -27.632,
        -48.758
      ]
    ]
  }
];
