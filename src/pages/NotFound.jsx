import { Link } from 'react-router-dom'
import { G } from '../styles/theme'

export default function NotFound() {
  return (
    <div style={{minHeight:"calc(100vh - 65px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{...G.card,textAlign:"center",padding:"3rem",maxWidth:"420px"}}>
        <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>🚧</div>
        <div style={{fontSize:"1.4rem",fontWeight:800,marginBottom:"0.5rem"}}>Page introuvable</div>
        <div style={{color:"rgba(255,255,255,0.5)",fontSize:"0.9rem",marginBottom:"1.5rem"}}>
          Cette page n'existe pas ou a été déplacée.
        </div>
        <Link to="/" style={{...G.btn(),textDecoration:"none"}}>← Retour à l'accueil</Link>
      </div>
    </div>
  )
}
