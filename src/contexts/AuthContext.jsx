import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../services/supabaseClient'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)   // auth user OR merged user
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const initAuth = async () => {
    try {
      // Check for mock user in localStorage
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        console.log('✅ Mock auth: User restored from storage', currentUser.email);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth init error:', err)
      setUser(null)
    }
    setLoading(false)
  }

  initAuth()

  // For mock auth, we'll poll localStorage for changes
  // (In real Supabase, this would be onAuthStateChange)
  const checkAuthInterval = setInterval(async () => {
    const currentUser = await getCurrentUser();
    if (currentUser?.email !== user?.email) {
      setUser(currentUser);
    }
  }, 1000);

  return () => clearInterval(checkAuthInterval);
}, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}