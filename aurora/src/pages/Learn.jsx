import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const ARTICLES = [
  {
    id: 'what_depression',
    emoji: '🧠',
    title: 'O que é depressão?',
    subtitle: 'Muito além de tristeza',
    color: 'bg-calm-50 border-calm-200',
    content: [
      {
        heading: 'Uma condição biopsicossocial',
        text: 'A depressão não é fraqueza, preguiça ou falta de força de vontade. É uma condição médica reconhecida que envolve alterações em neurotransmissores (serotonina, dopamina, noradrenalina), estrutura cerebral e padrões de pensamento.',
      },
      {
        heading: 'Sintomas comuns',
        text: 'Humor deprimido na maior parte do dia · Perda de prazer em atividades antes agradáveis (anedonia) · Fadiga e falta de energia · Dificuldade de concentração · Sentimentos de inutilidade ou culpa · Alterações no sono e apetite · Pensamentos sobre morte.',
      },
      {
        heading: 'Prevalência',
        text: 'A OMS estima que 280 milhões de pessoas vivem com depressão globalmente. No Brasil, é a condição de saúde mental mais prevalente. Você não está sozinho.',
      },
      {
        heading: 'Quando buscar ajuda',
        text: 'Se os sintomas persistem por mais de 2 semanas ou afetam sua função diária, busque um profissional de saúde mental. Este app é um complemento — não substitui tratamento profissional.',
      },
    ],
  },
  {
    id: 'ba_model',
    emoji: '⚡',
    title: 'Ativação Comportamental',
    subtitle: 'A ciência por trás do movimento',
    color: 'bg-sage-50 border-sage-200',
    content: [
      {
        heading: 'O ciclo da depressão',
        text: 'A depressão cria um ciclo vicioso: humor baixo → evitação de atividades → menos reforço positivo → humor ainda mais baixo. A Ativação Comportamental (BA) rompe esse ciclo de forma direta.',
      },
      {
        heading: 'A evidência',
        text: 'Martell, Addis e Jacobson (2001) demonstraram que a BA sozinha é tão eficaz quanto a Terapia Cognitivo-Comportamental completa para depressão moderada a grave. É uma das intervenções com mais suporte empírico disponíveis.',
      },
      {
        heading: 'Como funciona na prática',
        text: 'Identificamos atividades que trazem prazer e sensação de conquista. Programamos essas atividades mesmo quando o humor está baixo. Registramos o humor antes e depois. Com o tempo, o humor melhora — porque seguiu a ação, não o contrário.',
      },
      {
        heading: 'Atividades de maestria vs prazer',
        text: 'Equilibre dois tipos: Maestria (atividades que dão senso de competência, como organizar algo) e Prazer (atividades agradáveis, como ouvir música). Os dois tipos são necessários para uma recuperação completa.',
      },
      {
        heading: 'A regra dos 5 minutos',
        text: 'Não espere motivação para começar. Comprometa-se com apenas 5 minutos. Quase sempre, uma vez que você começa, a ativação aumenta. E mesmo que não aumente, 5 minutos já contam.',
      },
    ],
  },
  {
    id: 'positive_psychology',
    emoji: '🌻',
    title: 'Psicologia Positiva',
    subtitle: 'Não é sobre "pensar positivo"',
    color: 'bg-warm-50 border-warm-200',
    content: [
      {
        heading: 'O que é psicologia positiva?',
        text: 'É o estudo científico do que faz a vida valer a pena: bem-estar, forças, virtudes e florescimento humano. Foi fundada por Martin Seligman e tem décadas de pesquisa sólida.',
      },
      {
        heading: 'Teoria do Ampliar-e-Construir (Fredrickson, 2001)',
        text: 'Emoções positivas ampliam nossa atenção, pensamento e repertório de ações. Ao longo do tempo, constroem recursos duradouros: resiliência, habilidades sociais, saúde física. Este é o mecanismo científico por trás dos exercícios do app.',
      },
      {
        heading: 'Gratidão funciona?',
        text: 'Sim, com ressalvas. Estudos (Emmons & McCullough, 2003; Seligman et al., 2005) mostram que escrever 3 coisas boas diariamente por 2 semanas reduz sintomas depressivos e aumenta bem-estar — efeitos que duram meses.',
      },
      {
        heading: 'Forças de caráter',
        text: 'Todo ser humano tem forças únicas (criatividade, coragem, bondade, curiosidade etc.). Identificar e usar suas forças na vida diária está entre as intervenções com maior tamanho de efeito na psicologia positiva.',
      },
      {
        heading: 'Autocompaixão',
        text: 'Kristin Neff demonstrou que a autocompaixão (tratar a si mesmo com a mesma gentileza que trataria um amigo) é superior à autoestima como protetor de saúde mental — e é especialmente importante na depressão, onde a autocrítica é intensa.',
      },
    ],
  },
  {
    id: 'mind_body',
    emoji: '🏃',
    title: 'Corpo e Cérebro',
    subtitle: 'Exercício, sono e alimentação',
    color: 'bg-purple-50 border-purple-200',
    content: [
      {
        heading: 'Exercício como antidepressivo',
        text: 'Uma revisão de 2016 (Kvam et al.) analisou 23 estudos e concluiu que o exercício aeróbico tem eficácia comparável a antidepressivos para depressão leve a moderada. O mecanismo envolve BDNF, serotonina, endorfinas e neurogênese no hipocampo.',
      },
      {
        heading: 'Quanto exercício?',
        text: '150 minutos por semana de atividade moderada (caminhada rápida, natação, dança) já é suficiente para obter benefícios. Começar com 10 minutos por dia e aumentar gradualmente é uma estratégia validada.',
      },
      {
        heading: 'Sono e depressão',
        text: 'Sono e depressão têm relação bidirecional: cada um piora o outro. Horários regulares de sono, evitar telas 1h antes de dormir, e técnicas de relaxamento são componentes do tratamento. A privação de sono piora regulação emocional de forma aguda.',
      },
      {
        heading: 'Alimentação e humor',
        text: 'O eixo intestino-cérebro é real: 90% da serotonina do corpo é produzida no intestino. Dietas ricas em vegetais, peixes e probióticos estão associadas a menor risco de depressão (Jacka et al., 2017). Açúcar em excesso piora inflamação e humor.',
      },
      {
        heading: 'Luz solar',
        text: 'Exposição à luz natural pela manhã regula o ritmo circadiano, aumenta serotonina e melatonina. Em países com pouca luz solar no inverno, a Terapia de Luz tem evidência forte para depressão sazonal e benefício geral para depressão.',
      },
    ],
  },
  {
    id: 'therapy',
    emoji: '💬',
    title: 'Terapia Baseada em Evidências',
    subtitle: 'O que a ciência diz sobre tratamento',
    color: 'bg-rose-50 border-rose-200',
    content: [
      {
        heading: 'Terapia Cognitivo-Comportamental (TCC)',
        text: 'A abordagem mais estudada para depressão. Trabalha a relação entre pensamentos, emoções e comportamentos. Meta-análises mostram eficácia superior a lista de espera e comparável a medicação, com menor taxa de recaída.',
      },
      {
        heading: 'Ativação Comportamental (BA)',
        text: 'Componente da TCC com eficácia autônoma comprovada. Foca na mudança comportamental sem necessariamente reestruturar cognições. Especialmente útil quando há paralisia e inação.',
      },
      {
        heading: 'Terapia de Aceitação e Compromisso (ACT)',
        text: 'Baseada em flexibilidade psicológica, aceitação de experiências internas e ação guiada por valores. Evidência crescente para depressão, especialmente para reduzir ruminação e evitação experiencial.',
      },
      {
        heading: 'Terapia Interpessoal (TIP)',
        text: 'Foca em relações interpessoais e transições de vida. Eficaz especialmente quando a depressão está ligada a perdas, conflitos ou mudanças de papel social.',
      },
      {
        heading: 'Medicação',
        text: 'Antidepressivos (ISRS, IRSN e outros) têm eficácia comprovada para depressão moderada a grave. Combinação de medicação e psicoterapia costuma ter melhores resultados. Sempre com prescrição e acompanhamento médico.',
      },
      {
        heading: 'Este app',
        text: 'As intervenções neste app são baseadas em evidências e podem ser usadas como autoajuda estruturada ou como complemento ao tratamento profissional. Não substituem diagnóstico nem tratamento especializado.',
      },
    ],
  },
  {
    id: 'crisis',
    emoji: '🆘',
    title: 'Em Crise? Aqui Está Ajuda',
    subtitle: 'Recursos de emergência',
    color: 'bg-rose-50 border-rose-200',
    content: [
      {
        heading: 'CVV — Centro de Valorização da Vida',
        text: 'Ligue 188 (gratuito, 24h) ou acesse cvv.org.br. Escuta empática e sigilosa para pessoas em sofrimento emocional ou crise suicida.',
      },
      {
        heading: 'CAPS — Centro de Atenção Psicossocial',
        text: 'Serviço público gratuito do SUS para saúde mental. Encontre o mais próximo na prefeitura ou secretaria de saúde do seu município.',
      },
      {
        heading: 'UPA / Pronto-Socorro',
        text: 'Em situação de risco imediato, vá a uma UPA ou pronto-socorro. Crise psiquiátrica é emergência médica e deve ser tratada como tal.',
      },
      {
        heading: 'Se você está pensando em se machucar',
        text: 'Você não precisa enfrentar isso sozinho. Ligue 188 agora. Ou fale com alguém de confiança. Cada momento de ajuda é um passo para ficar.',
      },
    ],
  },
]

