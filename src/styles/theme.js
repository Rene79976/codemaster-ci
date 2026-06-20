// ================================================================
// theme.js — Styles partagés (objet G) utilisés dans toutes les pages
// ================================================================
export const G = {
  app:      { minHeight:"100vh", fontFamily:"'Outfit',sans-serif", color:"#e8edf5" },
  logo:     { fontSize:"1.3rem", fontWeight:800, letterSpacing:"-0.5px", background:"linear-gradient(90deg,#f97316,#fb923c,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", cursor:"pointer" },
  navBtn:   (a) => ({ padding:"0.45rem 0.9rem", borderRadius:"8px", border:"none", background:a?"rgba(249,115,22,0.15)":"transparent", color:a?"#f97316":"rgba(255,255,255,0.55)", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, transition:"all 0.2s" }),
  wrap:     { maxWidth:"960px", margin:"0 auto", padding:"2.5rem 1.5rem" },
  card:     { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"20px", padding:"1.75rem", backdropFilter:"blur(10px)" },
  badge:    (col) => ({ display:"inline-block", background:`${col}22`, color:col, border:`1px solid ${col}44`, borderRadius:"50px", padding:"0.2rem 0.75rem", fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px" }),
  btn:      (col="#f97316") => ({ padding:"0.65rem 1.5rem", background:`linear-gradient(135deg,${col},${col}cc)`, color:"#fff", border:"none", borderRadius:"10px", fontWeight:700, cursor:"pointer", fontSize:"0.9rem", transition:"all 0.2s" }),
  btnGhost: { padding:"0.55rem 1.2rem", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)", borderRadius:"10px", fontWeight:600, cursor:"pointer", fontSize:"0.85rem" },
  input:    { width:"100%", padding:"0.7rem 1rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px", color:"#e8edf5", fontSize:"0.92rem", outline:"none", boxSizing:"border-box" },
  textarea: { width:"100%", padding:"0.7rem 1rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"10px", color:"#e8edf5", fontSize:"0.88rem", outline:"none", resize:"vertical", minHeight:"90px", boxSizing:"border-box" },
  label:    { display:"block", fontSize:"0.78rem", color:"rgba(255,255,255,0.5)", marginBottom:"0.4rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" },
  h1:       { fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, lineHeight:1.1, marginBottom:"0.75rem" },
  h2:       { fontSize:"1.6rem", fontWeight:800, marginBottom:"0.5rem" },
  sub:      { color:"rgba(255,255,255,0.5)", fontSize:"0.92rem", marginBottom:"2rem" },
  row:      { display:"flex", gap:"0.75rem", alignItems:"center", flexWrap:"wrap" },
  grid2:    { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1rem" },
  divider:  { height:"1px", background:"rgba(255,255,255,0.06)", margin:"1.25rem 0" },
};

// Avatars disponibles pour les profils
export const AVATARS = ["🧑🏿","👩🏿","🧑🏾","👩🏾","👨🏿","👩🏽","🧑🏽","👨🏾","🧑","👩","👨","🧑‍🎓"];

// Numéros d'urgence Côte d'Ivoire
export const URGENCES = [
  ["🚑 1303","SAMU"],
  ["👮 110","Police"],
  ["🚒 180","Pompiers"],
  ["🚔 100","Gendarmerie"],
];

// Conseils sécurité routière
export const SECURITE_TIPS = [
  {icon:"🔒",t:"Ceinture obligatoire",b:"Le port de la ceinture est obligatoire pour le conducteur et tous les passagers. Réduction du risque de décès de 50%."},
  {icon:"📱",t:"Téléphone au volant interdit",b:"L'usage du téléphone tenu en main est interdit. Le risque d'accident est multiplié par 3. Contrôles réguliers à Abidjan et Bouaké."},
  {icon:"💤",t:"Lutte contre la somnolence",b:"1 accident sur 3 implique la fatigue. Sur les longues distances, faites des pauses de 15 min toutes les 2 heures."},
  {icon:"🌧️",t:"Saison des pluies",b:"En saison des pluies, la chaussée devient glissante. Réduisez votre vitesse et doublez la distance de sécurité."},
  {icon:"🚸",t:"Piétons et deux-roues",b:"Piétons et motos sont très présents en Côte d'Ivoire. Soyez vigilant dans les quartiers populaires et aux abords des écoles."},
  {icon:"🚌",t:"Gbaka & wôrô-wôrô",b:"Les minibus (gbaka) et taxis collectifs (wôrô-wôrô) s'arrêtent souvent de façon imprévisible. Gardez vos distances."},
];

// Extrait l'URL src d'un code embed iframe
export function extractEmbedSrc(code) {
  if (!code) return null;
  const match = code.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
