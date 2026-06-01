# Front-end Móvel

O Front-end Móvel do projeto **Gestão Integrada de Condomínios (Modernidade Soft)** foi planejado para oferecer uma experiência prática e intuitiva para moradores e perfis administrativos em contexto de uso diário no smartphone. O objetivo é centralizar, em uma navegação simples, os fluxos essenciais do condomínio: autenticação, acompanhamento de avisos e atualizações, registro de ocorrências, realização de reservas e gestão de usuários.

A proposta mobile prioriza rapidez nas tarefas mais frequentes e clareza na leitura de informações operacionais. Com isso, o aplicativo reduz a dependência de canais informais (mensagens e comunicados dispersos), melhora a comunicação entre administração e condôminos e aumenta a visibilidade sobre solicitações e serviços do condomínio.

## Projeto da Interface
O projeto da interface móvel foi estruturado com foco em **usabilidade em telas pequenas**, mantendo consistência entre módulos e reduzindo a curva de aprendizado para usuários não técnicos. A navegação principal ocorre por meio de **barra inferior fixa** (Dashboard, Reservas, Ocorrências e Gestão), complementada por ações contextuais no topo das telas (notificações, configurações e busca).

As páginas seguem um padrão visual baseado em cards, blocos de ação e indicadores de status, facilitando o escaneamento rápido. O fluxo foi desenhado para refletir o dia a dia condominial:
- **Login:** entrada segura na plataforma com foco em acesso rápido.
- **Dashboard:** visão geral de atalhos e atualizações recentes.
- **Reservas:** seleção de ambiente, data e faixa de horário com validações de disponibilidade.
- **Ocorrências:** acompanhamento de chamados por status, data e categoria.
- **Gestão:** controle de usuários ativos/inativos e permissões de acesso.

As interações priorizam toques únicos, feedback visual imediato e componentes reutilizáveis (botões primários, toggles, chips de filtro e cards informativos), garantindo previsibilidade de uso entre as telas.

### Wireframes

Os wireframes abaixo representam as páginas principais da experiência móvel e a disposição dos elementos de interface:

#### Login
![Wireframe - Login](../assets/c__Users_djgui_AppData_Roaming_Cursor_User_workspaceStorage_9066c7e4e49715e03f03b1909e52befb_images_login-f25d6d96-ce74-4dd5-ba6e-dc245699d192.png)

#### Dashboard
![Wireframe - Dashboard](../assets/c__Users_djgui_AppData_Roaming_Cursor_User_workspaceStorage_9066c7e4e49715e03f03b1909e52befb_images_dashboard-04886cc0-e037-4ab2-8691-7cce4ec85a80.png)

#### Reservas
![Wireframe - Reservas](../assets/c__Users_djgui_AppData_Roaming_Cursor_User_workspaceStorage_9066c7e4e49715e03f03b1909e52befb_images_reservas-93fdd40f-1cc8-45da-a64b-6a609d451304.png)

#### Ocorrências
![Wireframe - Ocorrências](../assets/c__Users_djgui_AppData_Roaming_Cursor_User_workspaceStorage_9066c7e4e49715e03f03b1909e52befb_images_ocorrencias-e4a470a9-d3ff-4abc-a6f6-c3e20ca36ce8.png)

#### Gestão de Usuários
![Wireframe - Gestão](../assets/c__Users_djgui_AppData_Roaming_Cursor_User_workspaceStorage_9066c7e4e49715e03f03b1909e52befb_images_gestao-fd08474c-4a19-4ab6-8eed-489941a5d59c.png)

### Design Visual

O estilo visual adota linguagem contemporânea, com predominância de tons de azul, cinza e branco para transmitir confiança, organização e leitura limpa. A hierarquia de informações é construída com contraste moderado, uso de espaçamento amplo e cards com cantos arredondados, mantendo a interface leve e amigável.

A tipografia sem serifa favorece legibilidade em diferentes tamanhos de tela, com títulos em peso mais forte para destacar ações críticas (ex.: confirmar reserva, criar usuário, registrar ocorrência). Os ícones são usados como apoio funcional para navegação e reconhecimento rápido de contexto (menu, alertas, manutenção, usuários e reserva).

Também foram definidos padrões visuais para estados e feedbacks:
- chips de status para ocorrências (aberto, em análise, finalizado);
- botões primários em destaque para ações de confirmação;
- toggles para ativação/inativação de usuários;
- blocos informativos para atualizações recentes e indicadores operacionais.

Esse conjunto garante consistência entre telas e reforça a proposta de uma experiência móvel objetiva para operações condominiais do dia a dia.

## Fluxo de Dados

[Diagrama ou descrição do fluxo de dados na aplicação.]

## Tecnologias Utilizadas

Para o desenvolvimento da interface do aplicativo para dispositivo móvel, tanto em sistemas IOS como Android, e de acordo com a proposta do projeto, foram selecionadas as seguintes tecnologias:

### 🏗️ Expo
Framework baseado na tecnologia React Native para desenvolvimento de aplicações mobile. Essa ferramenta é considerada "cross-platform", o que significa que é possível desenvolver tanto para sistemas IOS como Android. Um diferencial do Expo é que ele possui integração para fazer o bundle(versão funcional do código-fonte) e disponibilizar a aplicação na Play Store e na App Store, o que otimiza o processo de construção do app. 

## Considerações de Segurança

[Discuta as considerações de segurança relevantes para a aplicação distribuída, como autenticação, autorização, proteção contra ataques, etc.]

## Implantação

[Instruções para implantar a aplicação distribuída em um ambiente de produção.]

1. Defina os requisitos de hardware e software necessários para implantar a aplicação em um ambiente de produção.
2. Escolha uma plataforma de hospedagem adequada, como um provedor de nuvem ou um servidor dedicado.
3. Configure o ambiente de implantação, incluindo a instalação de dependências e configuração de variáveis de ambiente.
4. Faça o deploy da aplicação no ambiente escolhido, seguindo as instruções específicas da plataforma de hospedagem.
5. Realize testes para garantir que a aplicação esteja funcionando corretamente no ambiente de produção.

## Testes

[Descreva a estratégia de teste, incluindo os tipos de teste a serem realizados (unitários, integração, carga, etc.) e as ferramentas a serem utilizadas.]

1. Crie casos de teste para cobrir todos os requisitos funcionais e não funcionais da aplicação.
2. Implemente testes unitários para testar unidades individuais de código, como funções e classes.
3. Realize testes de integração para verificar a interação correta entre os componentes da aplicação.
4. Execute testes de carga para avaliar o desempenho da aplicação sob carga significativa.
5. Utilize ferramentas de teste adequadas, como frameworks de teste e ferramentas de automação de teste, para agilizar o processo de teste.

# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
