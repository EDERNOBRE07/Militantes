export type UserRole = 'admin' | 'coordenador' | 'lider' | 'militante' | 'motorista_van';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  avatar: string;
  phone: string;
  matricula: string;
  lgpdConsent: boolean;
  lgpdConsentDate: string;
}

export type MaterialType = 'santinhos' | 'adesivos' | 'adesivo_bola' | 'adesivo_parachoque' | 'colinhas' | 'abordagens' | 'comercio';

export interface MaterialCount {
  santinhos: number;
  adesivos: number;
  adesivo_bola: number;
  adesivo_parachoque: number;
  colinhas: number;
  abordagens?: number;
  comercio?: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  zone: 'Distrito Sede' | 'Distrito Barreiros' | 'Distrito Forquilhinhas' | 'Distrito Campinas';
  population: number; // IBGE 2022 Census
  households: number; // Domicílios
  votersEstimated: number; // Eleitores estimados
  totalStreets: number;
  completedStreets: number;
  lat: number;
  lng: number;
  polygon: [number, number][];
  priority: 'Alta' | 'Média' | 'Baixa';
  targetMaterials: MaterialCount;
  deliveredMaterials: MaterialCount;
  assignedTeamId?: string;
}

export interface Militant {
  id: string;
  name: string;
  matricula: string;
  cpfMasked: string;
  phone: string;
  email: string;
  teamId: string;
  role: UserRole;
  avatar: string;
  status: 'em_campo' | 'ativo' | 'pausa' | 'inativo';
  currentLocation?: {
    lat: number;
    lng: number;
    streetName: string;
    neighborhoodName: string;
    lastUpdate: string;
  };
  totalKmWalked: number;
  totalStreetsCovered: number;
  deliveredMaterials: MaterialCount;
  weeklyGoalPercentage: number;
  batteryLevel?: number;
  dailyRate?: number; // R$ valor da diária definido no cadastro
}

export interface Team {
  id: string;
  name: string;
  color: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  assignedVanId: string;
  targetNeighborhoodIds: string[];
  dailyProgressPct: number;
  totalMaterialsDelivered: number;
  status: 'em_campo' | 'em_transito' | 'descanso' | 'planejamento';
}

export interface Van {
  id: string;
  name: string;
  model: string;
  plate: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedTeamIds: string[];
  status: 'em_rota' | 'desembarque' | 'aguardando_resgate' | 'garagem';
  currentCoords: { lat: number; lng: number; lastUpdate: string };
  nextPickupLocation: string;
  nextPickupTime: string;
}

export interface StreetCheckIn {
  id: string;
  militantId: string;
  militantName: string;
  teamId: string;
  neighborhoodId: string;
  neighborhoodName: string;
  streetName: string;
  houseNumberRange: string;
  timestamp: string; // ISO date string
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  photos: string[];
  materialsDelivered: MaterialCount;
  observations?: string;
  status: 'validado' | 'pendente_auditoria' | 'rejeitado';
  synced: boolean;
}

export interface CampaignCalendarDay {
  id: string;
  date: string; // YYYY-MM-DD (e.g. '2026-08-26')
  dayOfWeek: string;
  dayNumber: number; // 1 to 39
  targetNeighborhoodIds: string[];
  teamsAssigned: string[];
  expectedStreetGoal: number;
  expectedMaterialsGoal: number;
  vanRoutePlan: {
    vanId: string;
    departureTime: string;
    pickupPoint: string;
    dropoffPoint: string;
    returnTime: string;
    coordinatorNotes: string;
  }[];
  status: 'concluido' | 'em_andamento' | 'planejado';
  completionRate?: number;
}

export interface StockItem {
  id: string;
  name: string;
  code: string;
  type: MaterialType;
  description: string;
  totalReceived: number;
  dispatched: number;
  currentStock: number;
  minThreshold: number;
  unit: string;
  imageIcon: string;
}

