import { useEffect, useState } from "react";
import { api } from "../api.js";

const EMPTY_FORM = { clienteId: "", descricao: "", valor: "", vencimento: "", forma_pgto: "", observacao: "" };
const FORMAS = ["PIX", "DINHEIRO", "CARTÃO", "FIADO"];

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [modal, setModal] = useState(null); // null | 'criar' | 'pagar'
  const [form, setForm] = useState(EMPTY_FORM);
  const [pagarId, setPagarId] = useState(null);
  const [formaPgto, setFormaPgto] = useState("PIX");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async () => {
    setLoading(true);
    try {
      const [v, c] = await Promise.all([api.vendas(filtro ? { status: filtro } : {}), api.clientes()]);
      setVendas(v);
      setClientes(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [filtro]);

  const abrirCriar = () => {
    setForm(EMPTY_FORM);
    setErro("");
    setModal("criar");
  };

  const abrirPagar = (id) => {
    setPagarId(id);
    setFormaPgto("PIX");
    setModal("pagar");
  };

  const fecharModal = () => { setModal(null); setErro(""); };

  const salvarVenda = async () => {
    if (!form.clienteId || !form.descricao || !form.valor) {
      setErro("Cliente, descrição e valor são obrigatórios.");
      return;
    }
    setSaving(true); setErro("");
    try {
      await api.criarVenda(form);
      fecharModal(); carregar();
    } catch (e) { setErro(e.message); }
    finally { setSaving(false); }
  };

  const confirmarPagar = async () => {
    setSaving(true);
    try {
      await api.pagarVenda(pagarId, formaPgto);
      fecharModal(); carregar();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const cancelar = async (id) => {
    if (!confirm("Cancelar esta venda?")) return;
    try { await api.cancelarVenda(id); carregar(); }
    catch (e) { alert(e.message); }
  };

  const deletar = async (id) => {
    if (!confirm("Remover esta venda permanentemente?")) return;
    try { await api.deletarVenda(id); carregar(); }
    catch (e) { alert(e.message); }
  };

  const isVencida = (v) => v.status === "PENDENTE" && v.vencimento && new Date(v.vencimento) < new Date();

  const getBadge = (v) => {
    if (isVencida(v)) return <span className="badge badge-vencida">VENCIDA</span>;
    if (v.status === "PAGO") return <span className="badge badge-pago">✓ PAGO</span>;
    if (v.status === "CANCELADO") return <span className="badge badge-cancelado">CANCELADO</span>;
    return <span className="badge badge-pendente">PENDENTE</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Pagamentos</div>
          <div className="text-sm text-dim">{vendas.length} registro(s)</div>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar}>+ Nova Venda</button>
      </div>

      {/* Filtros */}
      <div className="flex gap-8" style={{ marginBottom: 20 }}>
        {["", "PENDENTE", "PAGO", "CANCELADO"].map((s) => (
          <button
            key={s}
            className={`btn ${filtro === s ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 14px", fontSize: 13 }}
            onClick={() => setFiltro(s)}
          >
            {s || "Todos"}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner">Carregando...</div>
        ) : vendas.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💳</div>
            <div>Nenhuma venda encontrada</div>
            <button className="btn btn-primary mt-16" onClick={abrirCriar}>Registrar primeira venda</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Forma Pgto</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((v) => (
                  <tr key={v.id}>
                    <td className="fw-600">{v.cliente?.nome}</td>
                    <td className="text-dim text-sm">{v.descricao}</td>
                    <td className="mono fw-600">{fmt(v.valor)}</td>
                    <td className="text-dim text-sm">{fmtDate(v.vencimento)}</td>
                    <td className="text-dim text-sm">{v.forma_pgto || "—"}</td>
                    <td>{getBadge(v)}</td>
                    <td>
                      <div className="flex gap-8">
                        {v.status === "PENDENTE" && (
                          <button className="btn btn-success" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => abrirPagar(v.id)}>
                            💰 Pagar
                          </button>
                        )}
                        {v.status === "PENDENTE" && (
                          <button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => cancelar(v.id)}>
                            ✕
                          </button>
                        )}
                        <button className="btn btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => deletar(v.id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Venda */}
      {modal === "criar" && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Nova Venda / Cobrança</span>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>

            <div className="form-group">
              <label>Cliente *</label>
              <select className="select" value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}>
                <option value="">Selecione...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Descrição *</label>
              <input className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Legging fitness tam M" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Valor (R$) *</label>
                <input className="input" type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
              </div>
              <div className="form-group">
                <label>Vencimento</label>
                <input className="input" type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label>Forma de pagamento</label>
              <select className="select" value={form.forma_pgto} onChange={(e) => setForm({ ...form, forma_pgto: e.target.value })}>
                <option value="">— Definir depois —</option>
                {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Observação</label>
              <input className="input" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Opcional" />
            </div>

            {erro && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>⚠️ {erro}</div>}

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarVenda} disabled={saving}>
                {saving ? "Salvando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagar */}
      {modal === "pagar" && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Confirmar Pagamento</span>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            <div className="form-group">
              <label>Forma de pagamento</label>
              <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
                {FORMAS.map((f) => (
                  <button
                    key={f}
                    className={`btn ${formaPgto === f ? "btn-primary" : "btn-ghost"}`}
                    style={{ fontSize: 13, padding: "7px 14px" }}
                    onClick={() => setFormaPgto(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
              <button className="btn btn-success" onClick={confirmarPagar} disabled={saving}>
                {saving ? "..." : "✓ Confirmar Pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
