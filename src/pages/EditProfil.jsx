import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { auth } from '../lib/api'
import { G, AVATARS } from '../styles/theme'

export default function EditProfil() {
  const { user, profil, refreshProfil } = useAuth()
  const navigate = useNavigate()

  const [f, setF] = useState({ prenom: profil?.prenom || '', nom: profil?.nom || '' })
  const [avatar, setAvatar] = useState(profil?.avatar || AVATARS[0])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk]   = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setErr(''); setOk(false)
    if (!f.prenom.trim() || !f.nom.trim()) { setErr('Prénom et nom requis.'); return }
    if (password && password !== confirm)  { setErr('Les mots de passe ne correspondent pas.'); return }
    if (password && password.length < 6)   { setErr('Mot de passe trop court (minimum 6 caractères).'); return }

    setSaving(true)
    try {
      await auth.updateProfil(user.id, { prenom: f.prenom.trim(), nom: f.nom.trim(), avatar })
      if (password) await auth.updatePassword(password)
      refreshProfil()
      setOk(true)
      setTimeout(() => navigate('/profil'), 1000)
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={G.wrap}>
      <button style={{...G.btnGhost,marginBottom:"1.5rem"}} onClick={()=>navigate('/profil')}>← Retour au profil</button>
      <h2 style={G.h2}>✏️ Modifier mon profil</h2>
      <p style={G.sub}>Mettez à jour vos informations personnelles.</p>

      <div style={{maxWidth:"500px"}}>
        <div style={{...G.card,marginBottom:"1rem"}}>
          <label style={G.label}>Choisir un avatar</label>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.5rem"}}>
            {AVATARS.map(a => (
              <button key={a} onClick={()=>setAvatar(a)} style={{
                fontSize:"1.8rem",
                background:a===avatar?"rgba(249,115,22,0.15)":"rgba(255,255,255,0.04)",
                border:`2px solid ${a===avatar?"#f97316":"rgba(255,255,255,0.1)"}`,
                borderRadius:"10px",padding:"0.3rem 0.5rem",cursor:"pointer",transition:"all 0.15s"
              }}>{a}</button>
            ))}
          </div>
        </div>

        <div style={G.card}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div><label style={G.label}>Prénom</label><input style={G.input} value={f.prenom} onChange={e=>setF({...f,prenom:e.target.value})}/></div>
            <div><label style={G.label}>Nom</label><input style={G.input} value={f.nom} onChange={e=>setF({...f,nom:e.target.value})}/></div>
          </div>

          <div style={{marginBottom:"0.75rem"}}>
            <label style={G.label}>Email</label>
            <input style={{...G.input,opacity:0.5,cursor:"not-allowed"}} value={user.email} disabled/>
          </div>

          <div style={{height:"1px",background:"rgba(255,255,255,0.06)",margin:"1rem 0"}}/>

          <div style={{marginBottom:"0.75rem"}}>
            <label style={G.label}>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <input style={G.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/>
          </div>
          <div style={{marginBottom:"1.25rem"}}>
            <label style={G.label}>Confirmer</label>
            <input style={G.input} type="password" placeholder="••••••••" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          </div>

          {err && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"10px",padding:"0.7rem 1rem",marginBottom:"1rem",color:"#f87171",fontSize:"0.85rem"}}>⚠️ {err}</div>}
          {ok  && <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"10px",padding:"0.7rem 1rem",marginBottom:"1rem",color:"#34d399",fontSize:"0.85rem"}}>✓ Profil mis à jour !</div>}

          <button style={{...G.btn("#10b981"),width:"100%",padding:"0.85rem",opacity:saving?0.7:1}} onClick={save} disabled={saving}>
            {saving ? "⏳ Enregistrement..." : "✓ Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </div>
  )
}
