import { useState } from 'react'
import ModalWrap from '../ModalWrap'
import { G } from '../../styles/theme'

export default function CourseForm({ initial, onSave, onClose, showToast }) {
  const [f, setF] = useState(initial || { titre:"", icon:"🚗", couleur:"#f97316", description:"" })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!f.titre.trim()) { showToast("Titre requis", false); return }
    setSaving(true)
    try {
      await onSave({ titre: f.titre.trim(), icon: f.icon, couleur: f.couleur, description: f.description })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrap title={initial?.id ? "Modifier le cours" : "Nouveau cours"} onClose={onClose}>
      <label style={G.label}>Titre</label>
      <input style={{...G.input,marginBottom:"0.75rem"}} value={f.titre} onChange={e=>setF({...f,titre:e.target.value})} placeholder="Ex: Signalisation Routière"/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
        <div><label style={G.label}>Icône (emoji)</label><input style={G.input} value={f.icon} onChange={e=>setF({...f,icon:e.target.value})}/></div>
        <div><label style={G.label}>Couleur</label><input style={G.input} type="color" value={f.couleur} onChange={e=>setF({...f,couleur:e.target.value})}/></div>
      </div>

      <label style={G.label}>Description</label>
      <textarea style={{...G.textarea,marginBottom:"1rem"}} value={f.description} onChange={e=>setF({...f,description:e.target.value})}/>

      <div style={{display:"flex",gap:"0.6rem",justifyContent:"flex-end"}}>
        <button style={G.btnGhost} onClick={onClose}>Annuler</button>
        <button style={{...G.btn(),opacity:saving?0.7:1}} onClick={submit} disabled={saving}>
          {saving?"⏳ ...":"✓ Enregistrer"}
        </button>
      </div>
    </ModalWrap>
  )
}
