import { useState } from 'react'
import { quizzes } from './loadQuizzes'
import { Gallery } from './Gallery'
import { Player } from './Player'
import { NamePrompt } from './NamePrompt'
import { getName, setName as saveName } from './storage'

export function App() {
  const [name, setName] = useState<string | null>(getName())
  const [playingId, setPlayingId] = useState<string | null>(null)

  // Chưa có tên -> hỏi tên trước.
  if (!name) {
    return (
      <NamePrompt
        onSubmit={(n) => {
          saveName(n)
          setName(n)
        }}
      />
    )
  }

  const quiz = quizzes.find((q) => q.id === playingId)
  if (quiz) return <Player quiz={quiz} name={name} onExit={() => setPlayingId(null)} />
  return (
    <Gallery quizzes={quizzes} name={name} onPick={setPlayingId} onChangeName={() => setName(null)} />
  )
}
