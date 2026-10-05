// Evidence-based activity database for Behavioral Activation
// Based on Martell, Addis & Jacobson (2001) and Lewinsohn's Pleasant Events Schedule

export const CATEGORIES = {
  corpo: { label: 'Corpo e Movimento', emoji: '🏃', color: 'sage' },
  social: { label: 'Conexão Social', emoji: '👥', color: 'calm' },
  natureza: { label: 'Natureza', emoji: '🌿', color: 'sage' },
  criatividade: { label: 'Criatividade', emoji: '🎨', color: 'purple' },
  conquista: { label: 'Conquistas', emoji: '✅', color: 'warm' },
  prazer: { label: 'Prazer e Lazer', emoji: '😊', color: 'rose' },
  cuidado: { label: 'Autocuidado', emoji: '💛', color: 'warm' },
}

export const ACTIVITIES = [
  // Corpo e Movimento (strong evidence: Blumenthal et al., 1999; Kvam et al., 2016)
  { id: 'walk_10', category: 'corpo', label: 'Caminhada de 10 minutos', duration: '10 min', evidence: 'Reduz sintomas depressivos em até 30%' },
  { id: 'walk_30', category: 'corpo', label: 'Caminhada de 30 minutos', duration: '30 min', evidence: 'Eficácia comparável a antidepressivos para depressão leve-moderada' },
  { id: 'stretch', category: 'corpo', label: 'Alongamento suave', duration: '10 min', evidence: 'Ativa o sistema nervoso parassimpático' },
  { id: 'dance', category: 'corpo', label: 'Dançar por uma música', duration: '5 min', evidence: 'Eleva dopamina e endorfinas' },
  { id: 'yoga', category: 'corpo', label: 'Yoga ou tai chi', duration: '20 min', evidence: 'Reduz cortisol e melhora humor' },
  { id: 'bike', category: 'corpo', label: 'Pedalar ou nadar', duration: '30 min', evidence: 'Aeróbico moderado com forte evidência antidepressiva' },

  // Conexão Social (Cacioppo & Patrick, 2008; Holt-Lunstad et al.)
  { id: 'call_friend', category: 'social', label: 'Ligar para um amigo ou familiar', duration: '15 min', evidence: 'Ativação do sistema de recompensa social' },
  { id: 'message', category: 'social', label: 'Mandar uma mensagem carinhosa', duration: '5 min', evidence: 'Fortalece vínculos mesmo à distância' },
  { id: 'meet_person', category: 'social', label: 'Encontrar alguém pessoalmente', duration: '1h', evidence: 'Contato presencial é o mais protetor contra depressão' },
  { id: 'pet', category: 'social', label: 'Brincar com um animal de estimação', duration: '10 min', evidence: 'Oxitocina e redução de cortisol' },
  { id: 'volunteer', category: 'social', label: 'Fazer algo por alguém', duration: '20 min', evidence: 'Altruísmo ativa circuitos de recompensa' },

  // Natureza (Bratman et al., 2015)
  { id: 'park', category: 'natureza', label: 'Sentar num parque ou jardim', duration: '15 min', evidence: 'Reduz ruminação e ativa o sistema de calma' },
  { id: 'sunlight', category: 'natureza', label: 'Tomar sol da manhã', duration: '10 min', evidence: 'Regula melatonina e serotonina' },
  { id: 'plant', category: 'natureza', label: 'Cuidar de uma planta', duration: '10 min', evidence: 'Conecta com ciclos naturais e promove calma' },
  { id: 'water', category: 'natureza', label: 'Ouvir sons da natureza (água, vento)', duration: '10 min', evidence: 'Ativa resposta de relaxamento' },

  // Criatividade
  { id: 'draw', category: 'criatividade', label: 'Desenhar ou colorir', duration: '15 min', evidence: 'Induz estado de fluxo e reduz ansiedade' },
  { id: 'write_story', category: 'criatividade', label: 'Escrever uma história curta', duration: '20 min', evidence: 'Expressão criativa como processamento emocional' },
  { id: 'music', category: 'criatividade', label: 'Tocar um instrumento ou cantar', duration: '15 min', evidence: 'Sincronização neural e elevação de humor' },
  { id: 'cook', category: 'criatividade', label: 'Cozinhar algo especial', duration: '30 min', evidence: 'Atividade de maestria com reforço imediato' },
  { id: 'craft', category: 'criatividade', label: 'Artesanato ou trabalho manual', duration: '20 min', evidence: 'Estado de fluxo e senso de controle' },

  // Conquistas (Bandura, 1997 - self-efficacy)
  { id: 'small_task', category: 'conquista', label: 'Completar uma tarefa pequena', duration: '10 min', evidence: 'Cada pequena conquista reconstrói autoeficácia' },
  { id: 'organize', category: 'conquista', label: 'Organizar um espaço pequeno', duration: '15 min', evidence: 'Senso de controle e ambiente ordenado melhora humor' },
  { id: 'learn', category: 'conquista', label: 'Aprender algo novo por 10 min', duration: '10 min', evidence: 'Curiosidade e crescimento ativam recompensa' },
  { id: 'plan_day', category: 'conquista', label: 'Planejar o dia no papel', duration: '5 min', evidence: 'Estrutura reduz paralisia depressiva' },
  { id: 'read', category: 'conquista', label: 'Ler por 15 minutos', duration: '15 min', evidence: 'Engajamento cognitivo e escape saudável' },

  // Prazer e Lazer (Pleasant Events Schedule - Lewinsohn)
  { id: 'movie', category: 'prazer', label: 'Assistir um episódio de uma série', duration: '45 min', evidence: 'Reforço de atividades prazerosas' },
  { id: 'bath', category: 'prazer', label: 'Banho quente e relaxante', duration: '15 min', evidence: 'Regulação térmica associada à calma' },
  { id: 'music_listen', category: 'prazer', label: 'Ouvir músicas favoritas', duration: '20 min', evidence: 'Dopamina e memórias positivas' },
  { id: 'game', category: 'prazer', label: 'Jogar um jogo que aprecia', duration: '30 min', evidence: 'Engajamento e senso de competência' },
  { id: 'coffee', category: 'prazer', label: 'Tomar um café/chá com calma', duration: '10 min', evidence: 'Ritual de autocuidado e desaceleração' },

  // Autocuidado (sleep hygiene, nutrition evidence)
  { id: 'sleep_routine', category: 'cuidado', label: 'Ir dormir no mesmo horário', duration: '–', evidence: 'Sono regular é fator chave na recuperação da depressão' },
  { id: 'meal', category: 'cuidado', label: 'Fazer uma refeição nutritiva', duration: '20 min', evidence: 'Nutrição afeta diretamente neurotransmissores' },
  { id: 'hydrate', category: 'cuidado', label: 'Beber água ao longo do dia', duration: '–', evidence: 'Desidratação piora fadiga e humor' },
  { id: 'breathe', category: 'cuidado', label: 'Respiração lenta por 5 min (4-7-8)', duration: '5 min', evidence: 'Ativa nervo vago e reduz ativação simpática' },
  { id: 'screen_off', category: 'cuidado', label: 'Ficar 30 min sem telas antes de dormir', duration: '30 min', evidence: 'Melhora qualidade do sono e reduz ruminação noturna' },
]

export function getActivityById(id) {
  return ACTIVITIES.find(a => a.id === id)
}

export function getActivitiesByCategory(cat) {
  return ACTIVITIES.filter(a => a.category === cat)
}

export const CATEGORY_COLORS = {
  corpo: { bg: 'bg-sage-50', border: 'border-sage-200', badge: 'bg-sage-100 text-sage-700', icon: 'text-sage-500' },
  social: { bg: 'bg-calm-50', border: 'border-calm-200', badge: 'bg-calm-100 text-calm-700', icon: 'text-calm-500' },
  natureza: { bg: 'bg-sage-50', border: 'border-sage-300', badge: 'bg-sage-200 text-sage-800', icon: 'text-sage-600' },
  criatividade: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: 'text-purple-500' },
  conquista: { bg: 'bg-warm-50', border: 'border-warm-200', badge: 'bg-warm-100 text-warm-700', icon: 'text-warm-600' },
  prazer: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700', icon: 'text-rose-500' },
  cuidado: { bg: 'bg-warm-50', border: 'border-warm-200', badge: 'bg-warm-100 text-amber-700', icon: 'text-amber-500' },
}
