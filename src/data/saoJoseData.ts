import {
  Neighborhood,
  Militant,
  Team,
  Van,
  StreetCheckIn,
  CampaignCalendarDay,
  StockItem,
  StockTransaction,
  PushNotification,
  ActivityAuditLog,
  User,
  WeeklyPayroll,
  AdminUser
} from '../types';
import { OFFICIAL_SAO_JOSE_NEIGHBORHOODS } from './officialSaoJoseNeighborhoods';

export const SAO_JOSE_CENTER: [number, number] = [-27.6136, -48.6366];

/**
 * 28 Bairros Oficiais de São José (PMSJ 2020) + Área Rural (29 bairros totais)
 * Geometria precisa 1:1 com o mapa oficial PMSJ
 */
export const INITIAL_NEIGHBORHOODS: Neighborhood[] = OFFICIAL_SAO_JOSE_NEIGHBORHOODS;

export const INITIAL_USERS: User[] = [
  {
    id: 'user-coord-geral',
    name: 'Pedro da Silva Rosa',
    email: 'pedro.rosa@campanhasj.com.br',
    role: 'admin',
    teamId: 'team-1787840837258',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 99124-5501',
    matricula: 'coordenador01',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-20 08:30:00'
  },
  {
    id: 'user-lider-alpha',
    name: 'Juliana Silveira',
    email: 'juliana.campo@campanhasj.com.br',
    role: 'lider',
    teamId: 'team-1787840837258',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 98844-3211',
    matricula: 'LID-101',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-21 09:15:00'
  },
  {
    id: 'user-motorista-01',
    name: 'Roberto Valente (Beto Van)',
    email: 'beto.van@campanhasj.com.br',
    role: 'motorista_van',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 98412-9900',
    matricula: 'VAN-01',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-23 10:00:00'
  }
];

