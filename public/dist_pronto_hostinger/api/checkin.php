<?php
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
                    nome_rua = VALUES(nome_rua),
                    qtd_santinhos = VALUES(qtd_santinhos),
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

            echo json_encode([
                'status' => 'success',
                'message' => 'Check-in gravado com sucesso no MySQL Hostinger (u844537895_Militantes).',
                'id' => $id,
                'destination' => 'u844537895_Militantes.checkins_ruas'
            ]);
            exit;
        } catch (Exception $e) {
            // Se falhar no banco, retorna resposta amigável
            echo json_encode([
                'status' => 'partial_success',
                'message' => 'Recebido pelo endpoint PHP. Erro de gravação SQL: ' . $e->getMessage(),
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
            $stmt = $pdo->query("SELECT * FROM checkins_ruas ORDER BY timestamp_checkin DESC LIMIT 200");
            $rows = $stmt->fetchAll();
            echo json_encode([
                'status' => 'success',
                'count' => count($rows),
                'data' => $rows
            ]);
            exit;
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => []
            ]);
            exit;
        }
    } else {
        echo json_encode([
            'status' => 'success',
            'data' => []
        ]);
        exit;
    }
}
