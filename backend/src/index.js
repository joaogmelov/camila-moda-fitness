require("dotenv").config();
const express = require("express");
const cors = require("cors");

const clientesRouter = require("./routes/clientes");
const vendasRouter = require("./routes/vendas");
const dashboardRouter = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/clientes", clientesRouter);
app.use("/api/vendas", vendasRouter);
app.use("/api/dashboard", dashboardRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", sistema: "Camila Moda Fitness - API v1.0" });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: "Erro interno do servidor", detalhe: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}`);
});
