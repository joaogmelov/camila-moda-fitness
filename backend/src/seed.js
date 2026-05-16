const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco com dados de exemplo...");

  const clientes = await Promise.all([
    prisma.cliente.upsert({
      where: { cpf: "111.111.111-11" },
      update: {},
      create: { nome: "Maria Silva", telefone: "(88) 99999-0001", email: "maria@email.com", cpf: "111.111.111-11" },
    }),
    prisma.cliente.upsert({
      where: { cpf: "222.222.222-22" },
      update: {},
      create: { nome: "Ana Souza", telefone: "(88) 99999-0002", cpf: "222.222.222-22" },
    }),
    prisma.cliente.upsert({
      where: { cpf: "333.333.333-33" },
      update: {},
      create: { nome: "Fernanda Lima", telefone: "(88) 99999-0003", cpf: "333.333.333-33" },
    }),
  ]);

  // Vendas de exemplo
  await prisma.venda.createMany({
    data: [
      {
        clienteId: clientes[0].id,
        descricao: "Legging fitness - tam M",
        valor: 89.90,
        status: "PAGO",
        forma_pgto: "PIX",
        pago_em: new Date(),
      },
      {
        clienteId: clientes[0].id,
        descricao: "Top esportivo",
        valor: 59.90,
        status: "PENDENTE",
        vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        clienteId: clientes[1].id,
        descricao: "Conjunto fitness completo",
        valor: 149.90,
        status: "PENDENTE",
        vencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // vencida
      },
      {
        clienteId: clientes[2].id,
        descricao: "Shorts e regata",
        valor: 79.80,
        status: "PAGO",
        forma_pgto: "DINHEIRO",
        pago_em: new Date(),
      },
    ],
  });

  console.log("✅ Dados de exemplo criados com sucesso!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
