import { useState, useEffect } from 'react'
import { CheckCircle2, PlusCircle, MinusCircle, Info, Filter } from 'lucide-react'
import {
  ACTIVITIES,
  CATEGORIES,
  CATEGORY_COLORS,
  getActivitiesByCategory,
} from '../utils/activities'
import {
  getScheduled,
  scheduleActivity,
  unscheduleActivity,
  getActivitiesLog,
  logActivity,
  unlogActivity,
  todayKey,
} from '../utils/storage'

function CategoryChip({ cat, label, emoji, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
        active
          ? 'bg-sage-500 border-sage-500 text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-sage-300'
      }`}
    >
      <span>{emoji}</span> {label}
    </button>
  )
}

function ActivityCard({ activity, scheduled, done, onToggleSchedule, onToggleDone }) {
  const [showEvidence, setShowEvidence] = useState(false)
  const colors = CATEGORY_COLORS[activity.category]
  const cat = CATEGORIES[activity.category]

  return (
    <div className={`rounded-2xl border p-4 transition-all ${done ? 'bg-sage-50 border-sage-200' : `bg-white ${colors.border}`}`}>
      <div className="flex items-start gap-3">
        {/* Done checkbox */}
        <button
          onClick={onToggleDone}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            done ? 'bg-sage-500 border-sage-500' : 'border-gray-300 hover:border-sage-400'
          }`}
        >
          {done && <CheckCircle2 size={14} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm font-semibold ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {activity.label}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                  {cat.emoji} {cat.label}
                </span>
                <span className="text-[10px] text-gray-400">{activity.duration}</span>
              </div>
            </div>
            {/* Schedule toggle */}
            <button
              onClick={onToggleSchedule}
              className={`flex-shrink-0 transition-colors ${
                scheduled ? 'text-sage-500 hover:text-sage-700' : 'text-gray-300 hover:text-sage-400'
              }`}
              title={scheduled ? 'Remover da lista de hoje' : 'Adicionar para hoje'}
            >
              {scheduled ? <MinusCircle size={20} /> : <PlusCircle size={20} />}
            </button>
          </div>

          {/* Evidence toggle */}
          <button
            onClick={() => setShowEvidence(v => !v)}
            className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 hover:text-sage-500 transition-colors"
          >
            <Info size={12} />
            <span>Por que funciona?</span>
          </button>
          {showEvidence && (
            <div className={`mt-2 p-2.5 rounded-lg text-[11px] leading-relaxed text-gray-600 ${colors.bg} border ${colors.border}`}>
              {activity.evidence}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Activation() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [scheduled, setScheduled] = useState([])
  const [done, setDone] = useState([])
  const [showOnlyScheduled, setShowOnlyScheduled] = useState(false)

  useEffect(() => {
    const today = todayKey()
    setScheduled(getScheduled()[today] || [])
    setDone(getActivitiesLog()[today] || [])
  }, [])

  function handleToggleSchedule(id) {
    const today = todayKey()
    if (scheduled.includes(id)) {
      unscheduleActivity(id, today)
      setScheduled(prev => prev.filter(x => x !== id))
    } else {
      scheduleActivity(id, today)
      setScheduled(prev => [...prev, id])
    }
  }

  function handleToggleDone(id) {
    const today = todayKey()
    if (done.includes(id)) {
      unlogActivity(id, today)
      setDone(prev => prev.filter(x => x !== id))
    } else {
      logActivity(id, today)
      setDone(prev => [...prev, id])
      // Also schedule if not already
      if (!scheduled.includes(id)) {
        scheduleActivity(id, today)
        setScheduled(prev => [...prev, id])
      }
    }
  }

  const activities = activeFilter === 'all'
    ? ACTIVITIES
    : getActivitiesByCategory(activeFilter)

  const filtered = showOnlyScheduled
    ? activities.filter(a => scheduled.includes(a.id))
    : activities

  return (
    <div className="pb-24 px-4 max-w-lg mx-auto w-full">
      <div className="pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Ativação Comportamental</h1>
        <p className="text-sm text-gray-500 mt-1">
          Baseada em Martell, Addis & Jacobson (2001) — uma das terapias mais eficazes para depressão.
        </p>
      </div>

      {/* Concept card */}
      <div className="bg-gradient-to-r from-calm-50 to-sage-50 border border-calm-200 rounded-2xl p-4 mb-4 text-sm text-gray-700 leading-relaxed">
        <p className="font-semibold text-gray-800 mb-1">Como funciona?</p>
        A depressão nos afasta das atividades. Isso piora o humor, que nos afasta mais ainda.
        Quebrar esse ciclo com ações <span className="font-medium text-sage-600">pequenas e consistentes</span> é o caminho de volta.
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        <CategoryChip
          cat="all"
          label="Todas"
          emoji="✨"
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
          <CategoryChip
            key={key}
            cat={key}
            label={label}
            emoji={emoji}
            active={activeFilter === key}
            onClick={() => setActiveFilter(key)}
          />
        ))}
      </div>

      {/* Show scheduled toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {filtered.length} atividades · {scheduled.length} programadas hoje · {done.length} feitas
        </p>
        <button
          onClick={() => setShowOnlyScheduled(v => !v)}
          className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-all ${
            showOnlyScheduled ? 'bg-sage-500 text-white border-sage-500' : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          <Filter size={11} />
          Hoje
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhuma atividade programada para hoje ainda.
          </div>
        )}
        {filtered.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            scheduled={scheduled.includes(activity.id)}
            done={done.includes(activity.id)}
            onToggleSchedule={() => handleToggleSchedule(activity.id)}
            onToggleDone={() => handleToggleDone(activity.id)}
          />
        ))}
      </div>

      {/* Bottom tip */}
      <div className="mt-5 bg-warm-50 border border-warm-200 rounded-2xl p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-warm-600">Dica:</span> Comece por atividades de 5-10 minutos.
          Pequenos passos constroem o impulso. Marque como feito mesmo que tenha feito parcialmente — isso conta!
        </p>
      </div>
    </div>
  )
}
