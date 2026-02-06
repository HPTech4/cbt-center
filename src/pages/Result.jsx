import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trophy, Target, CheckCircle2, XCircle, Eye, Home, GraduationCap } from 'lucide-react'
import { getAttemptResult } from '../services/supabaseClient'

/**
 * Result Page
 * Shows exam score and performance summary
 * Provides button to view detailed review
 */
export default function Result() {
  const navigate = useNavigate()
  const { attemptId } = useParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResult()
  }, [attemptId])

  const loadResult = async () => {
    try {
      const data = await getAttemptResult(attemptId)
      console.log('Result data:', data)
      console.log('Score:', data.attempt.score)
      console.log('Total questions:', data.attempt.total_questions)
      console.log('Calculated percentage:', Math.round((data.attempt.score / data.attempt.total_questions) * 100))
      setResult(data)
    } catch (err) {
      console.error('Failed to load result:', err)
      setError('Failed to load result. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPercentage = () => {
    if (!result) return 0
    return Math.round((result.attempt.score / result.attempt.total_questions) * 100)
  }

  const getGrade = () => {
    const percentage = getPercentage()
    if (percentage >= 75) return { grade: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage >= 60) return { grade: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (percentage >= 50) return { grade: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { grade: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
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

  const gradeInfo = getGrade()
  const percentage = getPercentage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Prime Scholar</h1>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-blue-600 rounded-full mb-4 sm:mb-6 animate-bounce">
            <Trophy className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
            Exam Completed!
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            {result?.attempt.subjects?.name}
          </p>
        </div>

        {/* Score Card */}
        <div className="card mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-blue-50 border-4 sm:border-8 border-blue-100 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-bold text-blue-600">
                  {percentage}%
                </div>
              </div>
            </div>
            <div className={`inline-block px-4 sm:px-6 py-2 rounded-full ${gradeInfo.bg}`}>
              <span className={`text-base sm:text-lg font-semibold ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-1">
                {result?.attempt.score}
              </div>
              <div className="text-xs sm:text-sm text-green-600 font-medium">
                Correct Answers
              </div>
            </div>

            <div className="text-center p-4 sm:p-6 bg-red-50 rounded-xl">
              <XCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-red-700 mb-1">
                {result?.attempt.total_questions - result?.attempt.score}
              </div>
              <div className="text-xs sm:text-sm text-red-600 font-medium">
                Wrong Answers
              </div>
            </div>

            <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-xl">
              <Target className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 mx-auto mb-2 sm:mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 mb-1">
                {result?.attempt.total_questions}
              </div>
              <div className="text-xs sm:text-sm text-blue-600 font-medium">
                Total Questions
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(`/review/${attemptId}`)}
            className="btn-primary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base"
          >
            <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="font-semibold">View Corrections</span>
          </button>
          <button
            onClick={() => navigate('/exams')}
            className="btn-secondary flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 text-sm sm:text-base"
          >
            <Home className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>

        {/* Performance Tips */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 sm:mb-4 text-base sm:text-lg">
            {percentage >= 75 ? '🎉 Outstanding Performance!' : 
             percentage >= 60 ? '👏 Good Job!' : 
             percentage >= 50 ? '💪 Keep Practicing!' : 
             '📚 Don\'t Give Up!'}
          </h3>
          <p className="text-blue-800 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
            {percentage >= 75 
              ? 'Excellent work! You have a strong understanding of this subject. Keep up the great work and maintain this level of preparation.'
              : percentage >= 60
              ? 'You\'re doing well! Review the questions you missed to strengthen your weak areas. With more practice, you\'ll achieve even better scores.'
              : percentage >= 50
              ? 'You\'re on the right track. Focus on understanding the concepts behind each question. Review the explanations carefully and practice more questions.'
              : 'Don\'t be discouraged! Use this as a learning opportunity. Study the corrections carefully, identify your weak topics, and practice more. Every attempt makes you stronger.'}
          </p>
          <div className="pt-2 sm:pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Next Step:</strong> Review all questions and their explanations to understand where you went wrong.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
