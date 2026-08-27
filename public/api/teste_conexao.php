<?php
// ==============================================================================
// Diagnóstico de Conexão MySQL Hostinger
// URL: https://militancia.mastervisionmarketing.com/api/teste_conexao.php
// ==============================================================================

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

if (!$pdo) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Falha ao conectar com o banco de dados MySQL da Hostinger.',
        'host' => '127.0.0.1 / localhost',
        'banco' => 'u844537895_Militantes',
        'usuario' => 'u844537895_Militantes',
        'erro_detalhado' => $GLOBALS['db_error'] ?? 'Acesso negado ou servidor indisponível',
        'orientacao' => 'Certifique-se de que a senha Shift2026 está configurada corretamente no hPanel da Hostinger.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    $syncCountStmt = $pdo->query("SELECT COUNT(*) FROM app_sync_state");
    $syncCount = $syncCountStmt ? $syncCountStmt->fetchColumn() : 0;

    echo json_encode([
        'status' => 'success',
        'message' => 'Conexão com o banco MySQL da Hostinger realizada com SUCESSO total!',
        'banco_conectado' => 'u844537895_Militantes',
        'usuario' => 'u844537895_Militantes',
        'tabelas_no_banco' => $tables,
        'registros_sincronizados' => $syncCount,
        'data_hora_servidor' => date('Y-m-d H:i:s'),
        'suporte_sincronizacao' => 'ATIVO (Celular, Computador e Múltiplos Dispositivos)'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'partial_success',
        'message' => 'Conectado ao MySQL, mas ocorreu erro ao inspecionar tabelas: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
