import type { Quiz } from './quiz'

export function Gallery({
  quizzes,
  name,
  onPick,
  onChangeName,
}: {
  quizzes: Quiz[]
  name: string
  onPick: (id: string) => void
  onChangeName: () => void
}) {
  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h1>🎈 Quizzi</h1>
        <button className="btn" onClick={onChangeName} style={{ padding: '10px 16px' }}>
          👤 {name}
        </button>
      </div>
      <p style={{ color: 'var(--muted)' }}>Chào {name}, chọn một bài để chơi nhé!</p>

      {quizzes.length === 0 && <p>Chưa có bài nào. Thêm file vào src/quizzes/ nhé.</p>}

      <div className="grid">
        {quizzes.map((q) => (
          <button
            key={q.id}
            className="btn"
            onClick={() => onPick(q.id)}
            style={{
              background: q.theme.color2,
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '24px 16px',
              borderTop: `8px solid ${q.theme.color}`,
            }}
          >
            <span style={{ fontSize: 48 }}>{q.theme.emoji}</span>
            <strong>{q.title}</strong>
            <small style={{ color: 'var(--muted)' }}>{q.subject}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
