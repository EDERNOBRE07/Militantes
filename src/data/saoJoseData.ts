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

export const SAO_JOSE_CENTER: [number, number] = [-27.6136, -48.6366];

export const INITIAL_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'kobrasol',
    name: 'Kobrasol',
    zone: 'Distrito Campinas',
    population: 18640,
    households: 7850,
    votersEstimated: 15400,
    totalStreets: 68,
    completedStreets: 0,
    lat: -27.5955,
    lng: -48.6185,
    priority: 'Alta',
    polygon: [
      [-27.590, -48.625],
      [-27.590, -48.612],
      [-27.602, -48.612],
      [-27.602, -48.625]
    ],
    targetMaterials: { santinhos: 35000, adesivos: 4000, adesivo_bola: 1800, adesivo_parachoque: 900, colinhas: 22000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-alpha'
  },
  {
    id: 'campinas',
    name: 'Campinas',
    zone: 'Distrito Campinas',
    population: 16800,
    households: 7100,
    votersEstimated: 14100,
    totalStreets: 62,
    completedStreets: 0,
    lat: -27.6010,
    lng: -48.6270,
    priority: 'Alta',
    polygon: [
      [-27.596, -48.635],
      [-27.596, -48.620],
      [-27.608, -48.620],
      [-27.608, -48.635]
    ],
    targetMaterials: { santinhos: 32000, adesivos: 3800, adesivo_bola: 1600, adesivo_parachoque: 850, colinhas: 20000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-alpha'
  },
  {
    id: 'barreiros',
    name: 'Barreiros',
    zone: 'Distrito Barreiros',
    population: 27950,
    households: 11200,
    votersEstimated: 22800,
    totalStreets: 114,
    completedStreets: 0,
    lat: -27.5750,
    lng: -48.6080,
    priority: 'Alta',
    polygon: [
      [-27.565, -48.620],
      [-27.565, -48.598],
      [-27.585, -48.598],
      [-27.585, -48.620]
    ],
    targetMaterials: { santinhos: 50000, adesivos: 6000, adesivo_bola: 2800, adesivo_parachoque: 1400, colinhas: 34000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-bravo'
  },
  {
    id: 'praia_comprida',
    name: 'Praia Comprida',
    zone: 'Distrito Sede',
    population: 7200,
    households: 2850,
    votersEstimated: 5900,
    totalStreets: 42,
    completedStreets: 0,
    lat: -27.6180,
    lng: -48.6250,
    priority: 'Média',
    polygon: [
      [-27.610, -48.632],
      [-27.610, -48.618],
      [-27.625, -48.618],
      [-27.625, -48.632]
    ],
    targetMaterials: { santinhos: 15000, adesivos: 1800, adesivo_bola: 750, adesivo_parachoque: 400, colinhas: 9500 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-delta'
  },
  {
    id: 'forquilhinhas',
    name: 'Forquilhinhas',
    zone: 'Distrito Forquilhinhas',
    population: 32400,
    households: 12600,
    votersEstimated: 25900,
    totalStreets: 138,
    completedStreets: 0,
    lat: -27.6040,
    lng: -48.6650,
    priority: 'Alta',
    polygon: [
      [-27.592, -48.680],
      [-27.592, -48.650],
      [-27.615, -48.650],
      [-27.615, -48.680]
    ],
    targetMaterials: { santinhos: 58000, adesivos: 7200, adesivo_bola: 3200, adesivo_parachoque: 1600, colinhas: 39000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-charlie'
  },
  {
    id: 'serraria',
    name: 'Serraria',
    zone: 'Distrito Barreiros',
    population: 24800,
    households: 9400,
    votersEstimated: 19800,
    totalStreets: 96,
    completedStreets: 0,
    lat: -27.5580,
    lng: -48.6180,
    priority: 'Alta',
    polygon: [
      [-27.545, -48.630],
      [-27.545, -48.605],
      [-27.570, -48.605],
      [-27.570, -48.630]
    ],
    targetMaterials: { santinhos: 45000, adesivos: 5200, adesivo_bola: 2400, adesivo_parachoque: 1200, colinhas: 29000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-eco'
  },
  {
    id: 'rocado',
    name: 'Roçado',
    zone: 'Distrito Sede',
    population: 7800,
    households: 2950,
    votersEstimated: 6400,
    totalStreets: 46,
    completedStreets: 0,
    lat: -27.6080,
    lng: -48.6390,
    priority: 'Média',
    polygon: [
      [-27.602, -48.648],
      [-27.602, -48.630],
      [-27.615, -48.630],
      [-27.615, -48.648]
    ],
    targetMaterials: { santinhos: 16000, adesivos: 1900, adesivo_bola: 800, adesivo_parachoque: 420, colinhas: 10200 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-delta'
  },
  {
    id: 'fazenda_santo_antonio',
    name: 'Fazenda Santo Antônio',
    zone: 'Distrito Sede',
    population: 14500,
    households: 5600,
    votersEstimated: 11900,
    totalStreets: 64,
    completedStreets: 0,
    lat: -27.6220,
    lng: -48.6420,
    priority: 'Média',
    polygon: [
      [-27.615, -48.655],
      [-27.615, -48.635],
      [-27.632, -48.635],
      [-27.632, -48.655]
    ],
    targetMaterials: { santinhos: 28000, adesivos: 3300, adesivo_bola: 1450, adesivo_parachoque: 750, colinhas: 18000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-delta'
  },
  {
    id: 'ipiranga',
    name: 'Ipiranga',
    zone: 'Distrito Barreiros',
    population: 13200,
    households: 4900,
    votersEstimated: 10600,
    totalStreets: 54,
    completedStreets: 0,
    lat: -27.5820,
    lng: -48.6220,
    priority: 'Média',
    polygon: [
      [-27.575, -48.632],
      [-27.575, -48.615],
      [-27.590, -48.615],
      [-27.590, -48.632]
    ],
    targetMaterials: { santinhos: 25000, adesivos: 2900, adesivo_bola: 1300, adesivo_parachoque: 650, colinhas: 16000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-eco'
  },
  {
    id: 'bela_vista',
    name: 'Bela Vista',
    zone: 'Distrito Barreiros',
    population: 14100,
    households: 5200,
    votersEstimated: 11400,
    totalStreets: 58,
    completedStreets: 0,
    lat: -27.5710,
    lng: -48.6340,
    priority: 'Média',
    polygon: [
      [-27.562, -48.645],
      [-27.562, -48.625],
      [-27.580, -48.625],
      [-27.580, -48.645]
    ],
    targetMaterials: { santinhos: 26000, adesivos: 3100, adesivo_bola: 1350, adesivo_parachoque: 700, colinhas: 16500 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-bravo'
  },
  {
    id: 'potecas',
    name: 'Potecas',
    zone: 'Distrito Forquilhinhas',
    population: 11600,
    households: 4100,
    votersEstimated: 9200,
    totalStreets: 52,
    completedStreets: 0,
    lat: -27.6180,
    lng: -48.6850,
    priority: 'Média',
    polygon: [
      [-27.608, -48.700],
      [-27.608, -48.675],
      [-27.628, -48.675],
      [-27.628, -48.700]
    ],
    targetMaterials: { santinhos: 22000, adesivos: 2600, adesivo_bola: 1150, adesivo_parachoque: 580, colinhas: 14000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-charlie'
  },
  {
    id: 'picadas_do_sul',
    name: 'Picadas do Sul',
    zone: 'Distrito Sede',
    population: 9200,
    households: 3300,
    votersEstimated: 7400,
    totalStreets: 44,
    completedStreets: 0,
    lat: -27.6280,
    lng: -48.6650,
    priority: 'Baixa',
    polygon: [
      [-27.620, -48.678],
      [-27.620, -48.655],
      [-27.638, -48.655],
      [-27.638, -48.678]
    ],
    targetMaterials: { santinhos: 18000, adesivos: 2100, adesivo_bola: 900, adesivo_parachoque: 460, colinhas: 11500 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-fox'
  },
  {
    id: 'forquilhas',
    name: 'Forquilhas',
    zone: 'Distrito Forquilhinhas',
    population: 29100,
    households: 10800,
    votersEstimated: 23200,
    totalStreets: 120,
    completedStreets: 0,
    lat: -27.5950,
    lng: -48.6920,
    priority: 'Alta',
    polygon: [
      [-27.580, -48.710],
      [-27.580, -48.675],
      [-27.610, -48.675],
      [-27.610, -48.710]
    ],
    targetMaterials: { santinhos: 52000, adesivos: 6400, adesivo_bola: 2900, adesivo_parachoque: 1450, colinhas: 35000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-charlie'
  },
  {
    id: 'sertao_do_maruim',
    name: 'Sertão do Maruim',
    zone: 'Distrito Sede',
    population: 7100,
    households: 2500,
    votersEstimated: 5600,
    totalStreets: 38,
    completedStreets: 0,
    lat: -27.6350,
    lng: -48.6950,
    priority: 'Baixa',
    polygon: [
      [-27.625, -48.715],
      [-27.625, -48.685],
      [-27.648, -48.685],
      [-27.648, -48.715]
    ],
    targetMaterials: { santinhos: 14000, adesivos: 1600, adesivo_bola: 700, adesivo_parachoque: 360, colinhas: 9000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-fox'
  },
  {
    id: 'colonia_santana',
    name: 'Colônia Santana',
    zone: 'Distrito Sede',
    population: 5800,
    households: 2100,
    votersEstimated: 4600,
    totalStreets: 34,
    completedStreets: 0,
    lat: -27.6150,
    lng: -48.7450,
    priority: 'Baixa',
    polygon: [
      [-27.600, -48.765],
      [-27.600, -48.725],
      [-27.630, -48.725],
      [-27.630, -48.765]
    ],
    targetMaterials: { santinhos: 11000, adesivos: 1300, adesivo_bola: 580, adesivo_parachoque: 290, colinhas: 7200 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-fox'
  },
  {
    id: 'areias',
    name: 'Areias / Bosque das Mansões',
    zone: 'Distrito Barreiros',
    population: 22300,
    households: 8600,
    votersEstimated: 17800,
    totalStreets: 86,
    completedStreets: 0,
    lat: -27.5880,
    lng: -48.6410,
    priority: 'Alta',
    polygon: [
      [-27.578, -48.655],
      [-27.578, -48.630],
      [-27.598, -48.630],
      [-27.598, -48.655]
    ],
    targetMaterials: { santinhos: 40000, adesivos: 4800, adesivo_bola: 2100, adesivo_parachoque: 1050, colinhas: 26000 },
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0 },
    assignedTeamId: 'team-bravo'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-coord-geral',
    name: 'Pedro da Silva Rosa',
    email: 'pedro.rosa@campanhasj.com.br',
    role: 'admin',
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
    teamId: 'team-alpha',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 98844-3211',
    matricula: 'LID-101',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-21 09:15:00'
  },
  {
    id: 'user-militante-01',
    name: 'Carlos Eduardo Ramos',
    email: 'cadu.militancia@campanhasj.com.br',
    role: 'militante',
    teamId: 'team-alpha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 99912-7845',
    matricula: 'Mil001',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-22 14:00:00'
  },
  {
    id: 'user-militante-02',
    name: 'Mariana Becker',
    email: 'mariana.becker@campanhasj.com.br',
    role: 'militante',
    teamId: 'team-alpha',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '(48) 99655-1234',
    matricula: 'Mil002',
    lgpdConsent: true,
    lgpdConsentDate: '2026-08-22 14:10:00'
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
    id: 'mil-1787842613622',
    name: 'Daiana',
    matricula: 'Mil-DAI',
    cpfMasked: '***.452.189-**',
    phone: '(48) 99124-5501',
    email: 'daiana.militancia@campanhasj.com.br',
    teamId: 'team-1787840837258',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 4.8,
    totalStreetsCovered: 3,
    deliveredMaterials: { santinhos: 0, adesivos: 50, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 40, comercio: 0 },
    weeklyGoalPercentage: 85,
    batteryLevel: 92
  },
  {
    id: 'mil-1787842613621',
    name: 'Luciano',
    matricula: 'Mil-LUC',
    cpfMasked: '***.781.992-**',
    phone: '(48) 99655-4321',
    email: 'luciano.militancia@campanhasj.com.br',
    teamId: 'team-1787840837258',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 8.5,
    totalStreetsCovered: 12,
    deliveredMaterials: { santinhos: 150, adesivos: 225, adesivo_bola: 8, adesivo_parachoque: 4, colinhas: 100, abordagens: 37, comercio: 4 },
    weeklyGoalPercentage: 94,
    batteryLevel: 88
  },
  {
    id: 'mil-1787842613623',
    name: 'Milena',
    matricula: 'Mil-MIL',
    cpfMasked: '***.331.704-**',
    phone: '(48) 98844-9912',
    email: 'milena.militancia@campanhasj.com.br',
    teamId: 'team-1787840837258',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 6.2,
    totalStreetsCovered: 6,
    deliveredMaterials: { santinhos: 150, adesivos: 50, adesivo_bola: 8, adesivo_parachoque: 4, colinhas: 100, abordagens: 30, comercio: 28 },
    weeklyGoalPercentage: 90,
    batteryLevel: 95
  },
  {
    id: 'user-militante-01',
    name: 'Carlos Eduardo Ramos',
    matricula: 'Mil001',
    cpfMasked: '***.452.189-**',
    phone: '(48) 99912-7845',
    email: 'cadu.militancia@campanhasj.com.br',
    teamId: 'team-alpha',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 0,
    totalStreetsCovered: 0,
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    weeklyGoalPercentage: 0,
    batteryLevel: 100
  },
  {
    id: 'user-militante-02',
    name: 'Mariana Becker',
    matricula: 'Mil002',
    cpfMasked: '***.892.441-**',
    phone: '(48) 99655-1234',
    email: 'mariana.becker@campanhasj.com.br',
    teamId: 'team-alpha',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 0,
    totalStreetsCovered: 0,
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    weeklyGoalPercentage: 0,
    batteryLevel: 100
  },
  {
    id: 'mil-303',
    name: 'Lucas Pires Scherer',
    matricula: 'Mil003',
    cpfMasked: '***.311.609-**',
    phone: '(48) 99188-4422',
    email: 'lucas.scherer@campanhasj.com.br',
    teamId: 'team-bravo',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 0,
    totalStreetsCovered: 0,
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    weeklyGoalPercentage: 0,
    batteryLevel: 100
  },
  {
    id: 'mil-304',
    name: 'Beatriz Fontes Vieira',
    matricula: 'Mil004',
    cpfMasked: '***.712.980-**',
    phone: '(48) 98833-2190',
    email: 'beatriz.fontes@campanhasj.com.br',
    teamId: 'team-charlie',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 0,
    totalStreetsCovered: 0,
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    weeklyGoalPercentage: 0,
    batteryLevel: 100
  },
  {
    id: 'mil-305',
    name: 'Gabriel Costa Nogueira',
    matricula: 'Mil005',
    cpfMasked: '***.543.210-**',
    phone: '(48) 99119-8765',
    email: 'gabriel.costa@campanhasj.com.br',
    teamId: 'team-delta',
    role: 'militante',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'ativo',
    dailyRate: 150,
    totalKmWalked: 0,
    totalStreetsCovered: 0,
    deliveredMaterials: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    weeklyGoalPercentage: 0,
    batteryLevel: 100
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-alpha',
    name: 'Equipe Alpha (Campinas & Kobrasol)',
    color: '#10b981', // Emerald
    leaderId: 'user-lider-alpha',
    leaderName: 'Juliana Silveira',
    memberIds: ['user-militante-01', 'user-militante-02'],
    assignedVanId: 'van-01',
    targetNeighborhoodIds: ['kobrasol', 'campinas'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  },
  {
    id: 'team-bravo',
    name: 'Equipe Bravo (Barreiros & Bela Vista)',
    color: '#3b82f6', // Blue
    leaderId: 'mil-303',
    leaderName: 'Lucas Pires Scherer',
    memberIds: ['mil-303'],
    assignedVanId: 'van-02',
    targetNeighborhoodIds: ['barreiros', 'bela_vista', 'areias'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  },
  {
    id: 'team-charlie',
    name: 'Equipe Charlie (Forquilhinhas & Potecas)',
    color: '#f59e0b', // Amber
    leaderId: 'mil-304',
    leaderName: 'Beatriz Fontes Vieira',
    memberIds: ['mil-304'],
    assignedVanId: 'van-01',
    targetNeighborhoodIds: ['forquilhinhas', 'potecas', 'forquilhas'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  },
  {
    id: 'team-delta',
    name: 'Equipe Delta (Praia Comprida & Sede)',
    color: '#8b5cf6', // Violet
    leaderId: 'mil-305',
    leaderName: 'Gabriel Costa Nogueira',
    memberIds: ['mil-305'],
    assignedVanId: 'van-03',
    targetNeighborhoodIds: ['praia_comprida', 'rocado', 'fazenda_santo_antonio'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  },
  {
    id: 'team-eco',
    name: 'Equipe Eco (Serraria & Ipiranga)',
    color: '#ec4899', // Pink
    leaderId: 'user-lider-alpha',
    leaderName: 'Juliana Silveira',
    memberIds: [],
    assignedVanId: 'van-02',
    targetNeighborhoodIds: ['serraria', 'ipiranga'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  },
  {
    id: 'team-fox',
    name: 'Equipe Fox (Colônia Santana & Sertão)',
    color: '#06b6d4', // Cyan
    leaderId: 'user-coord-geral',
    leaderName: 'Pedro da Silva Rosa',
    memberIds: [],
    assignedVanId: 'van-03',
    targetNeighborhoodIds: ['sertao_do_maruim', 'colonia_santana', 'picadas_do_sul'],
    dailyProgressPct: 0,
    totalMaterialsDelivered: 0,
    status: 'planejamento'
  }
];

export const INITIAL_VANS: Van[] = [
  {
    id: 'van-01',
    name: 'Van 01 - Alpha & Charlie',
    model: 'Mercedes-Benz Sprinter 516 (19 Lugares)',
    plate: 'RKS-8A24',
    driverName: 'Roberto Valente (Beto)',
    driverPhone: '(48) 98412-9900',
    capacity: 19,
    assignedTeamIds: ['team-alpha', 'team-charlie'],
    status: 'aguardando_resgate',
    currentCoords: { lat: -27.598, lng: -48.622, lastUpdate: 'Agora' },
    nextPickupLocation: 'Comitê Central / Garagem',
    nextPickupTime: '08:00'
  },
  {
    id: 'van-02',
    name: 'Van 02 - Bravo & Eco',
    model: 'Renault Master Grand L3H2 (16 Lugares)',
    plate: 'RKA-3B90',
    driverName: 'Marcos Aurélio Santos',
    driverPhone: '(48) 99155-3344',
    capacity: 16,
    assignedTeamIds: ['team-bravo', 'team-eco'],
    status: 'aguardando_resgate',
    currentCoords: { lat: -27.576, lng: -48.609, lastUpdate: 'Agora' },
    nextPickupLocation: 'Comitê Central / Garagem',
    nextPickupTime: '08:00'
  },
  {
    id: 'van-03',
    name: 'Van 03 - Delta & Fox',
    model: 'Fiat Ducato Minibus (16 Lugares)',
    plate: 'QJC-7F45',
    driverName: 'Claudemir de Oliveira',
    driverPhone: '(48) 99877-1122',
    capacity: 16,
    assignedTeamIds: ['team-delta', 'team-fox'],
    status: 'aguardando_resgate',
    currentCoords: { lat: -27.619, lng: -48.627, lastUpdate: 'Agora' },
    nextPickupLocation: 'Comitê Central / Garagem',
    nextPickupTime: '08:00'
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
    id: "chk-1787944352110",
    militantId: "mil-1787842613622",
    militantName: "Daiana",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhinhas",
    neighborhoodName: "Forquilhinhas",
    streetName: "Rua Manoel Francisco de souza",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 19:12:32",
    latitude: -27.6042,
    longitude: -48.6530,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in de rua confirmado em Forquilhinhas",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787944235558",
    militantId: "mil-1787842613622",
    militantName: "Daiana",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhinhas",
    neighborhoodName: "Forquilhinhas",
    streetName: "Rua allan kardec",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 19:10:35",
    latitude: -27.6078,
    longitude: -48.6552,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in de rua confirmado em Forquilhinhas",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787944129777",
    militantId: "mil-1787842613622",
    militantName: "Daiana",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhinhas",
    neighborhoodName: "Forquilhinhas",
    streetName: "rua Aimoré",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 19:08:49",
    latitude: -27.6095,
    longitude: -48.6515,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 40, comercio: 0 },
    observations: "Militância de abordagem direta em Forquilhinhas",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787943417791",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua aguas de Chapecó",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:56:57",
    latitude: -27.5815,
    longitude: -48.6290,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 150, adesivos: 25, adesivo_bola: 8, adesivo_parachoque: 4, colinhas: 100, abordagens: 20, comercio: 0 },
    observations: "Excelente aceitação da campanha no bairro Bela Vista",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787943331411",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua lagoa da conceição",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:55:31",
    latitude: -27.5832,
    longitude: -48.6315,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 5, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787943252356",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua pantano do sul",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:54:12",
    latitude: -27.5840,
    longitude: -48.6328,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787943199431",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua Daniela",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:53:19",
    latitude: -27.5825,
    longitude: -48.6305,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787942999071",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua Giancarlo Griss Costa",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:49:59",
    latitude: -27.5855,
    longitude: -48.6280,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 5, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787942929846",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua das violetas",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:48:49",
    latitude: -27.5870,
    longitude: -48.6335,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787942872348",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua rua dos jasmins",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:47:52",
    latitude: -27.5862,
    longitude: -48.6340,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787942253428",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua das papoulas",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:37:33",
    latitude: -27.5880,
    longitude: -48.6345,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787942192399",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "bela_vista",
    neighborhoodName: "Bela Vista",
    streetName: "Rua rua candido amaro damasio",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:36:32",
    latitude: -27.5895,
    longitude: -48.6310,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787941749052",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "ipiranga",
    neighborhoodName: "Ipiranga",
    streetName: "rua Antenor Valentin da silva",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:29:09",
    latitude: -27.5910,
    longitude: -48.6395,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787940159378",
    militantId: "mil-1787842613623",
    militantName: "Milena",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhinhas",
    neighborhoodName: "Forquilhinhas",
    streetName: "rua jose Bartolomeu vieira",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:02:39",
    latitude: -27.6055,
    longitude: -48.6540,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 5, comercio: 2 },
    observations: "Abordagens e visitas a comércio em Forquilhinhas",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787940053919",
    militantId: "mil-1787842613623",
    militantName: "Milena",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua vereador Arthur Manoel mariano",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 18:00:53",
    latitude: -27.6020,
    longitude: -48.6620,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 150, adesivos: 25, adesivo_bola: 8, adesivo_parachoque: 4, colinhas: 100, abordagens: 15, comercio: 20 },
    observations: "Comércio local receptivo na principal de Forquilhas",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787939964436",
    militantId: "mil-1787842613623",
    militantName: "Milena",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua vitorino jose Luiz",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:59:24",
    latitude: -27.6080,
    longitude: -48.6650,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 8, adesivo_parachoque: 4, colinhas: 100, abordagens: 5, comercio: 3 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787939922505",
    militantId: "mil-1787842613623",
    militantName: "Milena",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua vitorino jose Luiz (Trecho Sul)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:58:42",
    latitude: -27.6085,
    longitude: -48.6655,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 5, comercio: 3 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787938172640",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua Alexandre plueinsk",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:29:32",
    latitude: -27.6065,
    longitude: -48.6680,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787937786691",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhinhas",
    neighborhoodName: "Forquilhinhas",
    streetName: "rua bernadino freitas de Agostinho",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:23:06",
    latitude: -27.6035,
    longitude: -48.6510,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 0, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787937074076",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua tulio Rodrigues martins",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:11:14",
    latitude: -27.6050,
    longitude: -48.6635,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 0, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 2, comercio: 0 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
  },
  {
    id: "chk-1787937127202",
    militantId: "mil-1787842613621",
    militantName: "Luciano",
    teamId: "team-1787840837258",
    neighborhoodId: "forquilhas",
    neighborhoodName: "Forquilhas",
    streetName: "rua tulio Rodrigues martins (Trecho Leste)",
    houseNumberRange: "Trecho Geral",
    timestamp: "2026-08-28 17:12:07",
    latitude: -27.6052,
    longitude: -48.6630,
    accuracyMeters: 4.2,
    photos: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80"],
    materialsDelivered: { santinhos: 0, adesivos: 25, adesivo_bola: 0, adesivo_parachoque: 0, colinhas: 0, abordagens: 5, comercio: 4 },
    observations: "Check-in realizado em campo",
    status: "validado",
    synced: true
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
    ['forquilhinhas', 'potecas'],
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
      teamsAssigned: ['team-alpha', 'team-bravo', 'team-charlie', 'team-delta'],
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

