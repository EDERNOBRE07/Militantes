import { BairroAction } from '../types';

export const INITIAL_BAIRRO_ACTIONS: BairroAction[] = [
  {
    id: 'act-kobrasol-praca-01',
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    title: 'Bandeiraço e Caminhada Cívica na Praça Eugênio Raulino Koerich',
    locationType: 'praca',
    locationName: 'Praça Eugênio Raulino Koerich',
    actionType: 'bandeiraco',
    scope: 'toda_equipe',
    teamId: 'team-alpha',
    teamName: 'Equipe Alpha',
    hasGps: true,
    latitude: -27.5958,
    longitude: -48.6185,
    accuracyMeters: 3.2,
    address: 'Rua Koesa c/ Rua Adhemar da Silva, Kobrasol',
    timestamp: '2026-09-24 10:30:00',
    photos: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&auto=format&fit=crop&q=80'
    ],
    estimatedPeople: 380,
    materialsDistributed: {
      santinhos: 650,
      adesivos: 180,
      adesivo_bola: 95,
      panfletos: 400,
      bandeiras: 25
    },
    observations: 'Ação com toda a equipe reunida na praça central do Kobrasol. Grande receptividade dos pedestres e comerciantes locais.',
    status: 'concluida',
    createdBy: 'mil-01',
    createdByName: 'Militante 01',
    createdAt: '2026-09-24 10:30:00'
  },
  {
    id: 'act-kobrasol-mercado-02',
    neighborhoodId: 'kobrasol',
    neighborhoodName: 'Kobrasol',
    title: 'Abordagens e Distribuição de Materiais no Supermercado Imperatriz',
    locationType: 'supermercado',
    locationName: 'Supermercado Imperatriz Kobrasol',
    actionType: 'abordagens',
    scope: 'grupo',
    militantIds: ['mil-01', 'mil-02', 'mil-03'],
    militantNames: ['Militante 01', 'Militante 02', 'Militante 03'],
    teamId: 'team-alpha',
    teamName: 'Equipe Alpha',
    hasGps: true,
    latitude: -27.5942,
    longitude: -48.6198,
    accuracyMeters: 4.1,
    address: 'Av. Lédio João Martins, 800, Kobrasol',
    timestamp: '2026-09-25 15:45:00',
    photos: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=900&auto=format&fit=crop&q=80'
    ],
    estimatedPeople: 210,
    materialsDistributed: {
      santinhos: 320,
      adesivos: 75,
      adesivo_bola: 40,
      panfletos: 150
    },
    observations: 'Grupo de 3 militantes atuando na entrada e estacionamento externo do supermercado, conversando com famílias e consumidores.',
    status: 'concluida',
    createdBy: 'mil-02',
    createdByName: 'Militante 02',
    createdAt: '2026-09-25 15:45:00'
  },
  {
    id: 'act-campinas-calcadao-01',
    neighborhoodId: 'campinas',
    neighborhoodName: 'Campinas',
    title: 'Caminhada e Corpo a Corpo no Calçadão de Campinas',
    locationType: 'calcadao',
    locationName: 'Calçadão Comercial de Campinas / Av. Central',
    actionType: 'caminhada',
    scope: 'toda_equipe',
    teamId: 'team-alpha',
    teamName: 'Equipe Alpha',
    hasGps: true,
    latitude: -27.5991,
    longitude: -48.6163,
    accuracyMeters: 2.8,
    address: 'Av. Central de Campinas, São José',
    timestamp: '2026-09-23 11:15:00',
    photos: [
      'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&auto=format&fit=crop&q=80'
    ],
    estimatedPeople: 450,
    materialsDistributed: {
      santinhos: 800,
      adesivos: 220,
      adesivo_bola: 110,
      panfletos: 500,
      bandeiras: 18
    },
    observations: 'Caminhada geral pelo calçadão movimentado, com diálogos diretos com lojistas e pedestres.',
    status: 'concluida',
    createdBy: 'mil-03',
    createdByName: 'Militante 03',
    createdAt: '2026-09-23 11:15:00'
  },
  {
    id: 'act-barreiros-escola-01',
    neighborhoodId: 'barreiros',
    neighborhoodName: 'Barreiros',
    title: 'Ação Informativa e Diálogo no Entorno da Escola Básica Municipal',
    locationType: 'escola',
    locationName: 'Escola Básica Municipal Altino Flores',
    actionType: 'distribuicao_materiais',
    scope: 'individual',
    militantId: 'mil-05',
    militantName: 'Militante 05',
    teamId: 'team-bravo',
    teamName: 'Equipe Bravo',
    hasGps: true,
    latitude: -27.5768,
    longitude: -48.6254,
    accuracyMeters: 4.5,
    address: 'Rua Eugênio Portela, Barreiros',
    timestamp: '2026-09-24 17:00:00',
    photos: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=900&auto=format&fit=crop&q=80'
    ],
    estimatedPeople: 140,
    materialsDistributed: {
      santinhos: 180,
      adesivos: 40,
      panfletos: 120
    },
    observations: 'Ação no horário de saída escolar, conversando com pais e responsáveis sobre propostas para a educação.',
    status: 'concluida',
    createdBy: 'mil-05',
    createdByName: 'Militante 05',
    createdAt: '2026-09-24 17:00:00'
  },
  {
    id: 'act-forquilhinhas-feira-01',
    neighborhoodId: 'forquilhinhas',
    neighborhoodName: 'Forquilhinhas',
    title: 'Presença e Panfletagem na Feira Livre e Mercado Municipal',
    locationType: 'feira',
    locationName: 'Feira Livre e Praça da Matriz de Forquilhinhas',
    actionType: 'corpo_a_corpo',
    scope: 'grupo',
    militantIds: ['mil-08', 'mil-09', 'mil-10'],
    militantNames: ['Militante 08', 'Militante 09', 'Militante 10'],
    teamId: 'team-bravo',
    teamName: 'Equipe Bravo',
    hasGps: false, // exemplo de geolocalização não utilizada, conforme o requisito do usuário ("geolocalização, que poderá ser usada ou não")
    address: 'Rua Vereador Arthur Mariano, centro de Forquilhinhas',
    timestamp: '2026-09-25 09:00:00',
    photos: [
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=900&auto=format&fit=crop&q=80'
    ],
    estimatedPeople: 320,
    materialsDistributed: {
      santinhos: 450,
      adesivos: 110,
      adesivo_bola: 60,
      panfletos: 280
    },
    observations: 'Registro sem coordenadas GPS exatas, com foco nos feirantes e famílias na feira de sábado.',
    status: 'concluida',
    createdBy: 'mil-08',
    createdByName: 'Militante 08',
    createdAt: '2026-09-25 09:00:00'
  }
];
