import { useEffect, useState } from "react";
import { api } from "../api.js";

const EMPTY_FORM = { nome: "", telefone: "", email: "", cpf: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(null); // null | 'criar' | 'editar'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = async (b = busca) => {
    setLoading(true);
    try {
      const data = await api.clientes(b);
      setClientes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirCriar = () => {
    setForm(EMPTY_FORM);
    setErro("");
    setModal("criar");
  };

  const abrirEditar = (c) => {
    setForm({ nome: c.nome, telefone: c.telefone || "", email: c.email || "", cpf: c.cpf || "" });
    setEditId(c.id);
    setErro("");
    setModal("editar");
  };

  const fecharModal = () => { setModal(null); setErro(""); };

  const salvar = async () => {
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    setSaving(true);
    setErro("");
    try {
      if (modal === "criar") await api.criarCliente(form);
      else await api.editarCliente(editId, form);
      fecharModal();
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (id, nome) => {
    if (!confirm(`Remover cliente "${nome}"? Isso também remove todas as vendas.`)) return;
    try {
      await api.deletarCliente(id);
      carregar();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBusca = (e) => {
    setBusca(e.target.value);
    clearTimeout(window._buscaTimer);
    window._buscaTimer = setTimeout(() => carregar(e.target.value), 400);
  };

  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="text-sm text-dim">{clientes.length} cadastrado(s)</div>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar}>+ Novo Cliente</button>
      </div>

      <div className="search-bar" style={{ marginBottom: 20 }}>
        <span className="icon">🔍</span>
        <input className="input" placeholder="Buscar por nome, telefone ou CPF..." value={busca} onChange={handleBusca} />
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner">Carregando...</div>
        ) : clientes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👥</div>
            <div>Nenhum cliente encontrado</div>
            <button className="btn btn-primary mt-16" onClick={abrirCriar}>Cadastrar primeiro cliente</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>A receber</th>
                  <th>Total vendas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-600">{c.nome}</td>
                    <td className="text-dim">{c.telefone || "—"}</td>
                    <td className="text-dim mono text-sm">{c.cpf || "—"}</td>
                    <td>
                      {c.totalPendente > 0 ? (
                        <span className="mono text-pink fw-600">{fmt(c.totalPendente)}</span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="mono text-sm">{fmt(c.totalVendas)}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }} onClick={() => abrirEditar(c)}>✏️</button>
                        <button className="btn btn-danger" style={{ padding: "6px 10px", fontSize: 13 }} onClick={() => deletar(c.id, c.nome)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === "criar" ? "Novo Cliente" : "Editar Cliente"}</span>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>

            <div className="form-group">
              <label>Nome *</label>
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input className="input" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(88) 99999-0000" />
              </div>
              <div className="form-group">
                <label>CPF</label>
                <input className="input" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>

            {erro && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>⚠️ {erro}</div>}

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={saving}>
                {saving ? "Salvando..." : modal === "criar" ? "Cadastrar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