export const INITIAL_MILITANTS: Militant[] = [
  {
    "id": "mil-1787842489241",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0.8,
    "totalStreetsCovered": 1,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Beatriz",
    "matricula": "Mil002",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99670-8704",
    "email": "beatriz@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.5741592,
      "lng": -48.6740642,
      "streetName": "R. Nossa Sra. Rainha da Paz (nº Trecho Geral)",
      "neighborhoodName": "Forquilhas",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-03T16:48:43.485Z",
    "_localModified": true
  },
  {
    "id": "mil-1787842613622",
    "name": "Daiana",
    "matricula": "Mil-DAI",
    "cpfMasked": "***.452.189-**",
    "phone": "(48) 99124-5501",
    "email": "daiana.militancia@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "dailyRate": 150,
    "totalKmWalked": 4.8,
    "totalStreetsCovered": 3,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 50,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 40,
      "comercio": 0
    },
    "weeklyGoalPercentage": 85,
    "batteryLevel": 92,
    "currentLocation": {
      "lat": -27.5962,
      "lng": -48.619,
      "streetName": "Rua Manoel Francisco de souza. (nº Trecho Geral)",
      "neighborhoodName": "Forquilhinhas",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 3,
    "updatedAt": "2026-09-03T16:49:12.927Z",
    "_localModified": true
  },
  {
    "id": "mil-1787842774685",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 1.6,
    "totalStreetsCovered": 2,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Gustavo",
    "matricula": "Mil007",
    "cpfMasked": "***.***.***-**",
    "phone": "(48) 985050302",
    "email": "gustavo@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.5751295,
      "lng": -48.6567069,
      "streetName": "R. Telmo Luiz Martins (nº Trecho Geral)",
      "neighborhoodName": "Areias / Bosque das Mansões",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:13:57.561Z",
    "_localModified": true
  },
  {
    "id": "mil-1787842879496",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0.8,
    "totalStreetsCovered": 1,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Jessica ",
    "matricula": "Mil010",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99156-6697",
    "email": "jessica.@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.6022455,
      "lng": -48.6483546,
      "streetName": "R. Leopoldina Marcelino (nº Trecho Geral)",
      "neighborhoodName": "Forquilhinhas",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:14:06.061Z",
    "_localModified": true
  },
  {
    "id": "mil-1787842912688",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 1.6,
    "totalStreetsCovered": 2,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 9,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Juliana",
    "matricula": "Mil011",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99802-5613",
    "email": "juliana@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.5750729,
      "lng": -48.6650612,
      "streetName": "R. Urano Pires (nº Trecho Geral)",
      "neighborhoodName": "Areias / Bosque das Mansões",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:14:20.118Z",
    "_localModified": true
  },
  {
    "id": "mil-1787842976552",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0.8,
    "totalStreetsCovered": 1,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Juliane",
    "matricula": "Mil012",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 98476-6891",
    "email": "juliane@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.6046667,
      "lng": -48.6519887,
      "streetName": "R. Aimoré (nº Trecho Geral)",
      "neighborhoodName": "Forquilhinhas",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:14:30.380Z",
    "_localModified": true
  },
  {
    "id": "mil-1787843082113",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Kayla",
    "matricula": "Mil013",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 47 98926-5369",
    "email": "kayla@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "currentLocation": {
      "lat": -27.5809,
      "lng": -48.6714349,
      "streetName": "Rua Guimarães (nº Trecho Geral)",
      "neighborhoodName": "Forquilhas",
      "lastUpdate": "Agora mesmo"
    },
    "updatedAt": "2026-09-04T14:14:42.179Z",
    "_localModified": true
  },
  {
    "id": "mil-1787843172481",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Merilyn",
    "matricula": "Mil014",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 67 99265-5292",
    "email": "merilyn@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:14:55.486Z",
    "_localModified": true
  },
  {
    "id": "mil-1787843294191",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Nathalia",
    "matricula": "Mil015",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99914-7238",
    "email": "nathalia@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:15:04.444Z",
    "_localModified": true,
    "currentLocation": {
      "lat": -27.5757929,
      "lng": -48.661112,
      "streetName": "Av. Ceniro Luiz Ribeiro Martins (nº Trecho Geral)",
      "neighborhoodName": "Centro",
      "lastUpdate": "Agora mesmo"
    }
  },
  {
    "id": "mil-1787848020226",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Raissa",
    "matricula": "Mil016",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99900-3029",
    "email": "raissa@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:15:17.696Z",
    "_localModified": true,
    "currentLocation": {
      "lat": -27.5544657,
      "lng": -48.6241074,
      "streetName": "R. Marcelo Antônio Réis (nº Trecho Geral)",
      "neighborhoodName": "Areias",
      "lastUpdate": "Agora mesmo"
    }
  },
  {
    "id": "mil-1787848111342",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 1.6,
    "totalStreetsCovered": 2,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 11,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Sandra Beatriz",
    "matricula": "Mil017",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 99180-8565",
    "email": "sandra.beatriz@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "currentLocation": {
      "lat": -27.5736983,
      "lng": -48.6115745,
      "streetName": "R. Cap. Pedro Leite (nº Trecho Geral)",
      "neighborhoodName": "Barreiros",
      "lastUpdate": "Agora mesmo"
    },
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:15:33.810Z",
    "_localModified": true
  },
  {
    "id": "mil-1787848170611",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Stefani",
    "matricula": "Mil018",
    "cpfMasked": "***.***.***-**",
    "phone": "+55 48 98407-7178",
    "email": "stefani@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "currentLocation": {
      "lat": -27.5618981,
      "lng": -48.6569486,
      "streetName": "R. Anélio Francisco de Souza (nº Trecho Geral)",
      "neighborhoodName": "Potecas",
      "lastUpdate": "Agora mesmo"
    },
    "updatedAt": "2026-09-07T23:44:29.869Z",
    "_localModified": true
  },
  {
    "id": "mil-1787848232931",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "Solange",
    "matricula": "Mil019",
    "cpfMasked": "***.***.***-**",
    "phone": "‪+55 48 98466‑3307‬",
    "email": "solange@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "updatedAt": "2026-09-07T23:45:03.277Z",
    "_localModified": true,
    "currentLocation": {
      "lat": -27.5764147,
      "lng": -48.624667,
      "streetName": "R. José Antônio Tomás (nº Trecho Geral)",
      "neighborhoodName": "Barreiros",
      "lastUpdate": "Agora mesmo"
    }
  },
  {
    "id": "mil-1787935574554",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "rose",
    "matricula": "Mil021",
    "cpfMasked": "***.***.***-**",
    "phone": "(48) 933819476",
    "email": "rose@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "militante",
    "dailyRate": 100,
    "completedStreets": 0,
    "updatedAt": "2026-09-04T14:16:12.529Z",
    "_localModified": true,
    "currentLocation": {
      "lat": -27.6175541,
      "lng": -48.6467543,
      "streetName": "R. Aristídes da Silva (nº Trecho Geral)",
      "neighborhoodName": "Fazenda Santo Antônio",
      "lastUpdate": "Agora mesmo"
    }
  },
  {
    "id": "mil-1788873214888",
    "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    "status": "ativo",
    "totalKmWalked": 0,
    "totalStreetsCovered": 0,
    "deliveredMaterials": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "weeklyGoalPercentage": 0,
    "batteryLevel": 100,
    "name": "DiegoNunes",
    "matricula": "DiegoNunes",
    "cpfMasked": "***.***.***-**",
    "phone": "(48) 988173085",
    "email": "diegonunes@campanhasj.com.br",
    "teamId": "team-1787840837258",
    "role": "coordenador",
    "dailyRate": 150,
    "updatedAt": "2026-09-08T13:42:30.784Z",
    "_localModified": true
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    "id": "team-1787840837258",
    "name": "Equipe Daniel Freitas - São José",
    "color": "#10b981",
    "leaderId": "user-coord-geral",
    "leaderName": "Pedro da Silva Rosa",
    "memberIds": [
      "mil-1787842613622"
    ],
    "assignedVanId": "van-01",
    "targetNeighborhoodIds": [
      "forquilhinhas",
      "forquilhas",
      "bela_vista",
      "ipiranga",
      "campinas",
      "kobrasol",
      "barreiros",
      "areias",
      "serraria",
      "potecas",
      "praia_comprida",
      "rocado",
      "fazenda_santo_antonio",
      "centro",
      "picadas_do_sul",
      "sertao_do_maruim",
      "colonia_santana"
    ],
    "dailyProgressPct": 95,
    "totalMaterialsDelivered": 4500,
    "status": "em_campo"
  }
];

