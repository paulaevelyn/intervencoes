import { useState } from 'react';
import { useStore, uid } from '../store';
import { Button, Choice, PageHead } from '../ui';
import { suggest } from '../data/suggest';
import { Suggestions } from './Home';
import { back } from '../router';
import type { Level3, Need, Overload } from '../types';

export function Energy() {
  const { update } = useStore();
  const [energy, setEnergy] = useState<Level3>();
  const [overload, setOverload] = useState<Overload>();
  const [need, setNeed] = useState<Need>();
  const [done, setDone] = useState(false);

  if (done) {
    const items = suggest({ energy, overload, need });
    return (
      <>
        <PageHead title="Registrado. O que pode ajudar" sub="Com base no que você contou. Você escolhe se quer fazer." />
        <Suggestions items={items} />
        <div className="mt-5"><Button onClick={() => { setDone(false); }}>Ajustar minhas respostas</Button></div>
      </>
    );
  }

  const ready = energy || overload || need;
  return (
    <>
      <PageHead title="Registro de energia" sub="Responda só o que quiser. Leva menos de 1 minuto." onBack={() => back('/mais')} />
      <div className="space-y-6">
        <Choice legend="Energia" value={energy} onChange={setEnergy} cols={3}
          options={[{ v: 'baixa', label: 'Baixa' }, { v: 'media', label: 'Média' }, { v: 'alta', label: 'Alta' }]} />
        <Choice legend="Sobrecarga" value={overload} onChange={setOverload} cols={4}
          options={[{ v: 'nenhuma', label: 'Nenhuma' }, { v: 'leve', label: 'Leve' }, { v: 'moderada', label: 'Moderada' }, { v: 'alta', label: 'Alta' }]} />
        <Choice legend="Do que você precisa agora?" value={need} onChange={setNeed} cols={2}
          options={[{ v: 'foco', label: 'Foco' }, { v: 'descanso', label: 'Descanso' }, { v: 'organizacao', label: 'Organização' }, { v: 'regulacao', label: 'Regulação emocional' }, { v: 'registrar', label: 'Só registrar' }]} />
        <Button kind="primary" big block disabled={!ready} onClick={() => {
          update((s) => ({ ...s, checkins: [...s.checkins, { id: uid(), at: Date.now(), energy, overload, need }].slice(-300) }));
          setDone(true);
        }}>Salvar e ver sugestões</Button>
      </div>
    </>
  );
}
