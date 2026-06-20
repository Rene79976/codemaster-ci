import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { auth as authAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // auth.users row
  const [profil,  setProfil]  = useState(null)   // public.profils row
  const [loading, setLoading] = useState(true)

  // Charge le profil une fois la session connue
  const loadProfil = async (userId) => {
    try {
      const p = await authAPI.getProfil(userId)
      setProfil(p)
    } catch {
      setProfil(null)
    }
  }

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfil(session.user.id)
      setLoading(false)
    })

    // Écoute les changements (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfil(session.user.id)
      else setProfil(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const data = await authAPI.login(email, password)
    return data
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
    setProfil(null)
  }

  const refreshProfil = () => user && loadProfil(user.id)

  const isAdmin = profil?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profil, loading, isAdmin, login, logout, refreshProfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
