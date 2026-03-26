interface Props {
  timeRemaining: number
  totalTime: number
}

export default function PotatoDisplay({ timeRemaining, totalTime }: Props) {
  const pct = timeRemaining / totalTime

  let shakeClass = ''
  if (pct < 0.15) shakeClass = 'shake-xl'
  else if (pct < 0.3) shakeClass = 'shake-lg'
  else if (pct < 0.5) shakeClass = 'shake-md'
  else if (pct < 0.7) shakeClass = 'shake-sm'

  const barColor = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444'
  const danger = 1 - pct
  const filter = danger > 0.3
    ? `saturate(${100 + danger * 250}%) hue-rotate(${danger * -30}deg)`
    : 'none'

  return (
    <div className="potato-area">
      <div className={`potato-emoji ${shakeClass}`} style={{ filter }}>
        🥔
      </div>
      <div className="timer-track">
        <div
          className="timer-fill"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="timer-label">{(timeRemaining / 1000).toFixed(1)}s</div>
    </div>
  )
}
