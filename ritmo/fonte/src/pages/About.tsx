import { back } from '../router';
import { Card, PageHead } from '../ui';
import { CrisisBox } from './Plan';

export function About() {
  return (
    <>
      <PageHead title="Sobre este app" onBack={() => back('/mais')} />
      <div className="space-y-4 text-lg">
        <Card>
          <h2 className="font-bold mb-1">O que é o Ritmo</h2>
          <p>Uma ferramenta de apoio para adultos neurodivergentes, como pessoas autistas, com TDAH, dislexia e outras diferenças neurocognitivas. Ajuda a reduzir sobrecarga, organizar o dia em passos pequenos e cuidar de si, respeitando o seu ritmo.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Nossa abordagem</h2>
          <p>Neurodiversidade afirmativa. Diferenças de funcionamento não são defeitos a corrigir. O Ritmo não tem metas obrigatórias, sequências, pontos, ranking nem comparações. Se um dia foi só descanso, está tudo bem.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">O que o Ritmo não é</h2>
          <p>O Ritmo é uma ferramenta de apoio. Não faz diagnóstico e não substitui avaliação, psicoterapia, acompanhamento médico ou outro tratamento profissional. As sugestões são ideias gerais e podem não servir para você. Você é quem melhor conhece o seu corpo.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Privacidade</h2>
          <p>Seus dados ficam apenas neste aparelho. Não pedimos cadastro, não temos anúncios, não vendemos dados e não usamos rastreadores. Você pode baixar uma cópia ou apagar tudo em Ajustes. Quem usar este aparelho desbloqueado pode ver o que está salvo.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Esta é uma versão de testes</h2>
          <p>Algumas coisas podem mudar com o que aprendermos com quem usa. As divisões de tarefas e as sugestões seguem regras simples, não inteligência artificial.</p>
        </Card>
        <CrisisBox />
      </div>
    </>
  );
}
