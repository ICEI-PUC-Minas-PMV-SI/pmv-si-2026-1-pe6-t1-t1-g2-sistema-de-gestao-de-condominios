# Front-end Móvel

[Inclua uma breve descrição do projeto e seus objetivos.]

## Projeto da Interface
[Descreva o projeto da interface móvel da aplicação, incluindo o design visual, layout das páginas, interações do usuário e outros aspectos relevantes.]

### Wireframes

[Inclua os wireframes das páginas principais da interface, mostrando a disposição dos elementos na página.]

### Design Visual

[Descreva o estilo visual da interface, incluindo paleta de cores, tipografia, ícones e outros elementos gráficos.]

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

![Tela Nova Entrega](img/mobile/entregas/nova-entrega.png)

Para usuários com cargo de Administrador é disponibilizado um botão no canto inferior direito da tela de entregas. Esse botão, ao ser clicado, abre um menu que permite registrar uma nova encomenda no sistema. Para isso, devem ser preenchidos os campos de descrição do produto, morador destinatário e status da entrega. 

![Tela Moradores](img/mobile/entregas/nova-entrega-morador.png)

Para selecionar o morador existe um menu de dropdown que ao ser pressionado mostra todos os moradores existentes. É possível também buscar um morador pelo campo de pesquisa derivado do menu de dropdown.

O campo de  data de chegada é opcional por ser preenchido automaticamente com o horário atual caso seja deixado em branco. Ao pressionar o botão "Registrar entrega" a encomenda é registrada no sistema e o menu se fecha.


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
