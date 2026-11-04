import { PageHead, Icon, Card } from '../ui';

const ITEMS = [
  { to: '/estados', icon: 'eye', title: 'Meus estados', text: 'Reconhecer emoções, sobrecarga, meltdown, shutdown e o que fazer.' },
  { to: '/perfil', icon: 'heart', title: 'Meu perfil', text: 'Como você funciona. O Ritmo se adapta ao seu jeito.' },
  { to: '/plano', icon: 'heart', title: 'Meu plano de apoio', text: 'Sinais, o que ajuda e quem chamar. Fica só neste aparelho.' },
  { to: '/sensorial', icon: 'eye', title: 'Registro sensorial', text: 'Anote o que pesou e o que ajudou. Veja padrões da semana.' },
  { to: '/comunicacao', icon: 'chat', title: 'Mensagens prontas', text: 'Modelos curtos para pedir prazo, pausa ou dizer não.' },
  { to: '/energia', icon: 'note', title: 'Registro de energia', text: 'Energia, sobrecarga e o que você precisa agora.' },
  { to: '/ajustes', icon: 'sliders', title: 'Ajustes e acessibilidade', text: 'Tema, tamanho do texto, baixo estímulo e seus dados.' },
  { to: '/sobre', icon: 'info', title: 'Sobre este app', text: 'O que o Ritmo é, o que não é e como cuida dos seus dados.' },
];

export function More() {
  return (
    <>
      <PageHead title="Mais" />
      <ul className="space-y-3">
        {ITEMS.map((i) => (
          <li key={i.to}>
            <a href={`#${i.to}`} className="block">
              <Card as="div" className="flex gap-4 items-start hover:border-brand">
                <span className="text-brand mt-1"><Icon name={i.icon} className="w-7 h-7" /></span>
                <span>
                  <span className="block font-bold text-lg">{i.title}</span>
                  <span className="block text-muted">{i.text}</span>
                </span>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
