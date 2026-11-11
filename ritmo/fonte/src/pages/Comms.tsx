import { useState } from 'react';
import { useStore } from '../store';
import { back } from '../router';
import { Button, Card, Copy, Field, inputCls, PageHead } from '../ui';
import { TEMPLATES, type Template } from '../data/templates';

const slots = (t: string) => [...new Set([...t.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]))];

export function Comms() {
  const [open, setOpen] = useState<string | null>(null);
  const t = TEMPLATES.find((x) => x.id === open);
  if (t) return <Editor t={t} onBack={() => setOpen(null)} />;
  return (
    <>
      <PageHead title="Mensagens prontas" sub="Modelos curtos. Preencha os campos e ajuste do seu jeito." onBack={() => back('/regulacao')} />
      <ul className="space-y-3">
        {TEMPLATES.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => setOpen(x.id)} className="tap w-full text-left rounded-2xl border-2 border-line bg-surface p-4 hover:border-brand">
              <span className="block font-bold text-lg">{x.title}</span>
              <span className="block text-muted">{x.when}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Editor({ t, onBack }: { t: Template; onBack: () => void }) {
  const { state, update } = useStore();
  const base = state.templateEdits[t.id] ?? t.text;
  const [vals, setVals] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const fields = slots(base);
  const out = base.replace(/\[([^\]]+)\]/g, (m, k) => (vals[k]?.trim() ? vals[k].trim() : m));
  const missing = fields.filter((f) => !vals[f]?.trim());

  return (
    <>
      <PageHead title={t.title} sub={t.when} onBack={onBack} />
      <div className="space-y-4">
        {fields.length > 0 && !editing && (
          <Card>
            <h2 className="font-bold mb-2">Preencha (opcional)</h2>
            <div className="space-y-3">
              {fields.map((f) => <Field key={f} label={f}><input className={inputCls} value={vals[f] ?? ''} onChange={(e) => setVals({ ...vals, [f]: e.target.value })} /></Field>)}
            </div>
          </Card>
        )}

        {editing ? (
          <Field label="Texto do modelo" hint="Use [colchetes] para criar campos que você preenche depois.">
            <textarea className={inputCls} rows={8} value={base} onChange={(e) => update((s) => ({ ...s, templateEdits: { ...s.templateEdits, [t.id]: e.target.value } }))} />
          </Field>
        ) : (
          <Card>
            <h2 className="font-bold mb-2">Sua mensagem</h2>
            <p className="whitespace-pre-wrap text-lg">{out}</p>
            {missing.length > 0 && <p className="text-sm text-muted mt-2">Ainda com campos em [colchetes]: troque ou apague antes de enviar.</p>}
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          {!editing && <Copy text={out} label="Copiar mensagem" />}
          <Button icon="edit" onClick={() => setEditing(!editing)}>{editing ? 'Pronto' : 'Editar o modelo'}</Button>
          {editing && state.templateEdits[t.id] !== undefined && (
            <Button onClick={() => update((s) => { const e = { ...s.templateEdits }; delete e[t.id]; return { ...s, templateEdits: e }; })}>Restaurar original</Button>
          )}
        </div>
      </div>
    </>
  );
}
