import { useState, useEffect, useCallback } from 'react'
import { coursAPI, leconsAPI, questionsAPI, adminAPI } from '../lib/api'
import { useToast, Toast } from '../components/Toast'
import CourseForm from '../components/admin/CourseForm'
import LeconForm  from '../components/admin/LeconForm'
import QuizForm   from '../components/admin/QuizForm'
import MembreForm from '../components/admin/MembreForm'
import { G } from '../styles/theme'

const TABS = [
  ["cours",   "📚 Cours"],
  ["lecons",  "📖 Leçons"],
  ["quiz",    "🎯 Quiz"],
  ["membres", "👥 Membres"],
  ["stats",   "📊 Stats"],
]

export default function Admin() {
  const [tab, setTab]         = useState("cours")
  const [cours, setCours]     = useState([])
  const [selCours, setSelCours] = useState("")
  const [modal, setModal]     = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast, showToast }  = useToast()

  const loadCours = useCallback(async () => {
    try {
      const data = await coursAPI.getAll()
      setCours(data)
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadCours() }, [loadCours])

  const ac = cours.find(c => c.id === selCours) || null

  const TS = (a) => ({ padding:"0.5rem 1.1rem",borderRadius:"8px",border:"none",background:a?"rgba(99,102,241,0.18)":"transparent",color:a?"#818cf8":"rgba(255,255,255,0.5)",cursor:"pointer",fontWeight:700,fontSize:"0.83rem",transition:"all 0.2s" })

  const CoursSelect = () => (
    <div style={{marginBottom:"1rem"}}>
      <label style={G.label}>Cours</label>
      <select style={{...G.input,width:"auto",minWidth:"220px"}} value={selCours} onChange={e=>setSelCours(e.target.value)}>
        <option value="">-- Choisir --</option>
        {cours.map(c=><option key={c.id} value={c.id}>{c.icon} {c.titre}</option>)}
      </select>
    </div>
  )

  if (loading) return <div style={G.wrap}><div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div></div>

  return (
    <div style={G.wrap}>
      <Toast toast={toast}/>

      {/* Modals */}
      {modal?.type==="cours-new" && (
        <CourseForm showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await coursAPI.create(f); setModal(null); showToast("Cours créé !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="cours-edit" && (
        <CourseForm initial={modal.data} showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await coursAPI.update(modal.data.id,f); setModal(null); showToast("Cours modifié !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="lecon-new" && (
        <LeconForm showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await leconsAPI.create({...f, cours_id: modal.cid}); setModal(null); showToast("Leçon ajoutée !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="lecon-edit" && (
        <LeconForm initial={modal.data} showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await leconsAPI.update(modal.data.id,f); setModal(null); showToast("Leçon modifiée !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="quiz-new" && (
        <QuizForm showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await questionsAPI.create({...f, cours_id: modal.cid}); setModal(null); showToast("Question ajoutée !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="quiz-edit" && (
        <QuizForm initial={modal.data} showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try { await questionsAPI.update(modal.data.id,f); setModal(null); showToast("Question modifiée !"); await loadCours() }
          catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="membre-new" && (
        <MembreForm showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try {
            await adminAPI.createMembre(f)
            setModal(null)
            showToast("Élève ajouté ! Email d'invitation envoyé.")
          } catch(e){ showToast(e.message,false) }
        }}/>
      )}
      {modal?.type==="membre-edit" && (
        <MembreForm initial={modal.data} showToast={showToast} onClose={()=>setModal(null)} onSave={async f=>{
          try {
            await adminAPI.updateMembre(modal.data.id, { prenom:f.prenom, nom:f.nom, avatar:f.avatar })
            setModal(null)
            showToast("Élève modifié !")
          } catch(e){ showToast(e.message,false) }
        }}/>
      )}

      <h2 style={{...G.h2,marginBottom:"0.2rem"}}>⚙️ Administration</h2>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.85rem",marginBottom:"1.5rem"}}>Gérez les cours, leçons, quiz et membres</div>

      <div style={{display:"flex",gap:"0.4rem",marginBottom:"2rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"0.35rem",width:"fit-content",flexWrap:"wrap"}}>
        {TABS.map(([id,label])=>(
          <button key={id} style={TS(tab===id)} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {/* COURS */}
      {tab==="cours" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",flexWrap:"wrap",gap:"0.5rem"}}>
            <div style={{fontWeight:700}}>Cours ({cours.length})</div>
            <button style={G.btn()} onClick={()=>setModal({type:"cours-new"})}>+ Nouveau cours</button>
          </div>
          {cours.length===0 && <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Aucun cours.</div>}
          {cours.map(c=>(
            <div key={c.id} style={{...G.card,marginBottom:"0.85rem",borderLeft:`3px solid ${c.couleur}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
                  <span style={{fontSize:"2rem"}}>{c.icon}</span>
                  <div>
                    <div style={{fontWeight:700,marginBottom:"0.2rem"}}>{c.titre}</div>
                    <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.82rem",marginBottom:"0.35rem"}}>{c.description}</div>
                    <div style={{display:"flex",gap:"0.4rem"}}>
                      <span style={G.badge(c.couleur)}>{c.lecons?.length||0} leçon{(c.lecons?.length||0)>1?"s":""}</span>
                      <span style={G.badge("#6366f1")}>{c.questions?.length||0} Q</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  <button style={{...G.btnGhost,fontSize:"0.8rem"}} onClick={()=>setModal({type:"cours-edit",data:c})}>✏️</button>
                  <button style={{...G.btnGhost,fontSize:"0.8rem",color:"#f87171",borderColor:"rgba(239,68,68,0.25)"}} onClick={async()=>{
                    if(window.confirm(`Supprimer "${c.titre}" ?`)){
                      try { await coursAPI.remove(c.id); if(selCours===c.id)setSelCours(""); showToast("Cours supprimé"); await loadCours() }
                      catch(e){ showToast(e.message,false) }
                    }
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEÇONS */}
      {tab==="lecons" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1rem",flexWrap:"wrap",gap:"0.75rem"}}>
            <CoursSelect/>
            {selCours && <button style={G.btn()} onClick={()=>setModal({type:"lecon-new",cid:selCours})}>+ Nouvelle leçon</button>}
          </div>
          {!selCours && <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Sélectionnez un cours.</div>}
          {ac && (ac.lecons||[]).length===0 && <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"2rem"}}>Aucune leçon.</div>}
          {ac && (ac.lecons||[]).map((l,i)=>(
            <div key={l.id} style={{...G.card,marginBottom:"0.75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:"0.6rem",alignItems:"center",marginBottom:"0.4rem",flexWrap:"wrap"}}>
                    <span style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:"6px",padding:"0.1rem 0.5rem",fontSize:"0.75rem",fontWeight:700,color:"#f97316"}}>{i+1}</span>
                    <span style={{fontWeight:700}}>{l.titre}</span>
                    {l.video_embed && <span style={G.badge("#f97316")}>🎬 Vidéo</span>}
                  </div>
                  <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.84rem",lineHeight:1.6}}>{(l.contenu||"").slice(0,160)}{(l.contenu||"").length>160?"…":""}</div>
                </div>
                <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                  <button style={{...G.btnGhost,fontSize:"0.8rem"}} onClick={()=>setModal({type:"lecon-edit",cid:selCours,data:l})}>✏️</button>
                  <button style={{...G.btnGhost,fontSize:"0.8rem",color:"#f87171",borderColor:"rgba(239,68,68,0.25)"}} onClick={async()=>{
                    if(window.confirm("Supprimer cette leçon ?")){
                      try { await leconsAPI.remove(l.id); showToast("Leçon supprimée"); await loadCours() }
                      catch(e){ showToast(e.message,false) }
                    }
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUIZ */}
      {tab==="quiz" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"1rem",flexWrap:"wrap",gap:"0.75rem"}}>
            <CoursSelect/>
            {selCours && <button style={G.btn()} onClick={()=>setModal({type:"quiz-new",cid:selCours})}>+ Nouvelle question</button>}
          </div>
          {!selCours && <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Sélectionnez un cours.</div>}
          {ac && (ac.questions||[]).length===0 && <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"2rem"}}>Aucune question.</div>}
          {ac && (ac.questions||[]).map(q=>(
            <div key={q.id} style={{...G.card,marginBottom:"0.75rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:"1rem"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",marginBottom:"0.5rem"}}>
                    <span style={{fontSize:"1.5rem"}}>{q.image}</span>
                    <span style={{fontWeight:700,fontSize:"0.93rem"}}>{q.question}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.3rem"}}>
                    {(q.options||[]).map((o,oi)=>(
                      <div key={oi} style={{fontSize:"0.8rem",padding:"0.3rem 0.6rem",borderRadius:"6px",background:oi===q.answer?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${oi===q.answer?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.07)"}`,color:oi===q.answer?"#34d399":"rgba(255,255,255,0.55)"}}>
                        {["A","B","C","D"][oi]}. {o} {oi===q.answer?"✓":""}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                  <button style={{...G.btnGhost,fontSize:"0.8rem"}} onClick={()=>setModal({type:"quiz-edit",cid:selCours,data:q})}>✏️</button>
                  <button style={{...G.btnGhost,fontSize:"0.8rem",color:"#f87171",borderColor:"rgba(239,68,68,0.25)"}} onClick={async()=>{
                    if(window.confirm("Supprimer cette question ?")){
                      try { await questionsAPI.remove(q.id); showToast("Question supprimée"); await loadCours() }
                      catch(e){ showToast(e.message,false) }
                    }
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEMBRES */}
      {tab==="membres" && (
        <AdminMembres modal={modal} setModal={setModal} showToast={showToast}/>
      )}

      {/* STATS */}
      {tab==="stats" && (
        <AdminStats cours={cours} showToast={showToast}/>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Sous-composant : MEMBRES
// ════════════════════════════════════════════════════════════
function AdminMembres({ modal, setModal, showToast }) {
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await adminAPI.getMembres()
      setMembres(data)
    } catch (e) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  // Recharger après fermeture d'une modale membre (création/édition)
  useEffect(() => {
    if (modal === null) load()
  }, [modal, load])

  if (loading) return <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div>

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem"}}>
        <div>
          <div style={{fontWeight:800,fontSize:"1.05rem"}}>Élèves inscrits</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.82rem"}}>{membres.length} membre{membres.length>1?"s":""} au total</div>
        </div>
        <button style={G.btn("#10b981")} onClick={()=>setModal({type:"membre-new"})}>➕ Ajouter un élève</button>
      </div>

      {membres.length===0 && (
        <div style={{...G.card,textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Aucun élève inscrit.</div>
      )}

      {membres.map(m=>{
        const moy = m.avg_score
        return (
          <div key={m.id} style={{...G.card,marginBottom:"0.85rem"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:"1rem",flexWrap:"wrap"}}>
              <div style={{width:"52px",height:"52px",borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"2px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",flexShrink:0}}>{m.avatar}</div>
              <div style={{flex:1,minWidth:"180px"}}>
                <div style={{fontWeight:800,fontSize:"1rem",marginBottom:"0.15rem"}}>
                  {m.prenom} {m.nom}
                  {m.role==='admin' && <span style={{...G.badge("#818cf8"),marginLeft:"0.5rem"}}>Admin</span>}
                </div>
                <div style={{color:"rgba(255,255,255,0.45)",fontSize:"0.8rem",marginBottom:"0.5rem"}}>📧 {m.email}</div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:"0.75rem",marginBottom:"0.5rem"}}>📅 Inscrit le {new Date(m.inscription).toLocaleDateString('fr-FR')}</div>
                <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                  <span style={G.badge("#10b981")}>{m.quiz_count} quiz passé{m.quiz_count>1?"s":""}</span>
                  <span style={G.badge("#f97316")}>{m.validated_count} cours validé{m.validated_count>1?"s":""}</span>
                  {moy!==null && <span style={G.badge(moy>=60?"#10b981":moy>=40?"#f59e0b":"#ef4444")}>Moy. {moy}%</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:"0.5rem",flexShrink:0,alignSelf:"center"}}>
                <button style={{...G.btnGhost,fontSize:"0.82rem"}} onClick={()=>setModal({type:"membre-edit",data:m})}>✏️ Modifier</button>
                <button style={{...G.btnGhost,fontSize:"0.82rem",color:"#f87171",borderColor:"rgba(239,68,68,0.25)"}} onClick={async()=>{
                  if(window.confirm(`Supprimer le compte de ${m.prenom} ${m.nom} ? Cette action est irréversible.`)){
                    try { await adminAPI.deleteMembre(m.id); showToast("Élève supprimé"); await load() }
                    catch(e){ showToast(e.message,false) }
                  }
                }}>🗑️ Supprimer</button>
              </div>
            </div>

            {moy !== null && (
              <div style={{marginTop:"1rem",paddingTop:"0.75rem",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",marginBottom:"0.3rem"}}>
                  <span>Progression globale</span><span>{moy}% de moyenne</span>
                </div>
                <div style={{height:"5px",background:"rgba(255,255,255,0.07)",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${moy}%`,background:moy>=60?"linear-gradient(90deg,#10b981,#34d399)":moy>=40?"linear-gradient(90deg,#f59e0b,#fbbf24)":"linear-gradient(90deg,#ef4444,#f87171)",borderRadius:"3px",transition:"width 0.6s ease"}}/>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// Sous-composant : STATS
// ════════════════════════════════════════════════════════════
function AdminStats({ cours, showToast }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    adminAPI.getStats()
      .then(d => { if (mounted) setStats(d) })
      .catch(e => showToast(e.message, false))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [showToast])

  if (loading) return <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div>
  if (!stats) return null

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"1rem",marginBottom:"2rem"}}>
        {[[stats.totalCours,"Cours","#f97316"],[stats.totalLecons,"Leçons","#10b981"],[stats.totalQuestions,"Questions","#6366f1"],[stats.totalMembres,"Membres","#f59e0b"],[stats.totalScores,"Scores","#e63946"]].map(([n,l,c])=>(
          <div key={l} style={{...G.card,textAlign:"center"}}>
            <div style={{fontSize:"2.5rem",fontWeight:900,color:c}}>{n}</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.78rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</div>
          </div>
        ))}
      </div>

      <h3 style={{fontWeight:700,marginBottom:"1rem"}}>Détail par cours</h3>
      {cours.map(c=>(
        <div key={c.id} style={{...G.card,marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"1rem"}}>
          <span style={{fontSize:"1.8rem"}}>{c.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,marginBottom:"0.2rem"}}>{c.titre}</div>
            <div style={{display:"flex",gap:"0.5rem"}}>
              <span style={G.badge(c.couleur)}>{c.lecons?.length||0} leçons</span>
              <span style={G.badge("#6366f1")}>{c.questions?.length||0} questions</span>
            </div>
          </div>
          <div style={{height:"6px",width:"100px",background:"rgba(255,255,255,0.07)",borderRadius:"3px"}}>
            <div style={{height:"100%",width:`${Math.min(100,((c.lecons?.length||0)+(c.questions?.length||0))*7)}%`,background:`linear-gradient(90deg,${c.couleur},${c.couleur}88)`,borderRadius:"3px"}}/>
          </div>
        </div>
      ))}

      {stats.topScores?.length > 0 && (
        <>
          <h3 style={{fontWeight:700,margin:"1.5rem 0 1rem"}}>🏆 Meilleurs scores</h3>
          <div style={G.card}>
            {stats.topScores.map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span>{i+1}. {s.profils?.avatar} {s.profils?.prenom} {s.profils?.nom}</span>
                <span style={{fontWeight:800,color:"#818cf8"}}>{s.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
