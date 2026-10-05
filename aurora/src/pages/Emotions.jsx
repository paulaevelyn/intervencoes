import { useState } from 'react'
import { ChevronDown, ChevronUp, Play, RotateCcw } from 'lucide-react'

// Evidence-based positive emotion exercises
// Sources: Fredrickson (2009), Seligman (2011), Emmons & McCullough (2003)
const EXERCISES = [
  {
    id: 'savor',
    title: 'Saborear o Momento',
    emoji: '🌸',
    duration: '5 min',
    theory: 'Saborear (savoring) amplia emoções positivas já presentes, contrabalanceando o viés negativo da depressão. Evidência: Bryant & Veroff (2007).',
    color: 'bg-rose-50 border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-700',
    steps: [
      'Encontre algo agradável ao seu redor — pode ser luz, uma textura, um cheiro, uma lembrança.',
      'Feche os olhos e concentre toda a atenção nessa experiência por 2 minutos.',
      'Observe cada detalhe: cor, forma, sensação, temperatura.',
      'Deixe a experiência se expandir. Não pressa. Apenas esteja com ela.',
      'Ao terminar, diga para si mesmo: "Eu mereço momentos como esse."',
    ],
  },
  {
    id: 'gratitude_3',
    title: '3 Coisas Boas',
    emoji: '✨',
    duration: '5-10 min',
    theory: 'Identificar 3 coisas positivas diariamente por 2 semanas reduz depressão e aumenta bem-estar em estudos de Seligman et al. (2005). O cérebro aprende a notar o positivo.',
    color: 'bg-warm-50 border-warm-200',
    badgeColor: 'bg-warm-100 text-warm-700',
    steps: [
      'Pegue papel e caneta (escrever à mão potencializa o efeito).',
      'Pense em 3 coisas boas que aconteceram hoje — podem ser pequenas.',
      'Para cada uma, escreva: O que aconteceu? Por que foi bom? Qual foi seu papel nisso?',
      'Leia o que escreveu em voz alta, lentamente.',
      'Guarde o papel. Ao longo do tempo, você vai acumular evidências de que há coisas boas na vida.',
    ],
  },
  {
    id: 'kindness',
    title: 'Ato de Bondade',
    emoji: '💛',
    duration: '10 min',
    theory: 'Praticar atos de bondade aumenta afeto positivo e autoestima (Lyubomirsky, 2005). A conexão com o outro é um dos antidepressivos naturais mais potentes.',
    color: 'bg-calm-50 border-calm-200',
    badgeColor: 'bg-calm-100 text-calm-700',
    steps: [
      'Pense em alguém em sua vida — um familiar, amigo, colega, ou até um desconhecido.',
      'Escolha um ato de bondade pequeno e concreto: uma mensagem, um elogio genuíno, ajudar em algo.',
      'Faça agora. Não adie. O poder está na ação imediata.',
      'Observe como você se sente durante e após o gesto.',
      'Registre mentalmente: "Eu contribuí com algo positivo no mundo hoje."',
    ],
  },
  {
    id: 'body_scan',
    title: 'Escaneamento Corporal',
    emoji: '🌊',
    duration: '8 min',
    theory: 'Mindfulness corporal desconecta a ruminação e ativa o sistema nervoso parassimpático. Eficaz como complemento no tratamento da depressão (MBCT — Segal, Williams & Teasdale, 2002).',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    steps: [
      'Deite-se ou sente-se confortavelmente. Feche os olhos.',
      'Comece pelos pés: observe qualquer sensação — temperatura, contato, formigamento. Sem julgamento.',
      'Suba lentamente: pernas, quadril, abdômen, peito, costas, ombros, braços, mãos.',
      'Observe o rosto: mandíbula, olhos, testa. Permita que se relaxem.',
      'Respire fundo e volte ao seu corpo inteiro. Você está aqui, agora.',
    ],
  },
  {
    id: 'love_kindness',
    title: 'Bondade Amorosa (Metta)',
    emoji: '💚',
    duration: '10 min',
    theory: 'Loving-kindness meditation aumenta emoções positivas, autocompaixão e reduz autocrítica — componente central da depressão (Hofmann et al., 2011).',
    color: 'bg-sage-50 border-sage-200',
    badgeColor: 'bg-sage-100 text-sage-700',
    steps: [
      'Sente-se confortavelmente e feche os olhos. Respire fundo três vezes.',
      'Visualize a si mesmo. Repita em silêncio: "Que eu esteja bem. Que eu seja feliz. Que eu esteja livre do sofrimento."',
      'Agora visualize alguém que você ama. Repita os mesmos desejos para essa pessoa.',
      'Visualize alguém neutro — um conhecido, um vizinho. Repita os desejos.',
      'Por fim, expanda para todas as pessoas: "Que todos estejam bem. Que todos sejam felizes."',
    ],
  },
  {
    id: 'best_self',
    title: 'Melhor Versão de Você',
    emoji: '🌟',
    duration: '10 min',
    theory: 'Imaginar o melhor eu possível (Best Possible Self) aumenta otimismo e expectativas positivas — reduz indefensabilidade aprendida associada à depressão (King, 2001).',
    color: 'bg-warm-50 border-warm-200',
    badgeColor: 'bg-warm-100 text-amber-700',
    steps: [
      'Pegue papel e caneta. Vá a um lugar tranquilo.',
      'Imagine sua vida daqui a 1-2 anos, depois de superar o momento atual.',
      'Escreva sobre essa versão de você: Como você está? O que você faz? Como se relaciona?',
      'Não filtre. Deixe fluir qualquer coisa positiva que vier à mente.',
      'Leia o que escreveu. Essa versão de você já existe em potência — e está sendo construída agora.',
    ],
  },
  {
    id: 'breathing_478',
    title: 'Respiração 4-7-8',
    emoji: '🌬️',
    duration: '5 min',
    theory: 'A respiração controlada ativa o nervo vago e o sistema parassimpático, reduzindo ativação ansiosa que alimenta o ciclo depressivo (Zaccaro et al., 2018).',
    color: 'bg-calm-50 border-calm-200',
    badgeColor: 'bg-calm-100 text-calm-700',
    steps: [
      'Sente-se ereto, ombros relaxados, mãos sobre as pernas.',
      'Inspire pelo nariz contando mentalmente até 4.',
      'Segure o ar contando até 7 — sem tensão, apenas retenção suave.',
      'Expire pela boca contando até 8, emitindo um som suave de "fsh".',
      'Repita o ciclo 4 vezes. Com a prática, você terá uma ferramenta poderosa de autorregulação.',
    ],
  },
  {
    id: 'positive_memory',
    title: 'Viagem de Memória Positiva',
    emoji: '📷',
    duration: '8 min',
    theory: 'Revisitar memórias positivas reativa circuitos de recompensa e contrabalança a tendência depressiva de recuperar apenas memórias negativas (Werner-Seidler & Moulds, 2011).',
    color: 'bg-purple-50 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    steps: [
      'Feche os olhos e respire fundo. Permita que sua mente vague pelo passado.',
      'Procure um momento em que você se sentiu bem — paz, alegria, conexão, orgulho.',
      'Reviva essa memória em detalhes: onde você estava, quem estava com você, o que sentiu no corpo.',
      'Fique nessa memória por 3-4 minutos. Permita que as emoções retornem.',
      'Ao abrir os olhos, lembre-se: você já viveu momentos bons. E viverá de novo.',
    ],
  },
]

