import pandas as pd
import requests
from io import StringIO
from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__, static_url_path='/static', static_folder='static')
app.secret_key = 'sua_chave_secreta'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/tusk'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from models import db, Usuario, Estoque, Produto, Baixa

db.init_app(app)

# Função para carregar planilha Google como DataFrame
def load_spreadsheet_csv(url):
    url = url.replace('/pubhtml', '/pub?output=csv')
    response = requests.get(url)
    content = StringIO(response.text)
    df = pd.read_csv(content)
    return df

# Rota principal
@app.route('/')
def index():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    produtos = Produto.query.all()
    estoque = Estoque.query.order_by(Estoque.nome).all()
    usuarios = Usuario.query.all()
    baixas = Baixa.query.all()
    usuario_tipo = session.get('usuario_tipo', '')

    return render_template('index.html', produtos=produtos, estoque=estoque, usuarios=usuarios, baixas=baixas, usuario_tipo=usuario_tipo)

# Rota de Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        nome = request.form['nome']
        senha = request.form['senha']

        usuario = Usuario.query.filter_by(nome=nome, senha=senha).first()
        if usuario:
            session['logged_in'] = True
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            session['usuario_tipo'] = usuario.tipo
            return redirect(url_for('index'))
        else:
            flash('Credenciais inválidas. Tente novamente.')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('usuario_id', None)  # <-- ADICIONE ESTA LINHA
    session.pop('usuario_nome', None)
    session.pop('usuario_tipo', None)
    return redirect(url_for('login'))

@app.route('/produtos')
def produtos():
    produtos = Estoque.query.order_by(Estoque.nome).all()
    lista = [{
        'id': p.id,
        'nome': p.nome,
        'estoque': p.estoque,
        'minimo': p.minimo,
        'data': p.data,
        'tipo_entrada': p.tipo_entrada
    } for p in produtos]
    return jsonify({'produtos': lista})

@app.route('/estoque/atualizar', methods=['POST'])
def atualizar_estoque():
    dados = request.get_json()
    produto_id = dados.get('produtoId')
    quantidade = dados.get('quantidade')
    tipo = dados.get('tipo')
    estoque_minimo = dados.get('estoque_minimo')
    print("Estoque mínimo recebido:", estoque_minimo)
    # Outros dados
    preco = dados.get('preco', 0)
    departamento = dados.get('destino', '').strip()
    observacao = dados.get('observacao', '')
    usuario_nome = session.get('usuario_nome', 'Desconhecido')  # <-- Obtenha o nome do usuário da sessão

    # NÃO use ou atualize o campo 'tipoEntrada' do payload

    produto = Estoque.query.get(produto_id)
    if not produto:
        return jsonify({"erro": "Produto não encontrado"}), 404

    if tipo == 'entrada':
        produto.estoque += quantidade
        produto.data = datetime.now()
        historico = Produto(
            nome=produto.nome,
            quantidade=quantidade,
            preco=preco,
            data_compra=datetime.now(),
            departamento=departamento,
            observacao=observacao,
            tipo_entrada=produto.tipo_entrada,
            usuario=usuario_nome  # <-- Adicione aqui
        )
        db.session.add(historico)
    elif tipo == 'saida':
        if quantidade > produto.estoque:
                        return jsonify({"erro": "Quantidade insuficiente no estoque."}), 400
        produto.estoque -= quantidade

        # Registrar baixa
        baixa = Baixa(
            produto=produto.nome,
            quantidade=quantidade,
            solicitante=dados.get('solicitante'),
            departamento=departamento,
            descricao=dados.get('descricao'),
            tipo_entrada=produto.tipo_entrada,
            urgencia=dados.get('urgencia'),
            data_baixa=datetime.now(),
            status='Entregue',
            usuario=usuario_nome  # <-- Adicione aqui
        )
        db.session.add(baixa)

    estoque_minimo = dados.get('estoque_minimo')
    print("Estoque mínimo recebido:", estoque_minimo)
    if estoque_minimo not in [None, '', 'null']:
        try:
            produto.minimo = int(estoque_minimo)
        except (ValueError, TypeError):
            pass  # Não altera o valor existente
    # Se estoque_minimo for None ou vazio, NÃO altera produto.minimo!

    produto.data = datetime.now()
    db.session.commit()
    return jsonify({
        "estoque_atualizado": produto.estoque,
        "estoque_minimo_atualizado": produto.minimo,
        "data_atualizacao": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    })
    # Debug
    print("Debug Atualizar Estoque:")
    print("Produto ID:", produto_id)
    print("Produto Nome:", produto.nome)
    print("Estoque Atual:", produto.estoque)
    print("Tipo_Entrada (antes):", produto.tipo_entrada)
    print("Dados Recebidos:", dados)
    print("DEBUG: Produto após commit:", produto.__dict__)  # <-- Linha adicionada para debug

