interface Props {
  value: number
}

export default function Countdown({ value }: Props) {
  const display = value <= 0 ? '🔥 GO!' : String(value)
  return (
    <div className="screen countdown-screen">
      <div key={value} className="countdown-num">{display}</div>
    </div>
  )
}
