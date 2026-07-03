import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Category, QuizSummary } from '@/lib/types'

interface CategoryWithQuizzes extends Category {
  quizzes: QuizSummary[]
}

export function CategoryQuizzesPage() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState<CategoryWithQuizzes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<CategoryWithQuizzes>(`/categories/${id}`)
      .then(setCategory)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-8 font-mono text-sm text-muted-foreground">loading…</p>
  }

  if (!category) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-8 font-mono text-sm text-muted-foreground">
        category not found.
      </p>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="flex w-fit items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> all categories
        </Link>
        <h1 className="font-heading text-3xl font-medium tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.quizzes.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">no quizzes in this category yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {category.quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            to={`/quizzes/${quiz.id}`}
            className="group flex flex-col justify-between gap-6 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-lg font-medium">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">start quiz</span>
              <ArrowRight className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
