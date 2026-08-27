-- =======================================================================
-- SCHEMA MYSQL - BANCO DE DADOS: u844537895_Militantes
-- DOMÍNIO: militancia.mastervisionmarketing.com
-- CAMPANHA ELEITORAL SÃO JOSÉ / SC 2026
-- =======================================================================

CREATE DATABASE IF NOT EXISTS `u844537895_Militantes` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u844537895_Militantes`;

-- 1. Tabela de Check-ins de Ruas e Produtividade de Campo
CREATE TABLE IF NOT EXISTS `checkins_ruas` (
  `id` VARCHAR(64) NOT NULL,
  `militante_id` VARCHAR(64) NOT NULL,
  `militante_nome` VARCHAR(255) NOT NULL,
  `equipe_id` VARCHAR(64) DEFAULT 'team-alpha',
  `bairro_id` VARCHAR(64) NOT NULL,
  `bairro_nome` VARCHAR(255) NOT NULL,
  `nome_rua` VARCHAR(255) NOT NULL,
  `faixa_numeracao` VARCHAR(100) DEFAULT '',
  `timestamp_checkin` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `precisao_gps_metros` DECIMAL(6, 2) DEFAULT 4.0,
  `qtd_santinhos` INT DEFAULT 0,
  `qtd_adesivos` INT DEFAULT 0,
  `qtd_adesivo_bola` INT DEFAULT 0,
  `qtd_adesivo_parachoque` INT DEFAULT 0,
  `qtd_colinhas` INT DEFAULT 0,
  `qtd_abordagens` INT DEFAULT 0,
  `qtd_comercio` INT DEFAULT 0,
  `observacoes` TEXT,
  `fotos_json` LONGTEXT,
  `status_auditoria` VARCHAR(50) DEFAULT 'validado',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_militante` (`militante_id`),
  INDEX `idx_bairro` (`bairro_id`),
  INDEX `idx_timestamp` (`timestamp_checkin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabela de Cadastro de Militantes
CREATE TABLE IF NOT EXISTS `militantes` (
  `id` VARCHAR(64) NOT NULL,
  `matricula` VARCHAR(32) NOT NULL UNIQUE,
  `nome` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(20) DEFAULT '',
  `chave_pix` VARCHAR(100) DEFAULT '',
  `tipo_pix` VARCHAR(20) DEFAULT 'cpf',
  `telefone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `equipe_id` VARCHAR(64) DEFAULT 'team-alpha',
  `cargo` VARCHAR(100) DEFAULT 'Militante de Campo',
  `valor_diaria` DECIMAL(10, 2) DEFAULT 150.00,
  `status` VARCHAR(50) DEFAULT 'em_campo',
  `total_ruas` INT DEFAULT 0,
  `total_km` DECIMAL(8, 2) DEFAULT 0.0,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Rotas de Vans & Transporte
CREATE TABLE IF NOT EXISTS `rotas_vans` (
  `id` VARCHAR(64) NOT NULL,
  `van_id` VARCHAR(64) NOT NULL,
  `van_nome` VARCHAR(255) NOT NULL,
  `placa` VARCHAR(20) DEFAULT '',
  `motorista_nome` VARCHAR(255) NOT NULL,
  `motorista_telefone` VARCHAR(30) DEFAULT '',
  `periodo` VARCHAR(20) DEFAULT 'manha',
  `data_rota` DATE NOT NULL,
  `bairro_id` VARCHAR(64) NOT NULL,
  `bairro_nome` VARCHAR(255) NOT NULL,
  `ruas_percorridas` TEXT,
  `passageiros_qtd` INT DEFAULT 14,
  `latitude` DECIMAL(10, 8) DEFAULT 0,
  `longitude` DECIMAL(11, 8) DEFAULT 0,
  `fotos_json` LONGTEXT,
  `observacoes` TEXT,
  `status` VARCHAR(50) DEFAULT 'concluido',
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Folhas Semanais de Pagamento
CREATE TABLE IF NOT EXISTS `folha_semanal` (
  `id` VARCHAR(64) NOT NULL,
  `semana_numero` INT NOT NULL,
  `periodo_inicio` DATE NOT NULL,
  `periodo_fim` DATE NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pago',
  `total_bruto` DECIMAL(12, 2) DEFAULT 0.00,
  `total_militantes` INT DEFAULT 0,
  `dados_json` LONGTEXT,
  `criado_em` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
