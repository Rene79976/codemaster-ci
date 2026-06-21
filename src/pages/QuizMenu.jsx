import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { coursAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function QuizMenu() {
  const navigate = useNavigate()
  const [cours, setCours]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    coursAPI.getAll()
      .then(data => { if (mounted) setCours(data) })
      .catch(console.error)
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div style={G.wrap}>
      <h2 style={G.h2}>🎯 Choisir un quiz</h2>
      <p style={G.sub}>Quiz thématiques ou entraînement complet aléatoire.</p>

      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <button style={{...G.btn(),padding:"1rem 2.5rem",fontSize:"1rem",boxShadow:"0 8px 30px rgba(249,115,22,0.25)"}} onClick={()=>navigate('/quiz/all')}>
          🎲 Quiz complet aléatoire (12 questions)
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"2rem"}}>Chargement...</div>
      ) : (
        <div style={G.grid2}>
          {cours.filter(c => (c.questions?.length||0) > 0).map(c => (
            <div key={c.id} className="hover-card" style={{...G.card,cursor:"pointer"}} onClick={()=>navigate(`/quiz/${c.id}`)}>
              <div style={{...G.row,marginBottom:"0.5rem"}}>
                <span style={{fontSize:"1.8rem"}}>{c.icon}</span>
                <div style={{fontWeight:700}}>{c.titre}</div>
              </div>
              <span style={G.badge(c.couleur)}>{c.questions.length} question{c.questions.length>1?"s":""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
