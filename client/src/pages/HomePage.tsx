import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">Quiz Categories</h1>
        <p className="text-sm text-muted-foreground">Pick a category to see its quizzes.</p>
      </div>

      {!user && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              You can play any quiz as a guest. Log in or register to save your attempts and
              track your progress over time.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading categories…</p>}

      {!loading && categories.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Link key={category.id} to={`/categories/${category.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                {category.description && (
                  <CardDescription>{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {category._count?.quizzes ?? 0} quiz
                {category._count?.quizzes === 1 ? '' : 'es'}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
