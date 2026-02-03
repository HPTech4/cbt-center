import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Clock, ArrowLeft, AlertCircle, PlayCircle, GraduationCap } from 'lucide-react'
import { getSubjects, hasAttemptedSubject, createAttempt } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/**
 * SubjectSelect Page
 * Students select which subject to practice
 * Prevents retaking same subject in same session
 */
export default function SubjectSelect() {
  const navigate = useNavigate()
  const { examId } = useParams()
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [attemptedSubjects, setAttemptedSubjects] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [startingAttempt, setStartingAttempt] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadSubjects()
    }
  }, [examId, user])

  const loadSubjects = async () => {
    if (!user) return
    
    try {
      const data = await getSubjects(examId)
      setSubjects(data)

      // Check which subjects have been attempted
      const attempted = new Set()
      for (const subject of data) {
        const hasAttempted = await hasAttemptedSubject(user.id, subject.id)
        if (hasAttempted) {
          attempted.add(subject.id)
        }
      }
      setAttemptedSubjects(attempted)
    } catch (err) {
      console.error('Failed to load subjects:', err)
      setError('Failed to load subjects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async (subjectId, subjectName) => {
    if (!user) {
      setError('Please log in to start an exam.')
      return
    }
    
    if (attemptedSubjects.has(subjectId)) {
      return
    }

    setStartingAttempt(subjectId)
    setError('')

    try {
      const attempt = await createAttempt(user.id, subjectId)
      navigate(`/exam/${attempt.id}`)
    } catch (err) {
      console.error('Failed to start exam:', err)
      setError(err.message || 'Failed to start exam. Please try again.')
      setStartingAttempt(null)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/exams')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">Prime Scholar</h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">Select a subject</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {error && (
          <div className="mb-6 sm:mb-8 flex items-start sm:items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No subjects available for this exam.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6">
            {subjects.map((subject) => {
              const isAttempted = attemptedSubjects.has(subject.id)
              const isStarting = startingAttempt === subject.id

              return (
                <div
                  key={subject.id}
                  className={`card ${
                    isAttempted
                      ? 'opacity-60 bg-slate-50'
                      : 'hover:shadow-lg hover:border-blue-300 transition-all duration-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          {subject.name}
                        </h3>
                        {isAttempted && (
                          <span className="px-2 sm:px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-medium whitespace-nowrap">
                            Attempted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {subject.time_limit_minutes} min • 40 qs
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartExam(subject.id, subject.name)}
                      disabled={isAttempted || isStarting}
                      className={`btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base flex-shrink-0 ${
                        isAttempted || isStarting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isStarting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Starting...</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-5 h-5" />
                          <span>Start Practice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Warning Box */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-1" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">Before You Start:</h3>
              <ul className="space-y-1 text-xs sm:text-sm text-amber-800">
                <li>• You can only attempt each subject once per session</li>
                <li>• The timer will start immediately when you click "Start Practice"</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• You cannot pause the exam once started</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