export const INITIAL_VANS: Van[] = [
  {
    "id": "van-01",
    "name": "Van 01 - Alpha & Charlie",
    "model": "Mercedes-Benz Sprinter 516 (19 Lugares)",
    "plate": "RKS-8A24",
    "driverName": "Roberto Valente (Beto)",
    "driverPhone": "(48) 98412-9900",
    "capacity": 19,
    "assignedTeamIds": [
      "team-1787840837258"
    ],
    "status": "aguardando_resgate",
    "currentCoords": {
      "lat": -27.598,
      "lng": -48.622,
      "lastUpdate": "Agora"
    },
    "nextPickupLocation": "Comitê Central / Garagem",
    "nextPickupTime": "08:00"
  },
  {
    "id": "van-02",
    "name": "Van 02 - Bravo & Eco",
    "model": "Renault Master Grand L3H2 (16 Lugares)",
    "plate": "RKA-3B90",
    "driverName": "Marcos Aurélio Santos",
    "driverPhone": "(48) 99155-3344",
    "capacity": 16,
    "assignedTeamIds": [
      "team-1787840837258"
    ],
    "status": "aguardando_resgate",
    "currentCoords": {
      "lat": -27.576,
      "lng": -48.609,
      "lastUpdate": "Agora"
    },
    "nextPickupLocation": "Comitê Central / Garagem",
    "nextPickupTime": "08:00"
  },
  {
    "id": "van-03",
    "name": "Van 03 - Delta & Fox",
    "model": "Fiat Ducato Minibus (16 Lugares)",
    "plate": "QJC-7F45",
    "driverName": "Claudemir de Oliveira",
    "driverPhone": "(48) 99877-1122",
    "capacity": 16,
    "assignedTeamIds": [
      "team-1787840837258"
    ],
    "status": "aguardando_resgate",
    "currentCoords": {
      "lat": -27.619,
      "lng": -48.627,
      "lastUpdate": "Agora"
    },
    "nextPickupLocation": "Comitê Central / Garagem",
    "nextPickupTime": "08:00"
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stock-santinhos',
    name: 'Santinhos Políticos (Candidato + Propostas)',
    code: 'MAT-SNT-01',
    type: 'santinhos',
    description: 'Santinho 7x10cm couche brilho 90g com propostas e foto oficial',
    totalReceived: 500000,
    dispatched: 0,
    currentStock: 500000,
    minThreshold: 50000,
    unit: 'unidades',
    imageIcon: 'FileText'
  },
  {
    id: 'stock-colinhas',
    name: 'Colinhas de Votação (Dia da Eleição)',
    code: 'MAT-COL-02',
    type: 'colinhas',
    description: 'Colinha de bolso com espaço para preenchimento de números',
    totalReceived: 350000,
    dispatched: 0,
    currentStock: 350000,
    minThreshold: 40000,
    unit: 'unidades',
    imageIcon: 'CheckSquare'
  },
  {
    id: 'stock-adesivos',
    name: 'Adesivos Retangulares para Roupa/Comércio',
    code: 'MAT-ADS-03',
    type: 'adesivos',
    description: 'Adesivo vinílico de peito 5x7cm de alta aderência',
    totalReceived: 60000,
    dispatched: 0,
    currentStock: 60000,
    minThreshold: 10000,
    unit: 'unidades',
    imageIcon: 'Tag'
  },
  {
    id: 'stock-adesivo-bola',
    name: 'Adesivo Bola Perfurite (Vidro Traseiro)',
    code: 'MAT-BOL-04',
    type: 'adesivo_bola',
    description: 'Adesivo circular perfurado 30cm para vidro traseiro de carros',
    totalReceived: 25000,
    dispatched: 0,
    currentStock: 25000,
    minThreshold: 3000,
    unit: 'unidades',
    imageIcon: 'Disc'
  },
  {
    id: 'stock-adesivo-parachoque',
    name: 'Adesivo de Parachoque (Faixa)',
    code: 'MAT-PAR-05',
    type: 'adesivo_parachoque',
    description: 'Adesivo faixa horizontal 35x10cm resistente a intempéries',
    totalReceived: 15000,
    dispatched: 0,
    currentStock: 15000,
    minThreshold: 2000,
    unit: 'unidades',
    imageIcon: 'Layers'
  }
];

