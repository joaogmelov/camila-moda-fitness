const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/vendas - listar vendas
router.get("/", async (req, res) => {
  try {
    const { status, clienteId } = req.query;
    const vendas = await prisma.venda.findMany({
      where: {
        ...(status && { status }),
        ...(clienteId && { clienteId: Number(clienteId) }),
      },
      include: { cliente: { select: { id: true, nome: true, telefone: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(vendas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/vendas/:id - detalhe de uma venda
router.get("/:id", async (req, res) => {
  try {
    const venda = await prisma.venda.findUnique({
      where: { id: Number(req.params.id) },
      include: { cliente: true },
    });
    if (!venda) return res.status(404).json({ erro: "Venda não encontrada" });
    res.json(venda);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/vendas - registrar nova venda/cobrança
router.post("/", async (req, res) => {
  try {
    const { clienteId, descricao, valor, vencimento, forma_pgto, observacao } = req.body;
    if (!clienteId || !descricao || !valor) {
      return res.status(400).json({ erro: "clienteId, descrição e valor são obrigatórios" });
    }

    const venda = await prisma.venda.create({
      data: {
        clienteId: Number(clienteId),
        descricao,
        valor: Number(valor),
        vencimento: vencimento ? new Date(vencimento) : null,
        forma_pgto,
        observacao,
        status: "PENDENTE",
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });
    res.status(201).json(venda);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/vendas/:id/pagar - marcar como pago
router.patch("/:id/pagar", async (req, res) => {
  try {
    const { forma_pgto } = req.body;
    const venda = await prisma.venda.update({
      where: { id: Number(req.params.id) },
      data: {
        status: "PAGO",
        pago_em: new Date(),
        ...(forma_pgto && { forma_pgto }),
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });
    res.json(venda);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /api/vendas/:id/cancelar - cancelar venda
router.patch("/:id/cancelar", async (req, res) => {
  try {
    const venda = await prisma.venda.update({
      where: { id: Number(req.params.id) },
      data: { status: "CANCELADO" },
    });
    res.json(venda);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/vendas/:id - remover venda
router.delete("/:id", async (req, res) => {
  try {
    await prisma.venda.delete({ where: { id: Number(req.params.id) } });
    res.json({ mensagem: "Venda removida com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
