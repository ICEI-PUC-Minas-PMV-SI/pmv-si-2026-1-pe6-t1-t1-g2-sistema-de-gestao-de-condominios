# Front-end Móvel

O Front-end Móvel do projeto **Gestão Integrada de Condomínios** foi planejado para oferecer uma experiência prática e intuitiva para moradores e perfis administrativos em contexto de uso diário no smartphone. O objetivo é centralizar, em uma navegação simples, os fluxos essenciais do condomínio: autenticação, acompanhamento de avisos e atualizações, registro de ocorrências, realização de reservas e gestão de usuários.

A proposta mobile prioriza rapidez nas tarefas mais frequentes e clareza na leitura de informações operacionais. Com isso, o aplicativo reduz a dependência de canais informais (mensagens e comunicados dispersos), melhora a comunicação entre administração e condôminos e aumenta a visibilidade sobre solicitações e serviços do condomínio.

## Projeto da Interface
O projeto da interface móvel foi estruturado com foco em **usabilidade em telas pequenas**, mantendo consistência entre módulos e reduzindo a curva de aprendizado para usuários não técnicos. A navegação principal ocorre por meio de **barra inferior fixa** (Dashboard, Reservas, Ocorrências e Gestão), complementada por ações contextuais no topo das telas (notificações, configurações e busca).

As páginas seguem um padrão visual baseado em cards, blocos de ação e indicadores de status, facilitando o escaneamento rápido. O fluxo foi desenhado para refletir o dia a dia condominial:
- **Login:** entrada segura na plataforma com foco em acesso rápido.
- **Reservas:** seleção de ambiente, data e faixa de horário com validações de disponibilidade.
- **Ocorrências:** acompanhamento de chamados por status, data e categoria.
- **Gestão:** controle de usuários ativos/inativos e permissões de acesso.

As interações priorizam toques únicos, feedback visual imediato e componentes reutilizáveis (botões primários, toggles, chips de filtro e cards informativos), garantindo previsibilidade de uso entre as telas.

### Wireframes

Os wireframes abaixo representam as páginas principais da experiência móvel e a disposição dos elementos de interface:

#### Login
![Wireframe - Login](/docs/img/wireframes/mobile/wireframe-login.jpeg)

#### Dashboard
![Wireframe - Dashboard](/docs/img/wireframes/mobile/wireframe-dashboard.jpeg)

#### Reservas
![Wireframe - Reservas](/docs/img/wireframes/mobile/reservas.jpeg)

#### Ocorrências
![Wireframe - Ocorrências](/docs/img/wireframes/mobile/wireframe-ocorrencias.jpeg)

#### Gestão de Usuários
![Wireframe - Gestão](/docs/img/wireframes/mobile/wireframe-residentes.jpeg)

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

### Carregamento
![Tela Carregamento](img/mobile/tela-carregamento.png)
 
Ao entrar no aplicativo o usuário é direcionado para a tela de carregamento, onde um ícone de spinner nativo do sistema aparece girando enquanto a aplicação está sendo efetivamente carregada.

### Login
![Tela Login](img/mobile/tela-login.png)

Após a tela carregar o usuário é redirecionado para a tela de login. O usuário pode inserir as informações de email e senha nos campos para fazer o login. Caso ainda não tenha um login, basta pressionar o botão nomeado "Criar conta" para ser redirecionado à tela de cadastro. Ao ter inserido as informações nos campos basta que o usuário pressione o botão "Acessar conta" para efetuar o login. Ao efetuar o login será redirecionado à tela de dashboard.

### Cadastro

![Tela Cadastro](img/mobile/tela-cadastro.png)

Na tela de cadastro o usuário deve informar suas credenciais nos campos. Essas credenciais são o nome completo, email e senha que serão utilizadas para acessar tanto a aplicação web quanto o aplicativo para dispositivos móveis. Uma vez que tenha inserido seus dados nos campos basta pressionar o botão "Criar conta" e o usuário será redirecionado para a tela de login, onde poderá prosseguir inserindo as informações cadastradas na tela de cadastro.

### Dashboard
![Tela Dashboard](img/mobile/tela-dashboard.png)

