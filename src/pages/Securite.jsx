import { G, SECURITE_TIPS, URGENCES } from '../styles/theme'

export default function Securite() {
  return (
    <div style={G.wrap}>
      <h2 style={G.h2}>🛡️ Sécurité Routière en Côte d'Ivoire</h2>
      <p style={G.sub}>Conseils adaptés aux réalités des routes ivoiriennes.</p>

      <div style={G.grid2}>
        {SECURITE_TIPS.map((t, i) => (
          <div key={i} style={G.card}>
            <div style={{fontSize:"1.8rem",marginBottom:"0.6rem"}}>{t.icon}</div>
            <div style={{fontWeight:700,marginBottom:"0.4rem"}}>{t.t}</div>
            <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.87rem",lineHeight:1.65}}>{t.b}</div>
          </div>
        ))}
      </div>

      <div style={{...G.card,marginTop:"1.5rem",textAlign:"center",background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.18)"}}>
        <div style={{fontSize:"1.3rem",fontWeight:800,color:"#f87171",marginBottom:"1rem"}}>🆘 Numéros d'urgence — Côte d'Ivoire</div>
        <div style={{display:"flex",justifyContent:"center",gap:"2rem",flexWrap:"wrap"}}>
          {URGENCES.map(([n, l]) => (
            <div key={n} style={{textAlign:"center"}}>
              <div style={{fontSize:"1.3rem",fontWeight:900}}>{n}</div>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.45)"}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
