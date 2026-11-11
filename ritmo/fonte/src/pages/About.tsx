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
          <p>Seus dados ficam neste aparelho. A conta é opcional: sem ela, nada sai do aparelho; com ela, seus dados ficam guardados no mesmo serviço dos outros apps da Psicoterapia e Afins e só você os vê. Se você foi vinculada(o) a uma profissional, pode escolher compartilhar só números e categorias (check-ins, registros sensoriais, estados marcados e contagens de tarefas). Isso começa desligado e você muda quando quiser. O plano de apoio, o perfil, os textos que você escreve e os títulos das tarefas nunca aparecem para a profissional. Não temos anúncios, não vendemos dados e não usamos rastreadores. Você pode baixar uma cópia ou apagar tudo em Ajustes. Quem usar este aparelho desbloqueado pode ver o que está salvo.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Perfil e sugestões</h2>
          <p>O perfil é autodeclarado: não é diagnóstico e não exige laudo, e serve só para adaptar dicas e ajustes. As sugestões, os guias e o planejador funcionam por regras simples, sem inteligência artificial e sem enviar nada para fora do aparelho.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Esta é uma versão de testes</h2>
          <p>Algumas coisas podem mudar com o que aprendermos com quem usa.</p>
        </Card>
        <Card>
          <h2 className="font-bold mb-1">Quem faz</h2>
          <p>O Ritmo é um app da Psicoterapia e Afins, feito por uma psicóloga clínica, com abordagem de neurodiversidade afirmativa.</p>
          <p className="mt-2"><a className="font-semibold underline" href="https://www.psicoterapiaeafins.com.br" target="_blank" rel="noopener">psicoterapiaeafins.com.br</a> · <a className="font-semibold underline" href="https://www.instagram.com/psicoterapiaeafins" target="_blank" rel="noopener">@psicoterapiaeafins</a></p>
        </Card>
        <CrisisBox />
      </div>
    </>
  );
}
