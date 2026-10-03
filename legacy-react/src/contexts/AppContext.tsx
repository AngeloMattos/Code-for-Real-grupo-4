import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import raw from "../data/fecha-comigo.json";
import type { Dataset, Page, Pending, Role, PendingStatus } from "../types";
import { changeStatus, REFERENCE_DATE, scoped } from "../lib/domain";
interface AppState {
  data: Dataset;
  role: Role;
  setRole: (r: Role) => void;
  companyId: string;
  setCompanyId: (id: string) => void;
  page: Page;
  navigate: (p: Page) => void;
  pendingId: string | null;
  openPending: (id: string) => void;
  closePending: () => void;
  items: Pending[];
  update: (id: string, patch: Partial<Pending>) => void;
  setStatus: (id: string, s: PendingStatus) => void;
  toast: (s: string) => void;
  create: (
    title: string,
    type: string,
    description: string,
    period: string,
  ) => void;
  notice: string;
  companyDetail: string | null;
  setCompanyDetail: (id: string | null) => void;
  employeeDetail: string | null;
  setEmployeeDetail: (id: string | null) => void;
}
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(
    () => structuredClone(raw) as Dataset,
  );
  const [role, setRoleState] = useState<Role>("contabilidade");
  const [companyId, setCompanyIdState] = useState("E2");
  const [page, setPage] = useState<Page>("dashboard");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [companyDetail, setCompanyDetail] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const navigate = (p: Page) => {
    setPage(p);
    setCompanyDetail(null);
    setEmployeeDetail(null);
  };
  const setCompanyId = (id: string) => {
    setCompanyIdState(id);
    setPendingId(null);
    setCompanyDetail(null);
    setEmployeeDetail(null);
  };
  const setRole = (r: Role) => {
    setRoleState(r);
    setPendingId(null);
    navigate("dashboard");
    if (r === "rh") setCompanyId("E2");
    if (r === "funcionario") setCompanyId("E1");
  };
  const update = (id: string, patch: Partial<Pending>) =>
    setData((d) => ({
      ...d,
      pendencias: d.pendencias.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }));
  const setStatus = (id: string, s: PendingStatus) => {
    setData((d) => ({
      ...d,
      pendencias: d.pendencias.map((p) =>
        p.id === id ? changeStatus(p, s) : p,
      ),
    }));
    setNotice(
      s === "resolvida"
        ? "Pendência resolvida. Os indicadores foram atualizados."
        : "Status atualizado na demonstração.",
    );
  };
  const create = (
    title: string,
    type: string,
    description: string,
    period: string,
  ) => {
    const id = `TEMP-${data.pendencias.filter((p) => p.id.startsWith("TEMP")).length + 1}`;
    const p: Pending = {
      id,
      empresa_id: "E1",
      funcionario_id: "F01",
      tipo: type,
      titulo: title.trim(),
      descricao: description.trim(),
      aberta_por: "funcionario",
      responsavel: "rh",
      status: "aberta",
      criada_em: REFERENCE_DATE,
      prazo: null,
      resolvida_em: null,
      canal_origem: "rh_net",
      bloqueia_fechamento: false,
      historico: [
        {
          data: REFERENCE_DATE,
          autor: "Marina Souza",
          papel: "funcionario",
          canal: "rh_net",
          mensagem: description.trim(),
        },
      ],
      competencia_relacionada: period,
    };
    setData((d) => ({ ...d, pendencias: [p, ...d.pendencias] }));
    setNotice("Solicitação criada! Você já pode acompanhar a resposta.");
    navigate("pendencias");
  };
  return (
    <Context.Provider
      value={{
        data,
        role,
        setRole,
        companyId,
        setCompanyId,
        page,
        navigate,
        pendingId,
        openPending: setPendingId,
        closePending: () => setPendingId(null),
        items: scoped(data, role, companyId),
        update,
        setStatus,
        toast: setNotice,
        create,
        notice,
        companyDetail,
        setCompanyDetail,
        employeeDetail,
        setEmployeeDetail,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AppProvider ausente");
  return ctx;
}
