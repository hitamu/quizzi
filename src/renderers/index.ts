import type { ComponentType } from 'react'
import type { Question } from '../quiz'
import { Select } from './Select'
import { DragDrop } from './DragDrop'

// Contract chung cho mọi renderer.
// - onReady(null): chưa đủ đáp án -> nút Kiểm tra bị khóa.
// - onReady(true/false): đã chọn/sắp/tô xong, kèm đúng/sai (Player giữ, chưa lộ cho bé).
// - checked: bé đã bấm Kiểm tra -> renderer khóa lại + hiện đáp án đúng.
export interface RendererProps<Q> {
  question: Q
  checked: boolean
  onReady: (correct: boolean | null) => void
}

// Map type -> renderer. Thêm kiểu mới = thêm 1 dòng ở đây + 1 file renderer.
export const renderers: Record<Question['type'], ComponentType<RendererProps<never>>> = {
  select: Select as ComponentType<RendererProps<never>>,
  dragdrop: DragDrop as ComponentType<RendererProps<never>>,
}
