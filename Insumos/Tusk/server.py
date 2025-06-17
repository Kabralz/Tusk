from flask import Flask, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__)

@app.route('/api/produtos')
def listar_produtos():
    try:
        # Certifique-se de que o arquivo produtos.xlsx está no mesmo diretório
        df = pd.read_excel('produtos.xlsx', engine='openpyxl')
        produtos = df.to_dict(orient='records')
        return jsonify(produtos)
    except FileNotFoundError:
        return jsonify({"error": "Arquivo produtos.xlsx não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(debug=True)
