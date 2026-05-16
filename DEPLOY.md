# 🚀 Guia de Deploy — Neon + Render + Vercel

> Tempo estimado: ~20 minutos. Tudo gratuito, sem cartão de crédito.

---

## ETAPA 1 — Banco de Dados (Neon)

1. Acesse **https://neon.tech** e clique em **"Sign up"**
   - Pode entrar com conta do Google ou GitHub

2. Após entrar, clique em **"Create Project"**
   - Nome do projeto: `camila-moda-fitness`
   - Region: escolha **US East** (mais estável no free tier)
   - Clique em **Create**

3. Na tela seguinte, copie a **Connection String** que aparece assim:
   ```
   postgresql://joao:AbCdEf123@ep-xxx-yyy.us-east-2.aws.neon.tech/camila?sslmode=require
   ```
   ⚠️ **Guarde esse texto — você vai precisar daqui a pouco!**

---

## ETAPA 2 — Colocar o projeto no GitHub

> O Render e o Vercel fazem o deploy automaticamente a partir do GitHub.

1. Crie uma conta em **https://github.com** (se não tiver)

2. Clique em **"New repository"**, nome: `camila-moda-fitness`
   - Deixe como **Public** e clique em **Create**

3. No terminal, dentro da pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "projeto camila moda fitness"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/camila-moda-fitness.git
   git push -u origin main
   ```
   > Substitua `SEU_USUARIO` pelo seu usuário do GitHub

---

## ETAPA 3 — Backend no Render

1. Acesse **https://render.com** e clique em **"Get started for free"**
   - Entre com a conta do GitHub

2. No painel, clique em **"New +"** → **"Web Service"**

3. Conecte o repositório `camila-moda-fitness`

4. Configure o serviço:
   | Campo | Valor |
   |-------|-------|
   | Name | `camila-api` |
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

5. Role a página até **Environment Variables** e adicione:
   - Key: `DATABASE_URL`
   - Value: *(cole a connection string do Neon que você copiou na Etapa 1)*

6. Clique em **"Create Web Service"**

7. Aguarde o deploy (2-4 minutos). Quando aparecer **"Live"**, copie a URL do seu backend, que será algo como:
   ```
   https://camila-api.onrender.com
   ```
   ⚠️ **Guarde essa URL — vai precisar na próxima etapa!**

---

## ETAPA 4 — Atualizar a URL do backend no Frontend

Antes de fazer o deploy do frontend, edite o arquivo:

**`frontend/vercel.json`**

Troque `SEU-BACKEND` pela URL real do Render (sem o `https://`):

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://camila-api.onrender.com/api/:path*"
    }
  ]
}
```

Depois faça commit e push:
```bash
git add .
git commit -m "configura url do backend"
git push
```

---

## ETAPA 5 — Frontend no Vercel

1. Acesse **https://vercel.com** e clique em **"Sign up"**
   - Entre com a conta do GitHub

2. Clique em **"Add New Project"** → escolha o repositório `camila-moda-fitness`

3. Configure:
   | Campo | Valor |
   |-------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Clique em **"Deploy"**

5. Após 1-2 minutos, o Vercel fornece uma URL pública como:
   ```
   https://camila-moda-fitness.vercel.app
   ```

🎉 **Pronto! O sistema está no ar!**

---

## ⚠️ Aviso sobre o Render gratuito

O plano gratuito do Render **hiberna o servidor após 15 minutos sem uso**. Na primeira abertura após inatividade, pode demorar ~30 segundos para carregar. Isso é normal e não afeta o funcionamento — é só uma limitação do plano grátis.

---

## 🔁 Atualizações futuras

Após qualquer mudança no código, basta fazer:
```bash
git add .
git commit -m "descrição da mudança"
git push
```
O Render e o Vercel fazem o redeploy automaticamente.

---

## 📊 Resumo dos serviços

| Serviço | Função | URL |
|---------|--------|-----|
| **Neon** | Banco PostgreSQL | neon.tech |
| **Render** | API backend | render.com |
| **Vercel** | Frontend React | vercel.com |
