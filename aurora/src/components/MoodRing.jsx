const MOODS = [
  { value: 1, emoji: '😞', label: 'Muito baixo', color: '#ef4444' },
  { value: 2, emoji: '😔', label: 'Baixo', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Neutro', color: '#eab308' },
  { value: 4, emoji: '🙂', label: 'Bem', color: '#84cc16' },
  { value: 5, emoji: '😊', label: 'Muito bem', color: '#22c55e' },
]

export default function MoodRing({ selected, onSelect, size = 'md' }) {
  const sizes = {
    sm: { btn: 'w-10 h-10 text-xl', label: 'hidden' },
    md: { btn: 'w-14 h-14 text-3xl', label: 'text-xs mt-1' },
    lg: { btn: 'w-16 h-16 text-4xl', label: 'text-xs mt-1' },
  }
  const s = sizes[size]
  return (
    <div className="flex gap-2 justify-center">
      {MOODS.map(m => (
        <button
          key={m.value}
          onClick={() => onSelect(m.value)}
          className={`flex flex-col items-center transition-all duration-150 ${
            selected === m.value
              ? 'scale-125 -translate-y-1'
              : 'opacity-60 hover:opacity-90 hover:scale-110'
          }`}
          title={m.label}
        >
          <span
            className={`${s.btn} flex items-center justify-center rounded-full border-2 transition-all`}
            style={{
              borderColor: selected === m.value ? m.color : 'transparent',
              backgroundColor: selected === m.value ? m.color + '20' : 'transparent',
            }}
          >
            {m.emoji}
          </span>
          <span className={`${s.label} text-gray-500`}>{m.label}</span>
        </button>
      ))}
    </div>
  )
}

export { MOODS }
