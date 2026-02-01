import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, LogOut, GraduationCap, Menu, X } from 'lucide-react'
import { getExams, signOut } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/**
 * ExamSelect Page Component
 * First step in the student exam flow
 * Features:
 * - Displays all available exam types (WAEC, NECO, JAMB)
 * - Shows exam descriptions
 * - Navigates to subject selection when exam is selected
 * - Logout functionality
 */
export default function ExamSelect() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Data states
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /**
   * Load available exams on component mount
   */
  useEffect(() => {
    loadExams()
  }, [])

  /**
   * Fetch exam list from database
   */
  const loadExams = async () => {
    try {
      const data = await getExams()
      setExams(data)
    } catch (err) {
      console.error('Failed to load exams:', err)
      setError('Failed to load exams. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Navigate to subject selection for selected exam
   * @param {string} examId - The ID of the selected exam
   */
  const handleExamSelect = (examId) => {
    navigate(`/subjects/${examId}`)
  }

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and User Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-900">Prime Scholar</h1>
                <p className="text-sm text-slate-600">Welcome, {user?.full_name}</p>
              </div>
              <div className="sm:hidden min-w-0">
                <h1 className="text-lg font-bold text-slate-900 truncate">Prime Scholar</h1>
                <p className="text-xs text-slate-600">Student Mode</p>
              </div>
            </div>
            
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700 flex-shrink-0 ml-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <button
              onClick={() => {
                handleLogout()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-3 font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
            Select Exam Type
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Choose an examination to practice
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No exams available at the moment.</p>
          </div>
        ) : (
          // Grid of exam cards
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => handleExamSelect(exam.id)}
                className="card hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group h-full"
              >
                {/* Exam Card Header */}
                <div className="flex items-center justify-between mb-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  {/* Chevron Icon */}
                  <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                {/* Exam Name */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  {exam.name}
                </h3>
                {exam.description && (
                  <p className="text-slate-600 text-xs sm:text-sm">
                    {exam.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Important Notes:</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-blue-800">
            <li>• Each practice session consists of 40 randomly selected questions</li>
            <li>• You can only attempt each subject once per session</li>
            <li>• Timer will start immediately when you begin</li>
            <li>• Exam will auto-submit when time runs out</li>
            <li>• You will see corrections after submission</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
