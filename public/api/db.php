<?php
// ==============================================================================
// Configuração de Conexão com Banco de Dados MySQL Hostinger
// Domínio: militancia.mastervisionmarketing.com
// Base de Dados: u844537895_Militantes
// ==============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timeout seguro para conexões
ini_set('default_socket_timeout', 5);

$pdo = null;
$db_error = null;

function getDbConnection() {
    global $pdo, $db_error;
    if ($pdo !== null) {
        return $pdo;
    }

    $db_name = 'u844537895_Militantes';
    $db_user = 'u844537895_Militantes';
    $db_pass = 'Shift2026'; // Senha informada no hPanel

    // Tenta primeiro 127.0.0.1 (IP direto do MySQL na Hostinger) e depois localhost
    $hosts = ['127.0.0.1', 'localhost'];
    
    foreach ($hosts as $host) {
        try {
            $instance = new PDO(
                "mysql:host={$host};dbname={$db_name};charset=utf8mb4",
                $db_user,
                $db_pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_TIMEOUT => 4,
                ]
            );
            $pdo = $instance;
            return $pdo;
        } catch (Throwable $e) {
            $db_error = $e->getMessage();
        }
    }

    $pdo = false;
    return null;
}