@app.route('/estoque')
def estoque():
    produtos = Estoque.query.order_by(Estoque.nome).all()
    lista = []
    for p in produtos:
        lista.append({
            'id': p.id,
            'nome': p.nome,
            'estoque': p.estoque,
            'minimo': p.minimo,
            'data': p.data.isoformat() if p.data else None
        })
    return jsonify({'produtos': lista})

@app.route('/estoque/deletar/<int:id>', methods=['DELETE'])
def deletar_estoque(id):
    produto = Estoque.query.get(id)
    if produto:
        db.session.delete(produto)
        db.session.commit()
        return jsonify({'sucesso': True})
    return jsonify({'sucesso': False, 'erro': 'Produto não encontrado.'})

@app.route('/baixas', methods=['GET'])
def listar_baixas():
    baixas = Baixa.query.order_by(Baixa.data_baixa.desc()).all()
    resultado = []
    for b in baixas:
        resultado.append({
            'id': b.id,
            'produto': b.produto,
            'quantidade': b.quantidade,
            'solicitante': b.solicitante,
            'departamento': b.departamento,
            'descricao': b.descricao,
            'tipo_entrada': b.tipo_entrada,
            'urgencia': b.urgencia,
            'status': getattr(b, 'status', 'Pendente'),
            'data_baixa': b.data_baixa.strftime('%d/%m/%Y %H:%M:%S') if b.data_baixa else None,
            'usuario': b.usuario or ''  # <-- Inclua aqui
        })
    return jsonify(resultado)

@app.route('/baixas/registrar', methods=['POST'])
def registrar_baixa():
    try:
        dados = request.get_json()
        produto_nome = dados.get('produto')
        quantidade = dados.get('quantidade')
        solicitante = dados.get('solicitante')
        departamento = dados.get('departamento')
        descricao = dados.get('descricao')
        urgencia = dados.get('urgencia')
        destino = dados.get('destino', '').strip()

        if not produto_nome or not quantidade:
            return jsonify({"erro": "Produto e quantidade são obrigatórios."}), 400

        produto_estoque = Estoque.query.filter_by(nome=produto_nome).first()
        if not produto_estoque:
            return jsonify({"erro": "Produto não encontrado no estoque."}), 404

        if quantidade > produto_estoque.estoque:
            return jsonify({"erro": "Quantidade insuficiente no estoque."}), 400

        # Busca o tipo_entrada do produto no estoque
        # Se o produto já existe, use o tipo_entrada do banco
        # Se não existe, tente pegar do front-end, mas só se realmente for novo
        if produto_estoque and produto_estoque.tipo_entrada:
            tipo_entrada = produto_estoque.tipo_entrada
        else:
            tipo_entrada = dados.get('tipoEntrada', '')

        baixa = Baixa(
            produto=produto_nome,
            quantidade=quantidade,
            solicitante=solicitante,
            departamento=destino,  # Alterado de setor para departamento
            descricao=descricao,
            tipo_entrada=tipo_entrada,  # <-- Inclua aqui
            urgencia=urgencia,
            data_baixa=datetime.now(),
            status='Entregue'
        )

        produto_estoque.estoque -= quantidade
        produto_estoque.data = datetime.now()

        db.session.add(baixa)
        db.session.commit()

        return jsonify({
            "mensagem": "Baixa registrada com sucesso.",
            "baixa": {
                "produto": produto_nome,
                "quantidade": quantidade,
                "solicitante": solicitante,
                "setor": destino,
                "descricao": descricao,
                "tipo_entrada": tipo_entrada,  # <-- Inclua na resposta também
                "urgencia": urgencia,
                "status": "Entregue",
                "data_baixa": baixa.data_baixa.strftime('%d/%m/%Y %H:%M:%S')
            },
            "estoque_atualizado": produto_estoque.estoque
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"erro": "Erro interno no servidor", "detalhes": str(e)}), 500

