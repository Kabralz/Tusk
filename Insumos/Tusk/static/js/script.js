let produtos = {}; // Inicializa como um objeto vazio

window.addEventListener("DOMContentLoaded", () => {
  // Outras chamadas já existentes...
  mostrarAba('estoque');
  carregarProdutos();
  carregarEstoque();
  iniciarCarrossel();
  carregarBaixas();
  setTimeout(carregarFiltrosBaixas, 1000); // Aguarda as linhas serem carregadas
});

// Preenche os selects de filtro com valores únicos das colunas
function carregarFiltrosBaixas() {
  preencherFiltroColuna('tabelaSolicitacoes', 0, 'filtroProdutoBaixa');
  preencherFiltroColuna('tabelaSolicitacoes', 2, 'filtroSolicitanteBaixa');
  preencherFiltroColuna('tabelaSolicitacoes', 3, 'filtroDepartamentoBaixa');
  preencherFiltroColuna('tabelaSolicitacoes', 5, 'filtroTipoEntradaBaixa');
  preencherFiltroColuna('tabelaSolicitacoes', 6, 'filtroUrgenciaBaixa');
  preencherFiltroColuna('tabelaSolicitacoes', 7, 'filtroStatusBaixa');
  preencherFiltroDataUnica('tabelaSolicitacoes', 8, 'filtroHoraBaixa'); // NOVO: só datas únicas
  preencherFiltroColuna('tabelaSolicitacoes', 9, 'filtroUsuarioBaixa');
}

// Função para preencher apenas as datas únicas (dd/mm/yyyy) da coluna "Hora"
function preencherFiltroDataUnica(tableId, colIndex, filtroId) {
  const tabela = document.getElementById(tableId);
  const filtro = document.getElementById(filtroId);
  if (!tabela || !filtro) return;
  const valores = new Set();
  tabela.querySelectorAll('tbody tr').forEach(tr => {
    const td = tr.children[colIndex];
    if (td) {
      // Pega só a parte da data (antes do espaço)
      const data = td.textContent.trim().split(' ')[0];
      if (data) valores.add(data);
    }
  });
  filtro.innerHTML = '<option value="">Todos</option>';
  Array.from(valores).sort((a, b) => {
    // Ordena datas no formato dd/mm/yyyy corretamente
    const [da, ma, ya] = a.split('/').map(Number);
    const [db, mb, yb] = b.split('/').map(Number);
    return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
  }).forEach(valor => {
    const opt = document.createElement('option');
    opt.value = valor;
    opt.textContent = valor;
    filtro.appendChild(opt);
  });
}

function preencherFiltroColuna(tableId, colIndex, filtroId) {
  const tabela = document.getElementById(tableId);
  const filtro = document.getElementById(filtroId);
  if (!tabela || !filtro) return;
  const valores = new Set();
  tabela.querySelectorAll('tbody tr').forEach(tr => {
    const td = tr.children[colIndex];
    if (td) valores.add(td.textContent.trim());
  });
  filtro.innerHTML = '<option value="">Todos</option>';
  Array.from(valores).sort().forEach(valor => {
    if (valor) {
      const opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      filtro.appendChild(opt);
    }
  });
}

// Filtra a tabela conforme os selects
function filtrarTabelaBaixas() {
  const tabela = document.getElementById('tabelaSolicitacoes');
  const filtros = [
    document.getElementById('filtroProdutoBaixa').value,
    null,
    document.getElementById('filtroSolicitanteBaixa').value,
    document.getElementById('filtroDepartamentoBaixa').value,
    null,
    document.getElementById('filtroTipoEntradaBaixa').value,
    document.getElementById('filtroUrgenciaBaixa').value,
    document.getElementById('filtroStatusBaixa').value,
    document.getElementById('filtroHoraBaixa').value, // agora é select!
    document.getElementById('filtroUsuarioBaixa').value
  ];
  tabela.querySelectorAll('tbody tr').forEach(tr => {
    let mostrar = true;
    filtros.forEach((filtro, i) => {
      if (filtro && i === 8) { // Coluna da data/hora
        const dataTexto = tr.children[8].textContent.trim().split(' ')[0];
        if (dataTexto !== filtro) {
          mostrar = false;
        }
      } else if (filtro && i !== 1 && i !== 4 && i !== 8) {
        if (tr.children[i].textContent.trim() !== filtro) {
          mostrar = false;
        }
      }
    });
    tr.style.display = mostrar ? '' : 'none';
  });
}

