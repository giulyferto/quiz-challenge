import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, api } from '@/lib/api'
import type { Category, QuizDetail, QuizSummary } from '@/lib/types'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

interface QuizFormErrors {
  title?: string
  categoryId?: string
}

interface QuestionFormErrors {
  text?: string
  options?: string
  correctAnswer?: string
}

function validateQuizForm(title: string, categoryId: string): QuizFormErrors {
  const errors: QuizFormErrors = {}
  if (!title.trim()) errors.title = 'Title is required'
  if (!categoryId) errors.categoryId = 'Pick an AI topic'
  return errors
}

function validateQuestionForm(
  text: string,
  options: string[],
  correctAnswer: string,
): QuestionFormErrors {
  const errors: QuestionFormErrors = {}
  if (!text.trim()) errors.text = 'Question text is required'
  if (options.some((o) => !o.trim())) {
    errors.options = 'Every option must have text — remove unused option fields instead of leaving them blank'
  }
  if (correctAnswer === '') errors.correctAnswer = 'Select the correct answer'
  return errors
}

interface QuizQuestionManagerProps {
  categories: Category[]
}

export function QuizQuestionManager({ categories }: QuizQuestionManagerProps) {
  const [categoryId, setCategoryId] = useState('')
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)

  const [quizId, setQuizId] = useState('')
  const [quizDetail, setQuizDetail] = useState<QuizDetail | null>(null)
  const [loadingQuizDetail, setLoadingQuizDetail] = useState(false)

  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizErrors, setQuizErrors] = useState<QuizFormErrors>({})
  const [quizFormError, setQuizFormError] = useState<string | null>(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)

  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [questionErrors, setQuestionErrors] = useState<QuestionFormErrors>({})
  const [questionFormError, setQuestionFormError] = useState<string | null>(null)
  const [questionSubmitting, setQuestionSubmitting] = useState(false)

  useEffect(() => {
    setQuizId('')
    setQuizDetail(null)
    if (!categoryId) {
      setQuizzes([])
      return
    }
    setLoadingQuizzes(true)
    api
      .get<QuizSummary[]>(`/quizzes?categoryId=${categoryId}`)
      .then(setQuizzes)
      .finally(() => setLoadingQuizzes(false))
  }, [categoryId])

  useEffect(() => {
    if (!quizId) {
      setQuizDetail(null)
      return
    }
    setLoadingQuizDetail(true)
    api
      .get<QuizDetail>(`/quizzes/${quizId}`)
      .then(setQuizDetail)
      .finally(() => setLoadingQuizDetail(false))
  }, [quizId])

  function resetQuestionForm() {
    setQuestionText('')
    setOptions(['', ''])
    setCorrectAnswer('')
    setExplanation('')
    setQuestionErrors({})
  }

  async function handleCreateQuiz(e: FormEvent) {
    e.preventDefault()
    const validationErrors = validateQuizForm(quizTitle, categoryId)
    setQuizErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setQuizFormError(null)
    setQuizSubmitting(true)
    try {
      const quiz = await api.post<QuizDetail>('/quizzes', {
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        categoryId,
      })
      setQuizzes((prev) => [{ ...quiz }, ...prev])
      setQuizDetail({ ...quiz, questions: quiz.questions ?? [] })
      setQuizId(quiz.id)
      setQuizTitle('')
      setQuizDescription('')
    } catch (err) {
      setQuizFormError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setQuizSubmitting(false)
    }
  }

  function addOption() {
    setOptions((opts) => (opts.length < MAX_OPTIONS ? [...opts, ''] : opts))
  }

  function removeOption(index: number) {
    if (options.length <= MIN_OPTIONS) return
    setOptions((opts) => opts.filter((_, i) => i !== index))
    setCorrectAnswer((prev) => {
      if (prev === '') return prev
      const prevIndex = Number(prev)
      if (prevIndex === index) return ''
      if (prevIndex > index) return String(prevIndex - 1)
      return prev
    })
  }

  function updateOption(index: number, value: string) {
    setOptions((opts) => opts.map((o, i) => (i === index ? value : o)))
  }

  async function handleAddQuestion(e: FormEvent) {
    e.preventDefault()
    if (!quizDetail) return
    const validationErrors = validateQuestionForm(questionText, options, correctAnswer)
    setQuestionErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setQuestionFormError(null)
    setQuestionSubmitting(true)
    try {
      const question = await api.post<QuizDetail['questions'][number]>(
        `/quizzes/${quizDetail.id}/questions`,
        {
          text: questionText.trim(),
          options: options.map((o) => o.trim()),
          correctAnswer: Number(correctAnswer),
          explanation: explanation.trim() || undefined,
          order: quizDetail.questions.length,
        },
      )
      setQuizDetail((quiz) => (quiz ? { ...quiz, questions: [...quiz.questions, question] } : quiz))
      resetQuestionForm()
    } catch (err) {
      setQuestionFormError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setQuestionSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
          <CardDescription>Pick an AI topic, then select or create a quiz.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create an AI topic first.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category-select">AI Topic</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category-select" className="w-full">
                  <SelectValue placeholder="Select an AI topic" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {categoryId && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quiz-select">Existing quiz</Label>
                <Select value={quizId} onValueChange={setQuizId} disabled={loadingQuizzes}>
                  <SelectTrigger id="quiz-select" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingQuizzes
                          ? 'Loading…'
                          : quizzes.length === 0
                            ? 'No quizzes yet in this topic'
                            : 'Select a quiz'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <form className="flex flex-col gap-3 border-t pt-4" onSubmit={handleCreateQuiz} noValidate>
                <p className="text-sm font-medium">Or create a new quiz</p>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quiz-title">Title</Label>
                  <Input
                    id="quiz-title"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    aria-invalid={!!quizErrors.title}
                  />
                  {quizErrors.title && <p className="text-sm text-destructive">{quizErrors.title}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quiz-description">Description (optional)</Label>
                  <Textarea
                    id="quiz-description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                  />
                </div>
                {quizFormError && <p className="text-sm text-destructive">{quizFormError}</p>}
                <Button type="submit" variant="outline" disabled={quizSubmitting} className="self-start">
                  {quizSubmitting ? 'Creating…' : 'Create quiz'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {loadingQuizDetail && (
        <p className="text-sm text-muted-foreground">Loading quiz…</p>
      )}

      {quizDetail && !loadingQuizDetail && (
        <Card>
          <CardHeader>
            <CardTitle>{quizDetail.title}</CardTitle>
            <CardDescription>
              {quizDetail.questions.length} question{quizDetail.questions.length === 1 ? '' : 's'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {quizDetail.questions.length > 0 && (
              <div className="flex flex-col gap-2">
                {quizDetail.questions.map((q, i) => (
                  <div key={q.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {i + 1}. {q.text}
                    </p>
                    <ul className="mt-1 flex flex-col gap-0.5 text-muted-foreground">
                      {q.options.map((option, oi) => (
                        <li key={oi} className={oi === q.correctAnswer ? 'font-medium text-foreground' : ''}>
                          {oi === q.correctAnswer ? '✓ ' : '– '}
                          {option}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form className="flex flex-col gap-4 border-t pt-4" onSubmit={handleAddQuestion} noValidate>
              <p className="text-sm font-medium">Add a question</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="question-text">Question</Label>
                <Textarea
                  id="question-text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  aria-invalid={!!questionErrors.text}
                />
                {questionErrors.text && (
                  <p className="text-sm text-destructive">{questionErrors.text}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Options — select the correct answer</Label>
                <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
                  {options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <RadioGroupItem value={String(i)} id={`correct-${i}`} />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1"
                      />
                      {options.length > MIN_OPTIONS && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove option ${i + 1}`}
                          onClick={() => removeOption(i)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                {options.length < MAX_OPTIONS && (
                  <Button type="button" variant="outline" size="sm" className="self-start" onClick={addOption}>
                    Add option
                  </Button>
                )}
                {questionErrors.options && (
                  <p className="text-sm text-destructive">{questionErrors.options}</p>
                )}
                {questionErrors.correctAnswer && (
                  <p className="text-sm text-destructive">{questionErrors.correctAnswer}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="question-explanation">Explanation (optional)</Label>
                <Textarea
                  id="question-explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Shown to players after they answer"
                />
              </div>

              {questionFormError && (
                <p className="text-sm text-destructive">{questionFormError}</p>
              )}
              <Button type="submit" disabled={questionSubmitting} className="self-start">
                {questionSubmitting ? 'Adding…' : 'Add question'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
