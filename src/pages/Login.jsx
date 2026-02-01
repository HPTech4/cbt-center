import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, LogIn, AlertCircle, WifiOff } from 'lucide-react'
import { signIn } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Login handler (FIXED & STABLE)
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Logging in:', email)

      const { user, profile } = await signIn(email, password)

      console.log('✅ Login success:', { id: user.id, role: profile.role })

      // Store in global auth context
      setUser({ ...user, ...profile })

      // Role-based redirect
      if (profile.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/exams')
      }
    } catch (err) {
      console.error('❌ Login error:', err)

      if (err.message?.includes('Invalid login credentials')) {
        setError('❌ Invalid email or password')
      } else if (err.code === 'PGRST116') {
        setError('❌ User profile not found. Contact administrator.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            CBT Practice System
          </h1>
          <p className="text-slate-600">
            Sign in to start your exam practice
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error Box */}
            {error && (
              <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <p className="text-sm whitespace-pre-wrap">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              No account? Contact your administrator.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}