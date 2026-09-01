<?php
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
                matricula VARCHAR(50) NOT NULL UNIQUE,
                cargo VARCHAR(50) DEFAULT 'militante',
                equipe_id VARCHAR(64) DEFAULT 'team-alpha',
                telefone VARCHAR(50) NULL,
                status VARCHAR(50) DEFAULT 'ativo',
                meta_ruas INT DEFAULT 8,
                meta_materiais INT DEFAULT 500,
                dados_json LONGTEXT NULL,
                atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

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

// GET: Retorna o estado sincronizado armazenado no MySQL
if ($method === 'GET') {
    if (!$pdo) {
        echo json_encode([
            'status' => 'offline_or_db_error',
            'message' => 'Não foi possível conectar ao MySQL Hostinger. Verifique as credenciais.',
            'data' => null,
            'db_name' => 'u844537895_Militantes'
        ]);
        exit;
    }

    try {
        $stmt = $pdo->query("SELECT key_name, json_data, updated_at FROM app_sync_state");
        $rows = $stmt->fetchAll();
        
        $state = [];
        $lastUpdated = null;

        foreach ($rows as $row) {
            $key = $row['key_name'];
            $decoded = json_decode($row['json_data'], true);
            $state[$key] = $decoded;
            if (!$lastUpdated || $row['updated_at'] > $lastUpdated) {
                $lastUpdated = $row['updated_at'];
            }
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Dados sincronizados com o banco de dados MySQL da Hostinger com sucesso.',
            'server_time' => date('Y-m-d H:i:s'),
            'last_updated' => $lastUpdated,
            'keys_found' => count($state),
            'data' => $state
        ]);
        exit;
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao buscar dados no MySQL: ' . $e->getMessage(),
            'data' => null
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

        // Se foram enviados militantes, atualiza também a tabela relacional
        if (isset($payload['collections']['militantes_data']) || isset($payload['militantes_data'])) {
            $militantsList = $payload['collections']['militantes_data'] ?? $payload['militantes_data'];
            if (is_array($militantsList)) {
                $stmtMil = $pdo->prepare("
                    INSERT INTO militantes_cadastrados (id, nome, matricula, cargo, equipe_id, telefone, status, meta_ruas, meta_materiais, dados_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        nome = VALUES(nome),
                        matricula = VALUES(matricula),
                        cargo = VALUES(cargo),
                        equipe_id = VALUES(equipe_id),
                        telefone = VALUES(telefone),
                        status = VALUES(status),
                        meta_ruas = VALUES(meta_ruas),
                        meta_materiais = VALUES(meta_materiais),
                        dados_json = VALUES(dados_json)
                ");

                foreach ($militantsList as $m) {
                    if (isset($m['id']) && isset($m['name'])) {
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
                    }
                }
            }
        }

        // Se foram enviadas vans, atualiza também a tabela relacional
        if (isset($payload['collections']['vans_data']) || isset($payload['vans_data'])) {
            $vansList = $payload['collections']['vans_data'] ?? $payload['vans_data'];
            if (is_array($vansList)) {
                $stmtVan = $pdo->prepare("
                    INSERT INTO vans_cadastradas (id, nome, motorista_nome, placa, telefone, pix, capacidade, ativo, dados_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        nome = VALUES(nome),
                        motorista_nome = VALUES(motorista_nome),
                        placa = VALUES(placa),
                        telefone = VALUES(telefone),
                        pix = VALUES(pix),
                        capacidade = VALUES(capacidade),
                        ativo = VALUES(ativo),
                        dados_json = VALUES(dados_json)
                ");

                foreach ($vansList as $v) {
                    if (isset($v['id']) && isset($v['name'])) {
                        $stmtVan->execute([
                            $v['id'],
                            $v['name'],
                            $v['driverName'] ?? '',
                            $v['plate'] ?? '',
                            $v['phone'] ?? '',
                            $v['driverPix'] ?? '',
                            $v['capacity'] ?? 12,
                            !empty($v['active']) ? 1 : 0,
                            json_encode($v, JSON_UNESCAPED_UNICODE)
                        ]);
                    }
                }
            }
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

        echo json_encode([
            'status' => 'success',
            'message' => 'Alterações gravadas e sincronizadas com sucesso no MySQL Hostinger (u844537895_Militantes).',
            'updated_keys' => $updatedKeys,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao salvar alterações no MySQL: ' . $e->getMessage()
        ]);
        exit;
    }
}