function ExerciseCard({ exercise }) {
  const [expanded, setExpanded] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const [done, setDone] = useState(false)

  function startExercise() {
    setActiveStep(0)
    setDone(false)
  }

  function nextStep() {
    if (activeStep < exercise.steps.length - 1) {
      setActiveStep(prev => prev + 1)
    } else {
      setDone(true)
      setActiveStep(null)
    }
  }

  function reset() {
    setActiveStep(null)
    setDone(false)
  }

  return (
    <div className={`rounded-2xl border p-4 transition-all ${exercise.color}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{exercise.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{exercise.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${exercise.badgeColor}`}>
              {exercise.duration}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Theory */}
          <div className="text-[11px] text-gray-500 leading-relaxed italic border-l-2 border-gray-300 pl-2">
            {exercise.theory}
          </div>

          {/* Active exercise mode */}
          {activeStep !== null && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                  Passo {activeStep + 1} de {exercise.steps.length}
                </p>
                <div className="flex gap-1">
                  {exercise.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-4 rounded-full transition-all ${
                        i <= activeStep ? 'bg-sage-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{exercise.steps[activeStep]}</p>
              <button
                onClick={nextStep}
                className="mt-4 w-full bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {activeStep < exercise.steps.length - 1 ? 'Próximo passo' : 'Concluir exercício'}
              </button>
            </div>
          )}

          {/* Done state */}
          {done && (
            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🌱</p>
              <p className="text-sm font-semibold text-sage-700">Exercício concluído!</p>
              <p className="text-xs text-gray-500 mt-1">Cada prática fortalece novos padrões neurais.</p>
              <button onClick={reset} className="mt-3 flex items-center gap-1 text-xs text-sage-500 mx-auto">
                <RotateCcw size={12} /> Fazer novamente
              </button>
            </div>
          )}

          {/* Steps list (when not in guided mode) */}
          {activeStep === null && !done && (
            <div className="space-y-2">
              {exercise.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* Start button */}
          {activeStep === null && !done && (
            <button
              onClick={startExercise}
              className="flex items-center gap-2 justify-center w-full bg-white border border-gray-200 hover:border-sage-400 text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-all"
            >
              <Play size={14} className="text-sage-500" />
              Iniciar modo guiado
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Emotions() {
  return (
    <div className="pb-24 px-4 max-w-lg mx-auto w-full">
      <div className="pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Emoções Positivas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Baseado na Teoria do Ampliar-e-Construir de Barbara Fredrickson e intervenções de Psicologia Positiva.
        </p>
      </div>

      {/* Science card */}
      <div className="bg-gradient-to-r from-purple-50 to-calm-50 border border-purple-200 rounded-2xl p-4 mb-5 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-gray-800 mb-1">Por que emocionar é ciência?</p>
        Emoções positivas <span className="font-medium text-purple-600">ampliam nossa atenção</span> e
        <span className="font-medium text-purple-600"> constroem recursos</span> (cognitivos, sociais, físicos)
        que protegem contra a depressão no longo prazo. Não se trata de "pensar positivo" — mas de
        praticar estados emocionais como uma habilidade.
      </div>

      <div className="space-y-3">
        {EXERCISES.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  )
}
