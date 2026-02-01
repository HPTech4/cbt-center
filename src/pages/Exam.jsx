import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Send, AlertCircle, Check } from 'lucide-react'
import Timer from '../components/Timer'
import QuestionCard from '../components/QuestionCard'
import { getAttemptWithQuestions, saveAnswer, submitAttempt } from '../services/supabaseClient'

/**
 * Exam Page
 * Main exam interface with timer, questions, and navigation
 * Handles answer submission and auto-submit on time up
 */
export default function Exam() {
  const navigate = useNavigate()
  const { attemptId } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [attempt, setAttempt] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    loadExam()
  }, [attemptId])

  const loadExam = async () => {
    try {
      const data = await getAttemptWithQuestions(attemptId)
      
      // Check if already submitted
      if (data.attempt.submitted_at) {
        navigate(`/result/${attemptId}`)
        return
      }

      setAttempt(data.attempt)
      setQuestions(data.questions)

      // Load existing answers
      const answersMap = {}
      data.questions.forEach((q) => {
        if (q.selected_option) {
          answersMap[q.id] = q.selected_option
        }
      })
      setAnswers(answersMap)
    } catch (err) {
      console.error('Failed to load exam:', err)
      setError('Failed to load exam. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = async (option) => {
    const currentQuestion = questions[currentQuestionIndex]
    const questionId = currentQuestion.id

    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }))

    // Save to database
    try {
      await saveAnswer(attemptId, questionId, option)
    } catch (err) {
      console.error('Failed to save answer:', err)
      // Don't show error to user, answer is still in local state
    }
  }

  const handleTimeUp = useCallback(async () => {
    // Auto-submit when time runs out
    await handleSubmitExam(true)
  }, [])

  const handleSubmitExam = async (autoSubmit = false) => {
    setSubmitting(true)
    setError('')

    try {
      await submitAttempt(attemptId)
      navigate(`/result/${attemptId}`)
    } catch (err) {
      console.error('Failed to submit exam:', err)
      setError('Failed to submit exam. Please try again.')
      setSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleQuestionNavigate = (index) => {
    setCurrentQuestionIndex(index)
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading exam...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {attempt?.subjects?.name}
                </h1>
                <p className="text-sm text-slate-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  Answered: {getAnsweredCount()}/{questions.length}
                </span>
              </div>
              <Timer
                attemptId={attemptId}
                initialSeconds={attempt?.time_remaining_seconds || 0}
                onTimeUp={handleTimeUp}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              selectedOption={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionNavigate(index)}
                    className={`w-full aspect-square rounded-lg font-medium text-sm transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Submit Exam?
                </h3>
                <p className="text-slate-600 text-sm">
                  You have answered {getAnsweredCount()} out of {questions.length} questions.
                  Once submitted, you cannot change your answers.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
