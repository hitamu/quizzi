// Lưu tên người chơi + lịch sử làm bài trong localStorage (không backend).

const NAME_KEY = 'quizzi.name'
const HIST_KEY = 'quizzi.history'

export interface Attempt {
  name: string
  quizId: string
  title: string
  date: number       // Date.now()
  durationSec: number
  mistakes: number   // tổng số lần chọn sai (kể cả các lượt làm lại)
}

export function getName(): string | null {
  try {
    return localStorage.getItem(NAME_KEY)
  } catch {
    return null
  }
}

export function setName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name)
  } catch {
    /* bỏ qua nếu trình duyệt chặn localStorage */
  }
}

export function getHistory(): Attempt[] {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || '[]')
  } catch {
    return []
  }
}

export function addAttempt(a: Attempt) {
  try {
    const all = getHistory()
    all.push(a)
    localStorage.setItem(HIST_KEY, JSON.stringify(all))
  } catch {
    /* bỏ qua */
  }
}

// Các lần đã làm của 1 bạn cho 1 quiz, mới nhất lên đầu.
export function attemptsFor(name: string, quizId: string): Attempt[] {
  return getHistory()
    .filter((a) => a.name === name && a.quizId === quizId)
    .sort((x, y) => y.date - x.date)
}
