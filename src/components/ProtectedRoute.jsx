import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute Component
 * Wraps routes to enforce authentication and role-based access control
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Route component to protect
 * @param {string} [props.requireRole] - Optional role requirement ('admin' or 'student')
 * 
 * Behaviors:
 * - If loading: Show loading spinner
 * - If not authenticated: Redirect to login
 * - If role mismatch: Redirect to appropriate dashboard based on actual role
 * - Otherwise: Render protected component
 */
export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  // Redirects user to their own dashboard if they try to access wrong role's routes
  if (requireRole && user.role !== requireRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/exams" replace />
    }
  }

  // User is authenticated and has correct role - render component
  return children
}
