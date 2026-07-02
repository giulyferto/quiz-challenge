import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { AttemptDetail } from '@/lib/types'

export function AttemptReviewPage() {
  const { id } = useParams<{ id: string }>()
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<AttemptDetail>(`/attempts/${id}`)
      .then(setAttempt)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground">Loading…</p>
  }
  if (!attempt) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-muted-foreground">Attempt not found.</p>
  }

  const answers = [...attempt.answers].sort((a, b) => a.question.order - b.question.order)
  const total = answers.length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <Link to="/attempts" className="text-sm text-muted-foreground hover:text-foreground">
          ← My attempts
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-medium">{attempt.quiz?.title}</h1>
          <Badge variant="secondary" className="text-sm">
            Score: {attempt.score} / {total}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {answers.map((answer, index) => (
          <Card key={answer.id}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <CardTitle className="text-base">
                {index + 1}. {answer.question.text}
              </CardTitle>
              {answer.isCorrect ? (
                <Badge variant="secondary" className="gap-1">
                  <Check className="size-3" /> Correct
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <X className="size-3" /> Incorrect
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {answer.question.options.map((option, i) => {
                const isCorrectOption = i === answer.question.correctAnswer
                const isSelectedOption = i === answer.selectedAnswer
                return (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg border p-3 text-sm',
                      isCorrectOption && 'border-primary bg-primary/5',
                      isSelectedOption && !isCorrectOption && 'border-destructive bg-destructive/5',
                    )}
                  >
                    {option}
                    {isCorrectOption && (
                      <span className="ml-2 text-xs text-muted-foreground">(correct answer)</span>
                    )}
                    {isSelectedOption && !isCorrectOption && (
                      <span className="ml-2 text-xs text-muted-foreground">(your answer)</span>
                    )}
                  </div>
                )
              })}
              {answer.question.explanation && (
                <p className="mt-1 text-sm text-muted-foreground">{answer.question.explanation}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
