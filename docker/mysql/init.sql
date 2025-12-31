-- ============================================================================
-- JobMatch AI - MySQL Initialization Script
-- ============================================================================
-- Este script é executado automaticamente na primeira inicialização do MySQL
-- ============================================================================

-- Configurar charset padrão
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Criar database se não existir
CREATE DATABASE IF NOT EXISTS jobmatch_ai 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar database
USE jobmatch_ai;

-- Mensagem de sucesso
SELECT 'Database jobmatch_ai criado com sucesso!' AS message;