Em dashboard o usuário pode verificar informações gerais destinadas ao seu perfil. É possível verificar informações quantitativas sobre suas encomendas, reservas, ocorrências e entregas. Fora isso existe um botão de atalho para o usuário ser redirecionado diretamente para a tela de entregas.

Como pode-se verificar, na parte inferior da tela existem as abas para as quais o usuário pode navegar. Essas abas estão presentes no aplicativo todo a partir do momento em que o usuário está logado. Ao navegar para uma das abas o conteúdo central da tela muda de acordo com o conteúdo da aba.

### Entregas
![Tela Entregas1](img/mobile/entregas/entrega-1.png)
![Tela Entregas2](img/mobile/entregas/entrega-2.png)
![Tela Entregas3](img/mobile/entregas/entrega-3.png)
![Tela Entregas4](img/mobile/entregas/entrega-4.png)
![Tela Entregas5](img/mobile/entregas/entrega-5.png)

Na tela de entregas o usuário pode verificar as informações de encomendas que chegaram ao condomínio. Como não foi possível capturar a tela de entregas inteira com apenas um print, foram feitas diversas capturas de tela do início ao final do conteúdo disponível para ser possível visualizar todo o fluxo.

É possível visualizar o total de encomendas recebidas e as que estão aguardando retirada. Para essa visualização são demonstrados números e a porcentagem de encomendas em espera na fila de retirada.

Para filtrar encomendas é exibida uma barra de pesquisa, que permite ao usuário pesquisar por termos e obter somente entregas que possuem algum tipo de relação nos termos do que foi pesquisado.

Abaixo da barra de pesquisa existe um menu de atividade recente que mostra as informações das encomendas. As encomendas registradas há mais tempo ficam no topo da lista e as mais recentes ficam mais próximas ao fim da lista.

![Tela Editar Entrega](img/mobile/entregas/editar-entrega.png)

Para usuários com cargo de Administrador é possível editar informações de entregas. Para isso basta o usuário pressionar o botão azul com ícone de lápis localizado na parte direita das informações sobre uma entrega. Ao pressionar este botão será aberto um menu contendo as informações atuais da entrega. Para efetivar uma alteração basta pressionar o botão "Salvar alterações".

![Tela Excluir Entrega](img/mobile/entregas/excluir-entrega.png)

Para usuários com cargo de Administrador é possível excluir informações sobre uma entrega. Para isso basta o usuário pressionar o botão vermelho com ícone de lixeira localizado à direita do ícone de edição. Ao pressionar este botão será mostrada uma modal de confirmação para a exclusão da informação. Caso o usuário deseje realmente excluir basta pressionar o botão "Excluir", mas se clicou por acidente ou deseja cancelar a operação basta pressionar o botão "Cancelar" para voltar à tela normal e manter as informações da entrega.

![Tela Nova Entrega](img/mobile/entregas/nova-entrega.png)

Para usuários com cargo de Administrador é disponibilizado um botão no canto inferior direito da tela de entregas. Esse botão, ao ser clicado, abre um menu que permite registrar uma nova encomenda no sistema. Para isso, devem ser preenchidos os campos de descrição do produto, morador destinatário e status da entrega. 

![Tela Moradores](img/mobile/entregas/nova-entrega-morador.png)

Para selecionar o morador existe um menu de dropdown que ao ser pressionado mostra todos os moradores existentes. É possível também buscar um morador pelo campo de pesquisa derivado do menu de dropdown.

O campo de  data de chegada é opcional por ser preenchido automaticamente com o horário atual caso seja deixado em branco. Ao pressionar o botão "Registrar entrega" a encomenda é registrada no sistema e o menu se fecha.


### Ocorrências (Morador)

Na tela de ocorrências, o morador pode visualizar a listagem de todos os chamados que ele abriu no condomínio. No topo, há cartões informativos com o total de ocorrências, a quantidade de abertas e em andamento. Caso queira registrar um novo problema, o usuário deve pressionar o botão flutuante "+", que abrirá o formulário de "Nova Ocorrência".

![Minhas Ocorrências](/docs/img/mobile/minhas-ocorrencias.jpeg)

### Nova Ocorrência

