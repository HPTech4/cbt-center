import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, LogIn, AlertCircle, GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Educational Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated geometric shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-400/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating book icons */}
        <div className="absolute top-1/4 right-1/4 opacity-10">
          <BookOpen className="w-24 h-24 text-white animate-bounce" style={{animationDuration: '3s'}} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-10">
          <GraduationCap className="w-32 h-32 text-white animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-2xl">
            <GraduationCap className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Prime Scholar
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Computer-Based Test Practice System
          </p>
          <p className="text-blue-200 text-sm mt-2">
            Sign in to access your examinations
          </p>
        </div>

        {/* Login Card */}
        <div className="card bg-white/95 backdrop-blur-lg shadow-2xl border border-white/20">
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
              Need help? Contact your administrator.
            </p>
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            © 2026 Prime Scholar. Empowering Education.
          </p>
        </div>

      </div>
    </div>
  )
}