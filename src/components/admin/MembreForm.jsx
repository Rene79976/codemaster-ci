import { useState } from 'react'
import ModalWrap from '../ModalWrap'
import { G, AVATARS } from '../../styles/theme'

export default function MembreForm({ initial, onSave, onClose, showToast }) {
  const isEdit = !!initial?.id
  const [f, setF] = useState({
    prenom: initial?.prenom || '',
    nom:    initial?.nom    || '',
    email:  initial?.email  || '',
    avatar: initial?.avatar || AVATARS[0],
  })
  const [saving, setSaving] = useState(false)

  const validate = () => {
    if (!f.prenom.trim() || !f.nom.trim() || !f.email.trim()) {
      showToast("Prénom, nom et email sont requis.", false); return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
      showToast("Adresse email invalide.", false); return false
    }
    return true
  }

  const submit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        prenom: f.prenom.trim(),
        nom:    f.nom.trim(),
        email:  f.email.trim(),
        avatar: f.avatar,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrap title={isEdit ? "Modifier l'élève" : "Ajouter un élève"} onClose={onClose} wide>
      {/* Avatar */}
      <label style={G.label}>Avatar</label>
      <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
        {AVATARS.map(a => (
          <button key={a} onClick={()=>setF({...f,avatar:a})} style={{
            fontSize:"1.6rem",
            background: a===f.avatar ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)",
            border: `2px solid ${a===f.avatar ? "#f97316" : "rgba(255,255,255,0.1)"}`,
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

      <div style={{marginBottom:"1rem"}}>
        <label style={G.label}>Adresse email</label>
        <input style={{...G.input, opacity: isEdit?0.5:1, cursor: isEdit?'not-allowed':'text'}} type="email" placeholder="exemple@email.ci" value={f.email} onChange={e=>setF({...f,email:e.target.value})} disabled={isEdit}/>
      </div>

      {!isEdit && (
        <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:"10px",padding:"0.75rem 1rem",marginBottom:"1rem",fontSize:"0.82rem",color:"#a5b4fc",lineHeight:1.6}}>
          📧 Un email d'invitation sera envoyé à cette adresse avec un lien pour définir le mot de passe et se connecter.
        </div>
      )}

      <div style={{display:"flex",gap:"0.6rem",justifyContent:"flex-end"}}>
        <button style={G.btnGhost} onClick={onClose}>Annuler</button>
        <button style={{...G.btn(isEdit?"#f97316":"#10b981"),opacity:saving?0.7:1}} onClick={submit} disabled={saving}>
          {saving ? "⏳ ..." : isEdit ? "✓ Enregistrer les modifications" : "➕ Ajouter et envoyer l'invitation"}
        </button>
      </div>
    </ModalWrap>
  )
}
