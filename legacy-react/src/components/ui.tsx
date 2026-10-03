import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { deadline, daysTo, initials, statusLabels } from "../lib/domain";
import type { Pending } from "../types";
export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function StatusBadge({ p }: { p: Pending }) {
  return (
    <Badge
      tone={
        p.status === "resolvida"
          ? "green"
          : p.status === "aberta"
            ? "neutral"
            : p.responsavel === "rh"
              ? "amber"
              : p.responsavel === "funcionario"
                ? "purple"
                : "blue"
      }
    >
      <span className="dot" />
      {statusLabels[p.status]}
    </Badge>
  );
}
export function DeadlineBadge({ p }: { p: Pending }) {
  return (
    <span
      className={`deadline ${p.status !== "resolvida" && daysTo(p.prazo) <= 1 ? "red-text" : ""}`}
    >
      <Clock3 size={13} />
      {deadline(p)}
    </span>
  );
}
export function Avatar({
  name,
  color = "blue",
}: {
  name: string;
  color?: string;
}) {
  return <span className={`avatar ${color}`}>{initials(name)}</span>;
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Pesquisar...",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Empty({
  text = "Nenhuma pendência encontrada com esses filtros.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <CheckCircle2 size={32} />
      <strong>{text}</strong>
      <span>As informações disponíveis aparecem aqui.</span>
    </div>
  );
}
export function CompanySelector() {
  const { data, companyId, setCompanyId, role } = useApp();
  return (
    <select
      aria-label="Selecionar empresa"
      value={companyId}
      onChange={(e) => setCompanyId(e.target.value)}
      disabled={role === "funcionario"}
    >
      {data.empresas
        .filter((c) => role !== "funcionario" || c.id === "E1")
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
    </select>
  );
}
export function SectionHeading({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="live-dot" /> CENTRAL DE OPERAÇÕES
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">
        {children ?? (
          <span className="date-chip">
            <CalendarDays size={16} />
            20 de outubro de 2026
          </span>
        )}
      </div>
    </div>
  );
}
