import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { scoresAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function Leaderboard() {
  const [lb, setLb] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    scoresAPI.getLeaderboard(10)
      .then(data => { if (mounted) setLb(data) })
      .catch(console.error)
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div style={G.wrap}>
      <h2 style={G.h2}>🏆 Classement</h2>
      <p style={G.sub}>Les meilleurs scores des candidats au permis ivoirien.</p>

      <div style={G.card}>
        {loading ? (
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div>
        ) : lb.length === 0 ? (
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Aucun score encore.</div>
        ) : lb.map((e, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"1rem",padding:"0.8rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)",color:i===0?"#f59e0b":i===1?"#c0c0c0":i===2?"#cd7f32":"rgba(255,255,255,0.7)"}}>
            <span style={{width:"2rem",fontWeight:900}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</span>
            <span style={{fontSize:"1.4rem"}}>{e.profils?.avatar || '🧑🏿'}</span>
            <span style={{flex:1,fontWeight:600}}>{e.profils?.prenom} {e.profils?.nom}</span>
            <span style={{fontWeight:800,fontSize:"1.1rem"}}>{e.percent}%</span>
            <span style={{fontSize:"0.78rem",opacity:0.45}}>{new Date(e.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",marginTop:"2rem"}}>
        <Link to="/quiz" style={{...G.btn(),textDecoration:"none"}}>Passer un quiz →</Link>
      </div>
    </div>
  )
}
