import { useState } from 'react'
import type { SelectQuestion } from '../quiz'
import type { RendererProps } from './index'

export function Select({ question, checked, onReady }: RendererProps<SelectQuestion>) {
  const [picked, setPicked] = useState<number | null>(null)

  function choose(i: number) {
    if (checked) return
    setPicked(i)
    onReady(!!question.options[i].correct)
  }

  return (
    <div className="grid">
      {question.options.map((opt, i) => {
        const isPicked = picked === i
        let bg = 'var(--surface)'
        let color = 'var(--ink)'
        let mark = ''
        if (checked) {
          if (opt.correct) {
            bg = 'var(--good)' // đáp án đúng luôn hiện xanh + ✓
            color = '#fff'
            mark = ' ✓'
          } else if (isPicked) {
            bg = '#e74c3c' // bé chọn sai -> đỏ + ✗
            color = '#fff'
            mark = ' ✗'
          }
        } else if (isPicked) {
          bg = 'var(--theme-2)' // đang chọn (chưa lộ kết quả)
        }
        return (
          <button
            key={i}
            className="btn"
            onClick={() => choose(i)}
            disabled={checked}
            style={{ background: bg, color, minHeight: 96, fontSize: 26, fontWeight: 800 }}
          >
            {opt.label}
            {mark}
          </button>
        )
      })}
    </div>
  )
}
