import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { coursAPI, scoresAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function CoursList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cours, setCours]     = useState([])
  const [progMap, setProgMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await coursAPI.getAll()
        if (!mounted) return
        setCours(data)
        if (user) {
          const prog = await scoresAPI.getProgression(user.id)
          const map = {}
          prog.forEach(p => { map[p.cours_id] = p.best_score })
          setProgMap(map)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

  return (
    <div style={G.wrap}>
      <h2 style={G.h2}>📚 Cours disponibles</h2>
      <p style={G.sub}>Sélectionnez un cours pour accéder aux leçons et au quiz.</p>

      {loading ? (
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div>
      ) : cours.length === 0 ? (
        <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Aucun cours disponible pour le moment.</div>
      ) : (
        <div style={G.grid2}>
          {cours.map(c => {
            const prog = progMap[c.id] || 0
            return (
              <div key={c.id} className="hover-card" style={{...G.card,cursor:"pointer",borderColor:`${c.couleur}33`,borderWidth:"1.5px",position:"relative"}} onClick={()=>navigate(`/cours/${c.id}`)}>
                {prog>=60 && <div style={{position:"absolute",top:"1rem",right:"1rem",fontSize:"1.2rem"}}>✅</div>}
                <div style={{fontSize:"2.2rem",marginBottom:"0.6rem"}}>{c.icon}</div>
                <div style={{fontWeight:800,fontSize:"1.05rem",marginBottom:"0.35rem"}}>{c.titre}</div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.84rem",marginBottom:"1rem",lineHeight:1.5}}>{c.description}</div>
                {prog>0 && (
                  <div style={{height:"4px",background:"rgba(255,255,255,0.07)",borderRadius:"2px",marginBottom:"0.75rem"}}>
                    <div style={{height:"100%",width:`${prog}%`,background:prog>=60?"#10b981":"#f59e0b",borderRadius:"2px"}}/>
                  </div>
                )}
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <span style={G.badge(c.couleur)}>{c.lecons?.length||0} leçon{(c.lecons?.length||0)>1?"s":""}</span>
                  <span style={G.badge("#6366f1")}>{c.questions?.length||0} Q</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
