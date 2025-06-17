from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import DateTime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    senha = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(20), nullable=False, default='COMUM')  # ADMIN, TÉCNICO, COMUM

class Estoque(db.Model):
    __tablename__ = 'estoque'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    estoque = db.Column(db.Integer, nullable=False)
    minimo = db.Column(db.Integer, nullable=True)
    data = db.Column(DateTime, default=datetime.utcnow)
    departamento = db.Column(db.String(100), nullable=True)
    tipo_entrada = db.Column(db.String(20), nullable=True)  # Coluna para o tipo de entrada

class Produto(db.Model):
    __tablename__ = 'produtos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco = db.Column(db.Numeric(10,2), nullable=False)
    departamento = db.Column(db.String(100))
    observacao = db.Column(db.Text)
    data_compra = db.Column(db.DateTime)
    tipo_entrada = db.Column(db.String(20), nullable=True)  # Coluna para o tipo de entrada
    usuario = db.Column(db.String(100))  # <-- ADICIONE ESTA LINHA

class Baixa(db.Model):
    __tablename__ = 'baixas'
    id = db.Column(db.Integer, primary_key=True)
    produto = db.Column(db.String(100))
    quantidade = db.Column(db.Integer)
    solicitante = db.Column(db.String(100))
    departamento = db.Column(db.String(100))
    descricao = db.Column(db.String(255))
    tipo_entrada = db.Column(db.String(50))  # <-- Adicione esta linha
    urgencia = db.Column(db.String(50))
    status = db.Column(db.String(50))
    data_baixa = db.Column(db.DateTime)
    usuario = db.Column(db.String(100))  # <-- ADICIONE ESTA LINHA