Ao abrir o formulário de nova ocorrência, o usuário deve preencher os campos obrigatórios de "Título" e "Descrição" para detalhar o problema para a administração do condomínio. Após inserir os dados, basta pressionar o botão "Registrar ocorrência" para enviar as informações para o sistema e salvar o chamado.

![Nova Ocorrência](/docs/img/mobile/nova-ocorrencia.jpeg)

### Confirmação de Ocorrência

Após pressionar o botão de registro, o sistema processa os dados e exibe na tela a confirmação de que a ocorrência foi aberta com sucesso, atualizando imediatamente os contadores e adicionando o novo chamado na lista de pendências.

![Ocorrência Criada](/docs/img/mobile/ocorrencia%20criada.jpeg)

### Detalhes e Exclusão de Ocorrência

Ao tocar em qualquer ocorrência na listagem, um menu inferior é exibido mostrando os detalhes do chamado, como a data de abertura e a descrição completa. Nesta tela, o morador tem as opções de "Editar" as informações ou pressionar o botão "Excluir" para remover permanentemente o registro caso o problem já tenha sido resolvido de outra forma.

![Editar ou Excluir Ocorrência](/docs/img/mobile/editar-excluir.jpeg)

![Ocorrência Excluída](/docs/img/mobile/ocorrencia-excluida.jpeg)

### Notificações e Avisos (Morador)

Na aba de "Avisos", o morador acessa a sua central pessoal de mensagens. Quando não há comunicados ou alertas pendentes direcionados à sua unidade habitacional, a interface exibe de forma limpa o estado padrão com a ilustração e o texto informativo de "Nenhuma notificação".

![Central de Avisos do Morador](/docs/img/mobile/notificações-morador.jpeg)

### Perfil do Usuário

Na aba "Perfil", o morador consegue visualizar suas informações cadastrais básicas, como e-mail de acesso e nome. Para fazer alterações em suas credenciais ou atualizar a senha de acesso, basta que o usuário pressione o botão "Editar" localizado no canto superior direito da tela. Caso deseje encerrar a sessão no dispositivo, o usuário deve pressionar o botão "Sair da conta".

![Perfil do Morador](/docs/img/mobile/tela-perfil.jpeg)

### Editar Perfil

Na tela de edição de perfil, os campos de Nome e E-mail aparecem preenchidos com os dados atuais. O usuário pode atualizar essas informações ou digitar uma nova credencial no campo opcional "Nova senha". Após realizar as alterações desejadas, basta pressionar o botão "Salvar alterações" para atualizar as credenciais no sistema.

![Editar Perfil](/docs/img/mobile/editar-perfil.jpeg)

---

## Fluxos Exclusivos do Administrador

Se o usuário estiver logado com um perfil de Administrador, ele terá acesso a telas de gerenciamento exclusivas para controle global do condomínio.

### Gestão de Residentes (Admin)

Na aba de Residentes, o administrador visualiza a listagem completa de todas as pessoas cadastradas no sistema, divididas entre moradores e outros administradores. É possível utilizar a barra de pesquisa para buscar um usuário por nome, e-mail ou perfil. Para adicionar um novo usuário, o administrador deve pressionar o botão flutuante "+". Cada cartão de residente possui botões diretos para editar ou excluir o cadastro.

![Gestão de Residentes](/docs/img/mobile/tela-residentes.jpeg)

### Cadastro de Novo Residente

Ao abrir o formulário de novo residente, o administrador deve preencher obrigatoriamente os campos de "Nome", "E-mail" e "Senha", além de selecionar o tipo de perfil do usuário ("Morador" ou "Administrador"). Após preencher todas as informações, basta pressionar o botão "Cadastrar residente" para efetivar a inclusão no banco de dados.

![Cadastrar Residente](/docs/img/mobile/criar-residente.jpeg)

### Editar Residente

Ao pressionar o ícone de edição de um residente específico, os dados atuais são carregados na tela. O administrador pode alterar o nome, o e-mail cadastrado, modificar o nível de permissão (Perfil) ou preencher o campo opcional de nova senha. Para consolidar os novos dados, basta pressionar o botão "Salvar alterações".

![Editar Dados do Residente](/docs/img/mobile/editar-residentes.jpeg)

### Gestão de Ocorrências (Admin)

