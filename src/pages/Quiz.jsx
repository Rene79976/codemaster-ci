import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { questionsAPI, scoresAPI } from '../lib/api'
import { G } from '../styles/theme'

export default function Quiz() {
  const { coursId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [score, setScore]         = useState(0)
  const [selected, setSelected]   = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [done, setDone]           = useState(false)
  const [loading, setLoading]     = useState(true)
  const [aiText, setAiText]       = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved]         = useState(false)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setDone(false); setAiText(''); setSaved(false)
    ;(async () => {
      try {
        const data = coursId === 'all'
          ? await questionsAPI.getAllRandom(12)
          : await questionsAPI.getByCours(coursId)
        if (mounted) setQuestions(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [coursId])

  const handleAnswer = useCallback((idx) => {
    if (showResult) return
    const q = questions[current]
    setSelected(idx)
    setShowResult(true)
    if (idx === q.answer) setScore(s => s + 1)
  }, [questions, current, showResult])

  const next = () => {
    const n = current + 1
    if (n >= questions.length) { setDone(true) }
    else { setCurrent(n); setSelected(null); setShowResult(false); setAiText('') }
  }

  const askAI = async (question, answer) => {
    setAiLoading(true); setAiText('')
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Tu es un expert du code de la route ivoirien. Explique pédagogiquement en 3-4 phrases la règle liée à : "${question}". Réponse correcte : "${answer}". Donne un conseil pratique pour les routes de Côte d'Ivoire.`
          }]
        })
      })
      const d = await r.json()
      setAiText(d.content?.[0]?.text || 'Explication indisponible.')
    } catch {
      setAiText("L'assistant IA est temporairement indisponible.")
    }
    setAiLoading(false)
  }

  const saveScore = async () => {
    if (!user || saving) return
    setSaving(true)
    try {
      await scoresAPI.submit(user.id, coursId === 'all' ? null : coursId, score, questions.length)
      setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={G.wrap}><div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",padding:"3rem"}}>Chargement...</div></div>

  if (questions.length === 0) return (
    <div style={G.wrap}>
      <div style={{...G.card,textAlign:"center",padding:"3rem"}}>
        <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>📭</div>
        <div style={{color:"rgba(255,255,255,0.5)",marginBottom:"1.5rem"}}>Aucune question disponible pour ce quiz.</div>
        <Link to="/quiz" style={{...G.btn(),textDecoration:"none"}}>← Retour aux quiz</Link>
      </div>
    </div>
  )

  // ── Résultats ──
  if (done) {
    const pct  = Math.round((score / questions.length) * 100)
    const mention = pct>=80?"🏆 Excellent !":pct>=60?"👍 Bien joué":pct>=40?"📚 À revoir":"❌ Insuffisant"
    const col = pct>=70?"#10b981":pct>=40?"#f59e0b":"#ef4444"
    return (
      <div style={G.wrap}>
        <div style={{...G.card,textAlign:"center",padding:"3rem 2rem"}}>
          <div style={{fontSize:"5rem",fontWeight:900,color:col}}>{pct}%</div>
          <div style={{fontSize:"1.6rem",fontWeight:800,margin:"0.5rem 0"}}>{mention}</div>
          <div style={{color:"rgba(255,255,255,0.5)",marginBottom:"2rem"}}>{score} / {questions.length} bonnes réponses</div>

          {user && (
            <div style={{maxWidth:340,margin:"0 auto 2rem"}}>
              {saved ? (
                <div style={{...G.badge("#10b981"),display:"block",textAlign:"center",padding:"0.6rem"}}>✓ Résultat enregistré dans votre profil !</div>
              ) : (
                <button style={{...G.btn("#10b981"),width:"100%",opacity:saving?0.7:1}} onClick={saveScore} disabled={saving}>
                  {saving?"⏳ Enregistrement...":"💾 Sauvegarder dans mon profil"}
                </button>
              )}
            </div>
          )}

          <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
            <button style={G.btn()} onClick={()=>window.location.reload()}>🔄 Recommencer</button>
            <button style={G.btnGhost} onClick={()=>navigate('/profil')}>👤 Mon profil</button>
            <button style={G.btnGhost} onClick={()=>navigate('/leaderboard')}>🏆 Classement</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question ──
  const q = questions[current]
  const progPct = Math.round((current / questions.length) * 100)
  const optSt = (i) => !showResult ? '' : i===q.answer ? 'correct' : i===selected ? 'wrong' : ''

  return (
    <div style={G.wrap}>
      <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"2rem"}}>
        <span style={{fontSize:"0.82rem",color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap"}}>{current+1}/{questions.length}</span>
        <div style={{flex:1,height:"6px",background:"rgba(255,255,255,0.08)",borderRadius:"3px"}}>
          <div style={{height:"100%",width:`${progPct}%`,background:"linear-gradient(90deg,#f97316,#fbbf24)",borderRadius:"3px",transition:"width 0.4s ease"}}/>
        </div>
        <span style={{fontSize:"0.85rem",color:"#f97316",fontWeight:700,whiteSpace:"nowrap"}}>✓ {score}</span>
      </div>

      <div style={G.card}>
        <div style={{fontSize:"3rem",marginBottom:"0.75rem"}}>{q.image || '🚗'}</div>
        <div style={{fontSize:"1.25rem",fontWeight:700,lineHeight:1.45,marginBottom:"1.75rem"}}>{q.question}</div>

        {(q.options || []).map((opt, i) => {
          const st = optSt(i)
          return (
            <button key={i} onClick={()=>handleAnswer(i)} style={{
              display:"block",width:"100%",textAlign:"left",padding:"0.9rem 1.25rem",marginBottom:"0.6rem",
              borderRadius:"12px",border:`2px solid ${st==='correct'?'#10b981':st==='wrong'?'#ef4444':'rgba(255,255,255,0.1)'}`,
              background:st==='correct'?'rgba(16,185,129,0.12)':st==='wrong'?'rgba(239,68,68,0.12)':'rgba(255,255,255,0.03)',
              color:"#e8edf5",cursor:showResult?"default":"pointer",fontSize:"0.93rem",fontWeight:500,transition:"all 0.2s"
            }}>
              <span style={{marginRight:"0.75rem",opacity:0.5}}>{["A","B","C","D"][i]}.</span>{opt}
            </button>
          )
        })}

        {showResult && (
          <>
            <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"10px",padding:"0.85rem 1.1rem",marginTop:"0.75rem",fontSize:"0.88rem",color:"rgba(255,255,255,0.8)",lineHeight:1.6}}>
              📖 {q.explication}
            </div>
            <button style={{...G.btnGhost,marginTop:"0.65rem",color:"#fb923c",borderColor:"rgba(249,115,22,0.3)"}} onClick={()=>askAI(q.question, q.options[q.answer])}>
              {aiLoading ? "⏳ Chargement..." : "🤖 Explication IA approfondie"}
            </button>
            {aiText && <div style={{background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.18)",borderRadius:"10px",padding:"0.85rem 1.1rem",marginTop:"0.5rem",fontSize:"0.85rem",lineHeight:1.65,color:"rgba(255,255,255,0.78)"}}>🤖 {aiText}</div>}
            <button style={{...G.btn(),width:"100%",marginTop:"1.25rem"}} onClick={next}>
              {current+1>=questions.length ? "Voir les résultats →" : "Question suivante →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
