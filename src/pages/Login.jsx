import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { G } from '../styles/theme'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr]           = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async () => {
    setErr('')
    if (!email.trim() || !password) { setErr('Email et mot de passe requis.'); return }
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (e) {
      setErr(e.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"calc(100vh - 65px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1rem"}}>
      <div style={{width:"100%",maxWidth:"440px"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:"3.5rem",marginBottom:"0.5rem"}}>🇨🇮</div>
          <div style={{...G.h2,textAlign:"center"}}>Bienvenue !</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.88rem",marginTop:"0.25rem"}}>Connectez-vous à votre espace membre</div>
        </div>

        <div style={{...G.card,padding:"2rem"}}>
          <div style={{marginBottom:"0.75rem"}}>
            <label style={G.label}>Email</label>
            <input style={G.input} type="email" placeholder="exemple@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} autoFocus/>
          </div>

          <div style={{marginBottom:"1.25rem"}}>
            <label style={G.label}>Mot de passe</label>
            <input style={G.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>

          {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"10px",padding:"0.7rem 1rem",marginBottom:"1rem",color:"#f87171",fontSize:"0.85rem"}}>⚠️ {err}</div>}

          <button style={{...G.btn(),width:"100%",padding:"0.85rem",fontSize:"1rem",boxShadow:"0 6px 24px rgba(249,115,22,0.25)",opacity:loading?0.7:1}} onClick={submit} disabled={loading}>
            {loading?"⏳ Connexion...":"🔑 Se connecter"}
          </button>

          <div style={{textAlign:"center",marginTop:"1.25rem",fontSize:"0.88rem",color:"rgba(255,255,255,0.45)"}}>
            Pas encore inscrit ?{" "}
            <Link to="/register" style={{color:"#f97316",fontWeight:700,textDecoration:"none"}}>Créer un compte gratuit →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
