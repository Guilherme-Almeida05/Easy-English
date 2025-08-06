// Serviço de SMS para Easy English
// Implementa a funcionalidade de envio de SMS para notificações de agendamento
// Sistema com proteção anti-spam integrada

// Configurações do serviço SMS
const SMS_CONFIG = {
    API_URL: "https://api.twilio.com/2010-04-01/Accounts", // URL base da API Twilio
    ACCOUNT_SID: "YOUR_TWILIO_ACCOUNT_SID", // Substitua pelo seu Account SID do Twilio
    AUTH_TOKEN: "YOUR_TWILIO_AUTH_TOKEN", // Substitua pelo seu Auth Token do Twilio
    FROM_NUMBER: "+1234567890", // Substitua pelo seu número Twilio
    PROFESSORA_NUMERO: "+5561992215844", // Número da professora
    
    // Configurações anti-spam
    MAX_SMS_POR_HORA: 5, // Máximo de SMS por hora por número
    MAX_SMS_POR_DIA: 20, // Máximo de SMS por dia por número
    INTERVALO_MINIMO: 60000, // Intervalo mínimo entre SMS (1 minuto)
    
    // Templates de mensagens
    TEMPLATES: {
        NOVO_AGENDAMENTO: "🎓 Easy English - Novo agendamento!\n\nAluno: {nome}\nData: {data}\nHorário: {horario}\nNível: {nivel}\n\nAcesse o painel para confirmar.",
        
        CONFIRMACAO_ALUNO: "✅ Easy English - Agendamento confirmado!\n\nOlá {nome}!\nSua aula foi confirmada para {data} às {horario}.\n\nNos vemos em breve!",
        
        CANCELAMENTO_ALUNO: "❌ Easy English - Agendamento cancelado\n\nOlá {nome},\nSua aula de {data} às {horario} foi cancelada.\n\nEntre em contato para reagendar.",
        
        REMARCACAO_ALUNO: "📅 Easy English - Aula remarcada\n\nOlá {nome}!\nSua aula foi remarcada:\n\nDe: {data_antiga} às {horario_antigo}\nPara: {data_nova} às {horario_novo}",
        
        CANCELAMENTO_PROFESSORA: "❌ Easy English - Cancelamento\n\nAgendamento cancelado:\nAluno: {nome}\nData: {data}\nHorário: {horario}",
        
        REMARCACAO_PROFESSORA: "📅 Easy English - Remarcação\n\nAgendamento remarcado:\nAluno: {nome}\nDe: {data_antiga} às {horario_antigo}\nPara: {data_nova} às {horario_novo}"
    }
};

// Sistema de controle anti-spam
class AntiSpamController {
    constructor() {
        this.historico = this.carregarHistorico();
        this.limparHistoricoAntigo();
    }
    
    // Carrega histórico do localStorage
    carregarHistorico() {
        try {
            return JSON.parse(localStorage.getItem('sms-historico')) || {};
        } catch (error) {
            console.error('Erro ao carregar histórico SMS:', error);
            return {};
        }
    }
    
    // Salva histórico no localStorage
    salvarHistorico() {
        try {
            localStorage.setItem('sms-historico', JSON.stringify(this.historico));
        } catch (error) {
            console.error('Erro ao salvar histórico SMS:', error);
        }
    }
    
    // Remove registros antigos (mais de 24 horas)
    limparHistoricoAntigo() {
        const agora = Date.now();
        const umDiaAtras = agora - (24 * 60 * 60 * 1000);
        
        for (const numero in this.historico) {
            this.historico[numero] = this.historico[numero].filter(
                timestamp => timestamp > umDiaAtras
            );
            
            if (this.historico[numero].length === 0) {
                delete this.historico[numero];
            }
        }
        
        this.salvarHistorico();
    }
    
    // Verifica se pode enviar SMS para um número
    podeEnviarSMS(numero) {
        const agora = Date.now();
        const umaHoraAtras = agora - (60 * 60 * 1000);
        
        if (!this.historico[numero]) {
            this.historico[numero] = [];
        }
        
        const smsUltimaHora = this.historico[numero].filter(
            timestamp => timestamp > umaHoraAtras
        ).length;
        
        const smsUltimoDia = this.historico[numero].length;
        
        // Verificar último SMS enviado
        const ultimoSMS = Math.max(...this.historico[numero], 0);
        const tempoDesdeUltimo = agora - ultimoSMS;
        
        // Verificações anti-spam
        if (smsUltimaHora >= SMS_CONFIG.MAX_SMS_POR_HORA) {
            return {
                permitido: false,
                motivo: `Limite de ${SMS_CONFIG.MAX_SMS_POR_HORA} SMS por hora atingido`
            };
        }
        
        if (smsUltimoDia >= SMS_CONFIG.MAX_SMS_POR_DIA) {
            return {
                permitido: false,
                motivo: `Limite de ${SMS_CONFIG.MAX_SMS_POR_DIA} SMS por dia atingido`
            };
        }
        
        if (tempoDesdeUltimo < SMS_CONFIG.INTERVALO_MINIMO) {
            const tempoRestante = Math.ceil((SMS_CONFIG.INTERVALO_MINIMO - tempoDesdeUltimo) / 1000);
            return {
                permitido: false,
                motivo: `Aguarde ${tempoRestante} segundos antes de enviar outro SMS`
            };
        }
        
        return { permitido: true };
    }
    
