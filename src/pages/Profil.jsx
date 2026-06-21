import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { coursAPI, scoresAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function Profil() {
  const { user, profil } = useAuth()
  const navigate = useNavigate()

  const [cours, setCours]       = useState([])
  const [progMap, setProgMap]   = useState({})
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const [coursData, progData, histData] = await Promise.all([
          coursAPI.getAll(),
          scoresAPI.getProgression(user.id),
          scoresAPI.getByUser(user.id),
        ])
        if (!mounted) return
        setCours(coursData)
        const map = {}
        progData.forEach(p => { map[p.cours_id] = p.best_score })
        setProgMap(map)
        setHistory(histData)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [user])

  if (loading) return <div style={G.wrap}><div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div></div>

  const moy = history.length ? Math.round(history.reduce((s,e)=>s+e.percent,0)/history.length) : 0
  const validated = Object.values(progMap).filter(v => v >= 60).length

  return (
    <div style={G.wrap}>
      {/* Header */}
      <div style={{...G.card,marginBottom:"1.5rem",background:"linear-gradient(135deg,rgba(16,185,129,0.07),rgba(99,102,241,0.05))",borderColor:"rgba(16,185,129,0.18)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1.5rem",flexWrap:"wrap"}}>
          <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"3px solid rgba(16,185,129,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem"}}>{profil?.avatar||'🧑🏿'}</div>
          <div style={{flex:1}}>
            <h2 style={{...G.h2,marginBottom:"0.2rem"}}>{profil?.prenom} {profil?.nom}</h2>
            <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.84rem",marginBottom:"0.5rem"}}>
              📧 {user.email} · 📅 Inscrit le {profil?.inscription ? new Date(profil.inscription).toLocaleDateString('fr-FR') : '—'}
            </div>
            <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
              <span style={G.badge("#10b981")}>{validated}/{cours.length} cours validés</span>
              <span style={G.badge("#f97316")}>{history.length} quiz passés</span>
              {moy>=70 && <span style={G.badge("#f59e0b")}>⭐ Bon niveau</span>}
            </div>
          </div>
          <button style={G.btn("#10b981")} onClick={()=>navigate('/profil/edit')}>✏️ Modifier</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"1rem",marginBottom:"1.5rem"}}>
        {[[moy+"%","Moyenne","#f97316"],[history.length,"Quiz passés","#6366f1"],[validated,"Cours validés","#10b981"],[Object.keys(progMap).length,"Cours tentés","#f59e0b"]].map(([v,l,c])=>(
          <div key={l} style={{...G.card,textAlign:"center",padding:"1.2rem"}}>
            <div style={{fontSize:"1.9rem",fontWeight:900,color:c}}>{v}</div>
            <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.5px",marginTop:"0.25rem"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progression par cours */}
      <h3 style={{fontWeight:800,marginBottom:"1rem",color:"#fb923c"}}>📊 Progression par cours</h3>
      {cours.map(c => {
        const p = progMap[c.id] || 0
        return (
          <div key={c.id} style={{...G.card,marginBottom:"0.75rem",padding:"1.1rem 1.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
              <span style={{fontSize:"1.6rem"}}>{c.icon}</span>
              <div style={{flex:1,minWidth:"150px"}}>
                <div style={{fontWeight:700,fontSize:"0.92rem",marginBottom:"0.35rem"}}>{c.titre}</div>
                <div style={{height:"6px",background:"rgba(255,255,255,0.07)",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${p}%`,background:p>=60?"linear-gradient(90deg,#10b981,#34d399)":p>0?"linear-gradient(90deg,#f59e0b,#fbbf24)":"transparent",borderRadius:"3px",transition:"width 0.6s ease"}}/>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                <span style={{fontWeight:800,color:p>=60?"#10b981":p>0?"#f59e0b":"rgba(255,255,255,0.3)"}}>{p}%</span>
                {p>=60 ? <span style={G.badge("#10b981")}>✓ Validé</span> : p>0 ? <span style={G.badge("#f59e0b")}>En cours</span> : <span style={G.badge("#6b7280")}>Non commencé</span>}
              </div>
              <button style={{...G.btn(c.couleur),padding:"0.45rem 0.9rem",fontSize:"0.78rem"}} onClick={()=>navigate(`/quiz/${c.id}`)}>Réviser →</button>
            </div>
          </div>
        )
      })}

      {/* Historique */}
      {history.length > 0 && (
        <>
          <h3 style={{fontWeight:800,margin:"1.5rem 0 1rem",color:"#fb923c"}}>📋 Historique des quiz</h3>
          <div style={G.card}>
            {history.slice(0,8).map((e, i) => (
              <div key={e.id||i} style={{display:"flex",alignItems:"center",gap:"1rem",padding:"0.7rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:"1.2rem"}}>{e.cours?.icon || '🎯'}</span>
                <span style={{flex:1,fontSize:"0.88rem",color:"rgba(255,255,255,0.65)"}}>{e.cours?.titre || 'Quiz complet'}</span>
                <span style={{fontWeight:800,color:e.percent>=60?"#10b981":e.percent>=40?"#f59e0b":"#f87171"}}>{e.percent}%</span>
                <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.3)"}}>{new Date(e.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
