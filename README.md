🧠 Descrição Detalhada do Sistema — Smart Lab ITEL

(Frontend + Backend)

🌍 Visão Geral

O Smart Lab ITEL é uma plataforma web inteligente para gestão de estagiários, controlo de presenças (RFID) e controlo de materiais (QR Code).
O sistema opera em dois pilares tecnológicos principais:

Backend (Servidor e API REST) – responsável pela lógica, regras de negócio e integração com o banco de dados.

Frontend (Interface Web Interativa) – responsável pela visualização, gestão e interação do usuário.

⚙️ 1. Backend – API REST Inteligente (Node.js + Express + PostgreSQL)
🎯 Função Principal

Gerir toda a lógica do sistema: autenticação, registo de estagiários, presenças, controlo de materiais e envio de notificações automáticas.

🧩 Arquitetura Técnica
Camada	Descrição
Servidor	Desenvolvido com Node.js e Express.js, fornece uma API RESTful que recebe dados do ESP32 (via HTTP POST) e do frontend (via Axios).
Banco de Dados	Utiliza PostgreSQL para armazenamento seguro e escalável de dados de estagiários, materiais, presenças e relatórios.
ORM	O acesso ao banco é feito através do Prisma ORM (ou Sequelize), garantindo tipagem e rapidez no desenvolvimento.
Notificações	Envio automático de e-mails via Nodemailer, integrado ao servidor backend.
Segurança	Autenticação JWT e proteção de rotas via middleware.
Logs e Monitoramento	Middleware para logs de requisições, detecção de erros e métricas básicas.
📦 Principais Endpoints da API
Rota	Método	Função
/api/login	POST	Autenticação de administradores e professores
/api/estagiarios	GET/POST/PUT/DELETE	CRUD de estagiários
/api/presencas	POST	Registo de presença via RFID
/api/materiais	GET/POST	Gestão de materiais e empréstimos
/api/notificacoes	POST	Envio de alertas automáticos
/api/relatorios	GET	Relatórios de presença e uso de materiais
🧠 Fluxo de Dados Backend
ESP32 → Envia RFID → API Node.js
          ↓
     Validação de dados
          ↓
     PostgreSQL (armazenamento)
          ↓
  Notificação / Resposta JSON
          ↓
 Frontend exibe resultado

🧰 Stack Técnica Backend

Node.js — ambiente de execução

Express.js — framework web leve

PostgreSQL — banco de dados relacional

Prisma ORM — modelagem de dados e migrações

Nodemailer — envio de e-mails automáticos

JWT — autenticação segura

Dotenv — variáveis de ambiente

CORS & Helmet — segurança e permissões HTTP

🎨 Identidade Visual Backend (Painel Admin)

Inspirada em cores tecnológicas:

Elemento	Cor	Significado
Fundo do painel	#0d1117 (cinza escuro do GitHub)	Foco e contraste
Cabeçalho / Navbar	#1f2937 (cinza grafite)	Estabilidade
Destaques / Botões principais	#61dafb (azul React)	Modernidade
Ações secundárias	#10b981 (verde Node.js)	Tecnologia & Energia
Alertas e notificações	#facc15 (amarelo JS) / #ef4444 (vermelho de erro)	Atenção
Gráficos e métricas	Tons de azul PostgreSQL (#336791)	Inteligência e dados
💻 2. Frontend – Painel Web Interativo (React + Tailwind CSS)
🎯 Função Principal

Fornecer uma interface moderna, intuitiva e responsiva onde o professor ou administrador pode:

Acompanhar presenças em tempo real

Cadastrar e editar estagiários

Visualizar materiais e seus empréstimos

Gerar relatórios de desempenho

Receber notificações de alertas

🧩 Arquitetura Técnica
Camada	Descrição
Framework Base	Construído em React (Vite), garantindo rapidez e componentização.
Estilos	Tailwind CSS para estilização moderna e produtiva.
Comunicação com API	Axios para chamadas HTTP seguras e limpas.
Navegação	React Router para rotas dinâmicas (ex: /dashboard, /materiais, /presencas).
Gestão de Estado	Context API ou Zustand, dependendo da complexidade.
Gráficos e Estatísticas	Recharts ou Chart.js para exibir presenças e uso de materiais.
📊 Componentes Principais
Componente	Descrição
LoginPage.jsx	Tela de autenticação
Dashboard.jsx	Resumo geral (presenças, materiais, alertas)
Estagiarios.jsx	CRUD completo de estagiários
Materiais.jsx	Lista e controlo de materiais (QR Code)
Presencas.jsx	Tabela em tempo real de RFID
Relatorios.jsx	Visualização e exportação de relatórios
Navbar.jsx / Sidebar.jsx	Navegação global
Notifications.jsx	Sistema de alertas e mensagens
🎨 Paleta de Cores Frontend

Baseada nas principais tecnologias usadas (React, Node.js, PostgreSQL, Tailwind):

Elemento	Cor	Tecnologia Inspirada
Primária	#61DAFB	React
Secundária	#10B981	Node.js
Acento	#336791	PostgreSQL
Fundo	#0F172A	Tailwind Dark
Texto	#E2E8F0	Neutral Tailwind
Sucesso	#22C55E	Tailwind Green
Erro	#EF4444	Tailwind Red
Aviso	#FACC15	JavaScript Yellow

🟦 Azul (React / PostgreSQL) — tecnologia e confiança
🟩 Verde (Node.js) — crescimento e energia
⬛ Cinza escuro — foco e elegância
🟨 Amarelo — atenção e dinamismo

🖥️ Layout e Estilo Visual

Design clean e minimalista com foco em usabilidade.

Dashboard principal com cards dinâmicos:

“Presenças de Hoje”

“Materiais Emprestados”

“Alertas Pendentes”

Gráficos interativos mostrando estatísticas semanais e mensais.

Transições suaves e animações leves (Framer Motion).

Dark mode por padrão (inspirado no GitHub e VS Code).

🌐 Comunicação Frontend ↔ Backend

Via Axios:

axios.get('http://localhost:5000/api/presencas')
  .then(res => setPresencas(res.data))
  .catch(err => console.error(err));

🔒 Integração e Segurança

Login e autenticação via JWT (JSON Web Token).

Tokens armazenados de forma segura (localStorage ou cookies HttpOnly).

Middleware no backend verifica permissões em cada rota.

CORS configurado para permitir apenas o domínio do frontend.

📊 Resumo das Tecnologias
Camada	Tecnologias
Frontend	React, Vite, Tailwind CSS, Axios, React Router, Recharts
Backend	Node.js, Express, PostgreSQL, Prisma ORM, JWT, Nodemailer
Estilo & Visual	Paleta baseada em cores de tecnologias modernas (React Azul, Node Verde, PostgreSQL Azul Escuro)