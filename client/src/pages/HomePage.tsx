import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'

export function HomePage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">
          // pick an AI topic
        </span>
        <h1 className="font-heading text-3xl font-medium tracking-tight text-balance">
          How well do you actually know AI?
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          This is an AI-knowledge testing ground — every quiz here covers AI concepts, models, and
          agents. Answer, get scored, see exactly where it broke.
        </p>
      </div>

      {!user && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/25 bg-accent/60 px-4 py-3">
          <p className="text-sm text-accent-foreground">
            You can run any quiz as a guest. Log in to persist your results across sessions.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <p className="font-mono text-sm text-muted-foreground">loading categories…</p>
      )}

      {!loading && categories.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">no AI topics yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const count = category._count?.quizzes ?? 0
          return (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group flex flex-col justify-between gap-6 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="font-heading text-lg font-medium">{category.name}</h2>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  {count} quiz{count === 1 ? '' : 'zes'} available
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
