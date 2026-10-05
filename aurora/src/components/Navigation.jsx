import { Home, Zap, Heart, BookOpen, BookHeart } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Início', Icon: Home },
  { id: 'activation', label: 'Ativar', Icon: Zap },
  { id: 'emotions', label: 'Sentir', Icon: Heart },
  { id: 'journal', label: 'Diário', Icon: BookHeart },
  { id: 'learn', label: 'Aprender', Icon: BookOpen },
]

export default function Navigation({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 pt-3 gap-0.5 transition-colors ${
                isActive ? 'text-sage-600' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-sage-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-sage-500 rounded-t-full" style={{ position: 'relative', display: 'block' }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
