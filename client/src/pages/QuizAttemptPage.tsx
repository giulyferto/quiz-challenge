import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import type { Attempt, QuizDetail } from '@/lib/types'

export function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get<QuizDetail>(`/quizzes/${id}`)
      .then(setQuiz)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground">Loading…</p>
  }
  if (!quiz) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground">Quiz not found.</p>
  }

  async function startAttempt() {
    if (!quiz) return
    const created = await api.post<Attempt>('/attempts', { quizId: quiz.id })
    setAttempt(created)
  }

  async function submitAnswer() {
    if (!quiz || !attempt || selected === undefined) return
    setSubmitting(true)
    try {
      const question = quiz.questions[currentIndex]
      await api.post(`/attempts/${attempt.id}/answers`, {
        questionId: question.id,
        selectedAnswer: Number(selected),
      })

      const isLast = currentIndex === quiz.questions.length - 1
      if (isLast) {
        await api.post(`/attempts/${attempt.id}/finish`)
        navigate(`/attempts/${attempt.id}`)
        return
      }
      setCurrentIndex((i) => i + 1)
      setSelected(undefined)
    } finally {
      setSubmitting(false)
    }
  }

  if (!attempt) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
          </CardContent>
          <CardFooter>
            <Button onClick={startAttempt}>Start attempt</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentIndex]
  const progress = (currentIndex / quiz.questions.length) * 100
  const isLast = currentIndex === quiz.questions.length - 1

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{question.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selected} onValueChange={setSelected}>
            {question.options.map((option, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem value={String(i)} id={`option-${i}`} />
                <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={submitAnswer} disabled={selected === undefined || submitting}>
            {submitting ? 'Saving…' : isLast ? 'Finish quiz' : 'Next question'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
