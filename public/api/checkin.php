<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

// Se o banco estiver conectado, garante que a tabela exista
if ($pdo) {
    try {
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    } catch (Exception $e) {
        // Silencioso se não tiver permissão de DDL
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!$body) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Payload JSON inválido.'
        ]);
        exit;
    }

    $data = isset($body['data']) ? $body['data'] : $body;
    $id = isset($data['id']) ? $data['id'] : ('chk-' . round(microtime(true) * 1000));
    $militanteId = isset($data['militante_id']) ? $data['militante_id'] : ($data['militantId'] ?? 'mil-01');
    $militanteNome = isset($data['militante_nome']) ? $data['militante_nome'] : ($data['militantName'] ?? 'Militante');
    $equipeId = isset($data['equipe_id']) ? $data['equipe_id'] : ($data['teamId'] ?? 'team-alpha');
    $bairroId = isset($data['bairro_id']) ? $data['bairro_id'] : ($data['neighborhoodId'] ?? 'kobrasol');
    $bairroNome = isset($data['bairro_nome']) ? $data['bairro_nome'] : ($data['neighborhoodName'] ?? 'Kobrasol');
    $nomeRua = isset($data['nome_rua']) ? $data['nome_rua'] : ($data['streetName'] ?? 'Rua de Campo');
    $faixaNumeracao = isset($data['faixa_numeracao']) ? $data['faixa_numeracao'] : ($data['houseNumberRange'] ?? 'Trecho Geral');
    $timestamp = isset($data['timestamp_checkin']) ? $data['timestamp_checkin'] : ($data['timestamp'] ?? date('Y-m-d H:i:s'));
    $latitude = isset($data['latitude']) ? floatval($data['latitude']) : -27.5962;
    $longitude = isset($data['longitude']) ? floatval($data['longitude']) : -48.6190;
    $precisaoGps = isset($data['precisao_gps_metros']) ? floatval($data['precisao_gps_metros']) : ($data['accuracyMeters'] ?? 4.0);
    
    $santinhos = isset($data['qtd_santinhos']) ? intval($data['qtd_santinhos']) : ($data['materialsDelivered']['santinhos'] ?? 0);
    $adesivos = isset($data['qtd_adesivos']) ? intval($data['qtd_adesivos']) : ($data['materialsDelivered']['adesivos'] ?? 0);
    $adesivoBola = isset($data['qtd_adesivo_bola']) ? intval($data['qtd_adesivo_bola']) : ($data['materialsDelivered']['adesivo_bola'] ?? 0);
    $adesivoParachoque = isset($data['qtd_adesivo_parachoque']) ? intval($data['qtd_adesivo_parachoque']) : ($data['materialsDelivered']['adesivo_parachoque'] ?? 0);
    $colinhas = isset($data['qtd_colinhas']) ? intval($data['qtd_colinhas']) : ($data['materialsDelivered']['colinhas'] ?? 0);
    $abordagens = isset($data['qtd_abordagens']) ? intval($data['qtd_abordagens']) : ($data['materialsDelivered']['abordagens'] ?? 0);
    $comercio = isset($data['qtd_comercio']) ? intval($data['qtd_comercio']) : ($data['materialsDelivered']['comercio'] ?? 0);
    
    $obs = isset($data['observacoes']) ? $data['observacoes'] : ($data['observations'] ?? '');
    $fotos = isset($data['fotos_json']) ? (is_string($data['fotos_json']) ? $data['fotos_json'] : json_encode($data['fotos_json'])) : json_encode($data['photos'] ?? []);
    $statusAudit = isset($data['status_auditoria']) ? $data['status_auditoria'] : ($data['status'] ?? 'validado');

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("
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

            $stmt->execute([
                $id, $militanteId, $militanteNome, $equipeId, $bairroId, $bairroNome,
                $nomeRua, $faixaNumeracao, $timestamp, $latitude, $longitude,
                $precisaoGps, $santinhos, $adesivos, $adesivoBola,
                $adesivoParachoque, $colinhas, $abordagens, $comercio,
                $obs, $fotos, $statusAudit
            ]);

            // Atualiza também o app_sync_state para manter a sincronização mútua com sync.php
            try {
                $checkinObj = [
                    'id' => $id,
                    'militantId' => $militanteId,
                    'militantName' => $militanteNome,
                    'teamId' => $equipeId,
                    'neighborhoodId' => $bairroId,
                    'neighborhoodName' => $bairroNome,
                    'streetName' => $nomeRua,
                    'houseNumberRange' => $faixaNumeracao,
                    'timestamp' => $timestamp,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'accuracyMeters' => $precisaoGps,
                    'materialsDelivered' => [
                        'santinhos' => $santinhos,
                        'adesivos' => $adesivos,
                        'adesivo_bola' => $adesivoBola,
                        'adesivo_parachoque' => $adesivoParachoque,
                        'colinhas' => $colinhas,
                        'abordagens' => $abordagens,
                        'comercio' => $comercio
                    ],
                    'observations' => $obs,
                    'photos' => is_string($fotos) ? json_decode($fotos, true) : (is_array($fotos) ? $fotos : []),
                    'status' => $statusAudit,
                    'synced' => true
                ];

                $stmtGetState = $pdo->prepare("SELECT json_data FROM app_sync_state WHERE key_name = 'militancia_checkins_v1'");
                $stmtGetState->execute();
                $existingStateRow = $stmtGetState->fetch();
                $existingCheckins = $existingStateRow ? json_decode($existingStateRow['json_data'], true) : [];
                if (!is_array($existingCheckins)) {
                    $existingCheckins = [];
                }

                // Atualiza ou insere no topo
                $foundIdx = -1;
                foreach ($existingCheckins as $i => $item) {
                    if (isset($item['id']) && $item['id'] === $id) {
                        $foundIdx = $i;
                        break;
                    }
                }

                if ($foundIdx >= 0) {
                    $existingCheckins[$foundIdx] = $checkinObj;
                } else {
                    array_unshift($existingCheckins, $checkinObj);
                }

                $stmtSaveState = $pdo->prepare("
                    INSERT INTO app_sync_state (key_name, json_data, updated_at, device_info)
                    VALUES ('militancia_checkins_v1', ?, NOW(), 'Checkin API')
                    ON DUPLICATE KEY UPDATE
                        json_data = VALUES(json_data),
                        updated_at = NOW(),
                        device_info = VALUES(device_info)
                ");
                $stmtSaveState->execute([json_encode($existingCheckins, JSON_UNESCAPED_UNICODE)]);
            } catch (Exception $eSync) {
                // Silencioso se app_sync_state falhar, pois o dado principal já foi salvo em checkins_ruas
            }

            // Atualiza também o cofre em disco (data_server_vault.json)
            try {
                $diskVaultPath = __DIR__ . '/data_server_vault.json';
                $currentDisk = [];
                if (file_exists($diskVaultPath)) {
                    $raw = file_get_contents($diskVaultPath);
                    if ($raw) {
                        $currentDisk = json_decode($raw, true) ?: [];
                    }
                }
                $checkins = isset($currentDisk['militancia_checkins_v1']) && is_array($currentDisk['militancia_checkins_v1']) 
                    ? $currentDisk['militancia_checkins_v1'] 
                    : [];
                $fIdx = -1;
                foreach ($checkins as $i => $item) {
                    if (isset($item['id']) && $item['id'] === $id) {
                        $fIdx = $i;
                        break;
                    }
                }
                if ($fIdx >= 0) {
                    $checkins[$fIdx] = $checkinObj;
                } else {
                    array_unshift($checkins, $checkinObj);
                }
                $currentDisk['militancia_checkins_v1'] = $checkins;
                $currentDisk['_lastUpdated'] = date('Y-m-d H:i:s');
                file_put_contents($diskVaultPath, json_encode($currentDisk, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            } catch (Exception $eDisk) {}

            echo json_encode([
                'status' => 'success',
                'message' => 'Check-in gravado com sucesso no MySQL Hostinger (u844537895_Militantes) e Cofre do Servidor.',
                'id' => $id,
                'destination' => 'u844537895_Militantes.checkins_ruas'
            ]);
            exit;
        } catch (Exception $e) {
            // Se falhar no banco, salva ao menos no cofre em disco
            try {
                $diskVaultPath = __DIR__ . '/data_server_vault.json';
                $currentDisk = [];
                if (file_exists($diskVaultPath)) {
                    $raw = file_get_contents($diskVaultPath);
                    if ($raw) {
                        $currentDisk = json_decode($raw, true) ?: [];
                    }
                }
                $checkins = isset($currentDisk['militancia_checkins_v1']) && is_array($currentDisk['militancia_checkins_v1']) 
                    ? $currentDisk['militancia_checkins_v1'] 
                    : [];
                $checkinObj = [
                    'id' => $id,
                    'militantId' => $militanteId,
                    'militantName' => $militanteNome,
                    'teamId' => $equipeId,
                    'neighborhoodId' => $bairroId,
                    'neighborhoodName' => $bairroNome,
                    'streetName' => $nomeRua,
                    'houseNumberRange' => $faixaNumeracao,
                    'timestamp' => $timestamp,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'accuracyMeters' => $precisaoGps,
                    'materialsDelivered' => [
                        'santinhos' => $santinhos,
                        'adesivos' => $adesivos,
                        'adesivo_bola' => $adesivoBola,
                        'adesivo_parachoque' => $adesivoParachoque,
                        'colinhas' => $colinhas,
                        'abordagens' => $abordagens,
                        'comercio' => $comercio
                    ],
                    'observations' => $obs,
                    'photos' => is_string($fotos) ? json_decode($fotos, true) : (is_array($fotos) ? $fotos : []),
                    'status' => $statusAudit,
                    'synced' => true
                ];
                array_unshift($checkins, $checkinObj);
                $currentDisk['militancia_checkins_v1'] = $checkins;
                $currentDisk['_lastUpdated'] = date('Y-m-d H:i:s');
                file_put_contents($diskVaultPath, json_encode($currentDisk, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            } catch (Exception $eDisk) {}

            echo json_encode([
                'status' => 'partial_success',
                'message' => 'Salvo no Cofre do Servidor. Erro no MySQL: ' . $e->getMessage(),
                'id' => $id
            ]);
            exit;
        }
    } else {
        // Retorno padrão quando o banco local ainda não foi conectado com as credenciais
        echo json_encode([
            'status' => 'success',
            'message' => 'Check-in recebido pela API PHP de militancia.mastervisionmarketing.com.',
            'id' => $id,
            'db_note' => 'Configure a senha do MySQL em api/db.php caso necessário.'
        ]);
        exit;
    }
} elseif ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM checkins_ruas ORDER BY timestamp_checkin DESC LIMIT 1000");
            $rows = $stmt->fetchAll();
            echo json_encode([
                'status' => 'success',
                'count' => count($rows),
                'database' => 'u844537895_Militantes',
                'table' => 'checkins_ruas',
                'data' => $rows
            ], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            // Em caso de erro, tenta o cofre local em disco
            $diskVaultPath = __DIR__ . '/data_server_vault.json';
            $fallbackRows = [];
            if (file_exists($diskVaultPath)) {
                $raw = file_get_contents($diskVaultPath);
                $disk = $raw ? json_decode($raw, true) : null;
                if ($disk && isset($disk['militancia_checkins_v1']) && is_array($disk['militancia_checkins_v1'])) {
                    $fallbackRows = $disk['militancia_checkins_v1'];
                }
            }
            echo json_encode([
                'status' => 'partial_success',
                'source' => 'disk_vault_fallback',
                'message' => $e->getMessage(),
                'count' => count($fallbackRows),
                'data' => $fallbackRows
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } else {
        $diskVaultPath = __DIR__ . '/data_server_vault.json';
        $fallbackRows = [];
        if (file_exists($diskVaultPath)) {
            $raw = file_get_contents($diskVaultPath);
            $disk = $raw ? json_decode($raw, true) : null;
            if ($disk && isset($disk['militancia_checkins_v1']) && is_array($disk['militancia_checkins_v1'])) {
                $fallbackRows = $disk['militancia_checkins_v1'];
            }
        }
        echo json_encode([
            'status' => 'success',
            'source' => 'disk_vault',
            'count' => count($fallbackRows),
            'data' => $fallbackRows
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
