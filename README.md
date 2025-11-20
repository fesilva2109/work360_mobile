# 🚀 Global Solution: Work360

O Work360 é um aplicativo móvel completo, projetado para centralizar a gestão de produtividade de profissionais. Ele combina ferramentas de organização com análises inteligentes, permitindo que os usuários controlem suas tarefas, agendem reuniões e recebam insights gerados por IA para otimizar seu desempenho.

Este projeto foi desenvolvido como parte da Global Solution da FIAP, com foco em criar uma solução robusta e escalável.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


### 👨‍💻 Integrantes

1.  **Eduardo Henrique Strapazzon Nagado** - RM558158
2.  **Felipe Silva Maciel** - RM555307
3.  **Gustavo Ramires Lazzuri** - RM556772

---

## 📹 Vídeo de Demonstração

Assista ao vídeo completo do projeto em funcionamento:

**[▶️ Work360 - Apresentação da Solução no YouTube]()**

---

## ✨ Funcionalidades Detalhadas

-   🔐 **Autenticação Segura**:
    -   Telas de Login e Registro com validação de formulário.
    -   Gerenciamento de sessão com persistência local (`AsyncStorage`), mantendo o usuário logado.
    -   Fluxo de logout seguro.

-   📊 **Dashboard Dinâmico**:
    -   Exibe um resumo em tempo real das principais métricas do dia: tarefas pendentes, tarefas concluídas, próximas reuniões e minutos de foco.
    -   Atualização automática ao entrar na tela (`pull-to-refresh`).

-   ✅ **Gestão de Tarefas**:
    -   CRUD completo: criar, visualizar, editar e deletar tarefas.
    -   Sistema de prioridades (Alta, Média, Baixa) com indicadores visuais.
    -   Filtros para visualizar tarefas por prioridade.
    -   Atualização "otimista": a interface responde instantaneamente ao marcar uma tarefa como concluída, sincronizando com o backend em segundo plano.

-   📅 **Agendamento de Reuniões**:
    -   CRUD completo para reuniões.
    -   Seletores de data e hora nativos para uma melhor experiência do usuário.
    -   Visualização de reuniões separadas por "Próximas" e "Passadas".

-   ⚡ **Modo Foco**:
    -   Um timer de concentração que registra o tempo dedicado a atividades.
    -   Ao iniciar e parar uma sessão, eventos (`FOCO_INICIO`, `FOCO_FIM`) são enviados para a API de analytics, alimentando os relatórios.
    -   Ao final da sessão, exibe um resumo e oferece a opção de gerar um relatório de produtividade para o período focado.

-   🤖 **Relatórios com IA**:
    -   Geração de relatórios de produtividade para períodos de tempo selecionados.
    -   Funcionalidade para "enriquecer" um relatório base com análises geradas por uma IA no backend.
    -   A IA preenche campos como `insights`, `resumoGeral` e `recomendacaoIA`.
    -   Visualização detalhada dos relatórios, com a opção de solicitar a análise da IA.

---

## 🏗️ Arquitetura e Estrutura de Pastas

O projeto segue uma arquitetura limpa e organizada, separando as responsabilidades para facilitar a manutenção e o desenvolvimento.
```bash

work360_mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── analytics.tsx
│   │   ├── focus.tsx
│   │   ├── index.tsx
│   │   ├── meetings.tsx
│   │   └── tasks.tsx
│   ├── meeting/
│   │   ├── [id].tsx
│   │   ├── edit/
│   │   │   └── [id].tsx
│   │   └── new.tsx
│   ├── report/
│   │   └── [id].tsx
│   ├── task/
│   │   ├── [id].tsx
│   │   ├── TaskFormScreen.tsx
│   │   ├── TaskListScreen.tsx
│   │   ├── edit/
│   │   │   └── [id].tsx
│   │   └── new.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── about.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── profile.tsx
│   ├── register.tsx
│   └── reports.tsx
├── assets/
│   └── images/
│       ├── favicon.png
│       └── icon.png
├── hooks/
│   └── useFrameworkReady.ts
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── MeetingCard.tsx
│   │   └── TaskCard.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MeetingForm.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ReportDetailScreen.tsx
│   │   └── ReportsScreen.tsx
│   ├── services/
│   │   ├── analyticsService.ts
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── focusService.ts
│   │   ├── iaService.ts
│   │   ├── iotService.ts
│   │   ├── meetingService.ts
│   │   └── taskService.ts
│   ├── styles/
│   │   └── theme.ts
│   └── types/
│       ├── analytics.types.ts
│       ├── focus.types.ts
│       ├── models.ts
│       ├── report.types.ts
│       └── task.types.ts
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
└── types.ts

```