export const INITIAL_CHECKINS: StreetCheckIn[] = [
  {
    id: "chk-fazenda-1",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. João Adalgisio Filipi (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:30:15",
    latitude: -27.6205806,
    longitude: -48.6427329,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-2",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Domingos Jalmeno Costa (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:35:20",
    latitude: -27.621782,
    longitude: -48.6418364,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-3",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Maria Jocelina Rodrigues da Silva (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:40:10",
    latitude: -27.6184733,
    longitude: -48.643494,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-4",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Sebastiana Ferreira de Souza (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:45:00",
    latitude: -27.6183,
    longitude: -48.6399,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-5",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Antônio Alfredo da Silva (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:50:30",
    latitude: -27.6165,
    longitude: -48.6427,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-6",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Eliane Gerlack (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:55:12",
    latitude: -27.6189,
    longitude: -48.6400,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-7",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Estevão de Andrade (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 11:58:45",
    latitude: -27.6192,
    longitude: -48.6400,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-8",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Viviana Guanabara (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 12:00:10",
    latitude: -27.6166,
    longitude: -48.6405,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-9",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Manoel José dos Santos (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 12:01:25",
    latitude: -27.6165,
    longitude: -48.6397,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-10",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. João Pessoa (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 12:02:40",
    latitude: -27.6169,
    longitude: -48.6400,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-11",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Viviana Guanabara (Trecho 2)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 12:03:50",
    latitude: -27.6166,
    longitude: -48.6405,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    id: "chk-fazenda-12",
    militantId: "mil-1787935574554",
    militantName: "rose",
    teamId: "team-1787840837258",
    neighborhoodId: "fazenda_santo_antonio",
    neighborhoodName: "Fazenda Santo Antônio",
    streetName: "R. Profa. Evanilda Maria Koerich (nº Trecho Geral)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-09-09 12:05:00",
    latitude: -27.6161,
    longitude: -48.6411,
    materialsDelivered: { santinhos: 150, adesivos: 30, adesivo_bola: 20, adesivo_parachoque: 10, colinhas: 50, abordagens: 40, comercio: 8 },
    gpsAccuracy: 4.2,
    photos: []
  },
  {
    "id": "chk-1788956428164-svngi-mil1787935574554",
    "militantId": "mil-1787935574554",
    "militantName": "rose",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ponta_de_baixo",
    "neighborhoodName": "Ponta de Baixo",
    "streetName": "Rua Oscar Francisco Schmidt (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-09 12:20:28",
    "latitude": -27.6353996,
    "longitude": -48.6320256,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788955826144-li3u9-mil1787935574554",
    "militantId": "mil-1787935574554",
    "militantName": "rose",
    "teamId": "team-1787840837258",
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "streetName": "R. Aristídes da Silva (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-09 12:10:26",
    "latitude": -27.6175541,
    "longitude": -48.6467543,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788955665569-kbn0l-mil1787935574554",
    "militantId": "mil-1787935574554",
    "militantName": "rose",
    "teamId": "team-1787840837258",
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "streetName": "R. Alice Santo da Rosa (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-09 12:07:45",
    "latitude": -27.6199913,
    "longitude": -48.6445984,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788955517428-gn8qa-mil1787935574554",
    "militantId": "mil-1787935574554",
    "militantName": "rose",
    "teamId": "team-1787840837258",
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "streetName": "R. Agostinho Corrêa de Oliveira (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-09 12:05:17",
    "latitude": -27.6214463,
    "longitude": -48.6424678,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788955375861-zc4pl-mil1787935574554",
    "militantId": "mil-1787935574554",
    "militantName": "rose",
    "teamId": "team-1787840837258",
    "neighborhoodId": "fazenda_santo_antonio",
    "neighborhoodName": "Fazenda Santo Antônio",
    "streetName": "R. Silvana Goedert (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-09 12:02:55",
    "latitude": -27.6210826,
    "longitude": -48.6439346,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788860375512-k3poh-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "streetName": "R. Marcelo Antônio Réis (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:39:35",
    "latitude": -27.5544657,
    "longitude": -48.6241074,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788860174217-c5g5m-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Nossa Sra. Aparecida (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:36:14",
    "latitude": -27.5811806,
    "longitude": -48.6103603,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788859996214-to3cx-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Antônio Rafael (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:33:16",
    "latitude": -27.6028623,
    "longitude": -48.6447339,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788859707064-8yyxh-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "streetName": "R. Telmo Luiz Martins (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:28:27",
    "latitude": -27.5750729,
    "longitude": -48.6650612,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788859572875-cbyi7-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "streetName": "R. Urano Pires (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:26:12",
    "latitude": -27.5750729,
    "longitude": -48.6650612,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788859447528-xfj7v-mil1787848020226",
    "militantId": "mil-1787848020226",
    "militantName": "Raissa",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Leopoldina Marcelino (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:24:07",
    "latitude": -27.6022455,
    "longitude": -48.6483546,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788858140196-d91cd-mil1787848232931",
    "militantId": "mil-1787848232931",
    "militantName": "Solange",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. José Antônio Tomás (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-08 09:02:20",
    "latitude": -27.5764147,
    "longitude": -48.624667,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 20,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612746888-thdmk-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "streetName": "R. Anélio Francisco de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:52:26",
    "latitude": -27.5618981,
    "longitude": -48.6569486,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612658455-b4cm8-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "centro",
    "neighborhoodName": "Centro",
    "streetName": "R. Isolda Schulle (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:50:58",
    "latitude": -27.5609605,
    "longitude": -48.6562311,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612575534-8e7j3-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. Izoel Ribeiro (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:49:35",
    "latitude": -27.5447693,
    "longitude": -48.63381,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612517838-fqrsu-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. José João Rachadel Filho (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:48:37",
    "latitude": -27.5452438,
    "longitude": -48.6329062,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612416313-evkly-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "streetName": "R. Aparecida Maria Dadam (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:46:56",
    "latitude": -27.5576718,
    "longitude": -48.629461,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612340425-vh1iz-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Álvaro Leite (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:45:40",
    "latitude": -27.5621255,
    "longitude": -48.6376609,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612296206-kz3ff-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "R. Joana D'arc (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:44:56",
    "latitude": -27.5627111,
    "longitude": -48.6363532,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612181434-jt4dc-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Mario César da Costa (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:43:01",
    "latitude": -27.5662742,
    "longitude": -48.6436658,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612110644-57cib-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "R. José Clodovel de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:41:50",
    "latitude": -27.5610558,
    "longitude": -48.634706,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788612008546-sd5o6-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "R. Cândido Portinari (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:40:08",
    "latitude": -27.5622378,
    "longitude": -48.6367137,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788611968904-ocj3x-mil1787848170611",
    "militantId": "mil-1787848170611",
    "militantName": "Stefani",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "streetName": "R. Marcelo Antônio Réis (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:39:28",
    "latitude": -27.5544657,
    "longitude": -48.6241074,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788611743062-lkag8-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "streetName": "Servidão Maria Anastácia de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:35:43",
    "latitude": -27.5917535,
    "longitude": -48.6241103,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 6,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788611651197-votgd-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "streetName": "Servidão Laudencio Pedro da Cunha (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:34:11",
    "latitude": -27.5923292,
    "longitude": -48.6261503,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 8,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788611570557-d979g-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "rocado",
    "neighborhoodName": "Roçado",
    "streetName": "R. Lindolfo Jásper (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-05 12:32:50",
    "latitude": -27.5923292,
    "longitude": -48.6261503,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788547583458-v4p8v-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "streetName": "R. Algodoeiro (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:46:23",
    "latitude": -27.55197,
    "longitude": -48.6573,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788547529490-md5hx-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "potecas",
    "neighborhoodName": "Potecas",
    "streetName": "R. Uváia (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:45:29",
    "latitude": -27.55135,
    "longitude": -48.65768,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788547095226-dqfdf-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Reinaldo Ferreira De Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:38:15",
    "latitude": -27.5650968,
    "longitude": -48.6745714,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788547040971-0hx0t-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Sabiá (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:37:20",
    "latitude": -27.57525,
    "longitude": -48.67316,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788546978547-6o5a9-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Araçari (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:36:18",
    "latitude": -27.5672541,
    "longitude": -48.6673606,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788546934043-sd780-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Ulisses Siqueira Lima (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:35:34",
    "latitude": -27.574659,
    "longitude": -48.651667,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788546877433-3o3ef-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "R. Otto Júlio Malina (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:34:37",
    "latitude": -27.5651062,
    "longitude": -48.6254931,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788546819743-9pb7n-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "R. João Paulo Gaspar (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:33:39",
    "latitude": -27.570394,
    "longitude": -48.6392128,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 7,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788546612354-cr67r-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "27°34'12.4\"S 48°38'31.2\"W (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 18:30:12",
    "latitude": -27.57011,
    "longitude": -48.642,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788543193721-cubw9-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Mal. Rondon (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:33:13",
    "latitude": -27.5829116,
    "longitude": -48.6043488,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788543122606-lbi8k-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "rua Justino machado loreto (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:32:02",
    "latitude": -27.5757185,
    "longitude": -48.6607909,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788543034081-1ptlo-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "rua jovito Manoel Gonçalves (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:30:34",
    "latitude": -27.5760901,
    "longitude": -48.6602336,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788542849840-x0lxh-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "rua mariafrancisca conceição ribeiro (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:27:29",
    "latitude": -27.5771623,
    "longitude": -48.661744,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788542714791-kiyzd-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "rua juliana maria da silva (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:25:14",
    "latitude": -27.5766823,
    "longitude": -48.659159,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788541643993-6yebc-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Telmo Luiz Martins (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:07:23",
    "latitude": -27.5755468,
    "longitude": -48.6541495,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788541583753-e3ohj-mil1787843294191",
    "militantId": "mil-1787843294191",
    "militantName": "Nathalia",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "Av. Ceniro Luiz Ribeiro Martins (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 17:06:23",
    "latitude": -27.5752006,
    "longitude": -48.6617073,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788531012195-khuxx-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "Rua José Victor da Silva (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:10:12",
    "latitude": -27.5714932,
    "longitude": -48.6058069,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 4,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530924195-4nc59-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. da Independência (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:08:44",
    "latitude": -27.5569988,
    "longitude": -48.6263331,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530834790-1ov4e-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias",
    "streetName": "R. Marcelo Antônio Réis (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:07:14",
    "latitude": -27.5539445,
    "longitude": -48.6218707,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530763094-sx8f2-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "R. José Clodovel de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:06:03",
    "latitude": -27.5611184,
    "longitude": -48.6320708,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530676827-podg5-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "Rua Eugênio Portela (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:04:36",
    "latitude": -27.5845136,
    "longitude": -48.6061229,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530569783-hqpta-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "R. Mario César da Costa (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:02:49",
    "latitude": -27.5645331,
    "longitude": -48.6377915,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530472154-cnstt-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. Veríssimo Rodrigues Fortuna (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:01:12",
    "latitude": -27.5452421,
    "longitude": -48.6395147,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530404807-mo3m6-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. Léo Augusto da Silva (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 14:00:04",
    "latitude": -27.5419317,
    "longitude": -48.6323232,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788530287329-yu9av-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. dos Lirios (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:58:07",
    "latitude": -27.5426368,
    "longitude": -48.6465482,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788529993617-n0yxl-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. Nelson Ferreira (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:53:13",
    "latitude": -27.5409207,
    "longitude": -48.6369685,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788529902922-qis32-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "Servidão Passos Filho (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:51:42",
    "latitude": -27.5735148,
    "longitude": -48.6029927,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788529836316-uckcb-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Portimao (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:50:36",
    "latitude": -27.5788755,
    "longitude": -48.668638,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788529765301-7fo82-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Açores (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:49:25",
    "latitude": -27.5793806,
    "longitude": -48.6685319,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788529704274-l5b2d-mil1787843082113",
    "militantId": "mil-1787843082113",
    "militantName": "Kayla",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "Rua Guimarães (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:48:24",
    "latitude": -27.5806455,
    "longitude": -48.6691286,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788527636411-c7dig-mil1787842976552",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "rua laci de lima (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:13:56",
    "latitude": -27.5678193,
    "longitude": -48.6413514,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788527483393-2627f-mil1787842976552",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua Arthur Mariano (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:11:23",
    "latitude": -27.5989113,
    "longitude": -48.6419768,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788527343309-g1ucm-mil1787842976552",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "Rua ararangua (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:09:03",
    "latitude": -27.5715749,
    "longitude": -48.6150196,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788527250818-3jnwb-mil1787842976552",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "rua Pedro bunn (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:07:30",
    "latitude": -27.573599,
    "longitude": -48.6283341,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788527102998-c6rb8-mil1787842976552",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "rua frontino coelho pires (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:05:02",
    "latitude": -27.5673835,
    "longitude": -48.6198308,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788526869699-qp9lk-mil1787842912688",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "R. Alceu Amoroso Lima (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 13:01:09",
    "latitude": -27.5684708,
    "longitude": -48.6424924,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788526762626-hj3sg-mil1787842912688",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "real_parque",
    "neighborhoodName": "Real Parque",
    "streetName": "R. Carlos Drumond de Andrade (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 12:59:22",
    "latitude": -27.5673339,
    "longitude": -48.6417136,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788526656174-fejko-mil1787842912688",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Bento Águido Viêira (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 12:57:36",
    "latitude": -27.5716244,
    "longitude": -48.6159013,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788526583106-j528g-mil1787842912688",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Cândido Amaro Damásio (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 12:56:23",
    "latitude": -27.5671868,
    "longitude": -48.6167989,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788526518582-tgm9y-mil1787842912688",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Valmir de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-04 12:55:18",
    "latitude": -27.5688612,
    "longitude": -48.6224819,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788459189751-83xve-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Antônio Basil Schroeder (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-03 18:13:09",
    "latitude": -27.5725516,
    "longitude": -48.6134587,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 10,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788459123286-tx14t-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "nossa_senhora_do_rosario",
    "neighborhoodName": "Nossa Senhora do Rosário",
    "streetName": "R. Maria Filomena da Silva (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-03 18:12:03",
    "latitude": -27.5781767,
    "longitude": -48.6175847,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 10,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788458880334-kmaj3-mil1787842774685",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. do Iano (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-03 18:08:00",
    "latitude": -27.5739592,
    "longitude": -48.6145662,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 15,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788457869724-7hho1-mil1787842613622",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Ver. Arthur Manoel Mariano (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-03 17:51:09",
    "latitude": -27.5989113,
    "longitude": -48.6419768,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 10,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788457733040-ooz2r-mil1787842613622",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "serraria",
    "neighborhoodName": "Serraria",
    "streetName": "R. Doná Lídia (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-03 17:48:53",
    "latitude": -27.5415373,
    "longitude": -48.6327915,
    "accuracyMeters": 3.5,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359354126",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "Av. Brasil (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:29:14",
    "latitude": -27.5691924,
    "longitude": -48.615441,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 7,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359302630",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Blumenau (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:28:22",
    "latitude": -27.5702011,
    "longitude": -48.6185431,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359238145",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Ratones (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:27:18",
    "latitude": -27.5718888,
    "longitude": -48.621617,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359201568",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Inglêses (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:26:41",
    "latitude": -27.5733769,
    "longitude": -48.6252562,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359149106",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Jurerê (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:25:49",
    "latitude": -27.5727768,
    "longitude": -48.62409,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359090347",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Cândido Amaro Damásio (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:24:50",
    "latitude": -27.5671868,
    "longitude": -48.6167989,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 7,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788359006100",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Santa Luzia (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:23:26",
    "latitude": -27.57044,
    "longitude": -48.62765,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358922840",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Valmir de Souza (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:22:02",
    "latitude": -27.5688612,
    "longitude": -48.6224819,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358853065",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Hidalgo Araújo (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:20:53",
    "latitude": -27.5694222,
    "longitude": -48.622855,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358554813",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Hidalgo Araújo (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:15:54",
    "latitude": -27.5694222,
    "longitude": -48.622855,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358363750",
    "militantId": "mil-1787843172481",
    "militantName": "Merilyn",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Anchieta (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:12:43",
    "latitude": -27.5696586,
    "longitude": -48.6152681,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358291011",
    "militantId": "mil-1787843172481",
    "militantName": "Merilyn",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Braço do Norte (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:11:31",
    "latitude": -27.571199,
    "longitude": -48.6177721,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788358204202",
    "militantId": "mil-1787843172481",
    "militantName": "Merilyn",
    "teamId": "team-1787840837258",
    "neighborhoodId": "bela_vista",
    "neighborhoodName": "Bela Vista",
    "streetName": "R. Braço do Norte (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-02 14:10:04",
    "latitude": -27.571199,
    "longitude": -48.6177721,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788304381308",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 23:13:01",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302883333",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:48:03",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302786486",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:46:26",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302271723",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "ipiranga",
    "neighborhoodName": "Ipiranga",
    "streetName": "Rua Francisco Nappi (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:37:51",
    "latitude": -27.5603846,
    "longitude": -48.6235286,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 150,
      "adesivos": 25,
      "adesivo_bola": 8,
      "adesivo_parachoque": 4,
      "colinhas": 100,
      "abordagens": 15,
      "comercio": 4
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302270012",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua Antônio Jovita Duarte (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:37:50",
    "latitude": -27.5920236,
    "longitude": -48.6503167,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 150,
      "adesivos": 25,
      "adesivo_bola": 8,
      "adesivo_parachoque": 4,
      "colinhas": 100,
      "abordagens": 15,
      "comercio": 4
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302270875",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua Vereador Arthur Mariano (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:37:50",
    "latitude": -27.5989113,
    "longitude": -48.6419768,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 150,
      "adesivos": 25,
      "adesivo_bola": 8,
      "adesivo_parachoque": 4,
      "colinhas": 100,
      "abordagens": 15,
      "comercio": 4
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302268892",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua Antônio Jovita Duarte (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:37:48",
    "latitude": -27.5920236,
    "longitude": -48.6503167,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 150,
      "adesivos": 25,
      "adesivo_bola": 8,
      "adesivo_parachoque": 4,
      "colinhas": 100,
      "abordagens": 15,
      "comercio": 4
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302266956",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:37:46",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788302027884",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-09-01 22:33:47",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788154693694",
    "militantId": "mil-1787842976552",
    "militantName": "Juliane",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Aimoré (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 05:38:13",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788154389398",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "streetName": "R. Urano Pires (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 05:33:09",
    "latitude": -27.5753464,
    "longitude": -48.6625458,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 5,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788154317878",
    "militantId": "mil-1787842912688",
    "militantName": "Juliana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "streetName": "R. Urano Pires (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 05:31:57",
    "latitude": -27.5753464,
    "longitude": -48.6625458,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788154260102",
    "militantId": "mil-1787842879496",
    "militantName": "Jessica ",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "R. Leopoldina Marcelino (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 05:31:00",
    "latitude": -27.6024588,
    "longitude": -48.6461692,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 2,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788153803894",
    "militantId": "mil-1787842774685",
    "militantName": "Gustavo",
    "teamId": "team-1787840837258",
    "neighborhoodId": "areias",
    "neighborhoodName": "Areias / Bosque das Mansões",
    "streetName": "R. Telmo Luiz Martins (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 05:23:23",
    "latitude": -27.5755468,
    "longitude": -48.6541495,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 3,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788151894061",
    "militantId": "mil-1787848111342",
    "militantName": "Sandra Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "barreiros",
    "neighborhoodName": "Barreiros",
    "streetName": "R. Cap. Pedro Leite (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 04:51:34",
    "latitude": -27.574346,
    "longitude": -48.6097739,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 10,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788151691324",
    "militantId": "mil-1787848883614",
    "militantName": "Milena",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Aveiro (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 04:48:11",
    "latitude": -27.5726168,
    "longitude": -48.6676077,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 4,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788151449108",
    "militantId": "mil-1787842489241",
    "militantName": "Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Nossa Sra. Rainha da Paz (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 04:44:09",
    "latitude": -27.5742844,
    "longitude": -48.671479,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788151262332",
    "militantId": "mil-1787848111342",
    "militantName": "Sandra Beatriz",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Nossa Sra. Rainha da Paz (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 04:41:02",
    "latitude": -27.5742844,
    "longitude": -48.671479,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1788151201636",
    "militantId": "mil-1787848883614",
    "militantName": "Milena",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhas",
    "neighborhoodName": "Forquilhas",
    "streetName": "R. Nossa Sra. Rainha da Paz (nº Trecho Geral)",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-31 04:40:01",
    "latitude": -27.5742844,
    "longitude": -48.671479,
    "accuracyMeters": 3.5,
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 1,
      "comercio": 0
    },
    "observations": "",
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1787944352110",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua Manoel Francisco de souza",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-28 19:12:32",
    "latitude": -27.6015755,
    "longitude": -48.6453365,
    "accuracyMeters": 4.2,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 25,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "Check-in de rua confirmado em Forquilhinhas",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1787944235558",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "Rua allan kardec",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-28 19:10:35",
    "latitude": -27.6022061,
    "longitude": -48.6458576,
    "accuracyMeters": 4.2,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 25,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 0,
      "comercio": 0
    },
    "observations": "Check-in de rua confirmado em Forquilhinhas",
    "status": "validado",
    "synced": true
  },
  {
    "id": "chk-1787944129777",
    "militantId": "mil-1787842613622",
    "militantName": "Daiana",
    "teamId": "team-1787840837258",
    "neighborhoodId": "forquilhinha",
    "neighborhoodName": "Forquilhinha",
    "streetName": "rua Aimoré",
    "houseNumberRange": "Trecho Geral",
    "timestamp": "2026-08-28 19:08:49",
    "latitude": -27.60463,
    "longitude": -48.64938,
    "accuracyMeters": 4.2,
    "photos": [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"
    ],
    "materialsDelivered": {
      "santinhos": 0,
      "adesivos": 0,
      "adesivo_bola": 0,
      "adesivo_parachoque": 0,
      "colinhas": 0,
      "abordagens": 40,
      "comercio": 0
    },
    "observations": "Militância de abordagem direta em Forquilhinhas",
    "status": "validado",
    "synced": true
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [];

export const INITIAL_AUDIT_LOGS: ActivityAuditLog[] = [
  {
    id: 'log-clean-init-001',
    timestamp: '2026-08-27 08:00:00',
    userId: 'user-coord-geral',
    userName: 'Pedro da Silva Rosa',
    userRole: 'admin',
    action: 'SISTEMA_ZERADO_TESTES_REAIS',
    category: 'CADASTROS',
    ipAddress: '127.0.0.1',
    details: 'Base de dados de campo e contadores de materiais 100% zerados para início dos testes reais de campo em São José/SC.'
  }
];

// Generate Full Campaign Calendar from 25/08/2026 to 04/10/2026 (41 days)
export function generateCampaignCalendar(): CampaignCalendarDay[] {
  const days: CampaignCalendarDay[] = [];
  const startDate = new Date('2026-08-25T12:00:00Z');
  const endDate = new Date('2026-10-04T12:00:00Z');
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  const neighborhoodSequence = [
    ['kobrasol', 'campinas'],
    ['barreiros', 'bela_vista'],
    ['forquilhinha', 'potecas'],
    ['serraria', 'ipiranga'],
    ['praia_comprida', 'rocado', 'fazenda_santo_antonio'],
    ['forquilhas', 'areias'],
    ['picadas_do_sul', 'sertao_do_maruim', 'colonia_santana'],
  ];

  let current = new Date(startDate);
  let dayNum = 1;

  while (current <= endDate) {
    const yyyy = current.toISOString().split('T')[0];
    const dayOfWeekStr = daysOfWeek[current.getDay()];
    const seqIndex = (dayNum - 1) % neighborhoodSequence.length;
    const targetBairros = neighborhoodSequence[seqIndex];

    const isPast = current < new Date('2026-08-25T23:59:59Z');
    const isToday = yyyy === '2026-08-26';

    days.push({
      id: `day-${yyyy}`,
      date: yyyy,
      dayOfWeek: dayOfWeekStr,
      dayNumber: dayNum,
      targetNeighborhoodIds: targetBairros,
      teamsAssigned: ['team-1787840837258', 'team-1787840837258', 'team-1787840837258', 'team-1787840837258'],
      expectedStreetGoal: 35 + (dayNum % 10) * 2,
      expectedMaterialsGoal: 18000 + (dayNum % 5) * 1500,
      vanRoutePlan: [
        {
          vanId: 'van-01',
          departureTime: '08:00',
          pickupPoint: 'Comitê Central (Av. Pres. Kennedy, Campinas)',
          dropoffPoint: `Ponto Estratégico 1 (${targetBairros[0]})`,
          returnTime: '12:30',
          coordinatorNotes: 'Desembarcar militantes em duplas com kits completos de material'
        },
        {
          vanId: 'van-02',
          departureTime: '08:15',
          pickupPoint: 'Comitê Central (Av. Pres. Kennedy, Campinas)',
          dropoffPoint: `Ponto Estratégico 2 (${targetBairros[1] || targetBairros[0]})`,
          returnTime: '13:00',
          coordinatorNotes: 'Foco em avenidas principais e comércio matutino'
        }
      ],
      status: isPast ? 'concluido' : (isToday ? 'em_andamento' : 'planejado'),
      completionRate: isPast ? 95 : (isToday ? 78 : undefined)
    });

    current.setDate(current.getDate() + 1);
    dayNum++;
  }

  return days;
}

export const INITIAL_CALENDAR_DAYS = generateCampaignCalendar();

export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-01',
    name: 'Pedro da Silva Rosa',
    email: 'pedro.rosa@campanhasj.com.br',
    matricula: 'coordenador01',
    phone: '(48) 99124-5501',
    role: 'admin',
    pinCode: '2026',
    securityLevel: 'super_admin',
    createdAt: '2026-08-20',
    active: true
  },
  {
    id: 'admin-02',
    name: 'Dra. Luciana Prado (Tesouraria)',
    email: 'financeiro.saojose@campanhasj.com.br',
    matricula: 'ADM-002',
    phone: '(48) 98822-1144',
    role: 'admin',
    pinCode: '1234',
    securityLevel: 'financeiro',
    createdAt: '2026-08-21',
    active: true
  }
];

export const INITIAL_PAYROLLS: WeeklyPayroll[] = [
  {
    id: 'folha-semana-1',
    weekNumber: 1,
    weekLabel: 'Semana 1 (26/08 a 01/09/2026)',
    startDate: '2026-08-26',
    endDate: '2026-09-01',
    status: 'aberta',
    totalWeeklyAmount: 0,
    totalDaysWorked: 0,
    totalWorkersPaid: 0,
    totalMilitantsAmount: 0,
    totalLeadersAmount: 0,
    totalDriversAmount: 0,
    approvedBy: undefined,
    approvedAt: undefined,
    notes: 'Folha de pagamento aberta para a primeira semana de campo.',
    items: []
  },
  {
    id: 'folha-semana-2',
    weekNumber: 2,
    weekLabel: 'Semana 2 (02/09 a 08/09/2026)',
    startDate: '2026-09-02',
    endDate: '2026-09-08',
    status: 'aberta',
    totalWeeklyAmount: 0,
    totalDaysWorked: 0,
    totalWorkersPaid: 0,
    totalMilitantsAmount: 0,
    totalLeadersAmount: 0,
    totalDriversAmount: 0,
    notes: 'Programação da segunda semana de campanha em São José.',
    items: []
  }
];

