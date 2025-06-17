# 🏢 Sistema de Gestão de Insumos - Comercial Souza

![GitHub](https://img.shields.io/badge/status-Em%20Produção-brightgreen)
![Python](https://img.shields.io/badge/Python-3.10-blue)
![Flask](https://img.shields.io/badge/Flask-Framework-lightgrey)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange)

---

## 📜 Descrição

Sistema web para controle de **estoque de insumos**, com funcionalidades de registro de **entradas, saídas (baixas)**, controle de **estoque mínimo**, além de relatórios em PDF e gestão multiusuário.

O sistema foi desenvolvido para uso interno do **Souza Atacado Distribuidor**, proporcionando uma gestão eficiente e segura dos materiais e produtos.

---

## 🖼️ Screenshots e Explicações

As imagens a seguir ilustram o sistema e suas funcionalidades, organizadas na pasta raiz `estrutura final`:

1. **Modelo Antigo de Gestão:** Contextualização geral com o modelo anterior de controle.
   ![Modelo Antigo](./estrutura final/1-modelo-antigo.png)

2. **Novo Modelo de Gestão e Tela de Login:** Explicação do novo fluxo e interface inicial do sistema.
   ![Novo Modelo e Login](./estrutura final/2-novo-modelo-login.png)

3. **Tela de Estoque:** Visão geral do controle e monitoramento dos produtos em estoque.
   ![Tela de Estoque](./estrutura final/3-tela-estoque.png)

4. **Tela de Baixas:** Registro detalhado das saídas de insumos com informações complementares.
   ![Tela de Baixas](./estrutura final/4-tela-baixas.png)

5. **Tela de Entradas:** Histórico e controle das entradas de insumos no sistema.
   ![Tela de Entradas](./estrutura final/5-tela-entradas.png)

---

## 🚀 Funcionalidades

- 🔐 **Autenticação de usuários**
- 📦 **Gestão de Estoque:**
  - Controle de entradas e saídas
  - Definição de estoque mínimo
  - Alerta visual para baixo estoque
- 📝 **Registro de Entradas (Histórico)**
- ❌ **Registro de Saídas (Baixas)** com:
  - Solicitante
  - Departamento
  - Descrição
  - Urgência
- 📑 **Relatórios PDF:**
  - Estoque
  - Baixas
  - Entradas
- 🔍 **Filtros avançados:**
  - Produto, solicitante, urgência, departamento, status, tipo e data
- 👥 **Gestão multiusuário com controle por sessão**

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python + Flask + SQLAlchemy
- **Frontend:** HTML5, CSS3, JavaScript puro
- **Banco de Dados:** MySQL
- **Outros:** JSPDF (para geração de PDFs), integração opcional com Google Sheets

---

## 🗂️ Estrutura de Pastas

```
├── app.py                # Arquivo principal (Backend Flask)
├── models.py             # Modelagem do banco de dados (SQLAlchemy)
├── templates/
│   └── index.html        # Interface principal
├── static/
│   ├── css/
│   │   └── style.css     # Estilo visual
│   ├── js/
│   │   └── script.js     # Funcionalidade e lógica do frontend
│   └── img/              # Imagens utilizadas
├── README.md             # Documentação do projeto
└── requirements.txt      # Dependências do projeto
```

---

## 🗄️ Banco de Dados

- Banco: `tusk` (MySQL)
- Tabelas principais:
  - `usuario`
  - `estoque`
  - `produto` (entradas)
  - `baixa` (saídas)

---

## 🔧 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Kabralz/Tusk.git
cd Tusk
```

### 2. Crie um ambiente virtual (opcional, mas recomendado)

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate   # Windows
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o banco de dados

- Crie um banco de dados MySQL chamado `tusk`
- Configure o arquivo `app.py` com seu usuário e senha do MySQL:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:SENHA@localhost/tusk'
```

- Execute os comandos para criar as tabelas (via SQLAlchemy ou diretamente no MySQL, conforme seu modelo de dados)

### 5. Execute o projeto

```bash
python app.py
```

Acesse no navegador:

```
http://localhost:5000
```

---

## ✅ Requisitos

- Python 3.10 ou superior
- MySQL
- Pip (gerenciador de pacotes do Python)

---

## 📄 Licença

Este projeto é de uso interno da **Comercial Souza**. Licença privada.

---

## 🤝 Colaboradores

- Matheus Cabral de Souza (https://github.com/Kabralz) – Desenvolvedor

---

## ⭐ Se este projeto te ajudou, deixe uma estrela! ⭐
