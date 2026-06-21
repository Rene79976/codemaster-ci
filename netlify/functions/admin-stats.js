// netlify/functions/admin-stats.js
// Route : /api/admin/stats  (GET)
// ================================================================
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

async function requireAdmin(event) {
  const token = (event.headers.authorization || '').replace('Bearer ', '')
  if (!token) throw new Error('Non authentifié')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw new Error('Token invalide')
  const { data: profil } = await supabaseAdmin.from('profils').select('role').eq('id', user.id).single()
  if (profil?.role !== 'admin') throw new Error('Accès refusé')
  return user
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }

  try { await requireAdmin(event) }
  catch (e) { return json(403, { error: e.message }) }

  const [
    { count: totalMembres },
    { count: totalCours },
    { count: totalLecons },
    { count: totalQuestions },
    { count: totalScores },
    { data: topScores },
  ] = await Promise.all([
    supabaseAdmin.from('profils').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('cours').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('lecons').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('scores').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('scores')
      .select('percent, created_at, profils(prenom, nom, avatar)')
      .order('percent', { ascending: false })
      .limit(5),
  ])

  return json(200, {
    totalMembres:   totalMembres   || 0,
    totalCours:     totalCours     || 0,
    totalLecons:    totalLecons    || 0,
    totalQuestions: totalQuestions || 0,
    totalScores:    totalScores    || 0,
    topScores:      topScores      || [],
  })
}