    // Registra envio de SMS
    registrarEnvio(numero) {
        if (!this.historico[numero]) {
            this.historico[numero] = [];
        }
        
        this.historico[numero].push(Date.now());
        this.salvarHistorico();
    }
    
    // Obtém estatísticas de uso
    obterEstatisticas(numero) {
        if (!this.historico[numero]) {
            return { hoje: 0, ultimaHora: 0 };
        }
        
        const agora = Date.now();
        const umaHoraAtras = agora - (60 * 60 * 1000);
        
        return {
            hoje: this.historico[numero].length,
            ultimaHora: this.historico[numero].filter(
                timestamp => timestamp > umaHoraAtras
            ).length
        };
    }
}

// Instância global do controlador anti-spam
const antiSpam = new AntiSpamController();

// Função para formatar número de telefone
function formatarNumero(numero) {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = numero.replace(/\D/g, '');
    
    // Se não começar com código do país, adiciona +55 (Brasil)
    if (!apenasNumeros.startsWith('55') && apenasNumeros.length === 11) {
        return '+55' + apenasNumeros;
    } else if (apenasNumeros.startsWith('55')) {
        return '+' + apenasNumeros;
    }
    
    return '+' + apenasNumeros;
}

// Função para substituir placeholders no template
function processarTemplate(template, dados) {
    let mensagem = template;
    
    for (const [chave, valor] of Object.entries(dados)) {
        const placeholder = `{${chave}}`;
        mensagem = mensagem.replace(new RegExp(placeholder, 'g'), valor);
    }
    
    return mensagem;
}

