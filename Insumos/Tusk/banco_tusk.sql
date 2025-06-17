
-- Banco de Dados: tusk

CREATE DATABASE IF NOT EXISTS tusk;
USE tusk;

-- Tabela de Usuários
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

-- Tabela de Estoque
CREATE TABLE estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estoque INT NOT NULL DEFAULT 0,
    minimo INT DEFAULT 0,
    data DATETIME,
    tipo_entrada VARCHAR(50),
    departamento VARCHAR(100)
);

-- Tabela de Produtos (Entradas)
CREATE TABLE produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    preco DECIMAL(10,2) DEFAULT 0,
    departamento VARCHAR(100),
    data_compra DATETIME,
    observacao VARCHAR(255),
    tipo_entrada VARCHAR(50),
    usuario VARCHAR(100)
);

-- Tabela de Baixas (Saídas)
CREATE TABLE baixa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    solicitante VARCHAR(100),
    departamento VARCHAR(100),
    descricao VARCHAR(255),
    tipo_entrada VARCHAR(50),
    urgencia VARCHAR(50),
    data_baixa DATETIME,
    status VARCHAR(50) DEFAULT 'Entregue',
    usuario VARCHAR(100)
);
