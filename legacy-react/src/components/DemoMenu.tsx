import { ArrowRight, Play } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { Overlay } from "./Overlay";
export function DemoMenu({ onClose }: { onClose: () => void }) {
  const { setRole, setCompanyId, navigate, openPending } = useApp();
  const cases = [
    {
      title: "Marina · O salário veio menor",
      sub: "P001 ↔ P002",
      description:
        "Acompanhe a dúvida, encontre o atestado relacionado e compare os holerites.",
      run: () => {
        setRole("funcionario");
        navigate("pendencias");
        openPending("P001");
      },
    },
    {
      title: "Clínica · A folha está parada",
      sub: "P019",
      description:
        "Entre como RH, confirme as 22h extras e veja o processamento desbloquear.",
      run: () => {
        setRole("rh");
        setCompanyId("E3");
        navigate("fechamento");
      },
    },
    {
      title: "Malharia · Cada prazo importa",
      sub: "Prazo RH · 22/10",
      description:
        "Priorize documentos, horas extras e solicitações de uma empresa com várias pendências.",
      run: () => {
        setRole("rh");
        setCompanyId("E2");
        navigate("pendencias");
      },
    },
  ];
  return (
    <Overlay title="Modo demonstração" onClose={onClose}>
      <div className="modal-body">
        <h2>Três caminhos até o fechamento</h2>
        <p>
          Todos os casos usam os dados fornecidos. Alterações são descartadas ao
          recarregar.
        </p>
        <div className="demo-cases">
          {cases.map((c, i) => (
            <div key={c.title}>
              <span className="demo-number">0{i + 1}</span>
              <BadgeInline text={c.sub} />
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <button
                className="primary-button"
                onClick={() => {
                  c.run();
                  onClose();
                }}
              >
                <Play size={13} />
                Iniciar demonstração
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Overlay>
  );
}
function BadgeInline({ text }: { text: string }) {
  return <small className="muted">{text}</small>;
}
