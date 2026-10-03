import { lazy, Suspense, useState } from "react";
import {
  Bell,
  Building2,
  CalendarRange,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Play,
  Users,
  X,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "./contexts/AppContext";
import { active, alertsFor, roles } from "./lib/domain";
import { Avatar, CompanySelector } from "./components/ui";
import { Dashboard } from "./pages/Dashboard";
import { PendingDetails } from "./components/PendingDetails";
import { DemoMenu } from "./components/DemoMenu";
import { NewRequest } from "./components/NewRequest";
import type { Page, Role } from "./types";
const Pendencies = lazy(() =>
  import("./pages/Pendencies").then((m) => ({ default: m.Pendencies })),
);
const Closing = lazy(() =>
  import("./pages/Closing").then((m) => ({ default: m.Closing })),
);
const Companies = lazy(() =>
  import("./pages/Directory").then((m) => ({ default: m.Companies })),
);
const Employees = lazy(() =>
  import("./pages/Directory").then((m) => ({ default: m.Employees })),
);
const Payslips = lazy(() =>
  import("./pages/Payslips").then((m) => ({ default: m.Payslips })),
);
const Alerts = lazy(() =>
  import("./pages/Communications").then((m) => ({ default: m.Alerts })),
);
const Messages = lazy(() =>
  import("./pages/Communications").then((m) => ({ default: m.Messages })),
);
const nav: { id: Page; label: string; icon: typeof Bell }[] = [
  { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
  { id: "pendencias", label: "Pendências", icon: ClipboardList },
  { id: "fechamento", label: "Fechamento", icon: CalendarRange },
  { id: "empresas", label: "Empresas", icon: Building2 },
  { id: "funcionarios", label: "Funcionários", icon: Users },
  { id: "mensagens", label: "Mensagens", icon: MessageSquare },
  { id: "holerites", label: "Holerites", icon: FileText },
  { id: "alertas", label: "Central de alertas", icon: Bell },
];
export default function App() {
  const {
    data,
    role,
    setRole,
    page,
    navigate,
    items,
    companyId,
    notice,
    toast,
  } = useApp();
  const [mobile, setMobile] = useState(false);
  const [demo, setDemo] = useState(false);
  const [newRequest, setNewRequest] = useState(false);
  const person =
    role === "contabilidade"
      ? data.escritorio.responsavel_dp.nome
      : role === "rh"
        ? data.empresas.find((c) => c.id === companyId)!.rh_nome
        : "Marina Souza";
  const alerts = items.filter((p) => alertsFor(p).length).length;
  const content = {
    dashboard: <Dashboard />,
    pendencias: <Pendencies />,
    fechamento: <Closing />,
    empresas: <Companies />,
    funcionarios: <Employees />,
    mensagens: <Messages />,
    holerites: <Payslips />,
    alertas: <Alerts />,
  }[page];
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-shade"
          aria-label="Fechar navegação"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("dashboard");
          }}
        >
          <span className="brand-symbol">
            <Workflow size={23} />
          </span>
          <span>
            fecha<span className="brand-light">comigo</span>
            <small>DA PENDÊNCIA AO FECHAMENTO</small>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-icon">
            <Building2 size={16} />
          </span>
          <div>
            {role === "contabilidade"
              ? "Conta Certa"
              : role === "funcionario"
                ? "Pão da Vila"
                : data.empresas.find((c) => c.id === companyId)!.nome}
            <small>
              {role === "contabilidade" ? "Escritório contábil" : roles[role]}
            </small>
          </div>
        </div>
        <div className="nav-label">ESPAÇO DE TRABALHO</div>
        <nav>
          {nav
            .filter(
              (n) =>
                role !== "funcionario" ||
                [
                  "dashboard",
                  "pendencias",
                  "mensagens",
                  "holerites",
                  "alertas",
                ].includes(n.id),
            )
            .map((n) => (
              <button
                key={n.id}
                className={page === n.id ? "active" : ""}
                onClick={() => {
                  navigate(n.id);
                  setMobile(false);
                }}
              >
                <n.icon size={18} />
                <span>{n.label}</span>
                {n.id === "pendencias" && (
                  <span className="nav-count">
                    {items.filter(active).length}
                  </span>
                )}
                {n.id === "alertas" && alerts > 0 && (
                  <span className="alert-dot" />
                )}
              </button>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-callout">
            <span>
              <Play size={15} /> PROTÓTIPO INTERATIVO
            </span>
            <p>
              Experimente os caminhos
              <br />
              até a folha fechar.
            </p>
            <button
              onClick={() => {
                setDemo(true);
                setMobile(false);
              }}
            >
              Modo demonstração
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="sidebar-user">
            <Avatar name={person} />
            <div>
              {person.split(" ").slice(0, 2).join(" ")}
              <small>{roles[role]}</small>
            </div>
            <span className="live-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegação"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Fecha Comigo <span>/</span>{" "}
              <strong>{nav.find((n) => n.id === page)?.label}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <div className="period">
              <span>
                <CalendarRange size={15} />
                Outubro/2026
              </span>
              <small>Referência · 20/10/2026</small>
            </div>
            <span className="divider" />
            <label className="profile-switch">
              <span>Modo de visualização</span>
              <select
                aria-label="Trocar perfil"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="contabilidade">Contabilidade</option>
                <option value="rh">RH</option>
                <option value="funcionario">Funcionário · Marina</option>
              </select>
            </label>
            <button
              className="notification icon-button"
              aria-label="Notificações"
              onClick={() => navigate("alertas")}
            >
              <Bell size={19} />
              {alerts > 0 && <i />}
            </button>
            <Avatar name={person} />
          </div>
        </header>
        <main>
          {role === "rh" && page !== "fechamento" && (
            <div className="rh-selector">
              <span>Empresa em acompanhamento</span>
              <CompanySelector />
            </div>
          )}
          {role === "funcionario" && page === "dashboard" && (
            <div className="employee-create">
              <button
                className="primary-button"
                onClick={() => setNewRequest(true)}
              >
                + Nova solicitação
              </button>
            </div>
          )}
          <Suspense
            key={page}
            fallback={
              <div
                className="route-skeleton"
                aria-busy="true"
                aria-label="Carregando tela"
              >
                <div />
                <div />
                <div />
              </div>
            }
          >
            {content}
          </Suspense>
        </main>
        <footer className="app-footer">
          <span>
            <span className="live-dot" /> Dados fictícios · Alterações somente
            nesta sessão
          </span>
          <span>Referência: 20/10/2026</span>
        </footer>
      </div>
      <PendingDetails />
      {demo && <DemoMenu onClose={() => setDemo(false)} />}{" "}
      {newRequest && <NewRequest onClose={() => setNewRequest(false)} />}{" "}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            aria-label="Fechar aviso"
            className="icon-button"
            onClick={() => toast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