@app.route('/produtos/listar')
def listar_produtos():
    produtos = Produto.query.order_by(Produto.nome).all()
    lista = [{
        'id': p.id,
        'nome': p.nome,
        'quantidade': p.quantidade,
        'departamento': p.departamento,
        'preco': float(p.preco),
        'data_compra': p.data_compra.strftime('%Y-%m-%d %H:%M:%S') if p.data_compra else '',
        'tipo_entrada': p.tipo_entrada or '',
        'usuario': p.usuario or ''  # <-- Inclua aqui
    } for p in produtos]
    return jsonify({'produtos': lista})
    
@app.route('/produtos/registrar', methods=['POST'])
def registrar_produto():
    import traceback
    try:
        dados = request.get_json()
        print("Dados recebidos:", dados)

        nome_novo = dados.get('nome_novo', '').strip()
        quantidade = int(dados.get('quantidade', 0))
        preco = float(dados.get('preco', 0)) if dados.get('preco') else 0.0
        departamento = dados.get('departamento', '').strip()
        observacao = dados.get('observacao', '').strip()

        if not nome_novo or quantidade <= 0:
            return jsonify({'erro': 'Nome do produto e quantidade são obrigatórios e válidos.'}), 400

        # Procura produto já existente no estoque
        produto_estoque = Estoque.query.filter_by(nome=nome_novo).first()

        if produto_estoque:
            # Produto já existe: atualiza apenas quantidade e data, mantendo tipo_entrada
            produto_estoque.estoque += quantidade
            produto_estoque.data = datetime.now()
            tipo_entrada = produto_estoque.tipo_entrada
        else:
            # Produto novo: cria no estoque
            # Aqui NÃO usamos nenhum valor vindo do payload para tipo_entrada;
            # se necessário defina um padrão (por exemplo, "FIXO")
            tipo_entrada = "FIXO"
            produto_estoque = Estoque(
                nome=nome_novo,
                estoque=quantidade,
                minimo=0,
                data=datetime.now(),
                tipo_entrada=tipo_entrada
            )
            db.session.add(produto_estoque)
            db.session.commit()
            tipo_entrada = produto_estoque.tipo_entrada

        # Cria o histórico do produto com os dados informados e
        # o valor de tipo_entrada que já está no banco (sem modificações)
        historico = Produto(
            nome=nome_novo,
            quantidade=quantidade,
            preco=preco,
            data_compra=datetime.now(),
            departamento=departamento,
            observacao=observacao,
            tipo_entrada=tipo_entrada
        )
        db.session.add(historico)
        db.session.commit()

        return jsonify({'sucesso': True, 'mensagem': 'Produto registrado com sucesso.'})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'erro': 'Erro interno ao registrar produto.', 'detalhes': str(e)}), 500
    

@app.route('/estoque/filtrar')
def filtrar_estoque():
    departamento = request.args.get('departamento')
    if departamento:
        produtos = Estoque.query.filter_by(departamento=departamento).all()
    else:
        produtos = Estoque.query.all()
    # Retorne os produtos como JSON
    return jsonify([{
        'id': p.id,
        'nome': p.nome,
        'estoque': p.estoque,
        'minimo': p.minimo,
        'departamento': p.departamento,
        'data': p.data
    } for p in produtos])



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