Diferente da tela do morador, o administrador visualiza todos os chamados abertos no condomínio na tela de Gestão de Ocorrências. O painel superior exibe o consolidado total de ocorrências abertas e em andamento. Ao selecionar uma ocorrência, o administrador pode verificar os detalhes, como a descrição ou identificar se o relato foi anônimo ("Nome não informado").

![Gestão Geral de Ocorrências](/docs/img/mobile/telaOcorrencias-admin.jpeg)

![Detalhes da Ocorrência sob Visão Admin](/docs/img/mobile/editar_excluir-notificação.jpeg)

### Alterar Status da Ocorrência

Na tela de gerenciamento de chamados, o administrador pode atualizar o andamento do problema pressionando o botão "Alterar status". Um menu inferior se abre com as opções de "Aberto", "Em Andamento", "Resolvido" ou "Cancelado". Basta selecionar a opção desejada para atualizar o fluxo operacional do condomínio.

![Alterar Status da Ocorrência](/docs/img/mobile/admin-alterarStatus.jpeg)

### Gestão de Notificações e Avisos (Admin)

O painel de controle do Administrador possui uma interface dedicada para gerenciar a distribuição de comunicados do condomínio. Através deste módulo, o administrador consegue monitorar o fluxo total de avisos emitidos e realizar a filtragem estrita dos registros em três abas funcionais:"Todos", "Não lidas" e "Lidas". Esse sistema de segmentação por abas permite acompanhar em tempo real as métricas de leitura e engajamento dos moradores com os avisos oficiais da gestão.

![Painel Geral de Notificações Admin](/docs/img/mobile/telaNotificações-admin.jpeg)

![Filtro de Mensagens Não Lidas](/docs/img/mobile/notificações-naoLidas.jpeg)

![Filtro de Mensagens Lidas](/docs/img/mobile/notificaçoes-lidas.jpeg)

## Tecnologias Utilizadas

Para o desenvolvimento da interface do aplicativo para dispositivo móvel, tanto em sistemas IOS como Android, e de acordo com a proposta do projeto, foram selecionadas as seguintes tecnologias:

### 🏗️ Expo
Framework baseado na tecnologia React Native para desenvolvimento de aplicações mobile. Essa ferramenta é considerada "cross-platform", o que significa que é possível desenvolver tanto para sistemas IOS como Android. Um diferencial do Expo é que ele possui integração para fazer o bundle(versão funcional do código-fonte) e disponibilizar a aplicação na Play Store e na App Store, o que otimiza o processo de construção do app. 

## Considerações de Segurança

A segurança do lado do cliente (mobile) foi projetada para garantir a integridade dos dados do usuário e proteger a comunicação com o backend em um ambiente de dispositivo móvel.

1. Autenticação e Persistência de Sessão
Gerenciamento de Sessão: O aplicativo utiliza o contexto de autenticação (AuthContext.tsx) para gerenciar o estado da sessão. O sistema não mantém credenciais sensíveis (como senha em texto limpo) no estado da aplicação após a autenticação bem-sucedida.

Armazenamento Seguro: A persistência do token de sessão obtido via Supabase é realizada utilizando mecanismos de armazenamento seguro oferecidos pelo ambiente Expo, garantindo que o token de autenticação não seja facilmente acessível por outros processos do dispositivo ou extraído via backup inseguro.

2. Controle de Acesso e UX Segura
Rotas Protegidas: A navegação do aplicativo (app/_layout.tsx e app/(tabs)/_layout.tsx) implementa uma camada de verificação de autenticação. Usuários não autenticados são redirecionados automaticamente para a tela de login.tsx, impedindo o acesso à interface administrativa ou de moradores sem o token válido.

Feedback de Autenticação: A interface utiliza componentes dedicados (AuthFeedbackMessage.tsx) para exibir erros de login ou cadastro, garantindo que o usuário receba feedback visual imediato em caso de falha, sem expor detalhes técnicos da exceção que poderiam ser explorados.

3. Proteção de Privacidade e Segurança de Tela
Restrição de Captura (FLAG_SECURE): O aplicativo implementa a diretiva de segurança FLAG_SECURE em telas que processam dados sensíveis (Login, Cadastro e Edição de Perfil). Esta medida impede que o sistema operacional execute capturas de tela (screenshots) ou gravações de vídeo (screen recording) nestas rotas, mitigando riscos de screen logging e garantindo que dados pessoais não sejam expostos em gravações não autorizadas.