// Função para mostrar aba ativa no menu lateral
function mostrarAba(abaId) {
  const abas = document.querySelectorAll('.content > div');
  abas.forEach((aba) => {
    aba.classList.add('hidden');
    aba.classList.remove('fade-in');
  });

  const abaSelecionada = document.getElementById(abaId);
  if (abaSelecionada) {
    abaSelecionada.classList.remove('hidden');
    void abaSelecionada.offsetWidth;
    abaSelecionada.classList.add('fade-in');
  }

  const links = document.querySelectorAll('.sidebar a');
  links.forEach(link => link.classList.remove('ativo'));

  links.forEach(link => {
    if (link.dataset.aba === abaId) {
      link.classList.add('ativo');
    }
  });
}

// Carrega estoque do backend e atualiza variável e tabela
async function carregarEstoque() {
  const res = await fetch('/estoque');
  if (!res.ok) {
    alert('Erro ao carregar o estoque.');
    return;
  }
  const data = await res.json();

  produtos = {};
  data.produtos.forEach(produto => {
    produtos[produto.id] = {
      nome: produto.nome,
      estoque: Number(produto.estoque),
      minimo: Number(produto.minimo),
      data: produto.data || '',
      tipo_entrada: produto.tipo_entrada || '' // <-- Aqui!
    };
  });

  atualizarTabela();
}

// Inicializa carrossel de imagens
function iniciarCarrossel() {
  let currentIndex = 0;
  const carrossel = document.querySelector('.carrossel');
  if (!carrossel) return;

  const imagens = Array.from(carrossel.querySelectorAll('img'));
  const totalImagens = imagens.length;

  imagens.forEach((img) => {
    const clone = img.cloneNode(true);
    carrossel.appendChild(clone);
  });

  function atualizarCarrossel() {
    const offset = -currentIndex * 100;
    carrossel.style.transition = currentIndex === totalImagens ? 'none' : 'transform 0.5s ease-in-out';
    carrossel.style.transform = `translateX(${offset}%)`;

    if (currentIndex === totalImagens) {
      setTimeout(() => {
        carrossel.style.transition = 'none';
        currentIndex = 0;
        carrossel.style.transform = `translateX(0%)`;
      }, 500);
    }
  }

  setInterval(() => {
    currentIndex++;
    atualizarCarrossel();
  }, 5000);
}

