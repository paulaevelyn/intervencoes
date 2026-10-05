import { useState, useEffect } from 'react'
import { Save, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import MoodRing, { MOODS } from '../components/MoodRing'
import {
  getMoodHistory,
  saveMoodEntry,
  getGratitudeJournal,
  saveGratitudeEntry,
  todayKey,
} from '../utils/storage'

const PROMPTS = [
  'O que foi um pouco melhor do que o esperado hoje?',
  'Que pequena coisa trouxe algum alívio ou conforto?',
  'Teve algum momento de conexão, mesmo que breve?',
  'O que você fez hoje que levou algum esforço?',
  'O que você notou ao seu redor que foi agradável?',
  'Houve algo que o fez sorrir, mesmo que por pouco?',
  'Que pensamento gentil você teve hoje — sobre você ou alguém?',
]

function GratitudeForm({ date }) {
  const [items, setItems] = useState(['', '', ''])
  const [saved, setSaved] = useState(false)
  const journal = getGratitudeJournal()
  const today = todayKey()

  useEffect(() => {
    const existing = journal[date]
    if (existing) {
      setItems(existing.items.length === 3 ? existing.items : ['', '', ''])
      setSaved(date !== today ? true : existing.items.some(i => i.trim()))
    } else {
      setItems(['', '', ''])
      setSaved(false)
    }
  }, [date])

  const isToday = date === today
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length]

  function handleSave() {
    if (items.some(i => i.trim())) {
      saveGratitudeEntry(items)
      setSaved(true)
    }
  }

  function handleEdit() {
    setSaved(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-5 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">✨</span>
        <h2 className="font-semibold text-gray-800">3 Coisas Boas</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4 italic">"{prompt}"</p>

      {saved ? (
        <div className="space-y-2">
          {items.map((item, i) => item.trim() ? (
            <div key={i} className="flex gap-2 items-start bg-warm-50 rounded-xl p-3 border border-warm-100">
              <span className="text-warm-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ) : null)}
          {isToday && (
            <button onClick={handleEdit} className="text-xs text-warm-500 underline mt-1">
              Editar
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-warm-400 font-bold text-sm w-4 flex-shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const next = [...items]
                    next[i] = e.target.value
                    setItems(next)
                  }}
                  placeholder={`Algo bom do dia ${i + 1}...`}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-warm-400 placeholder-gray-300"
                  disabled={!isToday}
                />
              </div>
            ))}
          </div>
          {isToday && (
            <button
              onClick={handleSave}
              disabled={!items.some(i => i.trim())}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-warm-400 hover:bg-warm-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              <Save size={15} /> Salvar gratidão
            </button>
          )}
        </>
      )}
    </div>
  )
}

function MoodJournalEntry({ date }) {
  const [rating, setRating] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const today = todayKey()
  const isToday = date === today

  useEffect(() => {
    const history = getMoodHistory()
    if (history[date]) {
      setRating(history[date].rating)
      setNote(history[date].note || '')
      setSaved(true)
    } else {
      setRating(null)
      setNote('')
      setSaved(false)
    }
  }, [date])

  function handleSave() {
    if (!rating) return
    saveMoodEntry(rating, note)
    setSaved(true)
  }

  const moodObj = MOODS.find(m => m.value === rating)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📓</span>
        <h2 className="font-semibold text-gray-800">Registro de Humor</h2>
      </div>
      <MoodRing selected={rating} onSelect={isToday ? setRating : undefined} size="md" />
      {saved && moodObj && (
        <p className="text-center text-xs text-gray-400 mt-2">{moodObj.label}</p>
      )}
      <textarea
        value={note}
        onChange={e => isToday && setNote(e.target.value)}
        placeholder={isToday ? 'Como foi o dia? O que estava acontecendo? (opcional)' : 'Sem nota registrada.'}
        readOnly={!isToday}
        className="w-full mt-3 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-sage-400 text-gray-700 placeholder-gray-300"
        rows={3}
      />
      {isToday && (
        <button
          onClick={handleSave}
          disabled={!rating}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          <Save size={15} /> {saved ? 'Atualizar' : 'Salvar humor'}
        </button>
      )}
    </div>
  )
}

function HistoryView() {
  const [offset, setOffset] = useState(0)
  const history = getMoodHistory()
  const gratitude = getGratitudeJournal()
  const today = todayKey()

  const dates = []
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  const PAGE = 7
  const page = dates.slice(offset, offset + PAGE)

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const moodColors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const moodEmojis = ['', '😞', '😔', '😐', '🙂', '😊']

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Calendar size={16} className="text-sage-500" /> Histórico
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setOffset(o => Math.min(o + PAGE, dates.length - PAGE))}
            disabled={offset + PAGE >= dates.length}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setOffset(o => Math.max(o - PAGE, 0))}
            disabled={offset === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {page.map(date => {
          const entry = history[date]
          const gEntry = gratitude[date]
          const isToday = date === today
          return (
            <div
              key={date}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${isToday ? 'bg-sage-50 border border-sage-200' : 'bg-gray-50'}`}
            >
              <div className="w-16 flex-shrink-0">
                <p className={`text-[10px] font-medium ${isToday ? 'text-sage-600' : 'text-gray-500'}`}>
                  {isToday ? 'Hoje' : formatDate(date)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-1">
                {entry ? (
                  <span style={{ color: moodColors[entry.rating] }} className="text-lg">
                    {moodEmojis[entry.rating]}
                  </span>
                ) : (
                  <span className="text-lg opacity-20">—</span>
                )}
                {entry?.note ? (
                  <p className="text-[11px] text-gray-500 truncate italic">"{entry.note}"</p>
                ) : null}
              </div>
              {gEntry && (
                <span className="text-[10px] px-1.5 py-0.5 bg-warm-100 text-warm-600 rounded-full">✨</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Journal() {
  return (
    <div className="pb-24 px-4 max-w-lg mx-auto w-full">
      <div className="pt-10 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Diário</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registrar o dia e praticar gratidão são ferramentas comprovadas de regulação emocional.
        </p>
      </div>

      <MoodJournalEntry date={todayKey()} />
      <GratitudeForm date={todayKey()} />
      <HistoryView />
    </div>
  )
}
