import { useState, useEffect } from 'react'
import { Flame, CheckCircle2, TrendingUp, Calendar, ChevronRight, Sparkles } from 'lucide-react'
import MoodRing, { MOODS } from '../components/MoodRing'
import {
  saveMoodEntry,
  getMoodHistory,
  todayKey,
  getScheduled,
  getActivitiesLog,
  getStreakData,
  getLast7DaysMood,
  logActivity,
  unlogActivity,
} from '../utils/storage'
import { getActivityById, CATEGORY_COLORS, CATEGORIES } from '../utils/activities'

const GREETING_MESSAGES = [
  'Como você está se sentindo agora?',
  'Que bom ter você aqui. Como está o humor?',
  'Cada dia que você chega aqui conta.',
  'Você importa. Como está hoje?',
]

function MoodChart({ data }) {
  const maxH = 64
  return (
    <div className="flex items-end gap-1 h-16 w-full px-2">
      {data.map(({ day, rating, date }) => {
        const height = rating ? (rating / 5) * maxH : 4
        const colors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
        const color = rating ? colors[rating] : '#e5e7eb'
        const isToday = date === todayKey()
        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{ height: `${height}px`, backgroundColor: color, opacity: rating ? 1 : 0.4 }}
            />
            <span className={`text-[9px] ${isToday ? 'font-bold text-sage-600' : 'text-gray-400'}`}>
              {day.replace('.', '')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Home({ onNavigate }) {
  const [mood, setMood] = useState(null)
  const [moodNote, setMoodNote] = useState('')
  const [moodSaved, setMoodSaved] = useState(false)
  const [todayScheduled, setTodayScheduled] = useState([])
  const [todayDone, setTodayDone] = useState([])
  const [streak, setStreak] = useState({ streak: 0, totalDays: 0, totalActivities: 0 })
  const [chartData, setChartData] = useState([])
  const [greeting] = useState(() => GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)])

  useEffect(() => {
    const history = getMoodHistory()
    const today = todayKey()
    if (history[today]) {
      setMood(history[today].rating)
      setMoodNote(history[today].note || '')
      setMoodSaved(true)
    }
    const scheduled = getScheduled()[today] || []
    const done = getActivitiesLog()[today] || []
    setTodayScheduled(scheduled)
    setTodayDone(done)
    setStreak(getStreakData())
    setChartData(getLast7DaysMood())
  }, [])

  function handleSaveMood() {
    if (!mood) return
    saveMoodEntry(mood, moodNote)
    setMoodSaved(true)
    setStreak(getStreakData())
    setChartData(getLast7DaysMood())
  }

  function toggleDone(id) {
    const done = getActivitiesLog()[todayKey()] || []
    if (done.includes(id)) {
      unlogActivity(id)
      setTodayDone(prev => prev.filter(d => d !== id))
    } else {
      logActivity(id)
      setTodayDone(prev => [...prev, id])
    }
    setStreak(getStreakData())
  }

  const moodObj = MOODS.find(m => m.value === mood)
  const hour = new Date().getHours()
  const timeGreet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="pt-10 pb-4">
        <p className="text-sage-600 font-medium text-sm">{timeGreet}</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-0.5">Aurora</h1>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
            <Flame size={16} />
            <span className="text-lg font-bold text-gray-800">{streak.streak}</span>
          </div>
          <p className="text-[10px] text-gray-500">dias seguidos</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1 text-sage-500 mb-1">
            <CheckCircle2 size={16} />
            <span className="text-lg font-bold text-gray-800">{streak.totalActivities}</span>
          </div>
          <p className="text-[10px] text-gray-500">atividades feitas</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1 text-calm-500 mb-1">
            <Calendar size={16} />
            <span className="text-lg font-bold text-gray-800">{streak.totalDays}</span>
          </div>
          <p className="text-[10px] text-gray-500">dias registrados</p>
        </div>
      </div>

      {/* Mood Check-in */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        {!moodSaved ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-sage-500" />
              <h2 className="font-semibold text-gray-700 text-sm">{greeting}</h2>
            </div>
            <MoodRing selected={mood} onSelect={setMood} size="md" />
            {mood && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={moodNote}
                  onChange={e => setMoodNote(e.target.value)}
                  placeholder="O que está acontecendo? (opcional)"
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-sage-400 text-gray-700 placeholder-gray-400"
                  rows={2}
                />
                <button
                  onClick={handleSaveMood}
                  className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Registrar humor
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">{moodObj?.emoji || '😐'}</div>
            <p className="text-gray-600 text-sm font-medium">
              Humor registrado: <span className="text-sage-600">{moodObj?.label}</span>
            </p>
            {moodNote && (
              <p className="text-xs text-gray-400 mt-1 italic">"{moodNote}"</p>
            )}
            <button
              onClick={() => setMoodSaved(false)}
              className="text-xs text-sage-500 mt-2 underline"
            >
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Mood Chart */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-sage-500" />
          <h2 className="font-semibold text-gray-700 text-sm">Últimos 7 dias</h2>
        </div>
        <MoodChart data={chartData} />
        <p className="text-[10px] text-gray-400 text-center mt-2">Altura do gráfico = intensidade do humor</p>
      </div>

      {/* Today's Activities */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 text-sm">Atividades de Hoje</h2>
          <button
            onClick={() => onNavigate('activation')}
            className="flex items-center gap-1 text-xs text-sage-500 font-medium"
          >
            Ver todas <ChevronRight size={14} />
          </button>
        </div>
        {todayScheduled.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">Nenhuma atividade programada.</p>
            <button
              onClick={() => onNavigate('activation')}
              className="mt-2 text-sm text-sage-500 font-medium underline"
            >
              Adicionar atividades
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayScheduled.map(id => {
              const act = getActivityById(id)
              if (!act) return null
              const done = todayDone.includes(id)
              const colors = CATEGORY_COLORS[act.category]
              const cat = CATEGORIES[act.category]
              return (
                <div
                  key={id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    done ? 'bg-sage-50 border-sage-200' : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <button
                    onClick={() => toggleDone(id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      done ? 'bg-sage-500 border-sage-500' : 'border-gray-300'
                    }`}
                  >
                    {done && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {act.label}
                    </p>
                    <p className="text-[10px] text-gray-400">{cat.emoji} {cat.label} · {act.duration}</p>
                  </div>
                </div>
              )
            })}
            {todayDone.length > 0 && (
              <p className="text-xs text-center text-sage-500 font-medium mt-2">
                {todayDone.length}/{todayScheduled.length} concluídas hoje
              </p>
            )}
          </div>
        )}
      </div>

      {/* Daily Tip */}
      <div className="bg-gradient-to-br from-sage-500 to-sage-600 rounded-2xl p-4 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Evidência do dia</p>
        <p className="text-sm leading-relaxed">
          Fazer atividades mesmo sem vontade no início é o coração da Ativação Comportamental.
          O humor melhora <em>depois</em> da ação — não antes. Dê o primeiro passo pequeno.
        </p>
      </div>
    </div>
  )
}
