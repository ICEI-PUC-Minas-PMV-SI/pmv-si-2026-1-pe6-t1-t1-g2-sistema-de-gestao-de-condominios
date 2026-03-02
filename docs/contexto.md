# Introdução

Este projeto aborda a crescente necessidade de modernização na administração de condomínios residenciais. O documento descreve a concepção e o planejamento de um sistema de software distribuído, nomeado "Gestão Integrada de Condomínios", cujo objetivo é otimizar processos administrativos e melhorar a comunicação interna. O foco principal da solução é automatizar o processo de reserva de áreas comuns, um ponto frequente de atrito e ineficiência. A aplicação será composta por uma API RESTful desenvolvida em .NET, uma aplicação web em React para acesso via navegador e um aplicativo móvel, garantindo acessibilidade e conveniência para todos os usuários. O projeto visa não apenas resolver um problema prático, mas também aplicar os conceitos de arquitetura de sistemas distribuídos, desenvolvimento de APIs e aplicações móveis, conforme o plano de ensino da disciplina.

## Problema
Nesse momento você deve apresentar o problema que a sua aplicação deve  resolver. No entanto, não é a hora de comentar sobre a aplicação.

Descreva também o contexto em que essa aplicação será usada, se  houver: empresa, tecnologias, etc. Novamente, descreva apenas o que de  fato existir, pois ainda não é a hora de apresentar requisitos  detalhados ou projetos.

Nesse momento, o grupo pode optar por fazer uso  de ferramentas como Design Thinking, que permite um olhar de ponta a ponta para o problema.