### Detalhes da Arquitetura

1.  **`app/` (Camada de Apresentação e Roteamento)**: Utiliza o **Expo Router** para um roteamento baseado em arquivos. As pastas definem a estrutura de navegação, como o grupo `(tabs)` para a barra de navegação inferior e rotas dinâmicas como `task/[id].tsx` para detalhes de uma tarefa específica.

2.  **`src/components/`**: Contém componentes de UI genéricos e reutilizáveis, como `Button.tsx`, `Card.tsx` e `Input.tsx`. Eles recebem `props` e não possuem lógica de negócio.

3.  **`src/contexts/`**: Centraliza o estado global. O `AuthContext.tsx` é um exemplo chave, gerenciando o estado de autenticação (usuário, token) e fornecendo funções como `signIn` e `signOut` para toda a aplicação.

4.  **`src/services/`**: Esta é a camada de acesso a dados. Cada arquivo (ex: `taskService.ts`, `reportService.ts`) é responsável por todas as chamadas de API relacionadas a uma entidade específica, usando o **Axios** para as requisições HTTP.

5.  **`src/types/`**: Define todas as interfaces e tipos TypeScript do projeto (ex: `Tarefa`, `Reuniao`, `RelatorioGerado`), garantindo a segurança de tipos e a previsibilidade dos dados.

---

## 🛠️ Tecnologias Utilizadas

-   **React Native**: Framework para desenvolvimento de apps nativos.
-   **Expo SDK 54**: Plataforma e conjunto de ferramentas para facilitar o desenvolvimento.
-   **TypeScript**: Garante a segurança de tipos e a manutenibilidade do código.
-   **Expo Router**: Sistema de roteamento moderno baseado em arquivos.
-   **Axios**: Cliente HTTP para comunicação com a API REST do backend.
-   **React Context API**: Para gerenciamento de estado global (autenticação).
-   **Lucide React Native**: Biblioteca de ícones vetoriais.

---

## 🚀 Como Executar

### Pré-requisitos

-   Node.js (versão LTS recomendada)
-   Emulador Android/iOS ou um dispositivo físico com o app Expo Go instalado.
-   Backend do Work360 (Java/Spring Boot) rodando na mesma rede.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/work360_mobile.git
    cd work360_mobile
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o endereço da API:**
    -   Abra o arquivo `src/services/api.ts`.
    -   Altere a constante `API_BASE_URL` para o endereço IP da máquina onde o backend está rodando.
    ```typescript
    const API_BASE_URL = 'http://SEU_IP_LOCAL:8080';
    ```

4.  **Inicie o aplicativo:**
    ```bash
    npx expo start
    ```

5.  **Abra no seu dispositivo:**
    -   Escaneie o QR code exibido no terminal com o app Expo Go (no seu celular) ou pressione `a` para abrir no emulador Android.

---

## 💡 Boas Práticas

-   **Tipagem Forte**: Uso de TypeScript para garantir a segurança e a manutenibilidade do código.
-   **Componentização**: Criação de componentes de UI reutilizáveis para manter a consistência visual.
-   **Separação de Responsabilidades**: A arquitetura em camadas (UI, Estado, Serviços, API) torna o código mais organizado.
-   **Estilo Centralizado**: Um arquivo de tema (`src/styles/theme.ts`) unifica cores, fontes e espaçamentos.
-   **Roteamento Moderno**: Expo Router para uma navegação declarativa e baseada no sistema de arquivos.

---

[!React Native](https://reactnative.dev/)
[!Expo](https://expo.dev/)
[!TypeScript](https://www.typescriptlang.org/)
[!License](LICENSE)

----

----


