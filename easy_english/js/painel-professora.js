// Sistema do Painel da Professora - Easy English
// Gerencia autenticação, visualização e gerenciamento de agendamentos

document.addEventListener('DOMContentLoaded', function() {
    // Configurações
    const SENHA_PROFESSORA = "easyenglish2025"; // ALTERE ESTA SENHA PARA UMA MAIS SEGURA
    
    // Elementos do DOM
    const loginSection = document.getElementById('login-section');
    const painelSection = document.getElementById('painel-section');
    const formLoginProfessora = document.getElementById('form-login-professora');
    const btnLogout = document.getElementById('btn-logout');
    const listaAgendamentosProfessora = document.getElementById('lista-agendamentos-professora');
    
    // Elementos de estatísticas
    const totalAgendamentos = document.getElementById('total-agendamentos');
    const agendamentosPendentes = document.getElementById('agendamentos-pendentes');
    const agendamentosConfirmados = document.getElementById('agendamentos-confirmados');
    const proximasAulas = document.getElementById('proximas-aulas');
    
    // Elementos de filtros
    const filtroStatus = document.getElementById('filtro-status');
    const filtroDataInicio = document.getElementById('filtro-data-inicio');
    const filtroDataFim = document.getElementById('filtro-data-fim');
    const filtroNivel = document.getElementById('filtro-nivel');
    const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');
    
    // Modal de remarcação
    const modalRemarcar = document.getElementById('modal-remarcar');
    const formRemarcar = document.getElementById('form-remarcar');
    const modalClose = document.querySelector('.modal-close');
    const btnCancelarModal = document.querySelector('.btn-cancelar-modal');
    
    // Variáveis globais
    let agendamentoParaRemarcar = null;
    let agendamentosFiltrados = [];
    
    // Inicialização
    inicializarEventos();
    verificarSessao();
    
    // Função para inicializar eventos
    function inicializarEventos() {
        // Login da professora
        if (formLoginProfessora) {
            formLoginProfessora.addEventListener('submit', function(e) {
                e.preventDefault();
                realizarLogin();
            });
        }
        
        // Logout
        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                realizarLogout();
            });
        }
        
        // Filtros
        if (btnAplicarFiltros) {
            btnAplicarFiltros.addEventListener('click', aplicarFiltros);
        }
        
        if (btnLimparFiltros) {
            btnLimparFiltros.addEventListener('click', limparFiltros);
        }
        
        // Modal de remarcação
        if (modalClose) {
            modalClose.addEventListener('click', fecharModal);
        }
        
        if (btnCancelarModal) {
            btnCancelarModal.addEventListener('click', fecharModal);
        }
        
        if (formRemarcar) {
            formRemarcar.addEventListener('submit', function(e) {
                e.preventDefault();
                confirmarRemarcacao();
            });
        }
        
        // Fechar modal clicando fora
        if (modalRemarcar) {
            modalRemarcar.addEventListener('click', function(e) {
                if (e.target === modalRemarcar) {
                    fecharModal();
                }
            });
        }
    }
    
    // Função para verificar se já está logado
    function verificarSessao() {
        const sessaoAtiva = localStorage.getItem('sessao-professora');
        if (sessaoAtiva === 'ativa') {
            mostrarPainel();
        }
    }
    
    // Função para realizar login
    function realizarLogin() {
        const senhaInformada = document.getElementById('senha-professora').value;
        
        if (senhaInformada === SENHA_PROFESSORA) {
            localStorage.setItem('sessao-professora', 'ativa');
            mostrarPainel();
            mostrarMensagem('Login realizado com sucesso!', 'sucesso');
        } else {
            mostrarMensagem('Senha incorreta. Tente novamente.', 'erro');
            document.getElementById('senha-professora').value = '';
        }
    }
    
    // Função para realizar logout
    function realizarLogout() {
        localStorage.removeItem('sessao-professora');
        loginSection.style.display = 'flex';
        painelSection.style.display = 'none';
        document.getElementById('senha-professora').value = '';
        mostrarMensagem('Logout realizado com sucesso!', 'info');
    }
    
    // Função para mostrar o painel
    function mostrarPainel() {
        loginSection.style.display = 'none';
        painelSection.style.display = 'block';
        carregarDadosPainel();
    }
    
    // Função para carregar dados do painel
    function carregarDadosPainel() {
        const agendamentos = obterTodosAgendamentos();
        atualizarEstatisticas(agendamentos);
        exibirAgendamentos(agendamentos);
    }
    
    // Função para obter todos os agendamentos
    function obterTodosAgendamentos() {
        return JSON.parse(localStorage.getItem('agendamentos')) || [];
    }
    
    // Função para atualizar estatísticas
    function atualizarEstatisticas(agendamentos) {
        const total = agendamentos.length;
        const pendentes = agendamentos.filter(a => a.status === 'pendente').length;
        const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
        
        // Calcular próximas aulas (próximos 7 dias)
        const hoje = new Date();
        const seteDiasDepois = new Date();
        seteDiasDepois.setDate(hoje.getDate() + 7);
        
        const proximas = agendamentos.filter(a => {
            const dataAula = new Date(a.data);
            return dataAula >= hoje && dataAula <= seteDiasDepois && a.status !== 'cancelado';
        }).length;
        
        // Atualizar elementos
        if (totalAgendamentos) totalAgendamentos.textContent = total;
        if (agendamentosPendentes) agendamentosPendentes.textContent = pendentes;
        if (agendamentosConfirmados) agendamentosConfirmados.textContent = confirmados;
        if (proximasAulas) proximasAulas.textContent = proximas;
    }
    
    // Função para exibir agendamentos
    function exibirAgendamentos(agendamentos) {
        if (!listaAgendamentosProfessora) return;
        
        // Limpar lista
        listaAgendamentosProfessora.innerHTML = '';
        
        if (agendamentos.length === 0) {
            listaAgendamentosProfessora.innerHTML = '<div class="mensagem-painel mensagem-info">Nenhum agendamento encontrado.</div>';
            return;
        }
        
        // Ordenar agendamentos por data (mais próximos primeiro)
        agendamentos.sort((a, b) => {
            const dataA = new Date(a.data + 'T' + a.horario);
            const dataB = new Date(b.data + 'T' + b.horario);
            return dataA - dataB;
        });
        
        // Criar cards para cada agendamento
        agendamentos.forEach(agendamento => {
            const card = criarCardAgendamentoProfessora(agendamento);
            listaAgendamentosProfessora.appendChild(card);
        });
        
        agendamentosFiltrados = agendamentos;
    }
    
    // Função para criar card de agendamento para professora
    function criarCardAgendamentoProfessora(agendamento) {
        const card = document.createElement('div');
        card.className = 'agendamento-card-professora';
        card.dataset.id = agendamento.id;
        
        // Formatar data para exibição
        const dataObj = new Date(agendamento.data + 'T' + agendamento.horario);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        // Definir classe de status
        let statusClass = '';
        switch (agendamento.status) {
            case 'confirmado':
                statusClass = 'status-confirmado';
                break;
            case 'pendente':
                statusClass = 'status-pendente';
                break;
            case 'cancelado':
                statusClass = 'status-cancelado';
                break;
        }
        
        // Construir HTML do card
        card.innerHTML = `
            <div class="agendamento-header">
                <div class="agendamento-titulo">
                    <h4>${agendamento.nome}</h4>
                    <span class="status-professora ${statusClass}">${agendamento.status}</span>
                </div>
                <div class="agendamento-data-hora">
                    <strong>${dataFormatada} às ${agendamento.horario}</strong>
                </div>
            </div>
            
            <div class="agendamento-detalhes">
                <div class="detalhe-grupo">
                    <h5>Contato</h5>
                    <p><strong>Email:</strong> ${agendamento.email}</p>
                    <p><strong>Telefone:</strong> ${agendamento.telefone}</p>
                </div>
                
                <div class="detalhe-grupo">
                    <h5>Informações da Aula</h5>
                    <p><strong>Nível:</strong> ${agendamento.nivel}</p>
                    <p><strong>Data de Criação:</strong> ${new Date(agendamento.dataCriacao).toLocaleDateString('pt-BR')}</p>
                </div>
                
                ${agendamento.observacoes ? `
                <div class="detalhe-grupo" style="grid-column: 1 / -1;">
                    <h5>Observações</h5>
                    <p>${agendamento.observacoes}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="agendamento-acoes-professora">
                ${agendamento.status === 'pendente' ? `
                    <button class="btn-confirmar" data-id="${agendamento.id}">Confirmar</button>
                ` : ''}
                ${agendamento.status !== 'cancelado' ? `
                    <button class="btn-remarcar-professora" data-id="${agendamento.id}">Remarcar</button>
                    <button class="btn-cancelar-professora" data-id="${agendamento.id}">Cancelar</button>
                ` : ''}
            </div>
        `;
        
        // Adicionar eventos aos botões
        setTimeout(() => {
            const btnConfirmar = card.querySelector('.btn-confirmar');
            const btnRemarcar = card.querySelector('.btn-remarcar-professora');
            const btnCancelar = card.querySelector('.btn-cancelar-professora');
            
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', () => confirmarAgendamento(agendamento.id));
            }
            
            if (btnRemarcar) {
                btnRemarcar.addEventListener('click', () => abrirModalRemarcacao(agendamento.id));
            }
            
            if (btnCancelar) {
                btnCancelar.addEventListener('click', () => cancelarAgendamentoProfessora(agendamento.id));
            }
        }, 0);
        
        return card;
    }
    
    // Função para confirmar agendamento
    function confirmarAgendamento(id) {
        if (confirm('Confirmar este agendamento?')) {
            let agendamentos = obterTodosAgendamentos();
            const index = agendamentos.findIndex(a => a.id === id);
            
            if (index !== -1) {
                agendamentos[index].status = 'confirmado';
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                
                // Enviar email de confirmação
                enviarEmailConfirmacao(agendamentos[index])
                    .then(result => {
                        console.log('Email de confirmação enviado:', result);
                        mostrarMensagem('Agendamento confirmado e emails enviados!', 'sucesso');
                    })
                    .catch(error => {
                        console.error('Erro ao enviar email:', error);
                        mostrarMensagem('Agendamento confirmado, mas houve erro no envio do email.', 'info');
                    });
                
                carregarDadosPainel();
            }
        }
    }
    
    // Função para abrir modal de remarcação
    function abrirModalRemarcacao(id) {
        const agendamentos = obterTodosAgendamentos();
        agendamentoParaRemarcar = agendamentos.find(a => a.id === id);
        
        if (agendamentoParaRemarcar) {
            // Definir data mínima como hoje
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('nova-data').setAttribute('min', hoje);
            
            modalRemarcar.style.display = 'flex';
        }
    }
    
    // Função para fechar modal
    function fecharModal() {
        modalRemarcar.style.display = 'none';
        agendamentoParaRemarcar = null;
        formRemarcar.reset();
    }
    
    // Função para confirmar remarcação
    function confirmarRemarcacao() {
        const novaData = document.getElementById('nova-data').value;
        const novoHorario = document.getElementById('novo-horario').value;
        
        if (!novaData || !novoHorario) {
            mostrarMensagem('Por favor, preencha todos os campos.', 'erro');
            return;
        }
        
        if (agendamentoParaRemarcar) {
            let agendamentos = obterTodosAgendamentos();
            const index = agendamentos.findIndex(a => a.id === agendamentoParaRemarcar.id);
            
            if (index !== -1) {
                const agendamentoAntigo = { ...agendamentos[index] };
                
                // Atualizar agendamento
                agendamentos[index].data = novaData;
                agendamentos[index].horario = novoHorario;
                agendamentos[index].status = 'confirmado'; // Automaticamente confirmar após remarcação
                
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                
                // Enviar email de remarcação
                enviarEmailRemarcacao(agendamentoAntigo, agendamentos[index])
                    .then(result => {
                        console.log('Email de remarcação enviado:', result);
                        mostrarMensagem('Agendamento remarcado e emails enviados!', 'sucesso');
                    })
                    .catch(error => {
                        console.error('Erro ao enviar email:', error);
                        mostrarMensagem('Agendamento remarcado, mas houve erro no envio do email.', 'info');
                    });
                
                fecharModal();
                carregarDadosPainel();
            }
        }
    }
    
    // Função para cancelar agendamento (professora)
    function cancelarAgendamentoProfessora(id) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            let agendamentos = obterTodosAgendamentos();
            const index = agendamentos.findIndex(a => a.id === id);
            
            if (index !== -1) {
                agendamentos[index].status = 'cancelado';
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                
                // Enviar email de cancelamento
                enviarEmailCancelamento(agendamentos[index])
                    .then(result => {
                        console.log('Email de cancelamento enviado:', result);
                        mostrarMensagem('Agendamento cancelado e emails enviados!', 'sucesso');
                    })
                    .catch(error => {
                        console.error('Erro ao enviar email:', error);
                        mostrarMensagem('Agendamento cancelado, mas houve erro no envio do email.', 'info');
                    });
                
                carregarDadosPainel();
            }
        }
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        const agendamentos = obterTodosAgendamentos();
        let filtrados = [...agendamentos];
        
        // Filtro por status
        const status = filtroStatus.value;
        if (status) {
            filtrados = filtrados.filter(a => a.status === status);
        }
        
        // Filtro por data início
        const dataInicio = filtroDataInicio.value;
        if (dataInicio) {
            filtrados = filtrados.filter(a => a.data >= dataInicio);
        }
        
        // Filtro por data fim
        const dataFim = filtroDataFim.value;
        if (dataFim) {
            filtrados = filtrados.filter(a => a.data <= dataFim);
        }
        
        // Filtro por nível
        const nivel = filtroNivel.value;
        if (nivel) {
            filtrados = filtrados.filter(a => a.nivel === nivel);
        }
        
        exibirAgendamentos(filtrados);
        mostrarMensagem(`${filtrados.length} agendamento(s) encontrado(s) com os filtros aplicados.`, 'info');
    }
    
    // Função para limpar filtros
    function limparFiltros() {
        filtroStatus.value = '';
        filtroDataInicio.value = '';
        filtroDataFim.value = '';
        filtroNivel.value = '';
        
        const agendamentos = obterTodosAgendamentos();
        exibirAgendamentos(agendamentos);
        mostrarMensagem('Filtros removidos.', 'info');
    }
    
    // Função para mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        // Remover mensagem anterior se existir
        const mensagemAnterior = document.querySelector('.mensagem-painel');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }
        
        // Criar elemento de mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-painel mensagem-${tipo}`;
        mensagem.textContent = texto;
        
        // Inserir mensagem no DOM
        const container = document.querySelector('.painel-container');
        if (container) {
            container.insertBefore(mensagem, container.firstChild);
            
            // Remover mensagem após alguns segundos
            setTimeout(() => {
                mensagem.remove();
            }, 5000);
        }
    }
});

