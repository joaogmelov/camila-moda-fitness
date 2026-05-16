const BASE = "/api";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || "Erro na requisição");
  return data;
}

export const api = {
  // Dashboard
  dashboard: () => req("/dashboard"),

  // Clientes
  clientes: (busca) => req(`/clientes${busca ? `?busca=${busca}` : ""}`),
  cliente: (id) => req(`/clientes/${id}`),
  criarCliente: (data) => req("/clientes", { method: "POST", body: JSON.stringify(data) }),
  editarCliente: (id, data) => req(`/clientes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletarCliente: (id) => req(`/clientes/${id}`, { method: "DELETE" }),

  // Vendas
  vendas: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req(`/vendas${q ? `?${q}` : ""}`);
  },
  criarVenda: (data) => req("/vendas", { method: "POST", body: JSON.stringify(data) }),
  pagarVenda: (id, forma_pgto) => req(`/vendas/${id}/pagar`, { method: "PATCH", body: JSON.stringify({ forma_pgto }) }),
  cancelarVenda: (id) => req(`/vendas/${id}/cancelar`, { method: "PATCH" }),
  deletarVenda: (id) => req(`/vendas/${id}`, { method: "DELETE" }),
};
