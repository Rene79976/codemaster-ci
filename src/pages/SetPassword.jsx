import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function SetPassword() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm,  setConfirm]    = useState('')
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState('')
  const [success,  setSuccess]    = useState(false)

  const S = {
    page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' },
    card:  { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'2.5rem 2rem', width:'100%', maxWidth:'420px' },
    label: { display:'block', fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', marginBottom:'0.4rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' },
    input: { width:'100%', padding:'0.7rem 1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#e8edf5', fontSize:'0.92rem', outline:'none', boxSizing:'border-box', marginBottom:'1rem' },
    btn:   { width:'100%', padding:'0.85rem', background:'linear-gradient(135deg,#f97316,#f97316cc)', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, cursor:'pointer', fontSize:'1rem' },
    err:   { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'0.7rem 1rem', marginBottom:'1rem', color:'#f87171', fontSize:'0.85rem' },
    ok:    { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'10px', padding:'0.7rem 1rem', marginBottom:'1rem', color:'#34d399', fontSize:'0.85rem' },
  }

  if (!token) return (
    <div style={S.page}>
      <div style={{...S.card, textAlign:'center'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>❌</div>
        <div style={{fontWeight:700,marginBottom:'0.5rem'}}>Lien invalide</div>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.9rem'}}>Ce lien d'invitation est invalide ou manquant.</div>
      </div>
    </div>
  )

  const handleSubmit = async () => {
    setError('')
    if (!password || !confirm)      { setError('Les deux champs sont requis.'); return }
    if (password !== confirm)        { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6)         { setError('Mot de passe trop court (minimum 6 caractères).'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/set-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur inconnue.'); return }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'3rem',marginBottom:'0.5rem'}}>🔑</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:800,marginBottom:'0.25rem'}}>Définir mon mot de passe</h2>
          <p style={{color:'rgba(255,255,255,0.45)',fontSize:'0.88rem'}}>Bienvenue sur CodeMaster.Ci ! Choisissez votre mot de passe.</p>
        </div>

        {success ? (
          <>
            <div style={S.ok}>✓ Mot de passe défini ! Redirection vers la connexion…</div>
            <button style={S.btn} onClick={() => navigate('/login')}>Se connecter →</button>
          </>
        ) : (
          <>
            {error && <div style={S.err}>⚠️ {error}</div>}
            <label style={S.label}>Nouveau mot de passe</label>
            <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} autoFocus />
            <label style={S.label}>Confirmer le mot de passe</label>
            <input style={S.input} type="password" placeholder="••••••••" value={confirm}  onChange={e=>setConfirm(e.target.value)}  onKeyDown={e=>e.key==='Enter'&&handleSubmit()} />
            <button style={{...S.btn,opacity:loading?0.7:1}} onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Enregistrement…' : '✓ Confirmer mon mot de passe'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
