import { useState } from 'react'

// Hỏi tên khi chưa có. Không có tên thì chưa vào chơi được.
export function NamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [value, setValue] = useState('')
  const name = value.trim()

  function submit() {
    if (name) onSubmit(name)
  }

  return (
    <div className="screen center">
      <div style={{ fontSize: 72 }} className="pop">👋</div>
      <h1>Con tên là gì?</h1>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Nhập tên của con"
        autoFocus
        maxLength={20}
      />
      <button className="btn btn-primary" onClick={submit} disabled={!name} style={{ opacity: name ? 1 : 0.5 }}>
        Bắt đầu →
      </button>
    </div>
  )
}