4. Integridade de Dados
Validação de Formulários (Frontend): Todos os formulários (Login, Cadastro e Nova Ocorrência) realizam validações síncronas antes da submissão dos dados. Isso evita o envio de payloads malformados ou incompletos para a API, reduzindo a carga desnecessária e protegendo o endpoint de possíveis ataques de injeção de dados via inputs.

Comunicação Criptografada: Toda a integração com o Supabase (services/supabase.ts) é feita via protocolo HTTPS, garantindo que o tráfego de dados entre o smartphone e os servidores de nuvem ocorra sob criptografia TLS, protegendo os dados contra ataques de Man-in-the-Middle (MitM) em redes Wi-Fi públicas.
## Implantação

### 1. Requisitos de hardware e software

**Desenvolvimento:**

- Node.js 18+ e npm
- Sistema operacional: Windows, macOS ou Linux
- Para iOS: macOS com Xcode instalado
- Para Android: Android Studio com emulador configurado, ou dispositivo físico
- App **Expo Go** instalado no dispositivo para testes rápidos

**Produção (build final):**

- Conta na plataforma **EAS (Expo Application Services)**
- Para publicar na Play Store: conta Google Play Developer
- Para publicar na App Store: conta Apple Developer

### 2. Plataforma de hospedagem

O frontend mobile é distribuído como aplicativo nativo gerado pelo **Expo SDK 54** com **React Native 0.81.5**. O build e distribuição são feitos via **EAS Build** (serviço em nuvem da Expo), eliminando a necessidade de servidor dedicado para o app em si. O backend ASP.NET permanece hospedado separadamente.

### 3. Configuração do ambiente

Instalar dependências:

```bash
cd src/frontend-mobile
npm install
```

Configurar a variável de ambiente com a URL do backend no arquivo `.env`:

```
EXPO_PUBLIC_API_URL=https://sua-api.com
```

Instalar o CLI do EAS:

```bash
npm install -g eas-cli
eas login
```

### 4. Deploy

Testes locais via Expo Go:

```bash
npx expo start
```

Build de produção Android:

```bash
eas build --platform android
```

Build de produção iOS:

```bash
eas build --platform ios
```

Publicar atualização over-the-air (sem novo build):

```bash
eas update --branch production
```

### 5. Testes pós-implantação

- Verificar login com perfis Administrador e Morador
- Confirmar que as chamadas à API estão apontando para o backend de produção
- Testar fluxo de encomendas, reservas e notificações
- Validar autenticação social via Google
- Testar em dispositivos Android e iOS reais antes da publicação nas lojas
## Testes

Os testes manuais validam se a jornada do usuário no aplicativo segue as regras de negócio. Para uma demonstração visual do fluxo completo, disponibilizamos vídeos demonstrativos das funcionalidades públicas.

> **Nota sobre Segurança:** Telas que processam dados sensíveis (Login, Cadastro, Edição de Perfil) implementam a diretiva `FLAG_SECURE`. Esta medida de segurança impede a gravação de tela e *screenshots* para evitar *screen logging*. Por este motivo, tais fluxos não possuem gravação de vídeo, sendo verificados via inspeção direta em ambiente de homologação.

