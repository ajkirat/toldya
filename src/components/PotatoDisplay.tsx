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

  const danger = 1 - pct
  const filter = danger > 0.3
    ? `saturate(${100 + danger * 250}%) hue-rotate(${danger * -30}deg)`
    : 'none'

  return (
    <div className="potato-area">
      <div className={`potato-emoji ${shakeClass}`} style={{ filter }}>
        🥔
      </div>
    </div>
  )
}
