import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { coursAPI, scoresAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function Home() {
  const { user, profil } = useAuth()
  const navigate = useNavigate()
  const [cours, setCours]   = useState([])
  const [stats, setStats]   = useState({ totalCours:0, totalLecons:0, totalQuestions:0, totalMembres:0 })
  const [progMap, setProgMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await coursAPI.getAll()
        if (!mounted) return
        setCours(data)
        setStats({
          totalCours:     data.length,
          totalLecons:    data.reduce((s,c)=>s+(c.lecons?.length||0),0),
          totalQuestions: data.reduce((s,c)=>s+(c.questions?.length||0),0),
          totalMembres:   0,
        })
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

  const goCours = (c) => {
    if (!user) { navigate('/login'); return }
    navigate(`/cours/${c.id}`)
  }

  return (
    <div>
      {/* HERO */}
      <div style={{textAlign:"center",padding:"4rem 2rem 2rem",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"radial-gradient(circle,#f97316 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"inline-block",background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:"50px",padding:"0.4rem 1.1rem",marginBottom:"1.5rem",fontSize:"0.82rem",color:"#fb923c",fontWeight:700}}>
            🇨🇮 Code de la Route — République de Côte d'Ivoire
          </div>
          <h1 style={{...G.h1,background:"linear-gradient(135deg,#fff 0%,#fb923c 50%,#f59e0b 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Préparez votre permis<br/>de conduire ivoirien
          </h1>
          <p style={{color:"rgba(255,255,255,0.55)",maxWidth:"560px",margin:"0 auto 2.5rem",lineHeight:1.65,fontSize:"1rem"}}>
            Quiz interactifs, leçons de code, explications IA — tout ce qu'il faut pour réussir l'examen du permis de conduire en Côte d'Ivoire.
          </p>

          <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"3rem"}}>
            {user ? (
              <>
                <Link to="/quiz" style={{...G.btn(),padding:"1rem 2.2rem",fontSize:"1rem",boxShadow:"0 8px 30px rgba(249,115,22,0.28)",textDecoration:"none"}}>Passer un quiz →</Link>
                <Link to="/cours" style={{...G.btnGhost,padding:"1rem 2rem",fontSize:"0.95rem",textDecoration:"none"}}>Voir les cours</Link>
                <Link to="/profil" style={{...G.btn("#10b981"),padding:"1rem 2rem",fontSize:"0.95rem",textDecoration:"none"}}>👤 {profil?.prenom||'Profil'}</Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{...G.btn(),padding:"1rem 2.2rem",fontSize:"1rem",boxShadow:"0 8px 30px rgba(249,115,22,0.28)",textDecoration:"none"}}>🔑 Se connecter</Link>
                <Link to="/register" style={{...G.btnGhost,padding:"1rem 2rem",fontSize:"0.95rem",textDecoration:"none"}}>Créer un compte gratuit</Link>
              </>
            )}
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:"1.5rem",flexWrap:"wrap",marginBottom:"3rem"}}>
            {[[stats.totalCours,"Cours"],[stats.totalLecons,"Leçons"],[stats.totalQuestions,"Questions"]].map(([n,l]) => (
              <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",padding:"1rem 1.75rem",textAlign:"center"}}>
                <div style={{fontSize:"1.8rem",fontWeight:900,color:"#f97316"}}>{n}</div>
                <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.8px"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA non connecté */}
      {!user && (
        <div style={{...G.wrap,paddingTop:0,paddingBottom:"2rem"}}>
          <div style={{...G.card,background:"linear-gradient(135deg,rgba(249,115,22,0.07),rgba(99,102,241,0.05))",borderColor:"rgba(249,115,22,0.18)",textAlign:"center",padding:"2rem"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔑</div>
            <div style={{fontWeight:800,fontSize:"1.1rem",marginBottom:"0.4rem"}}>Accès réservé aux membres</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.9rem",marginBottom:"1.25rem"}}>Connectez-vous pour accéder aux cours, suivre votre progression et passer les quiz.</div>
            <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
              <Link to="/login" style={{...G.btn(),textDecoration:"none"}}>Se connecter</Link>
              <Link to="/register" style={{...G.btnGhost,textDecoration:"none"}}>Créer un compte gratuit</Link>
            </div>
          </div>
        </div>
      )}

      {/* COURS */}
      <div style={{...G.wrap,paddingTop:0}}>
        <h3 style={{fontWeight:800,marginBottom:"1rem",textAlign:"center",fontSize:"1.2rem"}}>Thèmes de formation</h3>
        {loading ? (
          <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"2rem"}}>Chargement...</div>
        ) : (
          <div style={G.grid2}>
            {cours.map(c => (
              <div key={c.id} className="hover-card" style={{...G.card,cursor:"pointer",borderLeft:`3px solid ${c.couleur}`}} onClick={()=>goCours(c)}>
                <div style={{...G.row,marginBottom:"0.6rem"}}>
                  <span style={{fontSize:"2rem"}}>{c.icon}</span>
                  <div style={{fontWeight:700,fontSize:"1rem"}}>{c.titre}</div>
                  {!user && <span style={{marginLeft:"auto",opacity:0.5}}>🔒</span>}
                </div>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.83rem",marginBottom:"0.8rem"}}>{c.description}</div>
                {user && progMap[c.id] > 0 && (
                  <div style={{height:"4px",background:"rgba(255,255,255,0.07)",borderRadius:"2px",marginBottom:"0.75rem"}}>
                    <div style={{height:"100%",width:`${progMap[c.id]}%`,background:progMap[c.id]>=60?"#10b981":"#f59e0b",borderRadius:"2px"}}/>
                  </div>
                )}
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <span style={G.badge(c.couleur)}>{c.lecons?.length||0} leçon{(c.lecons?.length||0)>1?"s":""}</span>
                  <span style={G.badge("#6366f1")}>{c.questions?.length||0} Q</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{textAlign:"center",padding:"2rem",color:"rgba(255,255,255,0.18)",fontSize:"0.78rem"}}>CodeMaster.Ci © 2026 — Code de la Route, République de Côte d'Ivoire</div>
    </div>
  )
}
