const PREFIX = 'depressao_app_'

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {}
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function todayKey() {
  return new Date().toISOString().split('T')[0]
}

export function getMoodHistory() {
  return load('mood_history', {})
}

export function saveMoodEntry(rating, note = '') {
  const history = getMoodHistory()
  const key = todayKey()
  history[key] = { rating, note, timestamp: Date.now() }
  save('mood_history', history)
}

export function getActivitiesLog() {
  return load('activities_log', {})
}

export function logActivity(activityId, date = todayKey()) {
  const log = getActivitiesLog()
  if (!log[date]) log[date] = []
  if (!log[date].includes(activityId)) log[date].push(activityId)
  save('activities_log', log)
}

export function unlogActivity(activityId, date = todayKey()) {
  const log = getActivitiesLog()
  if (!log[date]) return
  log[date] = log[date].filter(id => id !== activityId)
  save('activities_log', log)
}

export function getScheduled() {
  return load('scheduled', {})
}

export function scheduleActivity(activityId, date = todayKey()) {
  const s = getScheduled()
  if (!s[date]) s[date] = []
  if (!s[date].includes(activityId)) s[date].push(activityId)
  save('scheduled', s)
}

export function unscheduleActivity(activityId, date = todayKey()) {
  const s = getScheduled()
  if (!s[date]) return
  s[date] = s[date].filter(id => id !== activityId)
  save('scheduled', s)
}

export function getGratitudeJournal() {
  return load('gratitude', {})
}

export function saveGratitudeEntry(items) {
  const journal = getGratitudeJournal()
  journal[todayKey()] = { items, timestamp: Date.now() }
  save('gratitude', journal)
}

export function getStreakData() {
  const history = getMoodHistory()
  const log = getActivitiesLog()
  const dates = Object.keys(history).sort()
  if (dates.length === 0) return { streak: 0, totalDays: 0, totalActivities: 0 }

  let streak = 0
  const today = todayKey()
  let d = new Date(today)
  while (true) {
    const k = d.toISOString().split('T')[0]
    if (history[k] || (log[k] && log[k].length > 0)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  const totalActivities = Object.values(log).reduce((sum, arr) => sum + arr.length, 0)
  return { streak, totalDays: dates.length, totalActivities }
}

export function getLast7DaysMood() {
  const history = getMoodHistory()
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const day = d.toLocaleDateString('pt-BR', { weekday: 'short' })
    result.push({ date: key, day, rating: history[key]?.rating ?? null })
  }
  return result
}
