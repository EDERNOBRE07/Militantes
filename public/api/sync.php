<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==============================================================================
// API de Sincronização em Tempo Real MySQL Hostinger
// Domínio: militancia.mastervisionmarketing.com
// Sincroniza dados entre Celular, Computador e múltiplos dispositivos da campanha
// ==============================================================================

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

// Garante a existência das tabelas principais caso ainda não existam no MySQL
if ($pdo) {
    try {
        // 1. Tabela de estado sincronizado do sistema (Garante persistência total e compatibilidade entre versões)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS app_sync_state (
                key_name VARCHAR(64) PRIMARY KEY,
                json_data LONGTEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                device_info VARCHAR(255) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 2. Tabela relacional de Check-ins de Campo
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS checkins_ruas (
                id VARCHAR(64) PRIMARY KEY,
                militante_id VARCHAR(64) NOT NULL,
                militante_nome VARCHAR(255) NOT NULL,
                equipe_id VARCHAR(64) DEFAULT 'team-alpha',
                bairro_id VARCHAR(64) NOT NULL,
                bairro_nome VARCHAR(255) NOT NULL,
                nome_rua VARCHAR(255) NOT NULL,
                faixa_numeracao VARCHAR(100) DEFAULT '',
                timestamp_checkin DATETIME DEFAULT CURRENT_TIMESTAMP,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                precisao_gps_metros DECIMAL(6, 2) DEFAULT 4.0,
                qtd_santinhos INT DEFAULT 0,
                qtd_adesivos INT DEFAULT 0,
                qtd_adesivo_bola INT DEFAULT 0,
                qtd_adesivo_parachoque INT DEFAULT 0,
                qtd_colinhas INT DEFAULT 0,
                qtd_abordagens INT DEFAULT 0,
                qtd_comercio INT DEFAULT 0,
                observacoes TEXT,
                fotos_json LONGTEXT,
                status_auditoria VARCHAR(50) DEFAULT 'validado',
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // 3. Tabela relacional de Militantes
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS militantes_cadastrados (
                id VARCHAR(64) PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                matricula VARCHAR(50) NOT NULL,
                cargo VARCHAR(50) DEFAULT 'militante',
                equipe_id VARCHAR(64) DEFAULT 'team-alpha',
                telefone VARCHAR(50) NULL,
                status VARCHAR(50) DEFAULT 'ativo',
                meta_ruas INT DEFAULT 8,
                meta_materiais INT DEFAULT 500,
                dados_json LONGTEXT NULL,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_matricula (matricula)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Se a tabela já existia com UNIQUE na matricula, tenta remover para evitar travamentos em edições
        try {
            $pdo->exec("ALTER TABLE militantes_cadastrados DROP INDEX matricula");
        } catch (Exception $eDrop) {}

        // 4. Tabela relacional de Vans e Motoristas
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS vans_cadastradas (
                id VARCHAR(64) PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                motorista_nome VARCHAR(255) NOT NULL,
                placa VARCHAR(20) NOT NULL,
                telefone VARCHAR(50) NULL,
                pix VARCHAR(100) NULL,
                capacidade INT DEFAULT 12,
                ativo TINYINT(1) DEFAULT 1,
                dados_json LONGTEXT NULL,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {
        // Tratamento silencioso
    }
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Retorna o estado sincronizado armazenado no MySQL ou Cofre do Servidor
if ($method === 'GET') {
    $state = [];
    $lastUpdated = null;

    // 1. Tenta carregar do disco local (data_server_vault.json) como base inicial
    $diskVaultPath = __DIR__ . '/data_server_vault.json';
    if (file_exists($diskVaultPath)) {
        $rawDisk = file_get_contents($diskVaultPath);
        if ($rawDisk) {
            $diskData = json_decode($rawDisk, true);
            if (is_array($diskData)) {
                $state = $diskData;
            }
        }
    }

    // 2. Se o MySQL estiver disponível, consulta app_sync_state e a tabela relacional checkins_ruas
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT key_name, json_data, updated_at FROM app_sync_state");
            $rows = $stmt->fetchAll();
            
            foreach ($rows as $row) {
                $key = $row['key_name'];
                $decoded = json_decode($row['json_data'], true);
                $state[$key] = $decoded;
                if (!$lastUpdated || $row['updated_at'] > $lastUpdated) {
                    $lastUpdated = $row['updated_at'];
                }
            }

            // Carrega ou inicializa a blacklist de IDs excluídos
            $deletedVault = isset($state['deleted_entities_vault']) && is_array($state['deleted_entities_vault'])
                ? $state['deleted_entities_vault']
                : [];
            $blacklistMap = [];
            foreach ($deletedVault as $delId) {
                if ($delId) $blacklistMap[strval($delId)] = true;
            }

            // Consulta também diretamente a tabela relacional checkins_ruas para garantir 100% de integridade
            try {
                $stmtCheckins = $pdo->query("SELECT * FROM checkins_ruas ORDER BY timestamp_checkin DESC LIMIT 500");
                $chkRows = $stmtCheckins->fetchAll();
                if ($chkRows && count($chkRows) > 0) {
                    $relationalCheckins = [];
                    foreach ($chkRows as $r) {
                        $cId = strval($r['id']);
                        $mId = strval($r['militante_id']);
                        if (isset($blacklistMap[$cId]) || isset($blacklistMap[$mId])) {
                            continue; // Ignora checkin excluído ou de militante excluído
                        }

                        $photosList = [];
                        if (!empty($r['fotos_json'])) {
                            $decodedPhotos = json_decode($r['fotos_json'], true);
                            if (is_array($decodedPhotos)) {
                                foreach ($decodedPhotos as $p) {
                                    if ($p && $p !== '[vault_photo]' && strpos(strval($p), 'unsplash.com') === false) {
                                        $photosList[] = $p;
                                    }
                                }
                            }
                        }

                        $relationalCheckins[] = [
                            'id' => $r['id'],
                            'militantId' => $r['militante_id'],
                            'militantName' => $r['militante_nome'],
                            'teamId' => $r['equipe_id'] ?? 'team-alpha',
                            'neighborhoodId' => $r['bairro_id'],
                            'neighborhoodName' => $r['bairro_nome'],
                            'streetName' => $r['nome_rua'],
                            'houseNumberRange' => $r['faixa_numeracao'] ?? '',
                            'timestamp' => $r['timestamp_checkin'],
                            'latitude' => floatval($r['latitude']),
                            'longitude' => floatval($r['longitude']),
                            'accuracyMeters' => floatval($r['precisao_gps_metros'] ?? 4.0),
                            'materialsDelivered' => [
                                'santinhos' => intval($r['qtd_santinhos'] ?? 0),
                                'adesivos' => intval($r['qtd_adesivos'] ?? 0),
                                'adesivo_bola' => intval($r['qtd_adesivo_bola'] ?? 0),
                                'adesivo_parachoque' => intval($r['qtd_adesivo_parachoque'] ?? 0),
                                'colinhas' => intval($r['qtd_colinhas'] ?? 0),
                                'abordagens' => intval($r['qtd_abordagens'] ?? 0),
                                'comercio' => intval($r['qtd_comercio'] ?? 0)
                            ],
                            'observations' => $r['observacoes'] ?? '',
                            'photos' => $photosList,
                            'status' => $r['status_auditoria'] ?? 'validado',
                            'synced' => true
                        ];
                    }

                    // Mescla checkins da tabela relacional com o array de checkins do app_sync_state
                    $existingCheckins = isset($state['militancia_checkins_v1']) && is_array($state['militancia_checkins_v1']) 
                        ? $state['militancia_checkins_v1'] 
                        : [];
                    
                    $checkinMap = [];
                    foreach ($existingCheckins as $chk) {
                        if (isset($chk['id'])) {
                            $chkId = strval($chk['id']);
                            $chkMilId = strval($chk['militantId'] ?? '');
                            if (!isset($blacklistMap[$chkId]) && !isset($blacklistMap[$chkMilId])) {
                                $checkinMap[$chk['id']] = $chk;
                            }
                        }
                    }
                    foreach ($relationalCheckins as $chk) {
                        if (isset($chk['id'])) {
                            if (!isset($checkinMap[$chk['id']])) {
                                $checkinMap[$chk['id']] = $chk;
                            } else {
                                // Preserva fotos e campos se o relacional for mais completo
                                if (empty($checkinMap[$chk['id']]['photos']) && !empty($chk['photos'])) {
                                    $checkinMap[$chk['id']]['photos'] = $chk['photos'];
                                }
                            }
                        }
                    }
                    $cleanCheckins = array_values($checkinMap);
                    $state['militancia_checkins_v1'] = $cleanCheckins;
                    $state['checkins_data'] = $cleanCheckins;
                }
            } catch (Exception $eRel) {
                // Silencioso se der erro na consulta relacional
            }

            // Consulta também diretamente a tabela relacional militantes_cadastrados
            try {
                $stmtMil = $pdo->query("SELECT * FROM militantes_cadastrados ORDER BY nome ASC");
                $milRows = $stmtMil->fetchAll();
                if ($milRows && count($milRows) > 0) {
                    $relationalMilitants = [];
                    foreach ($milRows as $mr) {
                        $mId = strval($mr['id']);
                        if (isset($blacklistMap[$mId])) {
                            continue; // Ignora militante na blacklist de excluídos
                        }
                        $parsedData = [];
                        if (!empty($mr['dados_json'])) {
                            $decoded = json_decode($mr['dados_json'], true);
                            if (is_array($decoded)) $parsedData = $decoded;
                        }
                        $relationalMilitants[] = array_merge([
                            'id' => $mr['id'],
                            'name' => $mr['nome'],
                            'matricula' => $mr['matricula'],
                            'role' => $mr['cargo'] ?? 'militante',
                            'teamId' => $mr['equipe_id'] ?? 'team-alpha',
                            'phone' => $mr['telefone'] ?? '',
                            'status' => $mr['status'] ?? 'ativo',
                            'weeklyGoalPercentage' => 0,
                            'totalStreetsCovered' => 0,
                            'totalKmWalked' => 0,
                            'deliveredMaterials' => [
                                'santinhos' => 0, 'adesivos' => 0, 'adesivo_bola' => 0,
                                'adesivo_parachoque' => 0, 'colinhas' => 0, 'abordagens' => 0, 'comercio' => 0
                            ]
                        ], $parsedData);
                    }

                    $existingMil = isset($state['militantes_data']) && is_array($state['militantes_data'])
                        ? $state['militantes_data']
                        : (isset($state['militancia_militants_v1']) && is_array($state['militancia_militants_v1']) ? $state['militancia_militants_v1'] : []);

                    $milMap = [];
                    foreach ($existingMil as $m) {
                        if (isset($m['id']) && !isset($blacklistMap[strval($m['id'])])) {
                            $milMap[$m['id']] = $m;
                        }
                    }
                    foreach ($relationalMilitants as $m) {
                        if (isset($m['id']) && !isset($blacklistMap[strval($m['id'])])) {
                            if (!isset($milMap[$m['id']])) {
                                $milMap[$m['id']] = $m;
                            } else {
                                $existingItem = $milMap[$m['id']];
                                $merged = array_merge($existingItem, $m);
                                if (!empty($existingItem['avatar']) && (empty($m['avatar']) || strpos($m['avatar'], 'unsplash.com/photo-1535713875002') !== false)) {
                                    $merged['avatar'] = $existingItem['avatar'];
                                }
                                $milMap[$m['id']] = $merged;
                            }
                        }
                    }
                    $finalMilitants = array_values($milMap);
                    $state['militantes_data'] = $finalMilitants;
                    $state['militancia_militants_v1'] = $finalMilitants;
                    $state['militancia_militantes_v1'] = $finalMilitants;
                }
            } catch (Exception $eMil) {}

            // Consulta também diretamente a tabela relacional vans_cadastradas
            try {
                $stmtVans = $pdo->query("SELECT * FROM vans_cadastradas ORDER BY nome ASC");
                $vanRows = $stmtVans->fetchAll();
                if ($vanRows && count($vanRows) > 0) {
                    $relationalVans = [];
                    foreach ($vanRows as $vr) {
                        $vId = strval($vr['id']);
                        if (isset($blacklistMap[$vId])) {
                            continue; // Ignora van na blacklist de excluídos
                        }
                        $parsedData = [];
                        if (!empty($vr['dados_json'])) {
                            $decoded = json_decode($vr['dados_json'], true);
                            if (is_array($decoded)) $parsedData = $decoded;
                        }
                        $relationalVans[] = array_merge([
                            'id' => $vr['id'],
                            'name' => $vr['nome'],
                            'driverName' => $vr['motorista_nome'],
                            'plate' => $vr['placa'],
                            'driverPhone' => $vr['telefone'] ?? '',
                            'capacity' => intval($vr['capacidade'] ?? 12),
                            'status' => 'aguardando_resgate',
                            'assignedTeamIds' => ['team-alpha']
                        ], $parsedData);
                    }
                    $existingVans = isset($state['vans_data']) && is_array($state['vans_data'])
                        ? $state['vans_data']
                        : (isset($state['militancia_vans_v1']) && is_array($state['militancia_vans_v1']) ? $state['militancia_vans_v1'] : []);
                    $vanMap = [];
                    foreach ($existingVans as $v) {
                        if (isset($v['id']) && !isset($blacklistMap[strval($v['id'])])) {
                            $vanMap[$v['id']] = $v;
                        }
                    }
                    foreach ($relationalVans as $v) {
                        if (isset($v['id']) && !isset($blacklistMap[strval($v['id'])])) {
                            if (!isset($vanMap[$v['id']])) {
                                $vanMap[$v['id']] = $v;
                            } else {
                                $vanMap[$v['id']] = array_merge($vanMap[$v['id']], $v);
                            }
                        }
                    }
                    $finalVans = array_values($vanMap);
                    $state['vans_data'] = $finalVans;
                    $state['militancia_vans_v1'] = $finalVans;
                }
            } catch (Exception $eVans) {}

            // Filtro defensivo final em todas as coleções de $state
            foreach (['militantes_data', 'militancia_militants_v1', 'militancia_militantes_v1', 'vans_data', 'militancia_vans_v1', 'militancia_teams_v1', 'teams_data'] as $colKey) {
                if (isset($state[$colKey]) && is_array($state[$colKey])) {
                    $state[$colKey] = array_values(array_filter($state[$colKey], function($item) use ($blacklistMap) {
                        return !isset($blacklistMap[strval($item['id'] ?? '')]);
                    }));
                }
            }
            if (isset($state['militancia_checkins_v1']) && is_array($state['militancia_checkins_v1'])) {
                $state['militancia_checkins_v1'] = array_values(array_filter($state['militancia_checkins_v1'], function($item) use ($blacklistMap) {
                    $chkId = strval($item['id'] ?? '');
                    $mId = strval($item['militantId'] ?? '');
                    return !isset($blacklistMap[$chkId]) && !isset($blacklistMap[$mId]);
                }));
                $state['checkins_data'] = $state['militancia_checkins_v1'];
            }

            // Garantia de 28 Bairros Oficiais (PMSJ 2020) + Área Rural (29 itens)
            $neighKey = 'militancia_neighborhoods_pmsj2020_v3';
            if (!isset($state[$neighKey]) || !is_array($state[$neighKey]) || count($state[$neighKey]) < 28) {
                if (file_exists($diskVaultPath)) {
                    $diskData = json_decode(file_get_contents($diskVaultPath), true);
                    if (isset($diskData[$neighKey]) && is_array($diskData[$neighKey]) && count($diskData[$neighKey]) >= 28) {
                        $state[$neighKey] = $diskData[$neighKey];
                        $state['militancia_neighborhoods_v1'] = $diskData[$neighKey];
                    }
                }
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Dados recuperados com sucesso do MySQL Hostinger e Cofre do Servidor.',
                'server_time' => date('Y-m-d H:i:s'),
                'last_updated' => $lastUpdated,
                'keys_found' => count($state),
                'checkins_count' => isset($state['militancia_checkins_v1']) ? count($state['militancia_checkins_v1']) : 0,
                'data' => $state
            ]);
            exit;
        } catch (Exception $e) {
            // Em caso de erro na consulta, retorna ao menos os dados do cofre em disco
            echo json_encode([
                'status' => 'success',
                'source' => 'disk_vault_fallback',
                'message' => 'Dados recuperados do cofre do servidor: ' . $e->getMessage(),
                'data' => $state
            ]);
            exit;
        }
    } else {
        echo json_encode([
            'status' => 'success',
            'source' => 'disk_vault',
            'message' => 'Dados recuperados do cofre permanente do servidor.',
            'data' => $state
        ]);
        exit;
    }
}

// POST: Recebe atualizações de dados do celular ou computador e grava no MySQL
if ($method === 'POST') {
    if (!$pdo) {
        echo json_encode([
            'status' => 'db_error',
            'message' => 'Erro de conexão com o MySQL Hostinger (u844537895_Militantes).',
            'error_details' => $GLOBALS['db_error'] ?? 'Conexão recusada.'
        ]);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Payload JSON vazio ou mal formatado.'
        ]);
        exit;
    }

    $deviceInfo = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 250) : 'Web App';
    $updatedKeys = [];

    // TRATAMENTO EXPLÍCITO DE EXCLUSÕES DEFINITIVAS
    $action = $payload['action'] ?? null;

    if ($action === 'delete_militant') {
        $militantId = $payload['militantId'] ?? null;
        if ($militantId) {
            try {
                $pdo->beginTransaction();
                // 1. Remove do banco relacional
                $stmtDel = $pdo->prepare("DELETE FROM militantes_cadastrados WHERE id = ?");
                $stmtDel->execute([$militantId]);

                // 2. Remove check-ins em cascata
                $stmtDelChk = $pdo->prepare("DELETE FROM checkins_ruas WHERE militante_id = ?");
                $stmtDelChk->execute([$militantId]);

                // 3. Atualiza blacklist de excluídos em app_sync_state
                $stmtGetVault = $pdo->prepare("SELECT json_data FROM app_sync_state WHERE key_name = 'deleted_entities_vault'");
                $stmtGetVault->execute();
                $existingVaultRow = $stmtGetVault->fetch();
                $deletedVault = $existingVaultRow ? json_decode($existingVaultRow['json_data'], true) : [];
                if (!is_array($deletedVault)) $deletedVault = [];
                if (!in_array($militantId, $deletedVault)) {
                    $deletedVault[] = $militantId;
                }
                $stmtSetVault = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES ('deleted_entities_vault', ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                $stmtSetVault->execute([json_encode($deletedVault), $deviceInfo]);

                // 4. Salva coleções filtradas se enviadas
                if (isset($payload['collections']) && is_array($payload['collections'])) {
                    $stmtUpdateState = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES (?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                    foreach ($payload['collections'] as $k => $v) {
                        $jsonStr = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                        $stmtUpdateState->execute([$k, $jsonStr, $deviceInfo]);
                    }
                }

                $pdo->commit();

                // Atualiza também data_server_vault.json se existir localmente
                $diskVaultPath = __DIR__ . '/data_server_vault.json';
                if (file_exists($diskVaultPath)) {
                    $diskData = json_decode(file_get_contents($diskVaultPath), true);
                    if (is_array($diskData)) {
                        $diskData['deleted_entities_vault'] = $deletedVault;
                        foreach (['militantes_data', 'militancia_militants_v1', 'militancia_militantes_v1'] as $mk) {
                            if (isset($diskData[$mk]) && is_array($diskData[$mk])) {
                                $diskData[$mk] = array_values(array_filter($diskData[$mk], function($item) use ($militantId) {
                                    return ($item['id'] ?? '') !== $militantId;
                                }));
                            }
                        }
                        if (isset($diskData['militancia_checkins_v1']) && is_array($diskData['militancia_checkins_v1'])) {
                            $diskData['militancia_checkins_v1'] = array_values(array_filter($diskData['militancia_checkins_v1'], function($item) use ($militantId) {
                                return ($item['militantId'] ?? '') !== $militantId;
                            }));
                        }
                        file_put_contents($diskVaultPath, json_encode($diskData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    }
                }

                echo json_encode([
                    'status' => 'success',
                    'message' => "Militante {$militantId} excluído definitivamente do MySQL e do cofre.",
                    'deletedMilitantId' => $militantId
                ]);
                exit;
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    if ($action === 'delete_van') {
        $vanId = $payload['vanId'] ?? null;
        if ($vanId) {
            try {
                $pdo->beginTransaction();
                // 1. Remove do banco relacional
                $stmtDel = $pdo->prepare("DELETE FROM vans_cadastradas WHERE id = ?");
                $stmtDel->execute([$vanId]);

                // 2. Atualiza blacklist
                $stmtGetVault = $pdo->prepare("SELECT json_data FROM app_sync_state WHERE key_name = 'deleted_entities_vault'");
                $stmtGetVault->execute();
                $existingVaultRow = $stmtGetVault->fetch();
                $deletedVault = $existingVaultRow ? json_decode($existingVaultRow['json_data'], true) : [];
                if (!is_array($deletedVault)) $deletedVault = [];
                if (!in_array($vanId, $deletedVault)) {
                    $deletedVault[] = $vanId;
                }
                $stmtSetVault = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES ('deleted_entities_vault', ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                $stmtSetVault->execute([json_encode($deletedVault), $deviceInfo]);

                // 3. Salva coleções filtradas se enviadas
                if (isset($payload['collections']) && is_array($payload['collections'])) {
                    $stmtUpdateState = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES (?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                    foreach ($payload['collections'] as $k => $v) {
                        $jsonStr = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                        $stmtUpdateState->execute([$k, $jsonStr, $deviceInfo]);
                    }
                }

                $pdo->commit();

                // Atualiza disco local se existir
                $diskVaultPath = __DIR__ . '/data_server_vault.json';
                if (file_exists($diskVaultPath)) {
                    $diskData = json_decode(file_get_contents($diskVaultPath), true);
                    if (is_array($diskData)) {
                        $diskData['deleted_entities_vault'] = $deletedVault;
                        foreach (['vans_data', 'militancia_vans_v1'] as $vk) {
                            if (isset($diskData[$vk]) && is_array($diskData[$vk])) {
                                $diskData[$vk] = array_values(array_filter($diskData[$vk], function($item) use ($vanId) {
                                    return ($item['id'] ?? '') !== $vanId;
                                }));
                            }
                        }
                        file_put_contents($diskVaultPath, json_encode($diskData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    }
                }

                echo json_encode([
                    'status' => 'success',
                    'message' => "Van/Motorista {$vanId} excluído definitivamente do MySQL e do cofre.",
                    'deletedVanId' => $vanId
                ]);
                exit;
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    if ($action === 'delete_team') {
        $teamId = $payload['teamId'] ?? null;
        if ($teamId) {
            try {
                $pdo->beginTransaction();
                $stmtGetVault = $pdo->prepare("SELECT json_data FROM app_sync_state WHERE key_name = 'deleted_entities_vault'");
                $stmtGetVault->execute();
                $existingVaultRow = $stmtGetVault->fetch();
                $deletedVault = $existingVaultRow ? json_decode($existingVaultRow['json_data'], true) : [];
                if (!is_array($deletedVault)) $deletedVault = [];
                if (!in_array($teamId, $deletedVault)) {
                    $deletedVault[] = $teamId;
                }
                $stmtSetVault = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES ('deleted_entities_vault', ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                $stmtSetVault->execute([json_encode($deletedVault), $deviceInfo]);

                if (isset($payload['collections']) && is_array($payload['collections'])) {
                    $stmtUpdateState = $pdo->prepare("INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info) VALUES (?, ?, NOW(), ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), updated_at = NOW()");
                    foreach ($payload['collections'] as $k => $v) {
                        $jsonStr = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                        $stmtUpdateState->execute([$k, $jsonStr, $deviceInfo]);
                    }
                }
                $pdo->commit();

                echo json_encode([
                    'status' => 'success',
                    'message' => "Equipe {$teamId} excluída definitivamente do MySQL e do cofre.",
                    'deletedTeamId' => $teamId
                ]);
                exit;
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
                exit;
            }
        }
    }

    try {
        $pdo->beginTransaction();

        $stmtState = $pdo->prepare("
            INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info)
            VALUES (?, ?, NOW(), ?)
            ON DUPLICATE KEY UPDATE
                json_data = VALUES(json_data),
                updated_at = NOW(),
                device_info = VALUES(device_info)
        ");

        // Se o payload for uma coleção de chaves (militantes, equipes, vans, checkins, etc.)
        if (isset($payload['collections']) && is_array($payload['collections'])) {
            foreach ($payload['collections'] as $key => $val) {
                $jsonStr = is_string($val) ? $val : json_encode($val, JSON_UNESCAPED_UNICODE);
                $stmtState->execute([$key, $jsonStr, $deviceInfo]);
                $updatedKeys[] = $key;
            }
        } elseif (isset($payload['key']) && isset($payload['data'])) {
            // Atualização de uma única chave
            $key = $payload['key'];
            $val = $payload['data'];
            $jsonStr = is_string($val) ? $val : json_encode($val, JSON_UNESCAPED_UNICODE);
            $stmtState->execute([$key, $jsonStr, $deviceInfo]);
            $updatedKeys[] = $key;
        } else {
            // Trata o payload inteiro como chaves diretas
            foreach ($payload as $key => $val) {
                if ($key === 'device_info') continue;
                $jsonStr = is_string($val) ? $val : json_encode($val, JSON_UNESCAPED_UNICODE);
                $stmtState->execute([$key, $jsonStr, $deviceInfo]);
                $updatedKeys[] = $key;
            }
        }

        // Se foram enviados militantes, atualiza também a tabela relacional militantes_cadastrados
        $militantsList = null;
        if (isset($payload['collections']['militantes_data']) && is_array($payload['collections']['militantes_data'])) {
            $militantsList = $payload['collections']['militantes_data'];
        } elseif (isset($payload['collections']['militancia_militants_v1']) && is_array($payload['collections']['militancia_militants_v1'])) {
            $militantsList = $payload['collections']['militancia_militants_v1'];
        } elseif (isset($payload['militantes_data']) && is_array($payload['militantes_data'])) {
            $militantsList = $payload['militantes_data'];
        } elseif (isset($payload['key']) && in_array($payload['key'], ['militantes_data', 'militancia_militants_v1', 'militancia_militantes_v1']) && isset($payload['data']) && is_array($payload['data'])) {
            $militantsList = $payload['data'];
        }

        if (is_array($militantsList)) {
            try {
                $stmtMil = $pdo->prepare("
                    INSERT INTO militantes_cadastrados (id, nome, matricula, cargo, equipe_id, telefone, status, meta_ruas, meta_materiais, dados_json, atualizado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        nome = VALUES(nome),
                        matricula = VALUES(matricula),
                        cargo = VALUES(cargo),
                        equipe_id = VALUES(equipe_id),
                        telefone = VALUES(telefone),
                        status = VALUES(status),
                        meta_ruas = VALUES(meta_ruas),
                        meta_materiais = VALUES(meta_materiais),
                        dados_json = VALUES(dados_json),
                        atualizado_em = NOW()
                ");

                foreach ($militantsList as $m) {
                    if (isset($m['id']) && isset($m['name'])) {
                        try {
                            $stmtMil->execute([
                                $m['id'],
                                $m['name'],
                                $m['matricula'] ?? $m['id'],
                                $m['role'] ?? 'militante',
                                $m['teamId'] ?? 'team-alpha',
                                $m['phone'] ?? '',
                                $m['status'] ?? 'ativo',
                                $m['metaRuas'] ?? 8,
                                $m['metaMateriais'] ?? 500,
                                json_encode($m, JSON_UNESCAPED_UNICODE)
                            ]);
                        } catch (Exception $eSingleMil) {
                            // Ignora erro individual e continua
                        }
                    }
                }
            } catch (Exception $eMilOuter) {}
        }

        // Se foram enviadas vans, atualiza também a tabela relacional vans_cadastradas
        $vansList = null;
        if (isset($payload['collections']['vans_data']) && is_array($payload['collections']['vans_data'])) {
            $vansList = $payload['collections']['vans_data'];
        } elseif (isset($payload['collections']['militancia_vans_v1']) && is_array($payload['collections']['militancia_vans_v1'])) {
            $vansList = $payload['collections']['militancia_vans_v1'];
        } elseif (isset($payload['vans_data']) && is_array($payload['vans_data'])) {
            $vansList = $payload['vans_data'];
        } elseif (isset($payload['key']) && in_array($payload['key'], ['vans_data', 'militancia_vans_v1']) && isset($payload['data']) && is_array($payload['data'])) {
            $vansList = $payload['data'];
        }

        if (is_array($vansList)) {
            try {
                $stmtVan = $pdo->prepare("
                    INSERT INTO vans_cadastradas (id, nome, motorista_nome, placa, telefone, pix, capacidade, ativo, dados_json, atualizado_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    ON DUPLICATE KEY UPDATE
                        nome = VALUES(nome),
                        motorista_nome = VALUES(motorista_nome),
                        placa = VALUES(placa),
                        telefone = VALUES(telefone),
                        pix = VALUES(pix),
                        capacidade = VALUES(capacidade),
                        ativo = VALUES(ativo),
                        dados_json = VALUES(dados_json),
                        atualizado_em = NOW()
                ");

                foreach ($vansList as $v) {
                    if (isset($v['id']) && isset($v['name'])) {
                        try {
                            $stmtVan->execute([
                                $v['id'],
                                $v['name'],
                                $v['driverName'] ?? '',
                                $v['plate'] ?? '',
                                $v['driverPhone'] ?? $v['phone'] ?? '',
                                $v['driverPix'] ?? '',
                                $v['capacity'] ?? 12,
                                !empty($v['active']) ? 1 : 0,
                                json_encode($v, JSON_UNESCAPED_UNICODE)
                            ]);
                        } catch (Exception $eSingleVan) {}
                    }
                }
            } catch (Exception $eVanOuter) {}
        }

        // Se foram enviados check-ins de ruas, atualiza também a tabela relacional checkins_ruas
        $checkInsList = null;
        if (isset($payload['collections']['militancia_checkins_v1'])) {
            $checkInsList = $payload['collections']['militancia_checkins_v1'];
        } elseif (isset($payload['collections']['checkins'])) {
            $checkInsList = $payload['collections']['checkins'];
        } elseif (isset($payload['key']) && in_array($payload['key'], ['militancia_checkins_v1', 'checkins']) && isset($payload['data'])) {
            $checkInsList = $payload['data'];
        }

        if (is_array($checkInsList)) {
            $stmtChk = $pdo->prepare("
                INSERT INTO checkins_ruas (
                    id, militante_id, militante_nome, equipe_id, bairro_id, bairro_nome, 
                    nome_rua, faixa_numeracao, timestamp_checkin, latitude, longitude, 
                    precisao_gps_metros, qtd_santinhos, qtd_adesivos, qtd_adesivo_bola, 
                    qtd_adesivo_parachoque, qtd_colinhas, qtd_abordagens, qtd_comercio, 
                    observacoes, fotos_json, status_auditoria
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, 
                    ?, ?, ?, ?, 
                    ?, ?, ?
                ) ON DUPLICATE KEY UPDATE
                    militante_id = VALUES(militante_id),
                    militante_nome = VALUES(militante_nome),
                    equipe_id = VALUES(equipe_id),
                    bairro_id = VALUES(bairro_id),
                    bairro_nome = VALUES(bairro_nome),
                    nome_rua = VALUES(nome_rua),
                    faixa_numeracao = VALUES(faixa_numeracao),
                    timestamp_checkin = VALUES(timestamp_checkin),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
                    precisao_gps_metros = VALUES(precisao_gps_metros),
                    qtd_santinhos = VALUES(qtd_santinhos),
                    qtd_adesivos = VALUES(qtd_adesivos),
                    qtd_adesivo_bola = VALUES(qtd_adesivo_bola),
                    qtd_adesivo_parachoque = VALUES(qtd_adesivo_parachoque),
                    qtd_colinhas = VALUES(qtd_colinhas),
                    qtd_abordagens = VALUES(qtd_abordagens),
                    qtd_comercio = VALUES(qtd_comercio),
                    observacoes = VALUES(observacoes),
                    fotos_json = VALUES(fotos_json),
                    status_auditoria = VALUES(status_auditoria)
            ");

            foreach ($checkInsList as $chk) {
                if (isset($chk['id']) && isset($chk['streetName'])) {
                    $mats = $chk['materialsDelivered'] ?? [];
                    $stmtChk->execute([
                        $chk['id'],
                        $chk['militantId'] ?? 'mil-01',
                        $chk['militantName'] ?? 'Militante',
                        $chk['teamId'] ?? 'team-alpha',
                        $chk['neighborhoodId'] ?? 'kobrasol',
                        $chk['neighborhoodName'] ?? 'Kobrasol',
                        $chk['streetName'] ?? 'Rua de Campo',
                        $chk['houseNumberRange'] ?? 'Trecho Geral',
                        $chk['timestamp'] ?? date('Y-m-d H:i:s'),
                        floatval($chk['latitude'] ?? -27.5962),
                        floatval($chk['longitude'] ?? -48.6190),
                        floatval($chk['accuracyMeters'] ?? 4.0),
                        intval($mats['santinhos'] ?? 0),
                        intval($mats['adesivos'] ?? 0),
                        intval($mats['adesivo_bola'] ?? 0),
                        intval($mats['adesivo_parachoque'] ?? 0),
                        intval($mats['colinhas'] ?? 0),
                        intval($mats['abordagens'] ?? 0),
                        intval($mats['comercio'] ?? 0),
                        $chk['observations'] ?? '',
                        json_encode($chk['photos'] ?? []),
                        $chk['status'] ?? 'validado'
                    ]);
                }
            }
        }

        $pdo->commit();

        // 3. Atualiza também o cofre em disco (data_server_vault.json) para redundância à prova de falhas
        try {
            $diskVaultPath = __DIR__ . '/data_server_vault.json';
            $currentDisk = [];
            if (file_exists($diskVaultPath)) {
                $raw = file_get_contents($diskVaultPath);
                if ($raw) {
                    $currentDisk = json_decode($raw, true) ?: [];
                }
            }

            if (isset($payload['collections']) && is_array($payload['collections'])) {
                foreach ($payload['collections'] as $k => $v) {
                    $currentDisk[$k] = $v;
                }
            } elseif (isset($payload['key']) && isset($payload['data'])) {
                $currentDisk[$payload['key']] = $payload['data'];
            }

            $currentDisk['_lastUpdated'] = date('Y-m-d H:i:s');
            file_put_contents($diskVaultPath, json_encode($currentDisk, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        } catch (Exception $eDisk) {
            // Silencioso
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Alterações gravadas e sincronizadas com sucesso no MySQL Hostinger (u844537895_Militantes) e Cofre do Servidor.',
            'updated_keys' => $updatedKeys,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        // Salva ao menos no cofre em disco para não perder dados em hipótese alguma
        try {
            $diskVaultPath = __DIR__ . '/data_server_vault.json';
            $currentDisk = [];
            if (file_exists($diskVaultPath)) {
                $raw = file_get_contents($diskVaultPath);
                if ($raw) {
                    $currentDisk = json_decode($raw, true) ?: [];
                }
            }
            if (isset($payload['collections']) && is_array($payload['collections'])) {
                foreach ($payload['collections'] as $k => $v) {
                    $currentDisk[$k] = $v;
                }
            } elseif (isset($payload['key']) && isset($payload['data'])) {
                $currentDisk[$payload['key']] = $payload['data'];
            }
            $currentDisk['_lastUpdated'] = date('Y-m-d H:i:s');
            file_put_contents($diskVaultPath, json_encode($currentDisk, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        } catch (Exception $eDisk) {}

        echo json_encode([
            'status' => 'partial_success',
            'message' => 'Salvo no Cofre do Servidor. Erro no MySQL: ' . $e->getMessage()
        ]);
        exit;
    }
}