// Carrega produtos do backend e preenche select
async function carregarProdutos() {
  try {
    const response = await fetch('/produtos');
    const data = await response.json();
    const select = document.getElementById("produto");
    select.innerHTML = '<option disabled selected value="">Selecione um produto</option>';
    
    data.produtos.forEach(produto => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.text = produto.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

// Função para registrar uma entrada (Gestão de Insumos)
function registrarInsumo(event) {
  event.preventDefault();

  // Pegue o valor do campo destino corretamente
  const destino = document.getElementById('destino').value.trim();
  console.log("Valor digitado no campo destino:", destino); // <-- Adicione este log
  
  // Capture os valores comuns
  const produtoId = document.getElementById('produto').value;
  const produtoSelecionado = produtos[produtoId];
  const tipoEntrada = produtoSelecionado ? produtoSelecionado.tipo_entrada : null;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const estoqueMinimoInput = document.getElementById('estoqueMinimo').value;
  const parsedEstoqueMinimo = parseInt(estoqueMinimoInput);
  const estoqueMinimo = isNaN(parsedEstoqueMinimo) ? null : parsedEstoqueMinimo;
  console.log("Estoque Mínimo digitado:", estoqueMinimo);
  const tipo = document.getElementById('tipo').value;
  
  // Dados específicos conforme tipo
  let preco = null, solicitante = null, descricao = null, urgencia = null;
  
  if (tipo === 'entrada') {
    // Preço por unidade é opcional
    preco = document.getElementById('preco-insumo').value;
  } else if (tipo === 'saida') {
    solicitante = document.getElementById('solicitante-estoque').value;
    descricao = document.getElementById('descricao-estoque').value;
    urgencia = document.getElementById('urgencia-estoque').value;
  }
  
  // Crie seu payload com base no tipo
  const payload = {
    produtoId,
    quantidade,
    estoque_minimo: estoqueMinimo, // <-- use exatamente este nome!
    tipo,
    destino,
    preco,
    solicitante,
    descricao,
    urgencia
  };
  console.log("Payload enviado:", payload);

  fetch('/estoque/atualizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    console.log("Resposta do servidor:", data);
    if (data.erro) {
      alert(data.erro);
    } else {
      alert("Estoque atualizado com sucesso.");

      // Recupera o nome do produto a partir do select
      const selectProduto = document.getElementById('produto');
      const produtoNome = selectProduto.options[selectProduto.selectedIndex].text;
      const hora = new Date().toLocaleString();

      // Atualiza a tabela de registros conforme o tipo
      if (tipo === 'entrada') {
        adicionarLinhaEntrada({
          produto: produtoNome,
          quantidade,
          departamento: destino,
          preco: payload.preco,
          hora
        });
      } else if (tipo === 'saida') {
        adicionarLinhaSolicitacao({
          produto: produtoNome,
          quantidade,
          solicitante: payload.solicitante,
          departamento: destino,
          descricao: payload.descricao,
          tipo_entrada: tipoEntrada, // <-- Adicione isto!
          urgencia: payload.urgencia,
          status: (data.baixa && data.baixa.status) ? data.baixa.status : 'Pendente',
          hora
        });
      }
      event.target.reset();
      toggleCamposTipo();

      // Atualiza automaticamente todas as abas após o registro:
      carregarEstoque();
      carregarProdutos();
      carregarTabelaEntradas();
      carregarBaixas();
    }
  })
  .catch(error => {
    console.error("Erro ao atualizar estoque:", error);
  });
}

// Função para adicionar uma nova linha na tabela de entradas (aba "produtos")
function adicionarLinhaEntrada({ produto, quantidade, departamento, preco, hora, usuario }) {
  const total = (quantidade * preco).toFixed(2);
  const tbody = document.querySelector('#tabelaEntradas tbody');
  if (!tbody) {
    console.error("Tabela de entradas não encontrada.");
    return;
  }
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="produto-coluna">${produto}</td>
    <td>${quantidade}</td>
    <td>${departamento}</td>
    <td>R$ ${parseFloat(preco).toFixed(2)}</td>
    <td>R$ ${total}</td>
    <td>${hora}</td>
    <td></td>
    <td>${usuario || ''}</td>
  `;
  tbody.appendChild(tr);
}

// Função para adicionar uma nova linha na tabela de baixas (saídas)
function adicionarLinhaSolicitacao({ produto, quantidade, solicitante, departamento, descricao, tipo_entrada, urgencia, status, hora, usuario }) {
  const tbody = document.querySelector('#tabelaSolicitacoes tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${produto}</td>
    <td>${quantidade}</td>
    <td>${solicitante || ''}</td>
    <td>${departamento || ''}</td>
    <td>${descricao || ''}</td>
    <td>${tipo_entrada || ''}</td>
    <td>${urgencia || ''}</td>
    <td>${status}</td>
    <td>${hora}</td>
    <td>${usuario || ''}</td>
  `;
  tbody.appendChild(tr);
}

function registrarInsumo(event) {
  event.preventDefault();
  
  // Capture os valores comuns
  const produtoId = document.getElementById('produto').value;
  const produtoSelecionado = produtos[produtoId];
  const tipoEntrada = produtoSelecionado ? produtoSelecionado.tipo_entrada : null;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const estoqueMinimoInput = document.getElementById('estoqueMinimo').value;
  const parsedEstoqueMinimo = parseInt(estoqueMinimoInput);
  const estoqueMinimo = isNaN(parsedEstoqueMinimo) ? null : parsedEstoqueMinimo;
  const tipo = document.getElementById('tipo').value;
  const destino = document.getElementById('destino').value.trim();
  
  // Dados específicos conforme tipo
  let preco = null, solicitante = null, descricao = null, urgencia = null;
  
  if (tipo === 'entrada') {
    // Preço por unidade é opcional
    preco = document.getElementById('preco-insumo').value;
  } else if (tipo === 'saida') {
    solicitante = document.getElementById('solicitante-estoque').value;
    descricao = document.getElementById('descricao-estoque').value;
    urgencia = document.getElementById('urgencia-estoque').value;
  }
  
  // Crie seu payload com base no tipo
  const payload = {
    produtoId,
    quantidade,
    estoque_minimo: estoqueMinimo, // <-- use exatamente este nome!
    tipo,
    destino,
    preco,
    solicitante,
    descricao,
    urgencia
  };
  
  // Envie payload para o back-end (endpoint correspondente)
  // Exemplo usando fetch:
  fetch('/estoque/atualizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.erro) {
      alert(data.erro);
    } else {
      alert("Estoque atualizado com sucesso!");

      // Recupera o nome do produto a partir do select
      const selectProduto = document.getElementById('produto');
      const produtoNome = selectProduto.options[selectProduto.selectedIndex].text;
      const hora = new Date().toLocaleString();

      // Atualiza a tabela de registros conforme o tipo
      if (tipo === 'entrada') {
        adicionarLinhaEntrada({
          produto: produtoNome,
          quantidade,
          departamento: destino,
          preco: payload.preco,
          hora
        });
      } else if (tipo === 'saida') {
        adicionarLinhaSolicitacao({
          produto: produtoNome,
          quantidade,
          solicitante: payload.solicitante,
          departamento: destino,
          descricao: payload.descricao,
          tipo_entrada: tipoEntrada, // <-- Adicione isto!
          urgencia: payload.urgencia,
          status: (data.baixa && data.baixa.status) ? data.baixa.status : 'Pendente',
          hora
        });
      }
      event.target.reset();
      toggleCamposTipo();

      // Atualiza automaticamente todas as abas após o registro:
      carregarEstoque();
      carregarProdutos();
      carregarTabelaEntradas();
      carregarBaixas();
    }
  })
  .catch(error => {
    console.error("Erro ao atualizar estoque:", error);
    alert("Erro ao atualizar estoque. Veja o console para detalhes.");
  });
}

