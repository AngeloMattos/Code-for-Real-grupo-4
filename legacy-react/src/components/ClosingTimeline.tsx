import { Check, LockKeyhole } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { closingFor, date, stageLabels } from "../lib/domain";
import { Badge } from "./ui";
export function ClosingTimeline({
  companyId,
  period = "2026-10",
}: {
  companyId: string;
  period?: string;
}) {
  const { data } = useApp();
  const company = data.empresas.find((c) => c.id === companyId)!;
  const closing = closingFor(company, data, period);
  return (
    <div className="closing-timeline">
      {closing.etapas.map((s, i) => {
        const blocked =
          closing.status === "bloqueado" && s.etapa === "processamento";
        const done = s.status === "concluida";
        return (
          <div
            className={`closing-step ${done ? "done" : blocked ? "blocked" : s.status === "em_andamento" ? "current" : ""}`}
            key={s.etapa}
          >
            <div className="step-top">
              <span>
                {done ? (
                  <Check size={17} />
                ) : blocked ? (
                  <LockKeyhole size={17} />
                ) : (
                  i + 1
                )}
              </span>
              <i />
            </div>
            <h3>{stageLabels[s.etapa]}</h3>
            <Badge
              tone={
                done
                  ? "green"
                  : blocked
                    ? "red"
                    : s.status === "em_andamento"
                      ? "blue"
                      : "neutral"
              }
            >
              {done
                ? "Concluída"
                : blocked
                  ? "Bloqueada"
                  : s.status === "em_andamento"
                    ? "Em andamento"
                    : "Pendente"}
            </Badge>
            <p>{s.descricao}</p>
            <dl>
              <dt>Prevista</dt>
              <dd>{date(s.data_prevista)}</dd>
              <dt>Realizada</dt>
              <dd>{date(s.data_realizada)}</dd>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
