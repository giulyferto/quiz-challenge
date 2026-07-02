import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    return <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted-foreground">Loading…</p>
  }

  if (!category) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted-foreground">
        Category not found.
      </p>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← All categories
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-medium">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.quizzes.length === 0 && (
        <p className="text-sm text-muted-foreground">No quizzes in this category yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {category.quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild>
                <Link to={`/quizzes/${quiz.id}`}>Start quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