### Demonstração Prática (Vídeos)
* **[Vídeo: Fluxo do Morador](https://youtube.com/shorts/IJ2besR8dTA?feature=share)**
* **[Vídeo: Fluxo do Administrador](https://youtube.com/shorts/2I2czB93lvw?feature=share)**

---

### 1. Procedimentos de Teste (Jornada do Morador)

| ID | Ação | Passo a Passo | Resultado Esperado | Referência |
|:---|:---|:---|:---|:---|
| **TM-M01** | Criar Ocorrência | 1. Clicar em '+' <br> 2. Preencher título/descrição <br> 3. Clicar em 'Registrar' | Sistema deve exibir tela de confirmação e redirecionar para lista. | [Vídeo: Fluxo do Morador](https://youtube.com/shorts/IJ2besR8dTA?feature=share) |
| **TM-M02** | Editar Ocorrência | 1. Tocar em ocorrência <br> 2. Clicar em 'Editar' <br> 3. Salvar alterações | Dados devem ser atualizados na tela de detalhes. | [Vídeo: Fluxo do Morador](https://youtube.com/shorts/IJ2besR8dTA?feature=share) |
| **TM-M03** | Excluir Ocorrência | 1. Tocar em ocorrência <br> 2. Clicar em 'Excluir' <br> 3. Confirmar ação | Ocorrência deve sumir da lista sem erros. | [Vídeo: Fluxo do Morador](https://youtube.com/shorts/IJ2besR8dTA?feature=share) |
| **TM-M04** | Ler Notificação | 1. Acessar aba 'Avisos' <br> 2. Tocar em notificação | O contador de não lidas deve ser decrementado. | [Vídeo: Fluxo do Morador](https://youtube.com/shorts/IJ2besR8dTA?feature=share) |
| **TM-M05** | Login / Autenticação | 1. Inserir credenciais <br> 2. Clicar em 'Entrar' | Acesso concedido e redirecionamento para o Dashboard. | Restrição de Segurança (`FLAG_SECURE`) |
| **TM-M06** | Editar Perfil | 1. Acessar aba 'Perfil' <br> 2. Alterar dados <br> 3. Salvar | Dados do usuário atualizados na base. | Restrição de Segurança (`FLAG_SECURE`) |

### 2. Procedimentos de Teste (Jornada do Administrador)

| ID | Ação | Passo a Passo | Resultado Esperado | Referência |
|:---|:---|:---|:---|:---|
| **TM-A01** | Cadastrar Residente | 1. Clicar em '+' na tela Residentes <br> 2. Preencher dados <br> 3. Salvar | Novo usuário deve aparecer na tabela de residentes. | [Vídeo: Fluxo do Administrador](https://youtube.com/shorts/2I2czB93lvw?feature=share) |
| **TM-A02** | Editar Residente | 1. Clicar no ícone de edição <br> 2. Alterar perfil <br> 3. Salvar | Nível de permissão deve ser atualizado no sistema. | [Vídeo: Fluxo do Administrador](https://youtube.com/shorts/2I2czB93lvw?feature=share) |
| **TM-A03** | Mudar Status Ocorrência | 1. Abrir Ocorrência <br> 2. Clicar em 'Alterar Status' <br> 3. Selecionar 'Resolvido' | Status deve atualizar instantaneamente. | [Vídeo: Fluxo do Administrador](https://youtube.com/shorts/2I2czB93lvw?feature=share) |
| **TM-A04** | Gerenciar Notificações | 1. Acessar aba 'Notificações' <br> 2. Alternar entre filtros: 'Todas', 'Lidas' e 'Não Lidas' | O sistema deve exibir o feed global (todas ocorrências) e atualizar a lista conforme o filtro aplicado. | [Vídeo: Fluxo do Administrador](https://youtube.com/shorts/2I2czB93lvw?feature=share) |

### 3. Login

| ID     | Caso de teste                                 | Dados                            | Resultado esperado                                                   | Resultado obtido                                                     |                                
| ------ | --------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |--------------------------------------------------------------------- |
| CT-001 | Login com credenciais válidas                 | Usuário e senha corretos         | Login realizado com sucesso e redirecionamento para a página inicial | Login realizado com sucesso e redirecionamento para a página inicial |
| CT-002 | Login com usuário inválido                    | Usuário inexistente              | Mensagem de erro informando credenciais inválidas                    | Exibição da mensagem "Usuário ou senha inválidos"                    |
| CT-003 | Login com senha inválida                      | Usuário válido e senha incorreta | Mensagem de erro informando credenciais inválidas                    | Exibição da mensagem "Usuário ou senha inválidos"                    |
| CT-004 | Login com usuário vazio                       | Campo usuário em branco          | Validação impedindo o login                                          | Exibição da mensagem "Informe e-mail e senha para continuar"         |                                            
| CT-005 | Login com senha vazia                         | Campo senha em branco            | Validação impedindo o login                                          | Exibição da mensagem "Informe e-mail e senha para continuar"         |
| CT-006 | Login com ambos os campos vazios              | Usuário e senha em branco        | Exibição das mensagens de obrigatoriedade                            | Exibição da mensagem "Usuário ou senha inválidos"                    |                           

### 4. Dashboard

| ID     | Caso de teste                                 | Dados                                                           | Resultado esperado                                   | Resultado obtido                                     |                                
| ------ | --------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |----------------------------------------------------- |
| CT-001 | Acessar dashboard após login                  | usuário: Matheus / perfil: Administrador                        | Dashboard carregado corretamente                     | Dashboard carregado corretamente                     |
| CT-002 | Verificar exibição dos widgets                | Wigets esperados : Encomendas, reservas, ocorrências e entregas | Todos os widgets são exibidos conforme especificação | Todos os widgets são exibidos conforme especificação |
| CT-003 | Validar dados dos indicadores                 | Dados das outras abas são apresentados no dashboard             | Valores apresentados correspondem aos dados da base  | Valores apresentados correspondem aos dados da base  |
| CT-004 | Atualizar dashboard                           | Atualizar dados nas outras abas modificam o dashboard           | Dados são atualizados corretamente                   | Dados não são atualizados corretamente               |                                            
               
### 5. Reservas

| ID     | Caso de teste          | Dados                                                     | Resultado esperado                 | Resultado obtido                    |                                
| ------ | ---------------------- | --------------------------------------------------------- | ---------------------------------- |------------------------------------ |
| CT-001 | Acessar a aba reservas | Acessar reservas após login                               | Reservas carregada corretamente    | Reservas carregada corretamente     |
| CT-002 | Criar uma reserva      | Iniciar o processo de criar reserva                       | Reserva criada com sucesso         | Reserva criada com sucesso          |
| CT-003 | Aprovar uma reserva    | Aprovar uma reserva por um Administrador                  | Reserva foi aprovada com sucesso   | Reserva foi aprovada com sucesso    |
| CT-004 | Editar uma reserva     | Editar reserva do salão dia 13/06 23:00-01:00/16:00-19:00 | Dados são atualizados corretamente | Dados  são atualizados corretamente |  
| CT-005 | Excluir uma reserva    |Excluir reserva do salão dia 13/06 16:00-19:00             | Dados são excluídos                | Dados não são excluidos             |  

### 6. Entregas

| ID     | Caso de teste             | Dados                                     | Resultado esperado                 | Resultado obtido                    |                                
| ------ | ------------------------- | ----------------------------------------- | ---------------------------------- |------------------------------------ |
| CT-001 | Acessar a aba entregas    | Acessar entregas após login               | Entregas carregada corretamente    | Entregas carregada corretamente     |
| CT-002 | Criar uma entrega         | Iniciar o processo de solicitar retirada  | Entrega criada com sucesso         | Entrega criada com sucesso          |
| CT-003 | Entrega no perfil morador | Retirada aparece no perfil morador        | Entrega criada com sucesso         | Entrega criada com sucesso          |
| CT-004 | Aprovar uma reserva       | Aprovar uma retirada por um Administrador | Retirada foi aprovada com sucesso  | Retirada foi aprovada com sucesso   |
| CT-005 | Editar uma reserva        | Editar entrega de uma panela              | Dados são atualizados corretamente | Dados  são atualizados corretamente |  
| CT-006 | Excluir uma reserva       |Excluirencomenda do Mercado Livre          | Dados são excluídos                | Dados não são excluidos             |  

# Referências

AMAZON WEB SERVICES (AWS). **AWS Documentation**. Disponível em: <https://docs.aws.amazon.com/>. Acesso em: 20 maio 2026.

EXPO. **Expo Documentation**. Disponível em: <https://docs.expo.dev/>. Acesso em: 01 jun. 2026.

META. **React Documentation**. Disponível em: <https://react.dev/reference/react>. Acesso em: 12 maio 2026.

META. **React Native Documentation**. Disponível em: <https://reactnative.dev/docs/getting-started>. Acesso em: 28 maio 2026.

MICROSOFT. **.NET Documentation**. Disponível em: <https://learn.microsoft.com/pt-br/dotnet/>. Acesso em: 15 maio 2026.

SUPABASE. **Supabase Documentation**. Disponível em: <https://supabase.com/docs>. Acesso em: 04 jun. 2026.
