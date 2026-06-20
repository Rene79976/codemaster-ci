import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { G } from '../styles/theme'

const NAV_ITEMS = [
  { to:"/",            label:"Accueil",    icon:"🏠" },
  { to:"/cours",       label:"Cours",      icon:"📚", auth:true },
  { to:"/quiz",        label:"Quiz",       icon:"🎯", auth:true },
  { to:"/leaderboard", label:"Classement", icon:"🏆" },
  { to:"/securite",    label:"Sécurité",   icon:"🛡️" },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const { user, profil, isAdmin, logout, loading } = useAuth()
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = async () => {
    await logout()
    close()
    navigate('/')
  }

  const navBtnStyle = ({ isActive }) => ({ ...G.navBtn(isActive), textDecoration:"none" })

  return (
    <>
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"1rem 2rem", borderBottom:"1px solid rgba(255,255,255,0.07)",
        background:"rgba(11,17,32,0.92)", backdropFilter:"blur(20px)",
        position:"sticky", top:0, zIndex:200,
      }}>
        <span
          style={{...G.logo, fontSize:"1.3rem"}}
          onClick={() => navigate('/')}
        >🇨🇮 CodeMaster.Ci</span>

        {/* Desktop */}
        <div className="nav-desktop">
          {NAV_ITEMS.map(n => (
            <NavLink key={n.to} to={n.to} style={navBtnStyle}
              onClick={(e) => { if (n.auth && !user) { e.preventDefault(); navigate('/login') } }}
            >
              {n.icon} {n.label}
            </NavLink>
          ))}
          <div style={{width:"1px",height:"22px",background:"rgba(255,255,255,0.1)",margin:"0 0.2rem"}}/>
          {!loading && (user ? (
            <>
              <NavLink to="/profil" style={({isActive})=>({...navBtnStyle({isActive}), color:isActive?"#10b981":"rgba(255,255,255,0.7)"})}>
                {profil?.avatar||'🧑🏿'} {profil?.prenom||'...'}
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" style={({isActive})=>({...navBtnStyle({isActive}), color:isActive?"#818cf8":"rgba(255,255,255,0.35)"})}>⚙️</NavLink>
              )}
              <button style={{...G.btnGhost,padding:"0.4rem 0.9rem",fontSize:"0.8rem"}} onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <button style={{...G.btn(),padding:"0.45rem 1.1rem",fontSize:"0.82rem"}} onClick={()=>navigate('/login')}>Connexion</button>
          ))}
        </div>

        {/* Hamburger */}
        <button className="nav-burger" onClick={()=>setOpen(o=>!o)} aria-label="Menu">
          <span className={`burger-bar ${open?"bar-1-open":""}`}/>
          <span className={`burger-bar ${open?"bar-2-open":""}`}/>
          <span className={`burger-bar ${open?"bar-3-open":""}`}/>
        </button>
      </nav>

      {/* Overlay */}
      <div className={`drawer-overlay ${open?"overlay-visible":""}`} onClick={close}/>

      {/* Drawer */}
      <aside className={`drawer ${open?"drawer-open":""}`}>
        <div style={{padding:"1.5rem 1.25rem 1rem",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <div style={{fontSize:"2.2rem"}}>{profil?.avatar||'🧑🏿'}</div>
              <div>
                <div style={{fontWeight:800,fontSize:"0.95rem"}}>{profil?.prenom} {profil?.nom}</div>
                <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.4)"}}>{user.email}</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{...G.logo,fontSize:"1.2rem"}}>🇨🇮 CodeMaster.Ci</div>
              <div style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.35)",marginTop:"0.25rem"}}>Code de la Route — Côte d'Ivoire</div>
            </>
          )}
        </div>

        <nav style={{padding:"1rem 0.75rem",flex:1,overflowY:"auto"}}>
          {NAV_ITEMS.map(n => (
            <NavLink key={n.to} to={n.to} className="drawer-item" onClick={(e)=>{ if(n.auth && !user){ e.preventDefault(); navigate('/login'); close(); return } close() }}
              style={({isActive}) => ({
                display:"flex",alignItems:"center",gap:"0.9rem",width:"100%",textAlign:"left",
                padding:"0.85rem 1rem",marginBottom:"0.25rem",borderRadius:"12px",border:"none",
                background:isActive?"rgba(249,115,22,0.13)":"transparent",
                color:isActive?"#f97316":"rgba(255,255,255,0.65)",
                fontSize:"0.97rem",fontWeight:isActive?700:500,cursor:"pointer",transition:"all 0.18s",
                textDecoration:"none",
              })}>
              <span style={{fontSize:"1.2rem",width:"1.6rem",textAlign:"center"}}>{n.icon}</span>
              {n.label}
              {n.auth && !user && <span style={{marginLeft:"auto",fontSize:"0.65rem",background:"rgba(249,115,22,0.12)",color:"#f97316",borderRadius:"4px",padding:"0.1rem 0.4rem"}}>🔒</span>}
            </NavLink>
          ))}

          <div style={{height:"1px",background:"rgba(255,255,255,0.06)",margin:"0.75rem 0"}}/>

          {user ? (
            <>
              <NavLink to="/profil" className="drawer-item" onClick={close}
                style={({isActive}) => ({display:"flex",alignItems:"center",gap:"0.9rem",width:"100%",textAlign:"left",padding:"0.85rem 1rem",marginBottom:"0.25rem",borderRadius:"12px",border:"none",background:isActive?"rgba(16,185,129,0.12)":"transparent",color:isActive?"#10b981":"rgba(255,255,255,0.65)",fontSize:"0.97rem",fontWeight:isActive?700:500,cursor:"pointer",transition:"all 0.18s",textDecoration:"none"})}>
                <span style={{fontSize:"1.2rem",width:"1.6rem",textAlign:"center"}}>👤</span>Mon profil
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="drawer-item" onClick={close}
                  style={({isActive}) => ({display:"flex",alignItems:"center",gap:"0.9rem",width:"100%",textAlign:"left",padding:"0.85rem 1rem",marginBottom:"0.25rem",borderRadius:"12px",border:"none",background:isActive?"rgba(99,102,241,0.12)":"transparent",color:isActive?"#818cf8":"rgba(255,255,255,0.55)",fontSize:"0.97rem",fontWeight:isActive?700:500,cursor:"pointer",transition:"all 0.18s",textDecoration:"none"})}>
                  <span style={{fontSize:"1.2rem",width:"1.6rem",textAlign:"center"}}>⚙️</span>Administration
                </NavLink>
              )}
              <button onClick={handleLogout} className="drawer-item" style={{display:"flex",alignItems:"center",gap:"0.9rem",width:"100%",textAlign:"left",padding:"0.85rem 1rem",borderRadius:"12px",border:"none",background:"transparent",color:"#f87171",fontSize:"0.97rem",fontWeight:500,cursor:"pointer",transition:"all 0.18s"}}>
                <span style={{fontSize:"1.2rem",width:"1.6rem",textAlign:"center"}}>🚪</span>Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/login" className="drawer-item" onClick={close} style={{display:"flex",alignItems:"center",gap:"0.9rem",width:"100%",textAlign:"left",padding:"0.85rem 1rem",borderRadius:"12px",border:"none",background:"rgba(249,115,22,0.12)",color:"#f97316",fontSize:"0.97rem",fontWeight:700,cursor:"pointer",transition:"all 0.18s",textDecoration:"none"}}>
              <span style={{fontSize:"1.2rem",width:"1.6rem",textAlign:"center"}}>🔑</span>Connexion / Inscription
            </NavLink>
          )}
        </nav>
        <div style={{padding:"1rem 1.5rem",borderTop:"1px solid rgba(255,255,255,0.07)",fontSize:"0.72rem",color:"rgba(255,255,255,0.2)"}}>CodeMaster.Ci © 2026</div>
      </aside>
    </>
  )
}
