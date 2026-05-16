# 💪 Camila Moda Fitness – Sistema de Controle de Pagamentos

**Projeto Integrador Extensionista – UNINTA ADS 2º Semestre**  
Aluno: João Gabriel Melo de Vasconcelos | RA: 40007613

---

## 📋 Funcionalidades

- ✅ Cadastro e gestão de clientes
- ✅ Registro de vendas e cobranças
- ✅ Controle de status (Pendente / Pago / Cancelado)
- ✅ Detecção de cobranças vencidas
- ✅ Dashboard financeiro (a receber, recebido, mês atual)
- ✅ Filtros por status
- ✅ Busca de clientes
- ✅ Registro de forma de pagamento (PIX, Dinheiro, Cartão, Fiado)

---

## 🏗️ Estrutura do Projeto

```
camila-moda-fitness/
├── backend/               ← API Node.js + Express + Prisma
│   ├── src/
│   │   ├── index.js       ← Servidor principal
│   │   ├── seed.js        ← Dados de exemplo
│   │   └── routes/
│   │       ├── clientes.js
│   │       ├── vendas.js
│   │       └── dashboard.js
│   ├── prisma/
│   │   └── schema.prisma  ← Modelo do banco de dados
│   └── package.json
└── frontend/              ← React + Vite
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Clientes.jsx
    │   │   └── Vendas.jsx
    │   ├── App.jsx
    │   ├── api.js         ← Serviço de chamadas à API
    │   └── index.css
    └── package.json
```

---

## ⚙️ Configuração Local (Desenvolvimento)

### Pré-requisitos
- [Node.js](https://nodejs.org) v18 ou superior
- npm (vem junto com o Node.js)

### 1. Configurar o Backend

```bash
# Entrar na pasta do backend
cd camila-moda-fitness/backend

# Instalar dependências
npm install

# Copiar o arquivo de variáveis de ambiente
cp .env.example .env

# Criar o banco de dados local (SQLite) e gerar o Prisma Client
npx prisma db push

# (Opcional) Popular o banco com dados de exemplo para testar
npm run db:seed

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

O backend estará rodando em: **http://localhost:3001**

### 2. Configurar o Frontend

```bash
# Em outro terminal, entrar na pasta do frontend
cd camila-moda-fitness/frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

> ℹ️ O Vite já está configurado para redirecionar chamadas `/api/*` para o backend na porta 3001 automaticamente.

---

## 🚀 Deploy em Produção (Colocar no Ar)

### Opção A – Railway (Recomendado – Grátis)

O Railway permite hospedar backend e banco de dados PostgreSQL juntos.

#### Passo a passo:

1. Crie uma conta em [railway.app](https://railway.app)
2. Clique em **"New Project" → "Deploy from GitHub repo"**
3. Conecte sua conta do GitHub e envie o projeto:

```bash
# Na pasta raiz do projeto, inicialize o git
git init
git add .
git commit -m "primeira versão"

# Crie um repositório no GitHub e siga as instruções para fazer push
```

4. No Railway, após conectar o repositório:
   - Adicione um **serviço PostgreSQL** ao projeto (botão "+ New" → Database → PostgreSQL)
   - Na aba **Variables** do serviço backend, adicione:
     - `DATABASE_URL` → copie o valor gerado pelo PostgreSQL do Railway
     - `PORT` → `3001`

5. Configure o **Root Directory** do serviço como `backend`

6. No **package.json** do backend, adicione o script de build para produção:
```json
"build": "npx prisma generate && npx prisma db push"
```
E configure o **Start Command** como: `npm start`

7. Para o frontend, crie outro serviço no Railway ou use o **Netlify** (veja abaixo)

---

### Opção B – Netlify (Frontend) + Railway (Backend)

**Frontend no Netlify:**

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Arraste a pasta `frontend/dist` (gerada com `npm run build`) para o painel do Netlify

   Ou conecte ao GitHub:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Crie um arquivo `frontend/public/_redirects` com o conteúdo:
```
/api/*  https://SEU-BACKEND.railway.app/api/:splat  200
/*      /index.html  200
```
   > Substitua `SEU-BACKEND.railway.app` pela URL do seu backend no Railway

**Backend no Railway** (seguindo os passos da Opção A acima)

---

### Opção C – Render (Grátis, mais simples)

1. Acesse [render.com](https://render.com)
2. Crie um **Web Service** apontando para a pasta `backend`
3. Crie um **PostgreSQL** gratuito no Render
4. Configure a variável `DATABASE_URL` com a connection string do banco
5. Build Command: `npm install && npx prisma generate && npx prisma db push`
6. Start Command: `node src/index.js`

Para o frontend, crie um **Static Site** no Render:
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `frontend/dist`

---

## 🗄️ Banco de Dados

### Modelo de Dados

```
Cliente
  id          Int (PK)
  nome        String
  telefone    String?
  email       String?
  cpf         String? (único)
  createdAt   DateTime

Venda
  id          Int (PK)
  clienteId   Int (FK → Cliente)
  descricao   String
  valor       Float
  vencimento  DateTime?
  status      String (PENDENTE | PAGO | CANCELADO)
  pago_em     DateTime?
  forma_pgto  String? (PIX | DINHEIRO | CARTÃO | FIADO)
  observacao  String?
  createdAt   DateTime
```

### Visualizar o banco (interface gráfica)

```bash
cd backend
npm run db:studio
# Abre o Prisma Studio em http://localhost:5555
```

---

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboard` | Resumo financeiro |
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes?busca=nome` | Buscar clientes |
| POST | `/api/clientes` | Criar cliente |
| PUT | `/api/clientes/:id` | Editar cliente |
| DELETE | `/api/clientes/:id` | Remover cliente |
| GET | `/api/vendas` | Listar vendas |
| GET | `/api/vendas?status=PENDENTE` | Filtrar por status |
| POST | `/api/vendas` | Criar venda |
| PATCH | `/api/vendas/:id/pagar` | Marcar como pago |
| PATCH | `/api/vendas/:id/cancelar` | Cancelar venda |
| DELETE | `/api/vendas/:id` | Remover venda |

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express |
| ORM | Prisma |
| Banco (dev) | SQLite |
| Banco (prod) | PostgreSQL |
| Frontend | React + Vite |
| Roteamento | React Router DOM |
| Estilização | CSS puro (variáveis CSS) |

---

## 📚 Referências Acadêmicas

- **Fundamentos de Banco de Dados**: estrutura relacional com Prisma ORM e PostgreSQL/SQLite, normalização das entidades Cliente e Venda.
- **Gerenciamento de Projetos I**: metodologia ágil aplicada, cronograma definido em sprints curtos conforme proposta do projeto.

---

*Projeto desenvolvido para o Projeto Integrador Extensionista do curso de Análise e Desenvolvimento de Sistemas – UNINTA, 2025.*
