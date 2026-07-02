import { Route, Routes } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { CategoryQuizzesPage } from '@/pages/CategoryQuizzesPage'
import { QuizAttemptPage } from '@/pages/QuizAttemptPage'
import { AttemptsPage } from '@/pages/AttemptsPage'
import { AttemptReviewPage } from '@/pages/AttemptReviewPage'

function App() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/categories/:id" element={<CategoryQuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizAttemptPage />} />
          <Route path="/attempts" element={<AttemptsPage />} />
          <Route path="/attempts/:id" element={<AttemptReviewPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
