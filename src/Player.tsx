import { useEffect, useMemo, useRef, useState } from 'react'
import type { Quiz } from './quiz'
import { renderers } from './renderers'
import { addAttempt, attemptsFor, type Attempt } from './storage'

const fmt = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

export function Player({ quiz, name, onExit }: { quiz: Quiz; name: string; onExit: () => void }) {
  const [order, setOrder] = useState<number[]>(() => quiz.questions.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [ready, setReady] = useState(false)   // bé đã chọn/sắp/tô xong
  const [correct, setCorrect] = useState(false)
  const [checked, setChecked] = useState(false) // đã lộ kết quả
  const [step, setStep] = useState(0)          // key để remount renderer mỗi câu
  const [phase, setPhase] = useState<'play' | 'retry' | 'done'>('play')

  const wrongRef = useRef<number[]>([]) // các câu sai trong lượt hiện tại
  const mistakesRef = useRef(0)         // tổng số lần chọn sai (cả các lượt làm lại)
  const lastAttemptRef = useRef<Attempt | null>(null) // bản ghi vừa hoàn thành
  const startedAt = useRef(Date.now())
  const [now, setNow] = useState(Date.now())

  // Đồng hồ đếm lên, tính cả thời gian làm lại câu sai. Dừng khi hoàn thành.
  useEffect(() => {
    if (phase === 'done') return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  const elapsed = Math.round((now - startedAt.current) / 1000)

  const themeStyle = useMemo(
    () => ({ '--theme': quiz.theme.color, '--theme-2': quiz.theme.color2 }) as React.CSSProperties,
    [quiz],
  )

  const qIndex = order[pos]
  const question = quiz.questions[qIndex]
  const Renderer = renderers[question.type]
  const isLast = pos + 1 >= order.length

  function onReady(c: boolean | null) {
    if (checked) return
    if (c === null) setReady(false)
    else {
      setReady(true)
      setCorrect(c)
    }
  }

  // Bấm "Tiếp theo": lộ kết quả (và giữ nguyên để bé tự đọc).
  function reveal() {
    setChecked(true)
    if (!correct) {
      mistakesRef.current += 1
      if (!wrongRef.current.includes(qIndex)) wrongRef.current.push(qIndex)
    }
  }

  // Bấm "Câu sau": mới thật sự chuyển câu.
  function advance() {
    if (pos + 1 < order.length) {
      setPos(pos + 1)
      resetQuestion()
    } else if (wrongRef.current.length > 0) {
      setPhase('retry') // hết lượt, còn câu sai -> mời làm lại
    } else {
      // hoàn thành: lưu 1 bản ghi lịch sử (giữ lại để hiển thị dù storage lỗi)
      const a: Attempt = {
        name,
        quizId: quiz.id,
        title: quiz.title,
        date: Date.now(),
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        mistakes: mistakesRef.current,
      }
      lastAttemptRef.current = a
      addAttempt(a)
      setPhase('done')
    }
  }

  function resetQuestion() {
    setReady(false)
    setChecked(false)
    setCorrect(false)
    setStep((s) => s + 1)
  }

  function startRetry() {
    setOrder(wrongRef.current)
    wrongRef.current = []
    setPos(0)
    setPhase('play')
    resetQuestion()
  }

  if (phase === 'retry') {
    const n = wrongRef.current.length
    return (
      <div className="screen center" style={themeStyle}>
        <div style={{ fontSize: 88 }} className="pop">💪</div>
        <h1>Làm lại nào!</h1>
        <p>
          Còn <strong>{n}</strong> câu chưa đúng. Con thử lại nhé, con làm được mà! 🌟
        </p>
        <button className="btn btn-primary" onClick={startRetry}>
          Làm lại →
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const current = lastAttemptRef.current!
    const saved = attemptsFor(name, quiz.id)
    const history = saved.length ? saved : [current] // phòng khi storage bị chặn
    const prev = history[1] // lần trước (history[0] là lần này)
    const improved =
      prev && (current.durationSec < prev.durationSec || current.mistakes < prev.mistakes)
    const mistakeText = (m: number) => (m === 0 ? 'không sai lần nào 🌟' : `${m} lần sai`)

    return (
      <div className="screen center" style={themeStyle}>
        <div style={{ fontSize: 96 }} className="pop">{quiz.theme.emoji}</div>
        <h1>Hoàn thành!</h1>
        <p>
          Con làm xong <strong>{quiz.title}</strong> trong <strong>{fmt(current.durationSec)}</strong>,{' '}
          {mistakeText(current.mistakes)}. Tuyệt vời! 🌟
        </p>
        {improved && (
          <p className="pop" style={{ fontWeight: 800, color: 'var(--good)' }}>
            🎉 Con tiến bộ hơn lần trước rồi!
          </p>
        )}

        <div className="card" style={{ width: '100%', maxWidth: 420, padding: 16, textAlign: 'left' }}>
          <strong>📅 Các lần {name} đã làm</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {history.map((a, i) => (
              <div
                key={a.date}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: i === 0 ? 'var(--theme-2)' : '#f4f4f8',
                }}
              >
                <span>
                  {i === 0 ? '⭐ ' : ''}
                  {new Date(a.date).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  ⏱ {fmt(a.durationSec)} · {mistakeText(a.mistakes)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={onExit}>
          🏠 Về trang chính
        </button>
      </div>
    )
  }

  return (
    <div className="screen" style={themeStyle}>
      {/* thanh trên: thoát + progress dots + đồng hồ */}
      <div className="topbar">
        <button className="btn" onClick={onExit} aria-label="Về trang chính" style={{ padding: 12 }}>
          🏠
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          {order.map((_, i) => (
            <span
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: i < pos ? 'var(--good)' : i === pos ? 'var(--theme)' : '#e5e5ee',
              }}
            />
          ))}
        </div>
        <span className="timer" aria-label="Thời gian">⏱ {fmt(elapsed)}</span>
      </div>

      {/* đoạn văn đọc hiểu (nếu có) — giữ hiện suốt các câu */}
      {quiz.passage && (
        <div className="card passage">
          <p style={{ whiteSpace: 'pre-line' }}>{quiz.passage}</p>
        </div>
      )}

      {/* vùng câu hỏi căn giữa theo chiều dọc */}
      <div className="stage">
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h2 style={{ textAlign: 'center' }}>{question.prompt.text}</h2>
          {question.prompt.image && (
            <img
              src={question.prompt.image}
              alt=""
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', alignSelf: 'center' }}
            />
          )}
          {/* @ts-expect-error union được thu hẹp theo question.type tại runtime */}
          <Renderer question={question} checked={checked} onReady={onReady} key={step} />
        </div>

        {checked && (
          <div className="pop" style={{ textAlign: 'center', fontSize: 22, fontWeight: 700 }}>
            {correct ? '🎉 Đúng rồi! Giỏi quá!' : 'Chưa đúng — xem đáp án đúng nhé 👀'}
          </div>
        )}
      </div>

      {!checked ? (
        <button
          className="btn btn-primary"
          onClick={reveal}
          disabled={!ready}
          style={{ opacity: ready ? 1 : 0.5 }}
        >
          {ready ? 'Tiếp theo →' : 'Chọn đáp án nhé'}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={advance}>
          {isLast ? 'Xong →' : 'Câu sau →'}
        </button>
      )}
    </div>
  )
}