export interface StockTransaction {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  teamId?: string;
  teamName?: string;
  militantId?: string;
  militantName?: string;
  type: 'entrada' | 'saida_equipe' | 'devolucao' | 'ajuste';
  quantity: number;
  receiptNumber: string;
  operatorName: string;
  notes?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgente' | 'meta' | 'van_logistica' | 'sistema' | 'estoque';
  targetRole?: UserRole | 'todos';
  targetTeamId?: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface ActivityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'AUTENTICACAO' | 'CHECKIN_RUA' | 'ESTOQUE' | 'RELATORIO' | 'LGPD' | 'ROTA_VAN' | 'CADASTROS' | 'FOLHA_PAGAMENTO';
  ipAddress: string;
  details: string;
}

export interface VanRouteLog {
  id: string;
  vanId: string;
  vanName?: string;
  vanPlate: string;
  driverName: string;
  driverPhone?: string;
  shift: 'manha' | 'tarde' | 'integral';
  period?: 'manha' | 'tarde' | 'integral';
  date: string;
  neighborhoodId: string;
  neighborhoodName: string;
  streetRoute?: string;
  streetsCovered?: string[];
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  photos: string[];
  passengersCount?: number;
  observations?: string;
  notes?: string;
  timestamp: string;
  checkInStatus?: 'em_andamento' | 'desembarcado' | 'concluido' | 'aguardando_resgate';
  status: 'em_rota' | 'concluido' | 'aguardando_resgate';
}

export type DayWorkValue = 1 | 0.5 | 0 | boolean;

export interface DaysWorkedSchedule {
  seg: DayWorkValue; // Segunda (1=integral, 0.5=meia diária, 0=folga)
  ter: DayWorkValue; // Terça
  qua: DayWorkValue; // Quarta
  qui: DayWorkValue; // Quinta
  sex: DayWorkValue; // Sexta
  sab: DayWorkValue; // Sábado
  dom: DayWorkValue; // Domingo
}

export interface WeeklyPayrollItem {
  id: string;
  workerId: string;
  workerName: string;
  role: UserRole;
  matricula: string;
  cpfMasked: string;
  phone: string;
  pixKey: string;
  pixType: 'CPF' | 'Telefone' | 'Email' | 'Chave Aleatória';
  teamId?: string;
  teamName?: string;
  dailyRate: number; // R$ 150,00 (militante) or R$ 250,00 (lider/motorista)
  daysWorked: number; // 0 to 7
  daysSchedule: DaysWorkedSchedule;
  bonus: number;
  deductions: number;
  totalAmount: number; // (dailyRate * daysWorked) + bonus - deductions
  status: 'pendente' | 'aprovado' | 'pago';
  paymentDate?: string;
  paymentReceiptNumber?: string;
  notes?: string;
}

export interface WeeklyPayroll {
  id: string;
  weekNumber: number; // 1 to 6
  weekLabel: string;
  startDate: string;
  endDate: string;
  items: WeeklyPayrollItem[];
  status: 'aberta' | 'em_analise' | 'fechada_paga';
  totalWeeklyAmount: number;
  totalDaysWorked: number;
  totalWorkersPaid: number;
  totalMilitantsAmount: number;
  totalLeadersAmount: number;
  totalDriversAmount: number;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  matricula: string;
  phone: string;
  role: 'admin';
  pinCode: string; // PIN for quick biometric/admin elevation check
  securityLevel: 'super_admin' | 'financeiro' | 'coordenador_geral';
  createdAt: string;
  active: boolean;
}

export interface StrategicMetrics {
  totalStreetsSaoJose: number;
  coveredStreets: number;
  coveragePercentage: number;
  totalPopulationReach: number;
  totalVotersReach: number;
  materialsTotalDelivered: MaterialCount;
  materialsTotalStock: MaterialCount;
  activeMilitantsInField: number;
  activeTeamsInField: number;
  daysRemainingCampaign: number; // Until 03/10/2026
}

export interface CheckInSyncResult {
  success: boolean;
  status: 'synced_mysql' | 'queued_offline' | 'error_retry';
  destination: string;
  message: string;
  checkIn: StreetCheckIn;
  latencyMs?: number;
  networkError?: string;
  httpStatus?: number;
  hostingerDatabase?: string;
  syncTimestamp: string;
}

export interface HostingerConnectionStatus {
  connected: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'CONFIGURACAO_PENDENTE';
  endpoint: string;
  database: string;
  latencyMs?: number;
  message: string;
  lastChecked: string;
  error?: string;
}


