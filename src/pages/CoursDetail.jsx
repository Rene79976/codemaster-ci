import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { coursAPI, scoresAPI } from '../lib/api'
import { G, extractEmbedSrc } from '../styles/theme'

export default function CoursDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cours, setCours]   = useState(null)
  const [prog, setProg]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await coursAPI.getById(id)
        if (!mounted) return
        setCours(data)

        if (user) {
          const progData = await scoresAPI.getProgression(user.id)
          const found = progData.find(p => p.cours_id === id)
          if (found) setProg(found.best_score)
        }
      } catch (e) {
        setError("Ce cours est introuvable.")
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, user])

  if (loading) return <div style={G.wrap}><div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div></div>
  if (error || !cours) return (
    <div style={G.wrap}>
      <div style={{...G.card,textAlign:"center",padding:"3rem"}}>
        <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>❌</div>
        <div style={{color:"rgba(255,255,255,0.5)",marginBottom:"1.5rem"}}>{error || "Cours introuvable."}</div>
        <Link to="/cours" style={{...G.btn(),textDecoration:"none"}}>← Retour aux cours</Link>
      </div>
    </div>
  )

  const lecons = cours.lecons || []
  const quiz   = cours.questions || []

  return (
    <div style={G.wrap}>
      <button style={{...G.btnGhost,marginBottom:"1.5rem"}} onClick={()=>navigate('/cours')}>← Retour aux cours</button>

      <div style={{...G.row,marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
        <span style={{fontSize:"2.5rem"}}>{cours.icon}</span>
        <div style={{flex:1}}>
          <h2 style={{...G.h2,marginBottom:"0.2rem"}}>{cours.titre}</h2>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.9rem",marginBottom:"0.5rem"}}>{cours.description}</div>
          {prog>0 && (
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <div style={{flex:1,maxWidth:"200px",height:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"3px"}}>
                <div style={{height:"100%",width:`${prog}%`,background:prog>=60?"#10b981":"#f59e0b",borderRadius:"3px"}}/>
              </div>
              <span style={{fontSize:"0.78rem",color:prog>=60?"#10b981":"#f59e0b",fontWeight:700}}>{prog}% réussi</span>
            </div>
          )}
        </div>
      </div>

      <h3 style={{fontWeight:700,marginBottom:"1rem",color:"#fb923c"}}>📚 Leçons ({lecons.length})</h3>
      {lecons.length === 0 && <div style={{color:"rgba(255,255,255,0.35)",marginBottom:"1.5rem"}}>Aucune leçon pour ce cours.</div>}

      {lecons.map((l, i) => {
        const src = extractEmbedSrc(l.video_embed)
        return (
          <div key={l.id} style={{...G.card,marginBottom:"0.85rem"}}>
            <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
              <div style={{minWidth:"2rem",height:"2rem",background:"rgba(249,115,22,0.12)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#f97316",fontSize:"0.9rem"}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem",flexWrap:"wrap"}}>
                  <span style={{fontWeight:700}}>{l.titre}</span>
                  {src && <span style={G.badge("#f97316")}>🎬 Vidéo</span>}
                </div>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.87rem",lineHeight:1.65}}>{l.contenu}</div>
                {src && (
                  <div className="video-wrap">
                    <iframe
                      src={src}
                      title={l.titre}
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <div style={G.divider}/>
      <div style={{display:"flex",gap:"1rem",alignItems:"center",flexWrap:"wrap"}}>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.88rem"}}>{quiz.length} question{quiz.length>1?"s":""} disponible{quiz.length>1?"s":""}</div>
        <button style={G.btn()} onClick={()=>navigate(`/quiz/${cours.id}`)} disabled={quiz.length===0}>🎯 Lancer le quiz →</button>
      </div>
    </div>
  )
}
