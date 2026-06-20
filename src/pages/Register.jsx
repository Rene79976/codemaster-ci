import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { G, AVATARS } from '../styles/theme'

export default function Register() {
  const navigate = useNavigate()
  const [f, setF] = useState({ prenom:'', nom:'', email:'', password:'', confirm:'' })
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [err, setErr]       = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr('')
    if (!f.prenom.trim() || !f.nom.trim() || !f.email.trim() || !f.password) {
      setErr('Tous les champs sont obligatoires.'); return
    }
    if (f.password !== f.confirm) { setErr('Les mots de passe ne correspondent pas.'); return }
    if (f.password.length < 6)    { setErr('Mot de passe trop court (minimum 6 caractères).'); return }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email:    f.email.trim(),
        password: f.password,
        options: {
          data: { prenom: f.prenom.trim(), nom: f.nom.trim(), avatar },
        },
      })
      if (error) throw error

      // Si la confirmation email est activée, pas de session immédiate
      if (!data.session) {
        navigate('/login', { state: { justRegistered: true } })
      } else {
        navigate('/')
      }
    } catch (e) {
      if (e.message?.includes('already registered') || e.message?.includes('already exists')) {
        setErr('Cet email est déjà utilisé.')
      } else {
        setErr(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"calc(100vh - 65px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem 1rem"}}>
      <div style={{width:"100%",maxWidth:"460px"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:"3.5rem",marginBottom:"0.5rem"}}>🇨🇮</div>
          <div style={{...G.h2,textAlign:"center"}}>Créer un compte</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.88rem",marginTop:"0.25rem"}}>Rejoignez CodeMaster.Ci gratuitement</div>
        </div>

        <div style={{...G.card,padding:"2rem"}}>
          {/* Avatar */}
          <label style={G.label}>Avatar</label>
          <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",marginBottom:"1rem"}}>
            {AVATARS.map(a => (
              <button key={a} onClick={()=>setAvatar(a)} type="button" style={{
                fontSize:"1.5rem",
                background: a===avatar ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
                border: `2px solid ${a===avatar ? "#f97316" : "rgba(255,255,255,0.1)"}`,
                borderRadius:"10px", padding:"0.25rem 0.4rem",
                cursor:"pointer", transition:"all 0.15s",
              }}>{a}</button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div>
              <label style={G.label}>Prénom</label>
              <input style={G.input} placeholder="Kouamé" value={f.prenom} onChange={e=>setF({...f,prenom:e.target.value})}/>
            </div>
            <div>
              <label style={G.label}>Nom</label>
              <input style={G.input} placeholder="Koné" value={f.nom} onChange={e=>setF({...f,nom:e.target.value})}/>
            </div>
          </div>

          <div style={{marginBottom:"0.75rem"}}>
            <label style={G.label}>Email</label>
            <input style={G.input} type="email" placeholder="exemple@email.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>

          <div style={{marginBottom:"0.75rem"}}>
            <label style={G.label}>Mot de passe</label>
            <input style={G.input} type="password" placeholder="••••••••" value={f.password} onChange={e=>setF({...f,password:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>

          <div style={{marginBottom:"1.25rem"}}>
            <label style={G.label}>Confirmer le mot de passe</label>
            <input style={G.input} type="password" placeholder="••••••••" value={f.confirm} onChange={e=>setF({...f,confirm:e.target.value})} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>

          {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"10px",padding:"0.7rem 1rem",marginBottom:"1rem",color:"#f87171",fontSize:"0.85rem"}}>⚠️ {err}</div>}

          <button style={{...G.btn(),width:"100%",padding:"0.85rem",fontSize:"1rem",boxShadow:"0 6px 24px rgba(249,115,22,0.25)",opacity:loading?0.7:1}} onClick={submit} disabled={loading}>
            {loading?"⏳ Création...":"🚀 Créer mon compte"}
          </button>

          <div style={{textAlign:"center",marginTop:"1.25rem",fontSize:"0.88rem",color:"rgba(255,255,255,0.45)"}}>
            Déjà un compte ?{" "}
            <Link to="/login" style={{color:"#f97316",fontWeight:700,textDecoration:"none"}}>Se connecter →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
