import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Clientes from "./pages/Clientes.jsx";
import Vendas from "./pages/Vendas.jsx";
import "./App.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/clientes", label: "Clientes", icon: "👥" },
  { to: "/vendas", label: "Pagamentos", icon: "💳" },
];

export default function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">💪</span>
          <div>
            <div className="brand-name">Camila</div>
            <div className="brand-sub">Moda Fitness</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="text-xs text-muted">Sistema v1.0</div>
          <div className="text-xs text-muted">UNINTA – ADS 2025</div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vendas" element={<Vendas />} />
        </Routes>
      </main>
    </div>
  );
}
