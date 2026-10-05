import { useState } from 'react'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Activation from './pages/Activation'
import Emotions from './pages/Emotions'
import Journal from './pages/Journal'
import Learn from './pages/Learn'

export default function App() {
  const [tab, setTab] = useState('home')

  function renderPage() {
    switch (tab) {
      case 'home': return <Home onNavigate={setTab} />
      case 'activation': return <Activation />
      case 'emotions': return <Emotions />
      case 'journal': return <Journal />
      case 'learn': return <Learn />
      default: return <Home onNavigate={setTab} />
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      <Navigation active={tab} onNavigate={setTab} />
    </div>
  )
}
