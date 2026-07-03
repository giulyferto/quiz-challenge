import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
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
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">// run log</span>
        <h1 className="font-heading text-3xl font-medium tracking-tight">My attempts</h1>
        <p className="text-sm text-muted-foreground">Every quiz you've run, with its result.</p>
      </div>

      {loading && <p className="font-mono text-sm text-muted-foreground">loading…</p>}
      {!loading && attempts.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">
          no attempts yet — pick a category to run your first quiz.
        </p>
      )}

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
        {attempts.map((attempt) => (
          <Link
            key={attempt.id}
            to={`/attempts/${attempt.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-accent/40"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{attempt.quiz?.title}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(attempt.startedAt).toLocaleString()}
              </span>
            </div>
            {attempt.finishedAt ? (
              <Badge variant="secondary" className="font-mono">
                {attempt.score}
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono">
                in progress
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
