import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import ExamSelect from './pages/ExamSelect'
import SubjectSelect from './pages/SubjectSelect'
import Exam from './pages/Exam'
import Result from './pages/Result'
import Review from './pages/Review'
import AdminDashboard from './pages/AdminDashboard'

/**
 * Main App Component
 * Handles routing and authentication flow
 * All routes protected by role-based access control
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/exams"
            element={
              <ProtectedRoute requireRole="student">
                <ExamSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:examId"
            element={
              <ProtectedRoute requireRole="student">
                <SubjectSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:attemptId"
            element={
              <ProtectedRoute requireRole="student">
                <Exam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:attemptId"
            element={
              <ProtectedRoute requireRole="student">
                <Result />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review/:attemptId"
            element={
              <ProtectedRoute requireRole="student">
                <Review />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
