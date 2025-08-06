# Easy-English
A project based on the interest of learning more and contributing to the work of someone special.


# Easy English - Sistema de Agendamento

Este é um sistema completo para agendamento de aulas de inglês, desenvolvido para permitir que os alunos agendem aulas, visualizem seus agendamentos, e possam remarcar ou cancelar quando necessário.

## Estrutura do Projeto

```
easy_english/
├── css/
│   ├── style.css          # Estilos principais
│   ├── cardsTop.css       # Estilos específicos para os cards
│   └── agendamento.css    # Estilos para o sistema de agendamento
├── js/
│   ├── agendamento.js     # Lógica principal do sistema de agendamento
│   └── email-service.js   # Serviço para envio de emails
├── img/                   # Pasta para imagens
└── index.html             # Página principal
```

## Funcionalidades

- **Formulário de Agendamento**: Permite que os alunos agendem aulas fornecendo nome, email, telefone, data, horário, nível e observações.
- **Validação de Campos**: Todos os campos obrigatórios são validados antes do envio.
- **Painel de Visualização**: Os alunos podem acessar seus agendamentos usando seu email.
- **Gerenciamento de Agendamentos**: Possibilidade de remarcar ou cancelar aulas agendadas.
- **Notificações por Email**: Sistema preparado para enviar emails de confirmação, remarcação e cancelamento.

## Configuração do Envio de Email

Para que o sistema envie emails reais, é necessário integrar com um serviço de email. O arquivo `js/email-service.js` contém o código preparado para essa integração, com comentários explicativos.

### Opções de Integração:

1. **EmailJS**: Serviço baseado em JavaScript que permite enviar emails diretamente do frontend.
   - Crie uma conta em [emailjs.com](https://www.emailjs.com/)
   - Configure um serviço e templates
   - Adicione o SDK ao projeto
   - Descomente e configure o código no arquivo `email-service.js`

2. **Outras opções**: SendGrid, Mailgun, AWS SES (requerem backend)

## Personalização

- **Cores e Estilos**: As cores principais podem ser alteradas modificando as variáveis CSS no arquivo `css/style.css`.
- **Horários Disponíveis**: Edite as opções no select de horários no arquivo `index.html`.
- **Email da Professora**: Altere o email no arquivo `js/email-service.js` para o email correto da professora.

## Uso

1. Abra o arquivo `index.html` em um navegador
2. Na seção "Agende sua aula", preencha o formulário com os dados solicitados
3. Clique em "Agendar Aula" para confirmar
4. Para visualizar agendamentos, clique na aba "Meus Agendamentos" e insira o email utilizado no agendamento

## Armazenamento de Dados

Atualmente, o sistema utiliza o localStorage do navegador para armazenar os agendamentos. Isso significa que:
- Os dados são armazenados apenas no navegador do usuário
- Os agendamentos não são compartilhados entre dispositivos
- Os dados persistem mesmo após fechar o navegador, mas podem ser perdidos se o usuário limpar os dados de navegação

Para uma solução mais robusta, seria recomendável implementar um backend com banco de dados.

## Próximos Passos Recomendados

1. Implementar a integração real com um serviço de email
2. Desenvolver um backend para armazenamento persistente dos agendamentos
3. Criar um painel administrativo para a professora gerenciar todos os agendamentos
4. Implementar um sistema de autenticação mais seguro
