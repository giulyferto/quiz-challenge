import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { AttemptDetail } from '@/lib/types'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

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
    return <p className="mx-auto max-w-2xl px-4 py-8 font-mono text-sm text-muted-foreground">loading…</p>
  }
  if (!attempt) {
    return <p className="mx-auto max-w-2xl px-4 py-8 font-mono text-sm text-muted-foreground">attempt not found.</p>
  }

  const answers = [...attempt.answers].sort((a, b) => a.question.order - b.question.order)
  const total = answers.length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link
          to="/attempts"
          className="flex w-fit items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> my attempts
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{attempt.quiz?.title}</h1>
          <Badge variant="secondary" className="font-mono text-sm">
            {attempt.score} / {total}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {answers.map((answer, index) => (
          <Card key={answer.id}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">
                <span className="font-mono text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>{' '}
                {answer.question.text}
              </CardTitle>
              {answer.isCorrect ? (
                <Badge variant="success" className="gap-1">
                  <Check className="size-3" /> pass
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <X className="size-3" /> fail
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
                      'flex items-center gap-3 rounded-lg border p-3 text-sm',
                      isCorrectOption && 'border-success bg-success/10',
                      isSelectedOption && !isCorrectOption && 'border-destructive bg-destructive/10',
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-xs text-muted-foreground">
                      {OPTION_LETTERS[i] ?? i + 1}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCorrectOption && (
                      <span className="font-mono text-xs text-muted-foreground">correct</span>
                    )}
                    {isSelectedOption && !isCorrectOption && (
                      <span className="font-mono text-xs text-muted-foreground">your answer</span>
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
