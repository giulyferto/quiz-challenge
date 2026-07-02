import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Attempt, QuizDetail } from '@/lib/types'

interface Feedback {
  isCorrect: boolean
  correctAnswer: number
  explanation?: string | null
}

interface QuestionResult {
  questionId: string
  isCorrect: boolean
}

function performanceFeedback(percentage: number): { label: string; message: string } {
  if (percentage >= 80) {
    return { label: 'Excellent', message: 'Excellent! You really know this material.' }
  }
  if (percentage >= 50) {
    return { label: 'Keep practicing', message: 'Good effort — keep practicing to sharpen these skills.' }
  }
  return { label: 'Needs review', message: 'Needs review — consider going through the material again.' }
}

export function QuizAttemptPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [quiz, setQuiz] = useState<QuizDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  // Radix's RadioGroup must stay controlled for its whole lifetime, so "no
  // selection yet" is represented as '' rather than undefined — switching
  // between a string and undefined flips it to uncontrolled and it stops
  // picking up further selections.
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [results, setResults] = useState<QuestionResult[]>([])
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

  async function startQuiz() {
    if (!quiz) return
    if (user) {
      const created = await api.post<Attempt>('/attempts', { quizId: quiz.id })
      setAttempt(created)
    } else {
      setAttempt(null)
    }
    setCurrentIndex(0)
    setSelected('')
    setFeedback(null)
    setResults([])
    setFinished(false)
    setStarted(true)
  }

  async function checkAnswer() {
    if (!quiz || selected === '') return
    setSubmitting(true)
    try {
      const question = quiz.questions[currentIndex]
      const selectedAnswer = Number(selected)
      const result =
        user && attempt
          ? await api.post<Feedback>(`/attempts/${attempt.id}/answers`, {
              questionId: question.id,
              selectedAnswer,
            })
          : await api.post<Feedback>(`/quizzes/${quiz.id}/questions/${question.id}/check`, {
              selectedAnswer,
            })
      setFeedback(result)
      setResults((r) => [...r, { questionId: question.id, isCorrect: result.isCorrect }])
    } finally {
      setSubmitting(false)
    }
  }

  async function nextQuestion() {
    if (!quiz) return
    const isLast = currentIndex === quiz.questions.length - 1
    if (isLast) {
      if (user && attempt) {
        await api.post(`/attempts/${attempt.id}/finish`)
      }
      setFinished(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelected('')
    setFeedback(null)
  }

  if (!started) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
            </p>
            {!user && (
              <p className="mt-2">
                You're playing as a guest — your score won't be saved.{' '}
                <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                  Log in
                </Link>{' '}
                or{' '}
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                  register
                </Link>{' '}
                to track your attempts.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={startQuiz}>Start quiz</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (finished) {
    const total = quiz.questions.length
    const correctCount = results.filter((r) => r.isCorrect).length
    const percentage = Math.round((correctCount / total) * 100)
    const { label, message } = performanceFeedback(percentage)
    const badgeVariant = percentage >= 80 ? 'secondary' : percentage >= 50 ? 'outline' : 'destructive'

    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz complete!</CardTitle>
            <CardDescription>{quiz.title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-heading text-4xl font-medium">{percentage}%</p>
            <p className="text-sm text-muted-foreground">
              {correctCount} out of {total} correct
            </p>
            <Badge variant={badgeVariant}>{label}</Badge>
            <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
            {!user && (
              <p className="max-w-sm text-sm text-muted-foreground">
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                  Create an account
                </Link>{' '}
                to save your results and track progress over time.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={startQuiz}>Retake quiz</Button>
            {user && attempt && (
              <Button variant="outline" asChild>
                <Link to={`/attempts/${attempt.id}`}>View full review</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentIndex]
  const progress = ((currentIndex + (feedback ? 1 : 0)) / quiz.questions.length) * 100
  const isLast = currentIndex === quiz.questions.length - 1
  const selectedIndex = selected !== '' ? Number(selected) : undefined

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
        <CardContent className="flex flex-col gap-3">
          <RadioGroup value={selected} onValueChange={setSelected} disabled={!!feedback}>
            {question.options.map((option, i) => {
              const isCorrectOption = feedback && i === feedback.correctAnswer
              const isWrongSelection = feedback && !feedback.isCorrect && i === selectedIndex
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border p-3',
                    isCorrectOption && 'border-primary bg-primary/5',
                    isWrongSelection && 'border-destructive bg-destructive/5',
                  )}
                >
                  <RadioGroupItem value={String(i)} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          {feedback && (
            <div
              className={cn(
                'flex items-start gap-2 rounded-lg border p-3 text-sm',
                feedback.isCorrect ? 'border-primary bg-primary/5' : 'border-destructive bg-destructive/5',
              )}
            >
              {feedback.isCorrect ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  {feedback.isCorrect ? 'Correct! Nice work.' : 'Not quite — keep going.'}
                </p>
                {feedback.explanation && (
                  <p className="mt-1 text-muted-foreground">{feedback.explanation}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {feedback ? (
            <Button onClick={nextQuestion}>{isLast ? 'See results' : 'Next question'}</Button>
          ) : (
            <Button onClick={checkAnswer} disabled={selected === '' || submitting}>
              {submitting ? 'Checking…' : 'Check answer'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
