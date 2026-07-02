export type Role = 'ADMIN' | 'PLAYER'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

export interface Category {
  id: string
  name: string
  description?: string | null
  _count?: { quizzes: number }
}

export interface QuizSummary {
  id: string
  title: string
  description?: string | null
  categoryId: string
  category?: Category
  _count?: { questions: number }
}

export interface Question {
  id: string
  text: string
  options: string[]
  order: number
  correctAnswer?: number
  explanation?: string | null
}

export interface QuizDetail extends QuizSummary {
  questions: Question[]
}

export interface Attempt {
  id: string
  score: number
  startedAt: string
  finishedAt: string | null
  quizId: string
  userId: string
  quiz?: { id: string; title: string }
}

export interface AttemptAnswer {
  id: string
  selectedAnswer: number
  isCorrect: boolean
  questionId: string
  question: Question
}

export interface AttemptDetail extends Attempt {
  answers: AttemptAnswer[]
}
