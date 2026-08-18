import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { DragDropQuestion } from '../quiz'
import type { RendererProps } from './index'

const TRAY = 'tray'

export function DragDrop({ question, checked, onReady }: RendererProps<DragDropQuestion>) {
  // placement: itemId -> targetId | 'tray'
  const [place, setPlace] = useState<Record<string, string>>(
    () => Object.fromEntries(question.items.map((it) => [it.id, TRAY])),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  )

  function onDragEnd(e: DragEndEvent) {
    if (checked || !e.over) return
    const itemId = String(e.active.id)
    const dest = String(e.over.id)
    const nextPlace = { ...place }
    // 1 item / target: đẩy item cũ ở target về tray
    if (dest !== TRAY) {
      for (const [id, loc] of Object.entries(nextPlace)) {
        if (loc === dest && id !== itemId) nextPlace[id] = TRAY
      }
    }
    nextPlace[itemId] = dest
    setPlace(nextPlace)

    // đủ item ở mọi target -> báo sẵn sàng kiểm tra (chưa lộ đúng/sai)
    const filled = question.targets.every((t) => Object.values(nextPlace).includes(t.id))
    if (filled) {
      const allRight = question.targets.every((t) => {
        const itemHere = Object.keys(nextPlace).find((id) => nextPlace[id] === t.id)
        return itemHere === t.accepts
      })
      onReady(allRight)
    } else {
      onReady(null)
    }
  }

  // Khi đã Kiểm tra: hiện đáp án ĐÚNG (snap mỗi item về target của nó).
  // Bắt đầu từ mọi item ở tray rồi mới snap item đúng vào target -> item thừa (distractor) vẫn hiện ở khay.
  const view = checked
    ? {
        ...Object.fromEntries(question.items.map((it) => [it.id, TRAY])),
        ...Object.fromEntries(question.targets.map((t) => [t.accepts, t.id])),
      }
    : place
  const trayItems = question.items.filter((it) => view[it.id] === TRAY)

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {/* các ô đích */}
      <div className="grid" style={{ marginBottom: 16 }}>
        {question.targets.map((t) => {
          const itemId = Object.keys(view).find((id) => view[id] === t.id)
          const item = question.items.find((it) => it.id === itemId)
          return (
            <Target key={t.id} id={t.id} label={t.label} checked={checked}>
              {item && <Chip id={item.id} label={item.label} disabled={checked} />}
            </Target>
          )
        })}
      </div>

      {/* khay chứa item chưa đặt */}
      <Tray>
        {trayItems.map((it) => (
          <Chip key={it.id} id={it.id} label={it.label} disabled={checked} />
        ))}
      </Tray>
    </DndContext>
  )
}

function Chip({ id, label, disabled }: { id: string; label: string; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, disabled })
  return (
    <button
      ref={setNodeRef}
      className="btn"
      {...listeners}
      {...attributes}
      style={{
        background: 'var(--theme-2)',
        touchAction: 'none',
        fontSize: 44,
        lineHeight: 1,
        padding: '10px 18px',
        opacity: isDragging ? 0.5 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
    >
      {label}
    </button>
  )
}

function Target({
  id,
  label,
  checked,
  children,
}: {
  id: string
  label: string
  checked: boolean
  children?: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: checked })
  const border = checked ? 'var(--good)' : isOver ? 'var(--theme)' : '#d5d5e0'
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 88,
        border: `3px ${checked ? 'solid' : 'dashed'} ${border}`,
        borderRadius: 'var(--radius)',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: 'var(--surface)',
      }}
    >
      <small style={{ color: 'var(--muted)' }}>{label}</small>
      {children}
    </div>
  )
}

function Tray({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: TRAY })
  return (
    <div
      ref={setNodeRef}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', minHeight: 72 }}
    >
      {children}
    </div>
  )
}
