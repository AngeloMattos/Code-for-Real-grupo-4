import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import {
  active,
  blocker,
  channelLabels,
  date,
  employeeLabels,
} from "../lib/domain";
import {
  Avatar,
  Badge,
  Empty,
  PageHeading,
  SearchInput,
  SectionHeading,
} from "../components/ui";
import { CompanyCard } from "../components/CompanyCard";
import { PendingTable } from "../components/PendingTable";
import { ClosingTimeline } from "../components/ClosingTimeline";
import { Payslips } from "./Payslips";
export function Companies() {
  const {
    data,
    role,
    companyId,
    companyDetail,
    setCompanyDetail,
    navigate,
    setCompanyId,
  } = useApp();
  const [tab, setTab] = useState("geral");
  const c = data.empresas.find((c) => c.id === companyDetail);
  const companies = data.empresas.filter(
    (c) => role === "contabilidade" || c.id === companyId,
  );
  if (c) {
    const pending = data.pendencias.filter((p) => p.empresa_id === c.id);
    return (
      <>
        <button
          className="text-button back-button"
          onClick={() => {
            setCompanyDetail(null);
            setTab("geral");
          }}
        >
          <ArrowLeft size={15} />
          Empresas
        </button>
        <PageHeading
          title={c.nome}
          description={`${c.segmento} · ${c.qtd_funcionarios} funcionários`}
        />
        <div className="tabs standalone">
          {[
            ["geral", "Visão geral"],
            ["pendencias", "Pendências"],
            ["fechamento", "Fechamento"],
            ["funcionarios", "Funcionários"],
          ].map(([id, l]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => setTab(id)}
            >
              {l}
            </button>
          ))}
        </div>
        {tab === "geral" ? (
          <>
            <div className="company-overview">
              <div className="panel info-card">
                <Building2 size={23} />
                <h2>Informações da empresa</h2>
                <dl>
                  <dt>Responsável RH</dt>
                  <dd>{c.rh_nome}</dd>
                  <dt>Cargo</dt>
                  <dd>{c.rh_cargo}</dd>
                  <dt>E-mail</dt>
                  <dd>{c.rh_email}</dd>
                  <dt>Canal preferido</dt>
                  <dd>{channelLabels[c.canal_preferido]}</dd>
                  <dt>Prazo RH</dt>
                  <dd>{date(c.prazo_envio_rh)}</dd>
                  <dt>Pagamento</dt>
                  <dd>{date(c.data_pagamento_salario)}</dd>
                  <dt>Pendências abertas</dt>
                  <dd>{pending.filter(active).length}</dd>
                  <dt>Bloqueadores</dt>
                  <dd>{pending.filter(blocker).length}</dd>
                </dl>
                {c.observacao && <p className="data-note">{c.observacao}</p>}
                <button
                  className="primary-button"
                  onClick={() => {
                    setCompanyId(c.id);
                    navigate("fechamento");
                  }}
                >
                  Acompanhar fechamento
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <CompanyCard company={c} />
            </div>
            <div className="panel">
              <SectionHeading title="Pendências da empresa" />
              <PendingTable items={pending} />
            </div>
          </>
        ) : tab === "pendencias" ? (
          <div className="panel">
            <PendingTable items={pending} />
          </div>
        ) : tab === "fechamento" ? (
          <div className="panel timeline-panel">
            <ClosingTimeline companyId={c.id} />
          </div>
        ) : (
          <Employees fixedCompany={c.id} />
        )}
      </>
    );
  }
  return (
    <>
      <PageHeading
        title="Empresas"
        description="Quatro empresas, uma visão clara de cada fechamento."
      />
      <div className="company-grid">
        {companies.map((c) => (
          <CompanyCard key={c.id} company={c} />
        ))}
      </div>
      <p className="data-note">
        {data.escritorio.nome} atende {data.escritorio.empresas_atendidas_total}{" "}
        empresas. Esta demonstração inclui {data.empresas.length} delas.
      </p>
    </>
  );
}
export function Employees({ fixedCompany }: { fixedCompany?: string }) {
  const { data, role, companyId, employeeDetail, setEmployeeDetail } = useApp();
  const [search, setSearch] = useState("");
  const e = data.funcionarios.find((e) => e.id === employeeDetail);
  const company = role === "rh" ? companyId : fixedCompany;
  const employees = data.funcionarios.filter(
    (e) =>
      (!company || e.empresa_id === company) &&
      [
        e.nome,
        e.cargo,
        e.setor,
        data.empresas.find((c) => c.id === e.empresa_id)?.nome,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (e) {
    const c = data.empresas.find((c) => c.id === e.empresa_id)!;
    return (
      <>
        <button
          className="text-button back-button"
          onClick={() => setEmployeeDetail(null)}
        >
          <ArrowLeft size={15} />
          Funcionários
        </button>
        <div className="employee-profile panel">
          <Avatar name={e.nome} />
          <div>
            <h1>{e.nome}</h1>
            <p>
              {e.cargo} · {c.nome}
            </p>
            <Badge tone="blue">{employeeLabels[e.situacao]}</Badge>
          </div>
        </div>
        <div className="profile-info">
          <span>
            <Users size={15} />
            {e.setor} · Admissão {date(e.data_admissao)}
          </span>
          <span>
            <Mail size={15} />
            {e.email}
          </span>
          <span>
            <Phone size={15} />
            {e.telefone}
          </span>
          <span>
            RH Net:{" "}
            {e.usa_app_rh_net ? "Usa o aplicativo" : "Não usa o aplicativo"}
          </span>
        </div>
        <div className="panel">
          <SectionHeading title="Pendências relacionadas" />
          <PendingTable
            items={data.pendencias.filter((p) => p.funcionario_id === e.id)}
          />
        </div>
        <div className="profile-payslips">
          <Payslips employeeId={e.id} />
        </div>
      </>
    );
  }
  return (
    <>
      {!fixedCompany && (
        <PageHeading
          title="Funcionários"
          description="Encontre as pessoas e acompanhe as solicitações relacionadas."
        />
      )}
      <div className="directory-search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar nome, cargo, setor ou empresa..."
        />
        <span className="muted small">
          {employees.length} funcionários no dataset
        </span>
      </div>
      {employees.length ? (
        <div className="employee-grid">
          {employees.map((e) => (
            <button
              key={e.id}
              className="employee-card panel"
              onClick={() => setEmployeeDetail(e.id)}
            >
              <Avatar name={e.nome} />
              <div>
                <h3>{e.nome}</h3>
                <p>{e.cargo}</p>
                <small>
                  {data.empresas.find((c) => c.id === e.empresa_id)!.nome} ·{" "}
                  {e.setor}
                </small>
                <div>
                  <Badge tone={e.situacao === "ativo" ? "green" : "amber"}>
                    {employeeLabels[e.situacao]}
                  </Badge>
                  <span>
                    {
                      data.pendencias.filter(
                        (p) => p.funcionario_id === e.id && active(p),
                      ).length
                    }{" "}
                    pendências abertas
                  </span>
                </div>
                <small>RH Net: {e.usa_app_rh_net ? "Sim" : "Não"}</small>
              </div>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      ) : (
        <Empty text="Nenhum funcionário encontrado." />
      )}
      <p className="data-note">
        A Malharia Fio Azul tem 40 funcionários; o dataset contém uma amostra de
        13. Os outros quadros estão completos.
      </p>
    </>
  );
}
