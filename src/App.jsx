import { useMemo, useState } from 'react'
import drawResults from './data/drawResults.js'
import './App.css'

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const SLOT_META = [
  { key: 'morning', label: 'Morning', time: '10:30 AM', accentVar: '--am' },
  { key: 'afternoon', label: 'Afternoon', time: '3:00 PM', accentVar: '--pm' },
  { key: 'evening', label: 'Evening', time: '7:00 PM', accentVar: '--eve' },
]

function formatDay(dateStr) {
  // dateStr: "YYYY-MM-DD" — parse manually to avoid timezone shifting the day
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return {
    weekday: WEEKDAY[dt.getDay()],
    day: String(d).padStart(2, '0'),
  }
}

// Turns "7-11", "11-7", "7 11", "07-11" etc into the same key ("7-11"),
// so a search matches a draw no matter what order the numbers were typed in.
function normalizeNumber(value) {
  if (!value) return ''
  const parts = value
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((n) => parseInt(n, 10))
  if (parts.length === 0) return ''
  return [...parts].sort((a, b) => a - b).join('-')
}

function Slot({ label, time, value, accentVar, isMatch }) {
  const hasValue = value && value.trim().length > 0
  return (
    <div className={`slot ${isMatch ? 'is-match' : ''}`} style={{ '--accent': `var(${accentVar})` }}>
      <div className="slot-head">
        <span className="slot-label">{label}</span>
        <span className="slot-time">{time}</span>
      </div>
      <div className={`slot-number ${hasValue ? '' : 'is-empty'}`}>
        {hasValue ? value : '—'}
      </div>
    </div>
  )
}

export default function App() {
  const monthKeys = useMemo(
    () => Object.keys(drawResults).sort((a, b) => (a < b ? 1 : -1)),
    [],
  )
  const [activeMonth, setActiveMonth] = useState(monthKeys[0])
  const [query, setQuery] = useState('')

  const normalizedQuery = normalizeNumber(query)
  const isSearching = normalizedQuery.length > 0

  // Flat, searchable list built once: every draw across every month.
  const allDraws = useMemo(() => {
    const flat = []
    for (const key of monthKeys) {
      const { label, days } = drawResults[key]
      for (const row of days) {
        for (const slot of SLOT_META) {
          const value = row[slot.key]
          if (value && value.trim().length > 0) {
            flat.push({
              monthKey: key,
              monthLabel: label,
              date: row.date,
              ...slot,
              value,
              normalized: normalizeNumber(value),
            })
          }
        }
      }
    }
    return flat
  }, [monthKeys])

  const searchMatches = useMemo(() => {
    if (!isSearching) return []
    return allDraws
      .filter((d) => d.normalized === normalizedQuery)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [allDraws, isSearching, normalizedQuery])

  const month = drawResults[activeMonth]
  const days = useMemo(
    () => [...(month?.days ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [month],
  )

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-eyebrow">Daily Results Board</div>
        <h1 className="masthead-title">STL Draw Tracker</h1>
        <p className="masthead-sub">
          Morning &middot; Afternoon &middot; Evening — logged day by day, month by month.
        </p>
      </header>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search a number, e.g. 7-11 or 11-7"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search draw number"
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {!isSearching && (
        <nav className="month-tabs" aria-label="Select month">
          {monthKeys.map((key) => (
            <button
              key={key}
              className={`month-tab ${key === activeMonth ? 'is-active' : ''}`}
              onClick={() => setActiveMonth(key)}
            >
              {drawResults[key].label}
            </button>
          ))}
        </nav>
      )}

      <main className="board">
        {isSearching ? (
          <>
            <p className="search-summary">
              {searchMatches.length === 0
                ? `No draws found for "${normalizedQuery}"`
                : `${searchMatches.length} draw${searchMatches.length === 1 ? '' : 's'} found for ${normalizedQuery}`}
            </p>
            {searchMatches.length > 0 && (
              <div className="ticket-list">
                {searchMatches.map((m) => {
                  const { weekday, day } = formatDay(m.date)
                  return (
                    <article className="ticket search-result" key={`${m.date}-${m.key}`}>
                      <div className="ticket-date">
                        <span className="ticket-day">{day}</span>
                        <span className="ticket-weekday">{weekday}</span>
                      </div>
                      <div className="ticket-slots search-slots">
                        <Slot
                          label={m.label}
                          time={m.time}
                          value={m.value}
                          accentVar={m.accentVar}
                          isMatch
                        />
                        <span className="search-month-tag">{m.monthLabel}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        ) : days.length === 0 ? (
          <p className="empty-state">No draws logged for this month yet.</p>
        ) : (
          <div className="ticket-list">
            {days.map((row) => {
              const { weekday, day } = formatDay(row.date)
              return (
                <article className="ticket" key={row.date}>
                  <div className="ticket-date">
                    <span className="ticket-day">{day}</span>
                    <span className="ticket-weekday">{weekday}</span>
                  </div>
                  <div className="ticket-slots">
                    {SLOT_META.map((slot) => (
                      <Slot
                        key={slot.key}
                        label={slot.label}
                        time={slot.time}
                        value={row[slot.key]}
                        accentVar={slot.accentVar}
                      />
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <footer className="footnote">
        Edit <code>src/data/drawResults.js</code> to add new months or update numbers.
      </footer>
    </div>
  )
}
