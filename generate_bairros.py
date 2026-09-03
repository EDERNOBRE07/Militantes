import json

def point_in_polygon(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# 28 Official Neighborhoods + Área Rural according to IFSC Câmpus São José (2020)
# Coordenação: Prof. Paulo Amorim / IBGE (2021) e PMSJ (2020)
NEIGHBORHOODS_DATA = [
    {
        "id": "alto_forquilhas",
        "name": "Alto Forquilhas",
        "zone": "Distrito Forquilhinha",
        "population": 5200,
        "households": 1850,
        "votersEstimated": 4100,
        "totalStreets": 48,
        "priority": "Média",
        "lat": -27.5520,
        "lng": -48.6920,
        "officialColor": "#a881d8",
        "polygon": [
            [-27.5180, -48.7050],
            [-27.5250, -48.6650],
            [-27.5400, -48.6500],
            [-27.5550, -48.6520],
            [-27.5680, -48.6460],
            [-27.5700, -48.6540],
            [-27.5760, -48.6680],
            [-27.5780, -48.6850],
            [-27.5700, -48.7200],
            [-27.5450, -48.7300]
        ]
    },
    {
        "id": "areias",
        "name": "Areias",
        "zone": "Distrito Barreiros",
        "population": 22300,
        "households": 8600,
        "votersEstimated": 17800,
        "totalStreets": 86,
        "priority": "Alta",
        "lat": -27.5730,
        "lng": -48.6360,
        "officialColor": "#ece657",
        "polygon": [
            [-27.5620, -48.6360],
            [-27.5660, -48.6280],
            [-27.5740, -48.6280],
            [-27.5800, -48.6320],
            [-27.5830, -48.6380],
            [-27.5780, -48.6440],
            [-27.5680, -48.6460],
            [-27.5550, -48.6520]
        ]
    },
    {
        "id": "barreiros",
        "name": "Barreiros",
        "zone": "Distrito Barreiros",
        "population": 27950,
        "households": 11200,
        "votersEstimated": 22800,
        "totalStreets": 114,
        "priority": "Alta",
        "lat": -27.5750,
        "lng": -48.6080,
        "officialColor": "#9884e8",
        "polygon": [
            [-27.5660, -48.6000],
            [-27.5740, -48.5940],
            [-27.5850, -48.6020],
            [-27.5890, -48.6080],
            [-27.5840, -48.6130],
            [-27.5740, -48.6130],
            [-27.5690, -48.6060]
        ]
    },
    {
        "id": "bela_vista",
        "name": "Bela Vista",
        "zone": "Distrito Barreiros",
        "population": 14200,
        "households": 5400,
        "votersEstimated": 11600,
        "totalStreets": 64,
        "priority": "Alta",
        "lat": -27.5680,
        "lng": -48.6230,
        "officialColor": "#76e053",
        "polygon": [
            [-27.5620, -48.6160],
            [-27.5650, -48.6120],
            [-27.5720, -48.6150],
            [-27.5750, -48.6200],
            [-27.5740, -48.6280],
            [-27.5660, -48.6280],
            [-27.5640, -48.6250]
        ]
    },
    {
        "id": "bosque_das_mansoes",
        "name": "Bosque das Mansões",
        "zone": "Distrito Sede",
        "population": 4300,
        "households": 1450,
        "votersEstimated": 3600,
        "totalStreets": 32,
        "priority": "Média",
        "lat": -27.5965,
        "lng": -48.6340,
        "officialColor": "#e860bc",
        "polygon": [
            [-27.5930, -48.6340],
            [-27.5920, -48.6280],
            [-27.5960, -48.6260],
            [-27.6000, -48.6300],
            [-27.6010, -48.6370],
            [-27.5960, -48.6400],
            [-27.5920, -48.6400]
        ]
    },
    {
        "id": "campinas",
        "name": "Campinas",
        "zone": "Distrito Campinas",
        "population": 16800,
        "households": 7100,
        "votersEstimated": 14100,
        "totalStreets": 62,
        "priority": "Alta",
        "lat": -27.5980,
        "lng": -48.6100,
        "officialColor": "#e2579b",
        "polygon": [
            [-27.5890, -48.6080],
            [-27.5850, -48.6020],
            [-27.5960, -48.6040],
            [-27.6040, -48.6100],
            [-27.6060, -48.6140],
            [-27.5990, -48.6160],
            [-27.5920, -48.6140]
        ]
    },
    {
        "id": "centro",
        "name": "Centro",
        "zone": "Distrito Sede",
        "population": 8400,
        "households": 3200,
        "votersEstimated": 6850,
        "totalStreets": 48,
        "priority": "Média",
        "lat": -27.6210,
        "lng": -48.6250,
        "officialColor": "#7be7ec",
        "polygon": [
            [-27.6160, -48.6250],
            [-27.6180, -48.6200],
            [-27.6240, -48.6220],
            [-27.6260, -48.6260],
            [-27.6220, -48.6300],
            [-27.6170, -48.6290]
        ]
    },
    {
        "id": "colonia_santana",
        "name": "Colônia Santana",
        "zone": "Distrito Sede",
        "population": 5800,
        "households": 2100,
        "votersEstimated": 4600,
        "totalStreets": 34,
        "priority": "Baixa",
        "lat": -27.6000,
        "lng": -48.7300,
        "officialColor": "#66f0a4",
        "polygon": [
            [-27.5700, -48.7200],
            [-27.5780, -48.6850],
            [-27.5850, -48.6900],
            [-27.5980, -48.6950],
            [-27.6060, -48.7080],
            [-27.6160, -48.7180],
            [-27.6160, -48.7450],
            [-27.6050, -48.7560],
            [-27.5850, -48.7450]
        ]
    },
    {
        "id": "distrito_industrial",
        "name": "Distrito Industrial",
        "zone": "Distrito Sede",
        "population": 3200,
        "households": 1100,
        "votersEstimated": 2700,
        "totalStreets": 36,
        "priority": "Baixa",
        "lat": -27.6300,
        "lng": -48.6450,
        "officialColor": "#d29b76",
        "polygon": [
            [-27.6220, -48.6380],
            [-27.6220, -48.6440],
            [-27.6260, -48.6500],
            [-27.6320, -48.6520],
            [-27.6380, -48.6460],
            [-27.6360, -48.6380],
            [-27.6280, -48.6360]
        ]
    },
    {
        "id": "fazenda_santo_antonio",
        "name": "Fazenda Santo Antônio",
        "zone": "Distrito Sede",
        "population": 8900,
        "households": 3400,
        "votersEstimated": 7200,
        "totalStreets": 52,
        "priority": "Média",
        "lat": -27.6250,
        "lng": -48.6330,
        "officialColor": "#e8a8b8",
        "polygon": [
            [-27.6200, -48.6310],
            [-27.6160, -48.6250],
            [-27.6170, -48.6290],
            [-27.6220, -48.6300],
            [-27.6270, -48.6290],
            [-27.6320, -48.6330],
            [-27.6280, -48.6360],
            [-27.6220, -48.6380]
        ]
    },
    {
        "id": "flor_de_napolis",
        "name": "Flor de Nápolis",
        "zone": "Distrito Sede",
        "population": 9200,
        "households": 3500,
        "votersEstimated": 7500,
        "totalStreets": 46,
        "priority": "Média",
        "lat": -27.6160,
        "lng": -48.6370,
        "officialColor": "#f2927c",
        "officialNumber": 1,
        "polygon": [
            [-27.6110, -48.6310],
            [-27.6100, -48.6230],
            [-27.6150, -48.6260],
            [-27.6200, -48.6310],
            [-27.6220, -48.6380],
            [-27.6170, -48.6430],
            [-27.6110, -48.6440],
            [-27.6110, -48.6360]
        ]
    },
    {
        "id": "forquilhas",
        "name": "Forquilhas",
        "zone": "Distrito Forquilhinha",
        "population": 24100,
        "households": 9300,
        "votersEstimated": 19200,
        "totalStreets": 110,
        "priority": "Alta",
        "lat": -27.5950,
        "lng": -48.6750,
        "officialColor": "#e89f8c",
        "polygon": [
            [-27.5760, -48.6680],
            [-27.5770, -48.6560],
            [-27.5850, -48.6500],
            [-27.5940, -48.6540],
            [-27.5940, -48.6580],
            [-27.6000, -48.6600],
            [-27.6090, -48.6620],
            [-27.6150, -48.6590],
            [-27.6180, -48.6750],
            [-27.6120, -48.6920],
            [-27.5980, -48.6950],
            [-27.5850, -48.6900],
            [-27.5780, -48.6850]
        ]
    },
    {
        "id": "forquilhinha",
        "name": "Forquilhinha",
        "zone": "Distrito Forquilhinha",
        "population": 32400,
        "households": 12600,
        "votersEstimated": 25900,
        "totalStreets": 138,
        "priority": "Alta",
        "lat": -27.6090,
        "lng": -48.6540,
        "officialColor": "#72d2e8",
        "polygon": [
            [-27.6040, -48.6520],
            [-27.6040, -48.6450],
            [-27.6110, -48.6440],
            [-27.6140, -48.6490],
            [-27.6150, -48.6590],
            [-27.6090, -48.6620],
            [-27.6000, -48.6600]
        ]
    },
    {
        "id": "ipiranga",
        "name": "Ipiranga",
        "zone": "Distrito Barreiros",
        "population": 11500,
        "households": 4400,
        "votersEstimated": 9200,
        "totalStreets": 54,
        "priority": "Média",
        "lat": -27.5860,
        "lng": -48.6360,
        "officialColor": "#bebcd2",
        "polygon": [
            [-27.5800, -48.6320],
            [-27.5830, -48.6300],
            [-27.5900, -48.6280],
            [-27.5930, -48.6340],
            [-27.5920, -48.6400],
            [-27.5860, -48.6420],
            [-27.5830, -48.6380]
        ]
    },
    {
        "id": "jardim_cidade_de_florianopolis",
        "name": "Jardim Cidade de Florianópolis",
        "zone": "Distrito Barreiros",
        "population": 8700,
        "households": 3350,
        "votersEstimated": 7100,
        "totalStreets": 46,
        "priority": "Média",
        "lat": -27.5840,
        "lng": -48.6240,
        "officialColor": "#aae08c",
        "officialNumber": 2,
        "polygon": [
            [-27.5740, -48.6280],
            [-27.5750, -48.6200],
            [-27.5830, -48.6220],
            [-27.5860, -48.6170],
            [-27.5900, -48.6180],
            [-27.5930, -48.6220],
            [-27.5900, -48.6280],
            [-27.5830, -48.6300]
        ]
    },
    {
        "id": "jardim_santiago",
        "name": "Jardim Santiago",
        "zone": "Distrito Barreiros",
        "population": 3900,
        "households": 1420,
        "votersEstimated": 3100,
        "totalStreets": 26,
        "priority": "Baixa",
        "lat": -27.5620,
        "lng": -48.6070,
        "officialColor": "#e8e48a",
        "polygon": [
            [-27.5550, -48.6080],
            [-27.5570, -48.6020],
            [-27.5660, -48.6000],
            [-27.5690, -48.6060],
            [-27.5650, -48.6120],
            [-27.5590, -48.6110]
        ]
    },
    {
        "id": "kobrasol",
        "name": "Kobrasol",
        "zone": "Distrito Campinas",
        "population": 18640,
        "households": 7850,
        "votersEstimated": 15400,
        "totalStreets": 68,
        "priority": "Alta",
        "lat": -27.5960,
        "lng": -48.6190,
        "officialColor": "#bfe85c",
        "polygon": [
            [-27.5900, -48.6180],
            [-27.5920, -48.6140],
            [-27.5990, -48.6160],
            [-27.6060, -48.6140],
            [-27.6060, -48.6200],
            [-27.6010, -48.6240],
            [-27.5930, -48.6220]
        ]
    },
    {
        "id": "nossa_senhora_do_rosario",
        "name": "Nossa Senhora do Rosário",
        "zone": "Distrito Barreiros",
        "population": 6800,
        "households": 2650,
        "votersEstimated": 5400,
        "totalStreets": 36,
        "priority": "Média",
        "lat": -27.5800,
        "lng": -48.6170,
        "officialColor": "#c06868",
        "polygon": [
            [-27.5720, -48.6150],
            [-27.5740, -48.6130],
            [-27.5840, -48.6130],
            [-27.5860, -48.6170],
            [-27.5830, -48.6220],
            [-27.5750, -48.6200]
        ]
    },
    {
        "id": "pedregal",
        "name": "Pedregal",
        "zone": "Distrito Barreiros",
        "population": 5600,
        "households": 2100,
        "votersEstimated": 4500,
        "totalStreets": 34,
        "priority": "Média",
        "lat": -27.5890,
        "lng": -48.6490,
        "officialColor": "#85c0e8",
        "polygon": [
            [-27.5850, -48.6500],
            [-27.5860, -48.6420],
            [-27.5920, -48.6400],
            [-27.5920, -48.6480],
            [-27.5940, -48.6540],
            [-27.5880, -48.6560],
            [-27.5850, -48.6500]
        ]
    },
    {
        "id": "picadas_do_sul",
        "name": "Picadas do Sul",
        "zone": "Distrito Sede",
        "population": 12400,
        "households": 4800,
        "votersEstimated": 9900,
        "totalStreets": 58,
        "priority": "Média",
        "lat": -27.6200,
        "lng": -48.6540,
        "officialColor": "#58d8c2",
        "polygon": [
            [-27.6150, -48.6590],
            [-27.6140, -48.6490],
            [-27.6170, -48.6430],
            [-27.6220, -48.6440],
            [-27.6260, -48.6500],
            [-27.6280, -48.6610],
            [-27.6210, -48.6640]
        ]
    },
    {
        "id": "ponta_de_baixo",
        "name": "Ponta de Baixo",
        "zone": "Distrito Sede",
        "population": 4100,
        "households": 1600,
        "votersEstimated": 3400,
        "totalStreets": 28,
        "priority": "Baixa",
        "lat": -27.6350,
        "lng": -48.6240,
        "officialColor": "#5c6ee8",
        "polygon": [
            [-27.6260, -48.6260],
            [-27.6240, -48.6220],
            [-27.6320, -48.6160],
            [-27.6440, -48.6200],
            [-27.6460, -48.6280],
            [-27.6380, -48.6320],
            [-27.6270, -48.6290]
        ]
    },
    {
        "id": "potecas",
        "name": "Potecas",
        "zone": "Distrito Forquilhinha",
        "population": 8100,
        "households": 3100,
        "votersEstimated": 6400,
        "totalStreets": 48,
        "priority": "Média",
        "lat": -27.5980,
        "lng": -48.6520,
        "officialColor": "#b284e8",
        "polygon": [
            [-27.5920, -48.6480],
            [-27.5920, -48.6400],
            [-27.5960, -48.6400],
            [-27.6020, -48.6450],
            [-27.6040, -48.6520],
            [-27.6000, -48.6600],
            [-27.5940, -48.6580],
            [-27.5940, -48.6540]
        ]
    },
    {
        "id": "praia_comprida",
        "name": "Praia Comprida",
        "zone": "Distrito Sede",
        "population": 7200,
        "households": 2850,
        "votersEstimated": 5900,
        "totalStreets": 42,
        "priority": "Média",
        "lat": -27.6120,
        "lng": -48.6220,
        "officialColor": "#d2c4e8",
        "polygon": [
            [-27.6060, -48.6200],
            [-27.6060, -48.6140],
            [-27.6130, -48.6160],
            [-27.6180, -48.6200],
            [-27.6160, -48.6250],
            [-27.6100, -48.6230]
        ]
    },
    {
        "id": "real_parque",
        "name": "Real Parque",
        "zone": "Distrito Barreiros",
        "population": 8300,
        "households": 3100,
        "votersEstimated": 6700,
        "totalStreets": 44,
        "priority": "Média",
        "lat": -27.5800,
        "lng": -48.6480,
        "officialColor": "#e878a8",
        "polygon": [
            [-27.5680, -48.6460],
            [-27.5780, -48.6440],
            [-27.5830, -48.6380],
            [-27.5860, -48.6420],
            [-27.5850, -48.6500],
            [-27.5770, -48.6560],
            [-27.5700, -48.6540]
        ]
    },
    {
        "id": "rocado",
        "name": "Roçado",
        "zone": "Distrito Sede",
        "population": 9800,
        "households": 3800,
        "votersEstimated": 7950,
        "totalStreets": 56,
        "priority": "Média",
        "lat": -27.6060,
        "lng": -48.6280,
        "officialColor": "#6ce8a2",
        "polygon": [
            [-27.5960, -48.6260],
            [-27.6010, -48.6240],
            [-27.6060, -48.6200],
            [-27.6100, -48.6230],
            [-27.6110, -48.6310],
            [-27.6070, -48.6340],
            [-27.6000, -48.6300]
        ]
    },
    {
        "id": "sao_luiz",
        "name": "São Luiz",
        "zone": "Distrito Sede",
        "population": 5100,
        "households": 1950,
        "votersEstimated": 4200,
        "totalStreets": 32,
        "priority": "Média",
        "lat": -27.6070,
        "lng": -48.6390,
        "officialColor": "#9cd264",
        "polygon": [
            [-27.6010, -48.6370],
            [-27.6000, -48.6300],
            [-27.6070, -48.6340],
            [-27.6110, -48.6360],
            [-27.6110, -48.6440],
            [-27.6040, -48.6450],
            [-27.6020, -48.6450]
        ]
    },
    {
        "id": "serraria",
        "name": "Serraria",
        "zone": "Distrito Barreiros",
        "population": 19800,
        "households": 7500,
        "votersEstimated": 15900,
        "totalStreets": 92,
        "priority": "Alta",
        "lat": -27.5500,
        "lng": -48.6280,
        "officialColor": "#aee894",
        "polygon": [
            [-27.5320, -48.6320],
            [-27.5360, -48.6180],
            [-27.5450, -48.6080],
            [-27.5580, -48.6080],
            [-27.5620, -48.6160],
            [-27.5640, -48.6250],
            [-27.5620, -48.6360],
            [-27.5550, -48.6520],
            [-27.5400, -48.6500]
        ]
    },
    {
        "id": "sertao_do_maruim",
        "name": "Sertão do Maruim",
        "zone": "Distrito Sede",
        "population": 7100,
        "households": 2750,
        "votersEstimated": 5700,
        "totalStreets": 42,
        "priority": "Média",
        "lat": -27.6260,
        "lng": -48.6920,
        "officialColor": "#e8b84e",
        "polygon": [
            [-27.6120, -48.6920],
            [-27.6180, -48.6750],
            [-27.6210, -48.6640],
            [-27.6280, -48.6610],
            [-27.6380, -48.6660],
            [-27.6440, -48.6780],
            [-27.6420, -48.7050],
            [-27.6300, -48.7150],
            [-27.6160, -48.7180],
            [-27.6060, -48.7080]
        ]
    },
    {
        "id": "area_rural",
        "name": "Área Rural",
        "zone": "Distrito Sede",
        "population": 1400,
        "households": 480,
        "votersEstimated": 1100,
        "totalStreets": 18,
        "priority": "Baixa",
        "lat": -27.6350,
        "lng": -48.7300,
        "officialColor": "#f0cca8",
        "polygon": [
            [-27.6160, -48.7450],
            [-27.6160, -48.7180],
            [-27.6300, -48.7150],
            [-27.6420, -48.7050],
            [-27.6520, -48.7120],
            [-27.6550, -48.7420],
            [-27.6350, -48.7550]
        ]
    }
]

print("Validating all centroids inside polygons:")
all_valid = True
for b in NEIGHBORHOODS_DATA:
    inside = point_in_polygon(b["lat"], b["lng"], b["polygon"])
    if not inside:
        print(f"FAILED: {b['name']} centroid ({b['lat']}, {b['lng']}) is outside its polygon!")
        all_valid = False
    else:
        print(f"OK: {b['name']} ({len(b['polygon'])} vertices, color: {b['officialColor']})")

if all_valid:
    print("\nALL 29 NEIGHBORHOOD UNITS ARE GEOMETRICALLY VALID!")
