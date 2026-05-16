import { useEffect, useState } from "react";
import { api } from "../api.js";

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function isVencida(v) {
  return v.status === "PENDENTE" && v.vencimento && new Date(v.vencimento) < new Date();
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Carregando...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="text-sm text-dim">Visão geral financeira</div>
        </div>
        <div className="text-sm text-muted">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</div>
      </div>

      {/* Cards de resumo */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{data?.totalClientes}</div>
            <div className="stat-label">Clientes</div>
          </div>
        </div>

        <div className="stat-card stat-card--pink">
          <div className="stat-icon">⏳</div>
          <div>
            <div className="stat-value">{fmt(data?.pendente?.total)}</div>
            <div className="stat-label">A receber ({data?.pendente?.quantidade} vendas)</div>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-icon">✅</div>
          <div>
            <div className="stat-value">{fmt(data?.recebido?.total)}</div>
            <div className="stat-label">Total recebido</div>
          </div>
        </div>

        <div className="stat-card stat-card--cyan">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{fmt(data?.mes?.recebido)}</div>
            <div className="stat-label">Recebido este mês</div>
          </div>
        </div>
      </div>

      {/* Cobranças vencidas */}
      {data?.vencidas?.length > 0 && (
        <div className="card mt-16">
          <div className="section-header">
            <span className="text-pink fw-600">⚠️ Cobranças Vencidas</span>
            <span className="badge badge-pendente">{data.vencidas.length}</span>
          </div>
          <div className="table-wrap mt-16">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.vencidas.map((v) => (
                  <tr key={v.id}>
                    <td className="fw-600">{v.cliente.nome}</td>
                    <td className="text-dim">{v.cliente.telefone || "—"}</td>
                    <td><span className="badge badge-vencida">{fmtDate(v.vencimento)}</span></td>
                    <td className="mono text-pink">{fmt(v.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data?.vencidas?.length === 0 && (
        <div className="card mt-16 empty-state">
          <div className="icon">🎉</div>
          <div>Sem cobranças vencidas!</div>
        </div>
      )}
    </div>
  );
}
