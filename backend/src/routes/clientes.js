const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/clientes - listar todos
router.get("/", async (req, res) => {
  try {
    const { busca } = req.query;
    const clientes = await prisma.cliente.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { telefone: { contains: busca } },
              { cpf: { contains: busca } },
            ],
          }
        : undefined,
      include: {
        vendas: {
          select: { id: true, valor: true, status: true },
        },
      },
      orderBy: { nome: "asc" },
    });

    const clientesFormatados = clientes.map((c) => ({
      ...c,
      totalVendas: c.vendas.reduce((sum, v) => sum + v.valor, 0),
      totalPendente: c.vendas
        .filter((v) => v.status === "PENDENTE")
        .reduce((sum, v) => sum + v.valor, 0),
    }));

    res.json(clientesFormatados);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/clientes/:id - detalhes de um cliente
router.get("/:id", async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(req.params.id) },
      include: { vendas: { orderBy: { createdAt: "desc" } } },
    });
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/clientes - cadastrar cliente
router.post("/", async (req, res) => {
  try {
    const { nome, telefone, email, cpf } = req.body;
    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });

    const cliente = await prisma.cliente.create({
      data: { nome, telefone, email, cpf },
    });
    res.status(201).json(cliente);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ erro: "CPF já cadastrado" });
    }
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/clientes/:id - editar cliente
router.put("/:id", async (req, res) => {
  try {
    const { nome, telefone, email, cpf } = req.body;
    const cliente = await prisma.cliente.update({
      where: { id: Number(req.params.id) },
      data: { nome, telefone, email, cpf },
    });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/clientes/:id - remover cliente
router.delete("/:id", async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: "Cliente removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