// Função principal para enviar SMS
async function enviarSMS(numero, mensagem, tipo = 'geral') {
    try {
        // Formatar número
        const numeroFormatado = formatarNumero(numero);
        
        // Verificar anti-spam
        const verificacao = antiSpam.podeEnviarSMS(numeroFormatado);
        if (!verificacao.permitido) {
            throw new Error(`Anti-spam: ${verificacao.motivo}`);
        }
        
        // Simular envio de SMS (substitua pela integração real com Twilio)
        const resultado = await simularEnvioSMS(numeroFormatado, mensagem);
        
        if (resultado.success) {
            // Registrar envio no sistema anti-spam
            antiSpam.registrarEnvio(numeroFormatado);
            
            console.log(`SMS enviado com sucesso para ${numeroFormatado}`);
            return {
                success: true,
                message: 'SMS enviado com sucesso',
                sid: resultado.sid,
                numero: numeroFormatado
            };
        } else {
            throw new Error(resultado.error);
        }
        
    } catch (error) {
        console.error('Erro ao enviar SMS:', error);
        throw {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Função para simular envio de SMS (substitua pela integração real)
async function simularEnvioSMS(numero, mensagem) {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula sucesso (em produção, use a API do Twilio)
    console.log(`[SIMULAÇÃO SMS] Para: ${numero}`);
    console.log(`[SIMULAÇÃO SMS] Mensagem: ${mensagem}`);
    
    return {
        success: true,
        sid: 'SM' + Math.random().toString(36).substr(2, 9),
        status: 'queued'
    };
}

// Função para enviar SMS de confirmação de agendamento
function enviarSMSConfirmacao(agendamento) {
    // Formatar data para exibição
    const dataObj = new Date(agendamento.data + 'T' + agendamento.horario);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Promessas para envio dos SMS
    const smsPromises = [];

    // 1. SMS para a professora (notificação de novo agendamento)
    const mensagemProfessora = processarTemplate(SMS_CONFIG.TEMPLATES.NOVO_AGENDAMENTO, {
        nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario,
        nivel: agendamento.nivel
    });

    const smsProfessora = enviarSMS(
        SMS_CONFIG.PROFESSORA_NUMERO,
        mensagemProfessora,
        'notificacao_professora'
    );

    smsPromises.push(smsProfessora);

    // 2. SMS para o aluno (confirmação do agendamento)
    const mensagemAluno = processarTemplate(SMS_CONFIG.TEMPLATES.CONFIRMACAO_ALUNO, {
        nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario
    });

    const smsAluno = enviarSMS(
        agendamento.telefone,
        mensagemAluno,
        'confirmacao_aluno'
    );

    smsPromises.push(smsAluno);

    // Retornar promessa que resolve quando ambos os SMS forem enviados
    return Promise.all(smsPromises)
        .then(results => {
            console.log('SMS enviados com sucesso:', results);
            return {
                success: true,
                message: 'SMS enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar SMS:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais SMS',
                error: error
            };
        });
}

// Função para enviar SMS de cancelamento
function enviarSMSCancelamento(agendamento) {
    // Formatar data para exibição
    const dataObj = new Date(agendamento.data + 'T' + agendamento.horario);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Promessas para envio dos SMS
    const smsPromises = [];

    // 1. SMS para a professora (notificação de cancelamento)
    const mensagemProfessora = processarTemplate(SMS_CONFIG.TEMPLATES.CANCELAMENTO_PROFESSORA, {
        nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario
    });

    const smsProfessora = enviarSMS(
        SMS_CONFIG.PROFESSORA_NUMERO,
        mensagemProfessora,
        'cancelamento_professora'
    );

    smsPromises.push(smsProfessora);

    // 2. SMS para o aluno (confirmação do cancelamento)
    const mensagemAluno = processarTemplate(SMS_CONFIG.TEMPLATES.CANCELAMENTO_ALUNO, {
        nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario
    });

    const smsAluno = enviarSMS(
        agendamento.telefone,
        mensagemAluno,
        'cancelamento_aluno'
    );

    smsPromises.push(smsAluno);

    // Retornar promessa que resolve quando ambos os SMS forem enviados
    return Promise.all(smsPromises)
        .then(results => {
            console.log('SMS de cancelamento enviados com sucesso:', results);
            return {
                success: true,
                message: 'SMS de cancelamento enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar SMS de cancelamento:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais SMS de cancelamento',
                error: error
            };
        });
}

// Função para enviar SMS de remarcação
function enviarSMSRemarcacao(agendamentoAntigo, agendamentoNovo) {
    // Formatar datas para exibição
    const dataAntigaObj = new Date(agendamentoAntigo.data + 'T' + agendamentoAntigo.horario);
    const dataAntigaFormatada = dataAntigaObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const dataNovaObj = new Date(agendamentoNovo.data + 'T' + agendamentoNovo.horario);
    const dataNovaFormatada = dataNovaObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Promessas para envio dos SMS
    const smsPromises = [];

    // 1. SMS para a professora (notificação de remarcação)
    const mensagemProfessora = processarTemplate(SMS_CONFIG.TEMPLATES.REMARCACAO_PROFESSORA, {
        nome: agendamentoNovo.nome,
        data_antiga: dataAntigaFormatada,
        horario_antigo: agendamentoAntigo.horario,
        data_nova: dataNovaFormatada,
        horario_novo: agendamentoNovo.horario
    });

    const smsProfessora = enviarSMS(
        SMS_CONFIG.PROFESSORA_NUMERO,
        mensagemProfessora,
        'remarcacao_professora'
    );

    smsPromises.push(smsProfessora);

    // 2. SMS para o aluno (confirmação da remarcação)
    const mensagemAluno = processarTemplate(SMS_CONFIG.TEMPLATES.REMARCACAO_ALUNO, {
        nome: agendamentoNovo.nome,
        data_antiga: dataAntigaFormatada,
        horario_antigo: agendamentoAntigo.horario,
        data_nova: dataNovaFormatada,
        horario_novo: agendamentoNovo.horario
    });

    const smsAluno = enviarSMS(
        agendamentoNovo.telefone,
        mensagemAluno,
        'remarcacao_aluno'
    );

    smsPromises.push(smsAluno);

    // Retornar promessa que resolve quando ambos os SMS forem enviados
    return Promise.all(smsPromises)
        .then(results => {
            console.log('SMS de remarcação enviados com sucesso:', results);
            return {
                success: true,
                message: 'SMS de remarcação enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar SMS de remarcação:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais SMS de remarcação',
                error: error
            };
        });
}

// Função para obter estatísticas do sistema anti-spam
function obterEstatisticasAntiSpam(numero) {
    const numeroFormatado = formatarNumero(numero);
    return antiSpam.obterEstatisticas(numeroFormatado);
}

// Função para testar a configuração do SMS
function testarConfiguracaoSMS() {
    const mensagemTeste = "🧪 Easy English - Teste de configuração SMS\n\nEste é um SMS de teste para verificar se o sistema está funcionando corretamente.";

    return enviarSMS(SMS_CONFIG.PROFESSORA_NUMERO, mensagemTeste, 'teste')
        .then(result => {
            console.log('Teste de configuração SMS bem-sucedido:', result);
            return { success: true, message: 'Configuração do SMS está funcionando!' };
        })
        .catch(error => {
            console.error('Erro no teste de configuração SMS:', error);
            return { success: false, message: 'Erro na configuração do SMS', error: error };
        });
}

