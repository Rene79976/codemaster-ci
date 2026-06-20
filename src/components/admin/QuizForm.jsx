import { useState } from 'react'
import ModalWrap from '../ModalWrap'
import { G } from '../../styles/theme'

export default function QuizForm({ initial, onSave, onClose, showToast }) {
  const [f, setF] = useState(initial
    ? { question: initial.question, image: initial.image || "🚗", options: [...(initial.options||["","","",""])], answer: initial.answer ?? 0, explication: initial.explication || "" }
    : { question: "", image: "🚗", options: ["","","",""], answer: 0, explication: "" }
  )
  const [saving, setSaving] = useState(false)

  const setOpt = (i, v) => { const o=[...f.options]; o[i]=v; setF({...f,options:o}) }

  const submit = async () => {
    if (!f.question.trim() || f.options.some(o=>!o.trim()) || !f.explication.trim()) {
      showToast("Tous les champs sont requis", false); return
    }
    setSaving(true)
    try {
      await onSave({
        question: f.question.trim(),
        image: f.image,
        options: f.options.map(o=>o.trim()),
        answer: f.answer,
        explication: f.explication.trim(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrap title={initial?.id ? "Modifier la question" : "Nouvelle question"} onClose={onClose} wide>
      <label style={G.label}>Question</label>
      <textarea style={{...G.textarea,marginBottom:"0.75rem"}} value={f.question} onChange={e=>setF({...f,question:e.target.value})}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
        <div><label style={G.label}>Emoji / illustration</label><input style={G.input} value={f.image} onChange={e=>setF({...f,image:e.target.value})}/></div>
        <div>
          <label style={G.label}>Réponse correcte</label>
          <select style={G.input} value={f.answer} onChange={e=>setF({...f,answer:parseInt(e.target.value)})}>
            {[0,1,2,3].map(i=><option key={i} value={i}>Option {["A","B","C","D"][i]}</option>)}
          </select>
        </div>
      </div>

      {["A","B","C","D"].map((l,i)=>(
        <div key={i} style={{marginBottom:"0.6rem"}}>
          <label style={{...G.label,color:f.answer===i?"#10b981":"rgba(255,255,255,0.5)"}}>Option {l} {f.answer===i?"✓ (correcte)":""}</label>
          <input style={{...G.input,borderColor:f.answer===i?"rgba(16,185,129,0.4)":"rgba(255,255,255,0.12)"}} value={f.options[i]} onChange={e=>setOpt(i,e.target.value)} placeholder={`Option ${l}...`}/>
        </div>
      ))}

      <label style={{...G.label,marginTop:"0.5rem"}}>Explication (affichée après réponse)</label>
      <textarea style={{...G.textarea,marginBottom:"1rem"}} value={f.explication} onChange={e=>setF({...f,explication:e.target.value})}/>

      <div style={{display:"flex",gap:"0.6rem",justifyContent:"flex-end"}}>
        <button style={G.btnGhost} onClick={onClose}>Annuler</button>
        <button style={{...G.btn(),opacity:saving?0.7:1}} onClick={submit} disabled={saving}>
          {saving?"⏳ ...":"✓ Enregistrer"}
        </button>
      </div>
    </ModalWrap>
  )
}
