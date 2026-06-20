import { useState } from 'react'
import ModalWrap from '../ModalWrap'
import { G, extractEmbedSrc } from '../../styles/theme'

export default function LeconForm({ initial, onSave, onClose, showToast }) {
  const [f, setF] = useState(initial
    ? { titre: initial.titre, contenu: initial.contenu, video_embed: initial.video_embed || '' }
    : { titre: "", contenu: "", video_embed: "" }
  )
  const [saving, setSaving] = useState(false)
  const previewSrc = extractEmbedSrc(f.video_embed)

  const submit = async () => {
    if (!f.titre.trim() || !f.contenu.trim()) { showToast("Titre et contenu requis", false); return }
    setSaving(true)
    try {
      await onSave({ titre: f.titre.trim(), contenu: f.contenu.trim(), video_embed: f.video_embed.trim() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrap title={initial?.id ? "Modifier la leçon" : "Nouvelle leçon"} onClose={onClose} wide>
      <label style={G.label}>Titre de la leçon</label>
      <input style={{...G.input,marginBottom:"0.75rem"}} value={f.titre} onChange={e=>setF({...f,titre:e.target.value})} placeholder="Ex: Panneaux d'interdiction"/>

      <label style={G.label}>Contenu pédagogique</label>
      <textarea style={{...G.textarea,minHeight:"120px",marginBottom:"1rem"}} value={f.contenu} onChange={e=>setF({...f,contenu:e.target.value})} placeholder="Rédigez le contenu de la leçon..."/>

      <label style={G.label}>Vidéo — code d'intégration (embed)</label>
      <textarea
        style={{...G.textarea,minHeight:"80px",fontFamily:"monospace",fontSize:"0.78rem"}}
        value={f.video_embed}
        onChange={e=>setF({...f,video_embed:e.target.value})}
        placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...></iframe>'
      />
      <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.35)",margin:"0.4rem 0 1rem"}}>
        Collez le code "Intégrer" (Embed) depuis YouTube, Vimeo, etc.
      </div>

      {previewSrc && (
        <div style={{marginBottom:"1rem"}}>
          <label style={G.label}>Aperçu</label>
          <div className="video-wrap">
            <iframe src={previewSrc} title="Aperçu vidéo" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
          </div>
        </div>
      )}
      {f.video_embed && !previewSrc && (
        <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:"10px",padding:"0.6rem 1rem",marginBottom:"1rem",color:"#f87171",fontSize:"0.8rem"}}>
          ⚠️ Impossible d'extraire une URL valide de ce code. Vérifiez qu'il contient bien un attribut <code>src="..."</code>.
        </div>
      )}

      <div style={{display:"flex",gap:"0.6rem",justifyContent:"flex-end"}}>
        <button style={G.btnGhost} onClick={onClose}>Annuler</button>
        <button style={{...G.btn(),opacity:saving?0.7:1}} onClick={submit} disabled={saving}>
          {saving?"⏳ ...":"✓ Enregistrer"}
        </button>
      </div>
    </ModalWrap>
  )
}