function limparRegistros() {
  document.getElementById('produto').value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('estoqueMinimo').value = '';
  document.getElementById('tipo').value = 'entrada';
}

function formatarDataBR(dataISO) {
  if (!dataISO) return '';

  // Se a data já estiver no formato "dd/mm/yyyy hh:mm:ss", retorna-a diretamente
  if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}(:\d{2})?$/.test(dataISO)) {
    return dataISO;
  }

  // Tenta converter qualquer string de data reconhecida pelo JS
  const dateObj = new Date(dataISO);
  if (isNaN(dateObj.getTime())) return 'Data inválida';

  const dia = String(dateObj.getDate()).padStart(2, '0');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const ano = dateObj.getFullYear();
  const hora = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const seg = String(dateObj.getSeconds()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

// Atualiza tabela visual do estoque
function atualizarTabela() {
  const tbody = document.querySelector('#tabelaEstoque tbody');
  tbody.innerHTML = '';

  for (const id in produtos) {
    const p = produtos[id];
    const estoque = p.estoque;
    const minimo = p.minimo;

    const tr = document.createElement('tr');
    tr.className = estoque < minimo ? 'baixo-estoque' : 'estoque-ok';
    tr.innerHTML = `
      <td>${p.nome.charAt(0).toUpperCase() + p.nome.slice(1)}</td>
      <td>${estoque}</td>
      <td>${minimo || ''}</td>
      <td>${formatarDataBR(p.data) || ''}</td>
    `;

    tbody.appendChild(tr);
  }
}

function abrirModalExcluir() {
  const modal = document.getElementById('modalExcluir');
  modal.classList.add('show');

  const select = document.getElementById('produtoExcluir');
  select.innerHTML = '<option disabled selected value="">Selecione um produto</option>';

  for (const id in produtos) {
    const p = produtos[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = p.nome.charAt(0).toUpperCase() + p.nome.slice(1);
    select.appendChild(option);
  }
}

function fecharModalExcluir() {
  const modal = document.getElementById('modalExcluir');
  modal.classList.remove('show');
}

function fecharModalExcluirFora(event) {
  const modal = document.getElementById('modalExcluir');
  if (event.target === modal) {
    fecharModalExcluir();
  }
}

function confirmarExclusao() {
  const produtoId = document.getElementById('produtoExcluir').value;
  if (!produtoId) {
    alert("Selecione um produto para excluir.");
    return;
  }

  fetch(`/estoque/deletar/${produtoId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.sucesso) {
        alert('Produto excluído com sucesso!');
        fecharModalExcluir();
        carregarEstoque();
        carregarProdutos();
      } else {
        alert('Erro: ' + data.erro);
      }
    })
    .catch(error => {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto. Veja o console para mais detalhes.');
    });
}

// Registrar baixa (consumo/requisição de produto)
async function registrarBaixa(event) {
  event.preventDefault();

  const produto = document.getElementById('produto-solicitacao').value;
  const quantidade = parseInt(document.getElementById('quantidade-solicitacao').value);
  const solicitante = document.getElementById('solicitante').value;
  const departamento = document.getElementById('departamento').value;
  const descricao = document.getElementById('descricao').value;
  const urgencia = document.getElementById('urgencia').value;

  try {
    const response = await fetch('/baixas/registrar', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ produto, quantidade, solicitante, departamento, descricao, urgencia })
    });

    const result = await response.json();

    if (!response.ok || result.erro) {
      alert('Erro ao registrar baixa: ' + (result.erro || 'Erro desconhecido'));
      return;
    }

    adicionarLinhaSolicitacao({
      produto,
      quantidade,
      solicitante,
      departamento,
      descricao,
      urgencia,
      status: result.baixa.status || 'Entregue',
      hora: new Date().toLocaleTimeString()
    });

    await carregarEstoque(); // Atualiza a aba estoque

    alert(result.mensagem || 'Baixa registrada com sucesso!');
    event.target.reset();

  } catch (error) {
    console.error('Erro ao registrar baixa:', error);
    alert('Erro ao registrar baixa. Verifique o console para mais detalhes.');
  }
}

// Adiciona linha nova na tabela de solicitações (baixas)
function adicionarLinhaSolicitacao({produto, quantidade, solicitante, departamento, descricao, urgencia, status, hora, usuario}) {
  const tbody = document.querySelector('#tabelaSolicitacoes tbody');
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${produto}</td>
    <td>${quantidade}</td>
    <td>${solicitante}</td>
    <td>${departamento || ''}</td> <!-- Certifique-se de que o backend retorna departamento -->
    <td>${descricao}</td>
    <td>${urgencia}</td>
    <td>${status}</td>
    <td>${hora}</td>
    <td>${usuario || ''}</td>
  `;

  tbody.appendChild(tr);
}

// Carrega lista de baixas do backend
async function carregarBaixas() {
  try {
    const res = await fetch('/baixas');
    const baixas = await res.json();
    const tbody = document.querySelector('#tabelaSolicitacoes tbody');
    tbody.innerHTML = '';

    baixas.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.produto}</td>
        <td>${b.quantidade}</td>
        <td>${b.solicitante || ''}</td>
        <td>${b.departamento || ''}</td>
        <td>${b.descricao || ''}</td>
        <td>${b.tipo_entrada || ''}</td>
        <td>${b.urgencia || ''}</td>
        <td>${b.status || 'Pendente'}</td>
        <td>${b.data_baixa || ''}</td>
        <td>${b.usuario || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar baixas:", error);
  }
}

// Carrega produtos no modal de baixa
async function carregarProdutosBaixa() {
  try {
    const response = await fetch('/produtos');
    const data = await response.json();
    const select = document.getElementById("produto-solicitacao");
    select.innerHTML = '<option disabled selected value="">Selecione um produto</option>';

    data.produtos.forEach(produto => {
      const option = document.createElement("option");
      option.value = produto.nome;
      option.text = produto.nome.charAt(0).toUpperCase() + produto.nome.slice(1);
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos para baixa:", error);
  }
}

async function carregarTabelaEntradas() {
  try {
    const response = await fetch('/produtos/listar');
    if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
    const data = await response.json();
    console.log("Dados recebidos para tabela de entradas:", data);

    const tabela = document.getElementById('tabelaEntradas');
    tabela.querySelectorAll('tbody tr').forEach(tr => tr.remove());
    const tbody = tabela.querySelector('tbody');
    if (!tbody) {
      console.error("Tabela precisa ter <tbody>");
      return;
    }

    data.produtos.forEach(produto => {
      console.log("Processando produto:", produto);
      const precoUnitario = produto.preco ? parseFloat(produto.preco).toFixed(2) : 'N/A';
      const total = produto.preco && produto.quantidade
                      ? (produto.quantidade * produto.preco).toFixed(2)
                      : 'N/A';
      const dataCompra = produto.data_compra || produto.data;
      const horaEntrada = dataCompra ? formatarDataBR(dataCompra) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.departamento}</td>
        <td>${precoUnitario}</td>
        <td>${total}</td>
        <td>${produto.tipo_entrada || ''}</td>
        <td>${horaEntrada}</td>
        <td>${produto.usuario || ''}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Erro ao carregar tabela de entradas:', error);
  }
}

// Se selecionar produto da lista, limpa o campo novo-produto
function toggleNovoProduto() {
  const select = document.getElementById('produto-estoque');
  const novoProduto = document.getElementById('novo-produto');
  if (!select || !novoProduto) return; // Se não existem, sai da função.

  if (select.value) {
    novoProduto.value = '';
    novoProduto.disabled = true;
  } else {
    novoProduto.disabled = false;
  }
}

// Se digitar novo produto, limpa seleção do produto existente
function toggleProdutoExistente() {
  const select = document.getElementById('produto-estoque');
  const novoProduto = document.getElementById('novo-produto');
  if (!select || !novoProduto) return;
  
  if (novoProduto.value.trim().length > 0) {
    select.value = '';
    select.disabled = true;
  } else {
    select.disabled = false;
  }
}

async function carregarProdutosEntrada() {
  try {
    const response = await fetch('/produtos');
    const data = await response.json();
    const select = document.getElementById('produto-estoque');
    // limpa opções anteriores, mantendo a primeira default
    select.innerHTML = '<option value="" selected>Selecione um produto existente</option>';

    data.produtos.forEach(produto => {
      const option = document.createElement("option");
      option.value = produto.nome;
      option.text = produto.nome.charAt(0).toUpperCase() + produto.nome.slice(1);
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos para entrada:", error);
  }
}

async function carregarTabelaEntradas() {
  try {
    const response = await fetch('/produtos/listar');
    if (!response.ok) throw new Error('Erro na requisição: ' + response.status);
    const data = await response.json();
    console.log("Dados recebidos para tabela de entradas:", data);

    const tabela = document.getElementById('tabelaEntradas');
    tabela.querySelectorAll('tbody tr').forEach(tr => tr.remove());
    const tbody = tabela.querySelector('tbody');
    if (!tbody) {
      console.error("Tabela precisa ter <tbody>");
      return;
    }

    data.produtos.forEach(produto => {
      console.log("Processando produto:", produto);
      const precoUnitario = produto.preco ? parseFloat(produto.preco).toFixed(2) : 'N/A';
      const total = produto.preco && produto.quantidade
                      ? (produto.quantidade * produto.preco).toFixed(2)
                      : 'N/A';
      const dataCompra = produto.data_compra || produto.data;
      const horaEntrada = dataCompra ? formatarDataBR(dataCompra) : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.departamento}</td>
        <td>${precoUnitario}</td>
        <td>${total}</td>
        <td>${produto.tipo_entrada || ''}</td>
        <td>${horaEntrada}</td>
        <td>${produto.usuario || ''}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Erro ao carregar tabela de entradas:', error);
  }
}

// Exemplo: carregar tabela ao abrir a página
window.addEventListener('DOMContentLoaded', carregarTabelaEntradas);

// Função para registrar entrada (nova lógica unificada)
function registrarEntrada(event) {
  event.preventDefault();

  const nomeExistente = document.getElementById('produto-estoque').value;
  const nomeNovo = document.getElementById('novo-produto').value.trim();
  const nome = nomeNovo || nomeExistente;
  const quantidade = parseInt(document.getElementById('quantidade-entrada').value);
  const departamento = document.getElementById('departamento-entrada').value.trim();
  const preco = parseFloat(document.getElementById('preco-entrada').value);
  const observacao = document.getElementById('observacao-entrada').value.trim();

  if (!nome || isNaN(quantidade) || !departamento || isNaN(preco)) {
    alert("Preencha todos os campos obrigatórios corretamente.");
    return;
  }

  fetch('/produtos/novo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, quantidade, departamento, preco, observacao })
  })
  .then(res => res.json())
  .then (data => {
    if (data.erro) {
      alert(data.erro);
    } else {
      alert("Entrada registrada com sucesso!");
      event.target.reset();
      carregarEstoque();
      carregarProdutos();
      carregarProdutosEntrada();
      carregarProdutosBaixa();

      const hora = new Date().toLocaleString();
      adicionarLinhaEntrada({ produto: nome, quantidade, departamento, preco, hora });
    }
  })
  .catch(err => {
    console.error("Erro ao registrar entrada:", err);
    alert("Erro ao registrar entrada.");
  });
}

// Garante que apenas um tipo de produto (novo ou existente) seja preenchido
function toggleNovoProduto() {
  const select = document.getElementById('produto-estoque');
  const novoProduto = document.getElementById('novo-produto');
  if (!select || !novoProduto) return; // Se não existem, sai da função.

  if (select.value) {
    novoProduto.value = '';
    novoProduto.disabled = true;
  } else {
    novoProduto.disabled = false;
  }
}

function toggleProdutoExistente() {
  const select = document.getElementById('produto-estoque');
  const novoProduto = document.getElementById('novo-produto');
  if (!select || !novoProduto) return;
  
  if (novoProduto.value.trim().length > 0) {
    select.value = '';
    select.disabled = true;
  } else {
    select.disabled = false;
  }
}

// Função para registrar um novo produto (entrada) na aba "produtos"
function registrarProduto(event) {
  event.preventDefault();

  // Captura dos valores do formulário
  const nome = document.getElementById('nome-produto').value.trim();
  const quantidade = parseInt(document.getElementById('quantidade-produto').value);
  const departamento = document.getElementById('departamento-produto').value.trim();
  const preco = parseFloat(document.getElementById('preco-produto').value);

  console.log("Valores capturados:", { nome, quantidade, departamento, preco });

  if (!nome || isNaN(quantidade) || !departamento || isNaN(preco)) {
    alert("Preencha todos os campos obrigatórios corretamente.");
    return;
  }

  const payload = { nome, quantidade, departamento, preco };
  console.log("Payload para envio:", payload);

  // Envia os dados para o back‑end
  fetch('/produtos/novo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    console.log("Resposta do registro:", data);
    if (data.erro) {
      alert(data.erro);
    } else {
      alert("Produto registrado com sucesso!");
      document.getElementById('form-produto').reset();
      
      // Atualiza automaticamente as tabelas
      carregarTabelaEntradas();  // Atualiza a tabela de registro de entradas
      carregarEstoque();         // Atualiza a tabela de estoque
      carregarProdutos();        // Atualiza a lista de produtos (se necessário)
      carregarProdutosEntrada(); // Atualiza os selects se estiverem sendo usados em outros lugares
      carregarProdutosBaixa();

      // Adiciona o registro na tabela de entradas
      const hora = new Date().toLocaleString();
      const novoRegistro = { produto: nome, quantidade, departamento, preco, hora };
      console.log("Registro que será adicionado à tabela:", novoRegistro);
      adicionarLinhaEntrada(novoRegistro);
    }
  })
  .catch(err => {
    console.error("Erro ao registrar produto:", err);
    alert("Erro ao registrar produto.");
  });
}

function toggleCamposTipo() {
  const tipo = document.getElementById('tipo').value;
  const camposEntrada = document.getElementById('campos-entrada');
  const camposSaida = document.getElementById('campos-saida');
  const tipoEntrada = document.getElementById('tipo-entrada');

  if (tipo === 'entrada') {
    camposEntrada.style.display = '';
    camposSaida.style.display = 'none';
    if (tipoEntrada) tipoEntrada.setAttribute('required', 'required');
  } else {
    camposEntrada.style.display = 'none';
    camposSaida.style.display = '';
    if (tipoEntrada) {
      tipoEntrada.removeAttribute('required');
      tipoEntrada.value = '';
    }
  }
}

function gerarRelatorio(tableId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.text("Relatório da Tabela", 14, 22);

  doc.autoTable({
    html: '#' + tableId,
    startY: 30,

    theme: 'grid',
    styles: { fontSize: 10, lineColor: [0,0,0], lineWidth: 0.5 },
    headStyles: { fillColor: [45, 92, 168] },
    columnStyles: {
      0: { halign: 'left' },  // 1ª coluna (Produto)
      2: { halign: 'left' },  // 3ª coluna (Departamento)
      // As demais ficam centralizadas (padrão)
      1: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' }
    }
  });

  doc.save("relatorio-" + tableId + ".pdf");
}

function gerarRelatorioEstoque() {
  const doc = new window.jspdf.jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' }); // retrato
  const tabela = document.getElementById('tabelaEstoque');
  if (!tabela) return;

  // Monta os dados da tabela
  const head = [[
    'Produto',
    'Estoque Atual',
    'Estoque Mínimo',
    'Última Movimentação'
  ]];

  const body = [];
  for (const row of tabela.querySelectorAll('tbody tr')) {
    const cols = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
    if (cols.length) body.push(cols);
  }

  doc.text('Relatório de Estoque', 40, 40);
  doc.autoTable({
    head: head,
    body: body,
    startY: 60,
    theme: 'grid',
    styles: { fontSize: 10, lineColor: [0,0,0], lineWidth: 0.5 },
    columnStyles: {
      0: { halign: 'left' },   // Produto
      1: { halign: 'center' }, // Estoque Atual
      2: { halign: 'center' }, // Estoque Mínimo
      3: { halign: 'center' }  // Última Movimentação
    }
  });

  doc.save('relatorio-estoque.pdf');
}

function gerarRelatorioComFiltro(tableId, filtroDataId) {
  const filtroData = document.getElementById(filtroDataId).value;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.text("Relatório da Tabela", 14, 22);

  const table = document.getElementById(tableId);
  if (!table) return;

  // Cabeçalhos
  const headerCells = table.querySelectorAll('thead tr th');
  const head = [Array.from(headerCells).map(th => th.textContent.trim())];

  // Filtra linhas se houver filtro de data
  const bodyRows = [];
  const trs = table.querySelectorAll('tbody tr');
  trs.forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length) {
      const dataText = tds[tds.length - 1].textContent.trim();
      if (!filtroData) {
        bodyRows.push(Array.from(tds).map(td => td.textContent.trim()));
      } else {
        // Formata filtro para DD/MM/YYYY
        const partes = filtroData.split('-');
        const filtroBR = `${partes[2]}/${partes[1]}/${partes[0]}`;
        if (dataText.startsWith(filtroBR)) {
          bodyRows.push(Array.from(tds).map(td => td.textContent.trim()));
        }
      }
    }
  });

  if (bodyRows.length === 0) {
    alert("Nenhum registro encontrado para a data selecionada.");
    return;
  }

  doc.autoTable({
    head: head,
    body: bodyRows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10, lineColor: [0,0,0], lineWidth: 0.5 },
    headStyles: { fillColor: [45, 92, 168] }
  });

  doc.save("relatorio-" + tableId + ".pdf");
}

function gerarRelatorioTabelaFiltrada(tableId) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.text("Relatório da Tabela", 14, 22);

  const table = document.getElementById(tableId);
  if (!table) return;

  // Cabeçalhos
  const headerCells = table.querySelectorAll('thead tr:first-child th');
  const head = [Array.from(headerCells).map(th => th.textContent.trim())];

  // Apenas linhas visíveis (filtradas)
  const bodyRows = [];
  const trs = table.querySelectorAll('tbody tr');
  trs.forEach(tr => {
    if (tr.style.display === '' || tr.style.display === 'table-row' || !tr.style.display) {
      const tds = tr.querySelectorAll('td');
      if (tds.length) {
        bodyRows.push(Array.from(tds).map(td => td.textContent.trim()));
      }
    }
  });

  if (bodyRows.length === 0) {
    alert("Nenhum registro encontrado para exportar.");
    return;
  }

  doc.autoTable({
    head: head,
    body: bodyRows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10, lineColor: [0,0,0], lineWidth: 0.5 },
    headStyles: { fillColor: [45, 92, 168] }
  });

  doc.save("relatorio-" + tableId + ".pdf");
}