function ArticleCard({ article }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${article.color}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="text-3xl flex-shrink-0">{article.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm">{article.title}</h3>
          <p className="text-[11px] text-gray-500">{article.subtitle}</p>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="w-full h-px bg-white/60" />
          {article.content.map((section, i) => (
            <div key={i}>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">{section.heading}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Learn() {
  return (
    <div className="pb-24 px-4 max-w-lg mx-auto w-full">
      <div className="pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Aprender</h1>
        <p className="text-sm text-gray-500 mt-1">
          Entender a depressão e as terapias baseadas em evidências é parte do processo de recuperação.
        </p>
      </div>

      <div className="bg-gradient-to-r from-sage-50 to-calm-50 border border-sage-200 rounded-2xl p-4 mb-5">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-sage-700">Importante:</span> Este app é uma ferramenta de apoio baseada em ciência.
          Ele não substitui avaliação diagnóstica, psicoterapia ou acompanhamento médico. Se você está sofrendo,
          busque um profissional de saúde mental.
        </p>
      </div>

      <div className="space-y-3">
        {ARTICLES.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <div className="mt-5 text-center text-[10px] text-gray-400 leading-relaxed">
        Conteúdo baseado em pesquisas de: Martell et al. (2001), Seligman et al. (2005),
        Fredrickson (2009), Emmons & McCullough (2003), Kvam et al. (2016), Hofmann et al. (2011) e outros.
      </div>
    </div>
  )
}
