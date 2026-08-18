// Hợp đồng chung cho mọi quiz. Mỗi quiz là 1 file JSON trong src/quizzes/.
// Thêm/xóa file không ảnh hưởng quiz khác. Kiểu tương tác mới = thêm 1 nhánh + 1 renderer.

export interface Theme {
  color: string   // màu chủ đạo
  color2: string  // màu phụ
  emoji: string   // biểu tượng vui của quiz
}

// Đề bài: chữ (trẻ tự đọc) + hình tùy chọn
export interface Prompt {
  text: string
  image?: string
}

// 1) Chọn đáp án
export interface SelectQuestion {
  type: 'select'
  prompt: Prompt
  options: { label: string; correct?: boolean }[]
}

// 2) Kéo-thả: kéo mỗi item vào target đúng (match theo id)
export interface DragDropQuestion {
  type: 'dragdrop'
  prompt: Prompt
  items: { id: string; label: string }[]
  targets: { id: string; label: string; accepts: string }[] // accepts = item.id đúng
}

export type Question = SelectQuestion | DragDropQuestion

export interface Quiz {
  id: string
  title: string
  subject: string
  theme: Theme
  passage?: string   // (tùy chọn) đoạn văn đọc hiểu, hiện suốt các câu để bé đọc lại
  questions: Question[]
}