> **Links Úteis**:
> - [Objetivos, Problema de pesquisa e Justificativa](https://medium.com/@versioparole/objetivos-problema-de-pesquisa-e-justificativa-c98c8233b9c3)
> - [Matriz Certezas, Suposições e Dúvidas](https://medium.com/educa%C3%A7%C3%A3o-fora-da-caixa/matriz-certezas-suposi%C3%A7%C3%B5es-e-d%C3%BAvidas-fa2263633655)
> - [Brainstorming](https://www.euax.com.br/2018/09/brainstorming/)

## Objetivos

Aqui você deve descrever os objetivos do trabalho indicando que o objetivo geral é desenvolver um software para solucionar o problema apresentado acima. 

Apresente também alguns (pelo menos 2) objetivos específicos dependendo de onde você vai querer concentrar a sua prática investigativa, ou como você vai aprofundar no seu trabalho.
 
> **Links Úteis**:
> - [Objetivo geral e objetivo específico: como fazer e quais verbos utilizar](https://blog.mettzer.com/diferenca-entre-objetivo-geral-e-objetivo-especifico/)

## Justificativa

O crescimento da população urbana e a verticalização das cidades resultaram em um aumento significativo no número de condomínios residenciais. Segundo dados do IBGE (2022), a proporção de brasileiros vivendo em apartamentos cresceu de 7,6% em 2000 para 12,5% em 2022. Com isso, a complexidade da gestão condominial aumentou, tornando os métodos tradicionais insuficientes.

A administração manual do processo de reservas, especificamente, é uma fonte constante de ineficiência e insatisfação. Ela não só consome tempo valioso da equipe administrativa como também gera atritos na comunidade devido a erros e falta de clareza. A implementação de um sistema automatizado agrega valor diretamente ao negócio do condomínio ao:

*   **Aumentar a eficiência operacional:** Reduz o tempo gasto em tarefas manuais.
*   **Melhorar a satisfação do morador:** Oferece conveniência, autonomia e transparência, melhorando a experiência de viver em comunidade.
*   **Promover a utilização justa e organizada dos espaços:** Garante que as regras sejam aplicadas de forma consistente para todos.

Este projeto se justifica pela oportunidade de aplicar tecnologia para resolver um problema real e recorrente, gerando um impacto positivo direto na qualidade de vida e na convivência dos moradores, ao mesmo tempo em que otimiza a gestão de recursos para a administração.

> **Links Úteis**:
> - [Como montar a justificativa](https://guiadamonografia.com.br/como-montar-justificativa-do-tcc/)

## Público-Alvo

Descreva quem serão as pessoas que usarão a sua aplicação indicando os diferentes perfis. O objetivo aqui não é definir quem serão os clientes ou quais serão os papéis dos usuários na aplicação. A ideia é, dentro do possível, conhecer um pouco mais sobre o perfil dos usuários: conhecimentos prévios, relação com a tecnologia, relações
hierárquicas, etc.

Adicione informações sobre o público-alvo por meio de uma descrição textual, diagramas de personas e mapa de stakeholders.

> **Links Úteis**:
> - [Público-alvo](https://blog.hotmart.com/pt-br/publico-alvo/)
> - [Como definir o público alvo](https://exame.com/pme/5-dicas-essenciais-para-definir-o-publico-alvo-do-seu-negocio/)
> - [Público-alvo: o que é, tipos, como definir seu público e exemplos](https://klickpages.com.br/blog/publico-alvo-o-que-e/)
> - [Qual a diferença entre público-alvo e persona?](https://rockcontent.com/blog/diferenca-publico-alvo-e-persona/)

# Especificações do Projeto

## Requisitos

### Requisitos Funcionais

| ID | Descrição do Requisito | Prioridade |
|---|---|---|
| RF-001 | O sistema deve permitir o cadastro e autenticação de usuários com perfis de 'Administrador' e 'Morador'. | ALTA |
| RF-002 | O sistema deve permitir que o 'Administrador' cadastre, visualize, edite e remova áreas comuns (ex: nome, capacidade, regras de uso). | ALTA |
| RF-003 | O sistema deve permitir que o 'Morador' consulte a disponibilidade de áreas comuns através de um calendário visual. | ALTA |
| RF-004 | O sistema deve permitir que o 'Morador' realize uma reserva para uma área comum em uma data e horário disponíveis. | ALTA |
| RF-005 | O sistema deve impedir a criação de reservas em horários já ocupados ou fora das regras estabelecidas para a área. | ALTA |
| RF-006 | O sistema deve permitir que o 'Morador' visualize e cancele suas próprias reservas futuras. | MÉDIA |
| RF-007 | O sistema deve permitir que o 'Administrador' visualize, aprove, rejeite ou cancele qualquer reserva no sistema. | MÉDIA |
| RF-008 | O sistema deve enviar uma notificação (email ou push) para o morador ao confirmar ou cancelar uma reserva. | BAIXA |

### Requisitos não Funcionais

| ID | Descrição do Requisito | Prioridade |
|---|---|---|
| RNF-001 | A aplicação web deve ser responsiva, garantindo usabilidade em desktops, tablets e smartphones. | ALTA |
| RNF-002 | O sistema deve ter uma interface intuitiva e de fácil aprendizado para os diferentes perfis de usuário. | ALTA |
| RNF-003 | A comunicação entre os clientes (web/mobile) e a API deve ser criptografada utilizando o protocolo HTTPS. | ALTA |
| RNF-004 | O tempo de resposta para a consulta de disponibilidade no calendário não deve exceder 2 segundos em condições normais de uso. | MÉDIA |
| RNF-005 | O sistema deve ser compatível com os navegadores Google Chrome, Mozilla Firefox e Microsoft Edge em suas duas versões mais recentes. | MÉDIA |

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

| ID | Restrição |
|---|---|
| 01 | A arquitetura do backend deverá ser monolítica, com todos os serviços de negócio contidos em uma única API. |
| 02 | A API deverá ser desenvolvida obrigatoriamente com a tecnologia .NET. |
| 03 | A aplicação web deverá ser desenvolvida obrigatoriamente com a biblioteca React. |
| 04 | A autenticação de usuários no sistema deverá ser implementada utilizando JSON Web Tokens (JWT). |
| 05 | O projeto deverá ser entregue na sua totalidade (código-fonte, documentação e apresentação) até a data limite estipulada no cronograma do semestre. |

# Catálogo de Serviços

Baseado nos conceitos de Gestão de Serviços de TI (ITSM), o projeto oferecerá os seguintes serviços de TI para dar suporte aos processos de negócio do condomínio:

*   **Serviço de Gestão de Identidade e Acesso:**
*   **Descrição:** Provê os meios para que usuários (moradores e administradores) sejam autenticados de forma segura e autorizados a acessar apenas as funcionalidades correspondentes aos seus perfis.
*   **Funcionalidades:** Login, gestão de perfis e papéis.

*   **Serviço de Agendamento de Recursos Comuns:**
*   **Descrição:** É o serviço central da aplicação. Permite que os clientes (moradores) consumam o recurso de negócio "Reserva de Áreas Comuns" de forma automatizada.
*   **Funcionalidades:** Consulta de disponibilidade, criação, visualização e cancelamento de reservas.

*   **Serviço de Portfólio de Recursos:**
*   **Descrição:** Permite que a administração do condomínio gerencie os ativos que serão disponibilizados para reserva.
*   **Funcionalidades:** Cadastro, edição e remoção de áreas comuns e suas respectivas regras de negócio.

*   **Serviço de Notificação:**
*   **Descrição:** Mantém os usuários informados sobre o status de suas solicitações de serviço, garantindo a comunicação e o alinhamento.
*   **Funcionalidades:** Envio de e-mails ou notificações push para confirmações, cancelamentos ou lembretes de reservas


# Arquitetura da Solução

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![arq](https://github.com/user-attachments/assets/b9402e05-8445-47c3-9d47-f11696e38a3d)


## Tecnologias Utilizadas

Descreva aqui qual(is) tecnologias você vai usar para resolver o seu problema, ou seja, implementar a sua solução. Liste todas as tecnologias envolvidas, linguagens a serem utilizadas, serviços web, frameworks, bibliotecas, IDEs de desenvolvimento, e ferramentas.

Apresente também uma figura explicando como as tecnologias estão relacionadas ou como uma interação do usuário com o sistema vai ser conduzida, por onde ela passa até retornar uma resposta ao usuário.

## Hospedagem

Explique como a hospedagem e o lançamento da plataforma foi feita.
