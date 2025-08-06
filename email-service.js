// Serviço de Email para Easy English
// Implementa a funcionalidade de envio de emails para notificações de agendamento
// Versão melhorada com templates específicos para professora e aluno

// Configurações do EmailJS - SUBSTITUA PELOS SEUS DADOS
const EMAIL_CONFIG = {
    USER_ID: "-XkcIiCZ10Q_dHTy5", // Seu User ID do EmailJS
    SERVICE_ID: "service_nyah5cs", // Seu Service ID do EmailJS
    TEMPLATE_PROFESSOR: "template_k5xjo9e", // Template para notificar a professora
    TEMPLATE_ALUNO_CONFIRMACAO: "template_31y2rtc", // Template para confirmar ao aluno
    TEMPLATE_ALUNO_CANCELAMENTO: "template_azp4rbb", // Template para cancelamento ao aluno
    EMAIL_PROFESSORA: "amorimguilherme007@gmail.com" // Email da professora
};

// Função para enviar email de confirmação de agendamento
function enviarEmailConfirmacao(agendamento) {
    // Formatar data para exibição
    const dataObj = new Date(agendamento.data + 'T' + agendamento.horario);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Promessas para envio dos emails
    const emailPromises = [];

    // 1. Email para a professora (notificação de novo agendamento)
    const templateParamsProfessora = {
        to_email: EMAIL_CONFIG.EMAIL_PROFESSORA,
        to_name: "Professora",
        from_name: "Sistema Easy English",
        aluno_nome: agendamento.nome,
        aluno_email: agendamento.email,
        aluno_telefone: agendamento.telefone,
        data: dataFormatada,
        horario: agendamento.horario,
        nivel: agendamento.nivel,
        observacoes: agendamento.observacoes || "Nenhuma observação",
        tipo_notificacao: "NOVO_AGENDAMENTO"
    };

    const emailProfessora = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_PROFESSOR,
        templateParamsProfessora
    );

    emailPromises.push(emailProfessora);

    // 2. Email para o aluno (confirmação do agendamento)
    const templateParamsAluno = {
        to_email: agendamento.email,
        to_name: agendamento.nome,
        from_name: "Easy English",
        aluno_nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario,
        nivel: agendamento.nivel,
        observacoes: agendamento.observacoes || "Nenhuma observação",
        professora_email: EMAIL_CONFIG.EMAIL_PROFESSORA,
        tipo_notificacao: "CONFIRMACAO_AGENDAMENTO"
    };

    const emailAluno = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ALUNO_CONFIRMACAO,
        templateParamsAluno
    );

    emailPromises.push(emailAluno);

    // Retornar promessa que resolve quando ambos os emails forem enviados
    return Promise.all(emailPromises)
        .then(results => {
            console.log('Emails enviados com sucesso:', results);
            return {
                success: true,
                message: 'Emails enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar emails:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais emails',
                error: error
            };
        });
}

// Função para enviar email de cancelamento
function enviarEmailCancelamento(agendamento) {
    // Formatar data para exibição
    const dataObj = new Date(agendamento.data + 'T' + agendamento.horario);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Promessas para envio dos emails
    const emailPromises = [];

    // 1. Email para a professora (notificação de cancelamento)
    const templateParamsProfessora = {
        to_email: EMAIL_CONFIG.EMAIL_PROFESSORA,
        to_name: "Professora",
        from_name: "Sistema Easy English",
        aluno_nome: agendamento.nome,
        aluno_email: agendamento.email,
        data: dataFormatada,
        horario: agendamento.horario,
        status: "CANCELADO",
        tipo_notificacao: "CANCELAMENTO"
    };

    const emailProfessora = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_PROFESSOR,
        templateParamsProfessora
    );

    emailPromises.push(emailProfessora);

    // 2. Email para o aluno (confirmação do cancelamento)
    const templateParamsAluno = {
        to_email: agendamento.email,
        to_name: agendamento.nome,
        from_name: "Easy English",
        aluno_nome: agendamento.nome,
        data: dataFormatada,
        horario: agendamento.horario,
        status: "CANCELADO",
        tipo_notificacao: "CANCELAMENTO_CONFIRMACAO"
    };

    const emailAluno = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ALUNO_CANCELAMENTO,
        templateParamsAluno
    );

    emailPromises.push(emailAluno);

    // Retornar promessa que resolve quando ambos os emails forem enviados
    return Promise.all(emailPromises)
        .then(results => {
            console.log('Emails de cancelamento enviados com sucesso:', results);
            return {
                success: true,
                message: 'Emails de cancelamento enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar emails de cancelamento:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais emails de cancelamento',
                error: error
            };
        });
}

// Função para enviar email de remarcação
function enviarEmailRemarcacao(agendamentoAntigo, agendamentoNovo) {
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

    // Promessas para envio dos emails
    const emailPromises = [];

    // 1. Email para a professora (notificação de remarcação)
    const templateParamsProfessora = {
        to_email: EMAIL_CONFIG.EMAIL_PROFESSORA,
        to_name: "Professora",
        from_name: "Sistema Easy English",
        aluno_nome: agendamentoNovo.nome,
        aluno_email: agendamentoNovo.email,
        data_antiga: dataAntigaFormatada,
        horario_antigo: agendamentoAntigo.horario,
        data_nova: dataNovaFormatada,
        horario_novo: agendamentoNovo.horario,
        tipo_notificacao: "REMARCACAO"
    };

    const emailProfessora = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_PROFESSOR,
        templateParamsProfessora
    );

    emailPromises.push(emailProfessora);

    // 2. Email para o aluno (confirmação da remarcação)
    const templateParamsAluno = {
        to_email: agendamentoNovo.email,
        to_name: agendamentoNovo.nome,
        from_name: "Easy English",
        aluno_nome: agendamentoNovo.nome,
        data_antiga: dataAntigaFormatada,
        horario_antigo: agendamentoAntigo.horario,
        data_nova: dataNovaFormatada,
        horario_novo: agendamentoNovo.horario,
        tipo_notificacao: "REMARCACAO_CONFIRMACAO"
    };

    const emailAluno = emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ALUNO_CONFIRMACAO,
        templateParamsAluno
    );

    emailPromises.push(emailAluno);

    // Retornar promessa que resolve quando ambos os emails forem enviados
    return Promise.all(emailPromises)
        .then(results => {
            console.log('Emails de remarcação enviados com sucesso:', results);
            return {
                success: true,
                message: 'Emails de remarcação enviados para professora e aluno',
                results: results
            };
        })
        .catch(error => {
            console.error('Erro ao enviar emails de remarcação:', error);
            throw {
                success: false,
                message: 'Erro ao enviar um ou mais emails de remarcação',
                error: error
            };
        });
}

// Função para testar a configuração do EmailJS
function testarConfiguracao() {
    const templateParamsTeste = {
        to_email: EMAIL_CONFIG.EMAIL_PROFESSORA,
        to_name: "Teste",
        from_name: "Sistema Easy English",
        message: "Este é um email de teste para verificar a configuração do EmailJS."
    };

    return emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_PROFESSOR,
        templateParamsTeste
    )
    .then(result => {
        console.log('Teste de configuração bem-sucedido:', result);
        return { success: true, message: 'Configuração do EmailJS está funcionando!' };
    })
    .catch(error => {
        console.error('Erro no teste de configuração:', error);
        return { success: false, message: 'Erro na configuração do EmailJS', error: error };
    });
}

