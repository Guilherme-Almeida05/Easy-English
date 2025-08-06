// Sistema de Agendamento para Easy English
// Gerencia formulários, validação, armazenamento local e visualização de agendamentos
// Versão com integração EmailJS

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const formAgendamento = document.getElementById('form-agendamento');
    const formLogin = document.getElementById('form-login');
    const listaAgendamentos = document.getElementById('lista-agendamentos');
    const loginSection = document.querySelector('.agendamento-login');
    const agendamentosLista = document.querySelector('.meus-agendamentos-lista');
    
    // Inicialização
    inicializarTabs();
    inicializarFormularios();
    
    // Função para alternar entre as abas
    function inicializarTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // Remover classe active de todas as abas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe active à aba selecionada
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Inicializar formulários com validação e eventos
    function inicializarFormularios() {
        // Formulário de agendamento
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (validarFormulario(formAgendamento)) {
                    const agendamento = salvarAgendamento();
                    
                    // Enviar email de confirmação usando EmailJS
                    enviarEmailConfirmacao(agendamento)
                        .then(result => {
                            console.log('Emails enviados com sucesso:', result);
                            mostrarMensagem('agendamento-sucesso', 'Aula agendada com sucesso! Emails de confirmação foram enviados para você e para a professora.', 'sucesso');
                        })
                        .catch(error => {
                            console.error('Erro ao enviar emails:', error);
                            mostrarMensagem('agendamento-sucesso', 'Aula agendada com sucesso! .', 'sucesso');
                        });
                    
                    formAgendamento.reset();
                }
            });
        }
        
        // Formulário de login para acessar agendamentos
        if (formLogin) {
            formLogin.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                if (email) {
                    carregarAgendamentos(email);
                    loginSection.style.display = 'none';
                    agendamentosLista.style.display = 'block';
                } else {
                    mostrarMensagem('login-erro', 'Por favor, informe seu email para acessar seus agendamentos.', 'erro');
                }
            });
        }
    }
    
    // Validar campos do formulário
    function validarFormulario(form) {
        let valido = true;
        const campos = form.querySelectorAll('input, select, textarea');
        
        campos.forEach(campo => {
            if (campo.hasAttribute('required') && !campo.value) {
                campo.classList.add('campo-erro');
                valido = false;
            } else {
                campo.classList.remove('campo-erro');
            }
            
            // Validação específica para email
            if (campo.type === 'email' && campo.value) {
                const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!regexEmail.test(campo.value)) {
                    campo.classList.add('campo-erro');
                    valido = false;
                }
            }
            
            // Validação específica para telefone
            if (campo.id === 'telefone' && campo.value) {
                const regexTelefone = /^\(\d{2}\)\s\d{5}-\d{4}$/;
                if (!regexTelefone.test(campo.value)) {
                    campo.classList.add('campo-erro');
                    valido = false;
                }
            }
        });
        
        if (!valido) {
            mostrarMensagem('form-erro', 'Por favor, preencha todos os campos obrigatórios corretamente.', 'erro');
        }
        
        return valido;
    }
    
    // Salvar agendamento no localStorage
    function salvarAgendamento() {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;
        const nivel = document.getElementById('nivel').value;
        const observacoes = document.getElementById('observacoes').value;
        
        // Criar objeto de agendamento
        const agendamento = {
            id: Date.now().toString(),
            nome,
            email,
            telefone,
            data,
            horario,
            nivel,
            observacoes,
            status: 'pendente',
            dataCriacao: new Date().toISOString()
        };
        
        // Buscar agendamentos existentes ou criar array vazio
        let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        
        // Adicionar novo agendamento
        agendamentos.push(agendamento);
        
        // Salvar no localStorage
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        return agendamento;
    }
    
    // Carregar agendamentos do localStorage pelo email
    function carregarAgendamentos(email) {
        // Limpar lista de agendamentos
        listaAgendamentos.innerHTML = '';
        
        // Buscar agendamentos no localStorage
        const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
        
        // Filtrar agendamentos pelo email
        const meusAgendamentos = agendamentos.filter(agendamento => agendamento.email === email);
        
        if (meusAgendamentos.length === 0) {
            listaAgendamentos.innerHTML = '<div class="mensagem">Você ainda não possui agendamentos.</div>';
            return;
        }
        
        // Ordenar agendamentos por data (mais recentes primeiro)
        meusAgendamentos.sort((a, b) => {
            const dataA = new Date(a.data + 'T' + a.horario);
            const dataB = new Date(b.data + 'T' + b.horario);
            return dataA - dataB;
        });
        
        // Criar cards para cada agendamento
        meusAgendamentos.forEach(agendamento => {
            const card = criarCardAgendamento(agendamento);
            listaAgendamentos.appendChild(card);
        });
    }
    
    // Criar card de agendamento
    function criarCardAgendamento(agendamento) {
        const card = document.createElement('div');
        card.className = 'agendamento-card';
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
            <div class="agendamento-info">
                <div class="agendamento-data">
                    <span class="status ${statusClass}">${agendamento.status.toUpperCase()}</span>
                    <h4>${dataFormatada}</h4>
                    <p><strong>Horário:</strong> ${agendamento.horario}</p>
                </div>
                <div class="agendamento-detalhes">
                    <p><strong>Nome:</strong> ${agendamento.nome}</p>
                    <p><strong>Nível:</strong> ${agendamento.nivel}</p>
                    ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
                </div>
            </div>
            <div class="agendamento-acoes">
                ${agendamento.status !== 'cancelado' ? `
                    <button class="btn-remarcar" data-id="${agendamento.id}">Remarcar</button>
                    <button class="btn-cancelar" data-id="${agendamento.id}">Cancelar</button>
                ` : ''}
            </div>
        `;
        
        // Adicionar eventos aos botões
        setTimeout(() => {
            const btnRemarcar = card.querySelector('.btn-remarcar');
            const btnCancelar = card.querySelector('.btn-cancelar');
            
            if (btnRemarcar) {
                btnRemarcar.addEventListener('click', () => remarcarAgendamento(agendamento.id));
            }
            
            if (btnCancelar) {
                btnCancelar.addEventListener('click', () => cancelarAgendamento(agendamento.id));
            }
        }, 0);
        
        return card;
    }
    
    // Remarcar agendamento
    function remarcarAgendamento(id) {
        // Em uma implementação real, abriria um modal para escolher nova data/horário
        alert('Funcionalidade de remarcação será implementada em breve.');
        
        // Aqui seria implementada a lógica para atualizar o agendamento
        // e enviar email de confirmação da remarcação
    }
    
    // Cancelar agendamento
    function cancelarAgendamento(id) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            // Buscar agendamentos no localStorage
            let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
            
            // Encontrar índice do agendamento
            const index = agendamentos.findIndex(a => a.id === id);
            
            if (index !== -1) {
                // Atualizar status para cancelado
                agendamentos[index].status = 'cancelado';
                
                // Salvar no localStorage
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                
                // Atualizar interface
                const card = document.querySelector(`.agendamento-card[data-id="${id}"]`);
                if (card) {
                    const statusElement = card.querySelector('.status');
                    statusElement.className = 'status status-cancelado';
                    statusElement.textContent = 'CANCELADO';
                    
                    // Remover botões de ação
                    card.querySelector('.agendamento-acoes').innerHTML = '';
                }
                
                mostrarMensagem('cancelamento-sucesso', 'Agendamento cancelado com sucesso!', 'sucesso');
                
                // Enviar email de cancelamento
                const agendamentoCancelado = agendamentos[index];
                enviarEmailCancelamento(agendamentoCancelado)
                    .then(result => {
                        console.log('Emails de cancelamento enviados com sucesso:', result);
                    })
                    .catch(error => {
                        console.error('Erro ao enviar emails de cancelamento:', error);
                    });
            }
        }
    }
    
    // Mostrar mensagem de feedback
    function mostrarMensagem(id, texto, tipo) {
        // Remover mensagem anterior se existir
        const mensagemAnterior = document.getElementById(id);
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }
        
        // Criar elemento de mensagem
        const mensagem = document.createElement('div');
        mensagem.id = id;
        mensagem.className = `mensagem mensagem-${tipo}`;
        mensagem.textContent = texto;
        
        // Inserir mensagem no DOM
        const container = document.querySelector('.agendamento-container');
        container.insertBefore(mensagem, container.firstChild);
        
        // Remover mensagem após alguns segundos
        setTimeout(() => {
            mensagem.remove();
        }, 5000);
    }
    
    // Máscara para o campo de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            
            if (valor.length > 0) {
                valor = '(' + valor;
            }
            if (valor.length > 3) {
                valor = valor.substring(0, 3) + ') ' + valor.substring(3);
            }
            if (valor.length > 10) {
                valor = valor.substring(0, 10) + '-' + valor.substring(10);
            }
            if (valor.length > 15) {
                valor = valor.substring(0, 15);
            }
            
            e.target.value = valor;
        });
    }
    
    // Definir data mínima como hoje
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const hoje = new Date().toISOString().split('T')[0];
        dataInput.setAttribute('min', hoje);
    }
});
