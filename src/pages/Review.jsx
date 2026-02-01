import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ArrowLeft, Home, CheckCircle2, XCircle, GraduationCap } from 'lucide-react'
import QuestionCard from '../components/QuestionCard'
import { getAttemptResult } from '../services/supabaseClient'

/**
 * Review Page
 * Shows all questions with correct answers and explanations
 * Read-only mode for learning from mistakes
 */
export default function Review() {
  const navigate = useNavigate()
  const { attemptId } = useParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [filter, setFilter] = useState('all') // all, correct, incorrect
  const [error, setError] = useState('')

  useEffect(() => {
    loadReview()
  }, [attemptId])

  const loadReview = async () => {
    try {
      const data = await getAttemptResult(attemptId)
      setResult(data)
    } catch (err) {
      console.error('Failed to load review:', err)
      setError('Failed to load review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredQuestions = () => {
    if (!result) return []
    
    switch (filter) {
      case 'correct':
        return result.questions.filter(q => q.is_correct)
      case 'incorrect':
        return result.questions.filter(q => !q.is_correct && q.selected_option)
      default:
        return result.questions
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading review...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/exams')} className="btn-primary">
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  const filteredQuestions = getFilteredQuestions()
  const correctCount = result?.questions.filter(q => q.is_correct).length || 0
  const incorrectCount = result?.questions.filter(q => !q.is_correct && q.selected_option).length || 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => navigate(`/result/${attemptId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  Prime Scholar
                </h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/exams')}
              className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Home className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Bar */}
        <div className="card mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({result?.questions.length})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center gap-1 sm:gap-2 ${
                  filter === 'correct'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct ({correctCount})</span>
              </button>
              <button
                onClick={() => setFilter('incorrect')}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center gap-1 sm:gap-2 ${
                  filter === 'incorrect'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Incorrect ({incorrectCount})</span>
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 w-full sm:w-auto text-right">
              Score: {result?.attempt.score}/{result?.attempt.total_questions}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4 sm:space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No questions to display.</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={question.question_order}
                selectedOption={question.selected_option}
                isReviewMode={true}
                showCorrectAnswer={true}
              />
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(`/result/${attemptId}`)}
            className="btn-secondary text-sm sm:text-base"
          >
            Back to Results
          </button>
          <button
            onClick={() => navigate('/exams')}
            className="btn-primary text-sm sm:text-base"
          >
            Practice Another Subject
          </button>
        </div>
      </main>
    </div>
  )
}
