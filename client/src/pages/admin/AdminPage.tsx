import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'
import { CategoryManager } from '@/pages/admin/CategoryManager'
import { QuizQuestionManager } from '@/pages/admin/QuizQuestionManager'

export function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Create categories, quizzes, and questions.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <CategoryManager
            categories={categories}
            onCreated={(category) => setCategories((prev) => [...prev, category])}
          />
          <QuizQuestionManager categories={categories} />
        </>
      )}
    </div>
  )
}
