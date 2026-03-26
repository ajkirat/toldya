interface Props {
  onStart: () => void
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="screen start-screen">
      <div className="start-potato">🥔</div>
      <h1 className="start-title">
        <span className="hot-text">HOT</span>
        <br />
        POTATO!
      </h1>
      <p className="start-sub">2 players · 1 phone</p>
      <div className="start-rules">
        <div className="rule">🔥 Pass before it explodes</div>
        <div className="rule">💥 Get burned = lose the round</div>
        <div className="rule">🏆 First to 3 wins!</div>
      </div>
      <button className="btn-start" onClick={onStart}>
        LET'S PLAY!
      </button>
    </div>
  )
}
