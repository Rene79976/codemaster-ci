// netlify/functions/set-password.js
// Route : /api/set-password  (POST)
// Permet à un élève invité de définir son mot de passe via token
// ================================================================
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')    return json(405, { error: 'Méthode non autorisée' })

  const { token, password } = JSON.parse(event.body || '{}')

  if (!token || !password) return json(400, { error: 'Token et mot de passe requis.' })
  if (password.length < 6)  return json(400, { error: 'Mot de passe trop court (min. 6 caractères).' })

  // 1. Vérifier le token d'invitation
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError || !invite) return json(404, { error: 'Lien invalide ou expiré.' })
  if (invite.used)            return json(400, { error: 'Ce lien a déjà été utilisé.' })
  if (new Date(invite.expires_at) < new Date()) return json(400, { error: 'Ce lien a expiré. Contactez votre administrateur.' })

  // 2. Récupérer l'utilisateur par email
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  if (usersError) return json(500, { error: 'Erreur serveur.' })

  const user = users.find(u => u.email === invite.email)
  if (!user) return json(404, { error: 'Utilisateur introuvable.' })

  // 3. Mettre à jour le mot de passe
  const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
  if (pwError) return json(500, { error: pwError.message })

  // 4. Marquer l'invitation comme utilisée
  await supabaseAdmin.from('invitations').update({ used: true }).eq('token', token)

  return json(200, {
    message: 'Mot de passe défini avec succès. Vous pouvez maintenant vous connecter.',
    email:   invite.email,
  })
}
