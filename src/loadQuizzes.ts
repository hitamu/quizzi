import type { Quiz } from './quiz'

// Auto-discover mọi file quiz. Thêm 1 file .json vào src/quizzes/ là tự xuất hiện,
// không cần khai báo manifest. Xóa file -> tự biến mất.
const modules = import.meta.glob<Quiz>('./quizzes/*.json', { eager: true, import: 'default' })

export const quizzes: Quiz[] = Object.values(modules).sort((a, b) =>
  a.title.localeCompare(b.title, 'vi'),
)

export const getQuiz = (id: string) => quizzes.find((q) => q.id === id)
