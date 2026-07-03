import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ApiError, api } from '@/lib/api'
import type { Category } from '@/lib/types'

interface Errors {
  name?: string
}

function validate(name: string): Errors {
  const errors: Errors = {}
  const trimmed = name.trim()
  if (!trimmed) {
    errors.name = 'Name is required'
  } else if (trimmed.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  return errors
}

interface CategoryManagerProps {
  categories: Category[]
  onCreated: (category: Category) => void
  onDeleted: (id: string) => void
}

export function CategoryManager({ categories, onCreated, onDeleted }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validate(name)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setFormError(null)
    setSubmitting(true)
    try {
      const category = await api.post<Category>('/categories', {
        name: name.trim(),
        description: description.trim() || undefined,
      })
      onCreated(category)
      setName('')
      setDescription('')
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Topics</CardTitle>
        <CardDescription>
          Create a topic to group AI quizzes under, e.g. LLM Fundamentals, Prompt Engineering, AI
          Agents, AI Safety &amp; Ethics.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-description">Description (optional)</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? 'Creating…' : 'Create topic'}
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Existing topics</p>
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">No AI topics yet.</p>
          )}
          <div className="flex flex-col gap-1.5">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <Badge variant="secondary">{category.name}</Badge>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Delete ${category.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  }
                  title={`Delete "${category.name}"?`}
                  description={
                    <>
                      This will permanently delete the <strong>{category.name}</strong> topic,
                      every quiz in it, and every question in those quizzes. This can't be undone.
                    </>
                  }
                  onConfirm={async () => {
                    await api.del(`/categories/${category.id}`)
                    onDeleted(category.id)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
