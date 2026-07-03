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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-primary">// admin</span>
        <h1 className="font-heading text-3xl font-medium tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Create AI topics, quizzes, and questions that test AI knowledge.
        </p>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted-foreground">loading…</p>
      ) : (
        <>
          <CategoryManager
            categories={categories}
            onCreated={(category) => setCategories((prev) => [...prev, category])}
            onDeleted={(id) => setCategories((prev) => prev.filter((c) => c.id !== id))}
          />
          <QuizQuestionManager categories={categories} />
        </>
      )}
    </div>
  )
}
