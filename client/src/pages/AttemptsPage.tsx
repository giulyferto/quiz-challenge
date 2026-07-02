import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { Attempt } from '@/lib/types'

export function AttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Attempt[]>('/attempts')
      .then(setAttempts)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">My Attempts</h1>
        <p className="text-sm text-muted-foreground">Your quiz history and scores.</p>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && attempts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You haven't taken any quizzes yet. Pick a category to get started.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {attempts.map((attempt) => (
          <Link key={attempt.id} to={`/attempts/${attempt.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">{attempt.quiz?.title}</CardTitle>
                {attempt.finishedAt ? (
                  <Badge variant="secondary">Score: {attempt.score}</Badge>
                ) : (
                  <Badge variant="outline">In progress</Badge>
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Started {new Date(attempt.startedAt).toLocaleString()}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
