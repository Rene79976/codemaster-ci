import { G } from '../styles/theme'

export default function ModalWrap({ title, onClose, children, wide }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={onClose}>
      <div
        style={{background:"#111827",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"2rem",width:"100%",maxWidth:wide?"620px":"480px",maxHeight:"90vh",overflowY:"auto"}}
        onClick={e => e.stopPropagation()}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div style={{fontWeight:800,fontSize:"1.05rem"}}>{title}</div>
          <button style={{...G.btnGhost,padding:"0.3rem 0.7rem",fontSize:"1rem"}} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
