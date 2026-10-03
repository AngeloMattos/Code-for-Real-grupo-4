import { useState } from "react";
import { Send } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { typeLabels } from "../lib/domain";
import { Overlay } from "./Overlay";
export function NewRequest({ onClose }: { onClose: () => void }) {
  const { data, create } = useApp();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("duvida_holerite");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("");
  return (
    <Overlay title="Nova solicitação" onClose={onClose}>
      <form
        className="modal-body new-request"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !description.trim()) return;
          create(title, type, description, period);
          onClose();
        }}
      >
        <h2>Como podemos ajudar, Marina?</h2>
        <p>Seu pedido será encaminhado ao RH da Padaria Pão da Vila.</p>
        <label>
          Assunto
          <input
            autoFocus
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que você precisa resolver?"
          />
        </label>
        <label>
          Categoria
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {data.dicionario.tipos_pendencia.map((t) => (
              <option key={t} value={t}>
                {typeLabels[t]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Descrição
          <textarea
            required
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte o que aconteceu e o que você precisa saber."
          />
        </label>
        <label>
          Competência relacionada (opcional)
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">Não se aplica</option>
            {[
              ...new Set([
                ...data.holerites.map((h) => h.competencia),
                data.meta.competencia_atual,
              ]),
            ]
              .sort()
              .map((p) => (
                <option key={p} value={p}>
                  {p.split("-").reverse().join("/")}
                </option>
              ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={!title.trim() || !description.trim()}
          >
            <Send size={14} />
            Criar solicitação
          </button>
        </div>
      </form>
    </Overlay>
  );
}
