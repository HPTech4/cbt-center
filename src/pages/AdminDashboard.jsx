import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  LogOut,
  Plus,
  Upload,
  Users,
  BarChart3,
  Trash2,
  Edit,
  X,
  Check,
  AlertCircle,
  FileText,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  Award,
  Menu
} from 'lucide-react'
import {
  getExams,
  getAllSubjects,
  createExam,
  createSubject,
  createQuestions,
  getQuestionsBySubject,
  getAllAttempts,
  deleteQuestion,
  updateQuestion,
  signOut
} from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/**
 * AdminDashboard
 * Complete admin interface for managing exams, subjects, questions, and viewing results
 */
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('exams')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Data states
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [attempts, setAttempts] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [subjectQuestions, setSubjectQuestions] = useState([])

  // Modal states
  const [showExamModal, setShowExamModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showQuestionUploadModal, setShowQuestionUploadModal] = useState(false)
  const [showEditQuestionModal, setShowEditQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)

  // Form states
  const [examForm, setExamForm] = useState({ name: '', description: '' })
  const [subjectForm, setSubjectForm] = useState({ examId: '', name: '', timeLimitMinutes: 60 })
  const [questionUploadForm, setQuestionUploadForm] = useState({
    subjectId: '',
    questionsText: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'exams') {
        const examsData = await getExams()
        setExams(examsData)
      } else if (activeTab === 'subjects') {
        const subjectsData = await getAllSubjects()
        setSubjects(subjectsData)
      } else if (activeTab === 'results') {
        const attemptsData = await getAllAttempts()
        setAttempts(attemptsData)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Exam Management
  const handleCreateExam = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await createExam(examForm.name, examForm.description)
      setSuccess('Exam created successfully')
      // Close modal immediately
      setShowExamModal(false)
      setExamForm({ name: '', description: '' })
      // Then reload data
      setTimeout(() => {
        loadData()
      }, 300)
    } catch (err) {
      setError(err.message || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  // Subject Management
  const handleCreateSubject = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await createSubject(
        subjectForm.examId,
        subjectForm.name,
        parseInt(subjectForm.timeLimitMinutes)
      )
      setSuccess('Subject created successfully')
      setShowSubjectModal(false)
      setSubjectForm({ examId: '', name: '', timeLimitMinutes: 60 })
      loadData()
    } catch (err) {
      setError(err.message || 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  // Question Management
  const handleUploadQuestions = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Parse questions from text (expects specific format)
      const questionsArray = parseQuestionsText(questionUploadForm.questionsText)
      
      if (questionsArray.length === 0) {
        throw new Error('No valid questions found')
      }

      // Add subject_id to each question
      const questionsWithSubject = questionsArray.map(q => ({
        ...q,
        subject_id: questionUploadForm.subjectId
      }))

      await createQuestions(questionsWithSubject)
      setSuccess(`${questionsArray.length} questions uploaded successfully`)
      setShowQuestionUploadModal(false)
      setQuestionUploadForm({ subjectId: '', questionsText: '' })
    } catch (err) {
      setError(err.message || 'Failed to upload questions')
    } finally {
      setLoading(false)
    }
  }

  const parseQuestionsText = (text) => {
    // Expected format:
    // Q: Question text here?
    // A) Option A text
    // B) Option B text
    // C) Option C text
    // D) Option D text
    // ANSWER: A
    // EXPLANATION: Explanation text (optional)
    // (blank line between questions)

    const questions = []
    const blocks = text.trim().split(/\n\s*\n/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      let question = {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: '',
        explanation: ''
      }

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('Q:') || trimmed.match(/^\d+\./)) {
          question.question_text = trimmed.replace(/^(Q:|^\d+\.)/, '').trim()
        } else if (trimmed.match(/^A\)/i)) {
          question.option_a = trimmed.replace(/^A\)/i, '').trim()
        } else if (trimmed.match(/^B\)/i)) {
          question.option_b = trimmed.replace(/^B\)/i, '').trim()
        } else if (trimmed.match(/^C\)/i)) {
          question.option_c = trimmed.replace(/^C\)/i, '').trim()
        } else if (trimmed.match(/^D\)/i)) {
          question.option_d = trimmed.replace(/^D\)/i, '').trim()
        } else if (trimmed.match(/^ANSWER:/i)) {
          const answer = trimmed.replace(/^ANSWER:/i, '').trim().toUpperCase()
          question.correct_option = answer[0] // Get first character (A, B, C, or D)
        } else if (trimmed.match(/^EXPLANATION:/i)) {
          question.explanation = trimmed.replace(/^EXPLANATION:/i, '').trim()
        }
      }

      // Validate question
      if (
        question.question_text &&
        question.option_a &&
        question.option_b &&
        question.option_c &&
        question.option_d &&
        ['A', 'B', 'C', 'D'].includes(question.correct_option)
      ) {
        questions.push(question)
      }
    }

    return questions
  }

  const loadSubjectQuestions = async (subjectId) => {
    setLoading(true)
    try {
      const questions = await getQuestionsBySubject(subjectId)
      setSubjectQuestions(questions)
      setSelectedSubject(subjectId)
    } catch (err) {
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setShowEditQuestionModal(true)
  }

  const handleUpdateQuestion = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await updateQuestion(editingQuestion.id, {
        question_text: editingQuestion.question_text,
        option_a: editingQuestion.option_a,
        option_b: editingQuestion.option_b,
        option_c: editingQuestion.option_c,
        option_d: editingQuestion.option_d,
        correct_option: editingQuestion.correct_option,
        explanation: editingQuestion.explanation
      })
      setSuccess('Question updated successfully')
      setShowEditQuestionModal(false)
      loadSubjectQuestions(selectedSubject)
    } catch (err) {
      setError(err.message || 'Failed to update question')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await deleteQuestion(questionId)
      setSuccess('Question deleted successfully')
      loadSubjectQuestions(selectedSubject)
    } catch (err) {
      setError(err.message || 'Failed to delete question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-900">Prime Scholar</h1>
                <p className="text-sm text-slate-600">Admin Dashboard • Welcome, {user?.full_name}</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold text-slate-900">Prime Scholar</h1>
                <p className="text-xs text-slate-600">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium text-slate-700"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {[
              { key: 'exams', icon: Award, label: 'Exams' },
              { key: 'subjects', icon: BookOpen, label: 'Subjects' },
              { key: 'questions', icon: ClipboardList, label: 'Questions' },
              { key: 'results', icon: BarChart3, label: 'Results' }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 font-medium rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
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

      {/* Desktop Tabs */}
      <div className="hidden md:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'exams', icon: Award, label: 'Exams' },
              { key: 'subjects', icon: BookOpen, label: 'Subjects' },
              { key: 'questions', icon: ClipboardList, label: 'Questions' },
              { key: 'results', icon: BarChart3, label: 'Results' }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium capitalize transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start sm:items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm sm:text-base">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} className="ml-auto flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 flex items-start sm:items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm sm:text-base">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="flex-1">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Exams</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{exams.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Subjects</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{subjects.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Attempts</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{attempts.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Questions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{subjectQuestions.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Exams</h2>
              <button
                onClick={() => setShowExamModal(true)}
                className="btn-primary w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Exam</span>
              </button>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{exam.name}</h3>
                        {exam.description && (
                          <p className="text-sm text-slate-600 mt-1">{exam.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Manage Subjects</h2>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="grid gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{subject.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {subject.exams?.name}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Time Limit: {subject.time_limit_minutes} minutes
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('questions')
                        loadSubjectQuestions(subject.id)
                      }}
                      className="btn-secondary text-sm"
                    >
                      Manage Questions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Manage Questions</h2>
              <button
                onClick={() => setShowQuestionUploadModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Questions</span>
              </button>
            </div>

            {selectedSubject ? (
              <div>
                <div className="card mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-600">
                      Total Questions: <span className="font-bold text-slate-900">{subjectQuestions.length}</span>
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSubject(null)
                        setSubjectQuestions([])
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Change Subject
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {subjectQuestions.map((question, index) => (
                    <div key={question.id} className="card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              Q{index + 1}
                            </span>
                          </div>
                          <p className="text-slate-900 mb-3">{question.question_text}</p>
                          <div className="grid sm:grid-cols-2 gap-2 text-sm">
                            <div className={`p-2 rounded ${question.correct_option === 'A' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                              <span className="font-medium">A)</span> {question.option_a}
                            </div>
                            <div className={`p-2 rounded ${question.correct_option === 'B' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                              <span className="font-medium">B)</span> {question.option_b}
                            </div>
                            <div className={`p-2 rounded ${question.correct_option === 'C' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                              <span className="font-medium">C)</span> {question.option_c}
                            </div>
                            <div className={`p-2 rounded ${question.correct_option === 'D' ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}>
                              <span className="font-medium">D)</span> {question.option_d}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Select a subject to manage its questions</p>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="btn-secondary"
                >
                  Go to Subjects
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Student Results</h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BarChart3 className="w-4 h-4" />
                <span>Total Attempts: {attempts.length}</span>
              </div>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">Student</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">Exam</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">Subject</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">Score</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">%</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-slate-700 whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => {
                    const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                    return (
                      <tr key={attempt.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 truncate">{attempt.users?.full_name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 truncate">{attempt.subjects?.exams?.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 truncate">{attempt.subjects?.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center font-medium whitespace-nowrap">
                          {attempt.score}/{attempt.total_questions}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            percentage >= 75 ? 'bg-green-100 text-green-700' :
                            percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                            percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-slate-600 whitespace-nowrap text-xs sm:text-sm">
                          {new Date(attempt.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Add New Exam</h3>
              <button onClick={() => setShowExamModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateExam}>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Exam Type</label>
                  <select
                    value={examForm.name}
                    onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                    className="input text-sm"
                    required
                  >
                    <option value="">-- Choose Exam --</option>
                    <option value="WAEC">WAEC (West African Examinations Council)</option>
                    <option value="JAMB">JAMB (Joint Admissions and Matriculation Board)</option>
                    <option value="NECO">NECO (National Examinations Council)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Description (Optional)</label>
                  <textarea
                    value={examForm.description}
                    onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Brief description of the exam"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add New Subject</h3>
              <button onClick={() => setShowSubjectModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject}>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Exam</label>
                  <select
                    value={subjectForm.examId}
                    onChange={(e) => setSubjectForm({ ...subjectForm, examId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Choose an exam</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                <div>
                  <label className="label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={subjectForm.timeLimitMinutes}
                    onChange={(e) => setSubjectForm({ ...subjectForm, timeLimitMinutes: e.target.value })}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Questions Modal */}
      {showQuestionUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Upload Questions</h3>
              <button onClick={() => setShowQuestionUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUploadQuestions}>
              <div className="space-y-4">
                <div>
                  <label className="label">Select Subject</label>
                  <select
                    value={questionUploadForm.subjectId}
                    onChange={(e) => setQuestionUploadForm({ ...questionUploadForm, subjectId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.exams?.name} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Questions (Paste formatted questions below)</label>
                  <textarea
                    value={questionUploadForm.questionsText}
                    onChange={(e) => setQuestionUploadForm({ ...questionUploadForm, questionsText: e.target.value })}
                    className="input font-mono text-sm"
                    rows="15"
                    placeholder="Q: What is 2 + 2?
A) 2
B) 3
C) 4
D) 5
ANSWER: C
EXPLANATION: 2 plus 2 equals 4

Q: What is the capital of Nigeria?
A) Lagos
B) Abuja
C) Kano
D) Port Harcourt
ANSWER: B
EXPLANATION: Abuja is the capital city of Nigeria"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Format: Start each question with "Q:" or number, options as "A)", "B)", etc., 
                    correct answer as "ANSWER: X", and optional "EXPLANATION:". Separate questions with blank lines.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowQuestionUploadModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Uploading...' : 'Upload Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditQuestionModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Question</h3>
              <button onClick={() => setShowEditQuestionModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateQuestion}>
              <div className="space-y-4">
                <div>
                  <label className="label">Question Text</label>
                  <textarea
                    value={editingQuestion.question_text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                    className="input"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Option A</label>
                    <input
                      type="text"
                      value={editingQuestion.option_a}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, option_a: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Option B</label>
                    <input
                      type="text"
                      value={editingQuestion.option_b}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, option_b: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Option C</label>
                    <input
                      type="text"
                      value={editingQuestion.option_c}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, option_c: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Option D</label>
                    <input
                      type="text"
                      value={editingQuestion.option_d}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, option_d: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Correct Answer</label>
                  <select
                    value={editingQuestion.correct_option}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_option: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="label">Explanation (Optional)</label>
                  <textarea
                    value={editingQuestion.explanation || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    className="input"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditQuestionModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Updating...' : 'Update Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
