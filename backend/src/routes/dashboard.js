const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard - resumo financeiro geral
router.get("/", async (req, res) => {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalClientes,
      vendasPendentes,
      vendasPagas,
      vendasMes,
      recebidoMes,
      vencidasHoje,
    ] = await Promise.all([
      prisma.cliente.count(),

      prisma.venda.aggregate({
        where: { status: "PENDENTE" },
        _sum: { valor: true },
        _count: true,
      }),

      prisma.venda.aggregate({
        where: { status: "PAGO" },
        _sum: { valor: true },
        _count: true,
      }),

      prisma.venda.aggregate({
        where: { createdAt: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true },
        _count: true,
      }),

      prisma.venda.aggregate({
        where: { status: "PAGO", pago_em: { gte: inicioMes, lte: fimMes } },
        _sum: { valor: true },
      }),

      prisma.venda.findMany({
        where: {
          status: "PENDENTE",
          vencimento: { lt: new Date() },
        },
        include: { cliente: { select: { nome: true, telefone: true } } },
        orderBy: { vencimento: "asc" },
        take: 5,
      }),
    ]);

    res.json({
      totalClientes,
      pendente: {
        total: vendasPendentes._sum.valor || 0,
        quantidade: vendasPendentes._count,
      },
      recebido: {
        total: vendasPagas._sum.valor || 0,
        quantidade: vendasPagas._count,
      },
      mes: {
        vendas: vendasMes._sum.valor || 0,
        quantidade: vendasMes._count,
        recebido: recebidoMes._sum.valor || 0,
      },
      vencidas: vencidasHoje,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
