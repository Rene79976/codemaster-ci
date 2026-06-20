import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Nav        from './components/Nav'

// Pages
import Home        from './pages/Home'
import Login       from './pages/Login'
import Register    from './pages/Register'
import SetPassword from './pages/SetPassword'
import CoursList   from './pages/CoursList'
import CoursDetail from './pages/CoursDetail'
import QuizMenu    from './pages/QuizMenu'
import Quiz        from './pages/Quiz'
import Leaderboard from './pages/Leaderboard'
import Securite    from './pages/Securite'
import Profil      from './pages/Profil'
import EditProfil  from './pages/EditProfil'
import Admin       from './pages/Admin'
import NotFound    from './pages/NotFound'

// ── Route protégée (membres connectés) ───────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'rgba(255,255,255,0.4)' }}>Chargement…</div>
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── Route admin ───────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading)  return null
  if (!user)    return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        {/* Publiques */}
        <Route path="/"             element={<Home />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/leaderboard"  element={<Leaderboard />} />
        <Route path="/securite"     element={<Securite />} />

        {/* Membres connectés */}
        <Route path="/cours"         element={<PrivateRoute><CoursList /></PrivateRoute>} />
        <Route path="/cours/:id"     element={<PrivateRoute><CoursDetail /></PrivateRoute>} />
        <Route path="/quiz"          element={<PrivateRoute><QuizMenu /></PrivateRoute>} />
        <Route path="/quiz/:coursId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/profil"        element={<PrivateRoute><Profil /></PrivateRoute>} />
        <Route path="/profil/edit"   element={<PrivateRoute><EditProfil /></PrivateRoute>} />

        {/* Admin uniquement */}
        <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
