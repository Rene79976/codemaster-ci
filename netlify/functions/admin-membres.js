// netlify/functions/admin-membres.js
// Route : /api/admin/membres  (GET, POST)
//         /api/admin/membres/:id  (PATCH, DELETE)
// ================================================================
const { createClient } = require('@supabase/supabase-js')
const { Resend }       = require('resend')

// ── Clients ──────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY)

// ── CORS helpers ─────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// ── Auth guard : vérifie JWT + rôle admin ────────────────────
async function requireAdmin(event) {
  const token = (event.headers.authorization || '').replace('Bearer ', '')
  if (!token) throw new Error('Non authentifié')

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) throw new Error('Token invalide')

  const { data: profil } = await supabaseAdmin
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profil?.role !== 'admin') throw new Error('Accès refusé — admin requis')
  return user
}

// ── EMAIL : invitation nouvel élève ──────────────────────────
async function sendInvitationEmail({ email, prenom, nom, token }) {
  const appUrl    = process.env.VITE_APP_URL || 'https://codemaster-ci.netlify.app'
  const loginLink = `${appUrl}/set-password?token=${token}`

  await resend.emails.send({
    from:    `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to:      email,
    subject: `🇨🇮 Bienvenue sur CodeMaster.Ci, ${prenom} !`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0b1120;font-family:'Outfit',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#f59e0b);padding:32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🇨🇮</div>
            <h1 style="margin:0;color:#fff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">CodeMaster.Ci</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Code de la Route — République de Côte d'Ivoire</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="color:#f97316;font-size:20px;margin:0 0 12px;">Bonjour ${prenom} ${nom} ! 👋</h2>
            <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;margin:0 0 20px;">
              Votre compte a été créé sur <strong style="color:#f97316;">CodeMaster.Ci</strong>,
              la plateforme de formation au code de la route en Côte d'Ivoire.
            </p>
            <p style="color:rgba(255,255,255,0.75);font-size:15px;line-height:1.6;margin:0 0 28px;">
              Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre espace :
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${loginLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;
                        text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;
                        font-size:16px;letter-spacing:0.3px;">
                🔑 Définir mon mot de passe
              </a>
            </div>

            <!-- Info box -->
            <div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.25);border-radius:12px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;line-height:1.6;">
                📧 <strong>Email :</strong> ${email}<br>
                ⏰ <strong>Ce lien expire dans 7 jours.</strong><br>
                Si vous ne l'utilisez pas dans ce délai, contactez votre administrateur.
              </p>
            </div>

            <p style="color:rgba(255,255,255,0.4);font-size:12px;line-height:1.5;margin:0;">
              Si vous n'attendiez pas cet email, vous pouvez l'ignorer en toute sécurité.<br>
              Lien direct : <a href="${loginLink}" style="color:#f97316;">${loginLink}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:12px;">
              CodeMaster.Ci © 2026 — Code de la Route, République de Côte d'Ivoire
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  })
}

// ── Handler principal ─────────────────────────────────────────
exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }

  try {
    await requireAdmin(event)
  } catch (e) {
    return json(403, { error: e.message })
  }

  const pathParts = (event.path || '').split('/').filter(Boolean)
  const userId    = pathParts[pathParts.length - 1]
  const isSubPath = userId && userId !== 'membres'

  // ── GET /api/admin/membres ──────────────────────────────────
  if (event.httpMethod === 'GET' && !isSubPath) {
    const { data, error } = await supabaseAdmin
      .from('profils')
      .select('id, prenom, nom, avatar, role, inscription')
      .order('inscription', { ascending: false })

    if (error) return json(500, { error: error.message })

    // Enrichit avec email (depuis auth.users) et stats
    const enriched = await Promise.all(data.map(async (p) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.id)
      const { data: scores }   = await supabaseAdmin
        .from('scores')
        .select('percent')
        .eq('user_id', p.id)
      const { data: prog }     = await supabaseAdmin
        .from('progression')
        .select('best_score')
        .eq('user_id', p.id)

      const quizCount     = scores?.length || 0
      const avgScore      = quizCount ? Math.round(scores.reduce((s, r) => s + r.percent, 0) / quizCount) : null
      const validatedCount = prog?.filter(r => r.best_score >= 60).length || 0

      return {
        ...p,
        email:          authUser?.user?.email || '',
        quiz_count:     quizCount,
        avg_score:      avgScore,
        validated_count: validatedCount,
      }
    }))

    return json(200, enriched)
  }

  // ── POST /api/admin/membres — créer un élève ────────────────
  if (event.httpMethod === 'POST' && !isSubPath) {
    const { prenom, nom, email, avatar = '🧑🏿' } = JSON.parse(event.body || '{}')

    if (!prenom || !nom || !email) return json(400, { error: 'prenom, nom et email sont requis' })

    // 1. Créer l'utilisateur dans Supabase Auth (mot de passe temporaire)
    //    user_metadata est lu par le trigger handle_new_user() qui crée
    //    automatiquement la ligne profils correspondante.
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password:      tempPassword,
      email_confirm: true,  // considéré confirmé — le lien sert à changer le mdp
      user_metadata: { prenom, nom, avatar },
    })
    if (authError) return json(400, { error: authError.message })

    // 2. S'assurer que le profil est correct (le trigger a déjà créé la ligne,
    //    on la met à jour au cas où — upsert pour robustesse)
    const { error: profilError } = await supabaseAdmin.from('profils').upsert({
      id:     authUser.user.id,
      prenom,
      nom,
      avatar,
      role:   'eleve',
    })
    if (profilError) return json(500, { error: profilError.message })

    // 3. Créer une invitation avec token
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invitations')
      .insert({ email, prenom, nom })
      .select()
      .single()
    if (inviteError) return json(500, { error: inviteError.message })

    // 4. Envoyer l'email d'invitation
    try {
      await sendInvitationEmail({ email, prenom, nom, token: invite.token })
    } catch (emailErr) {
      console.error('Email non envoyé:', emailErr.message)
      // On ne bloque pas la création si l'email échoue
    }

    return json(201, {
      message:  'Élève créé et email d\'invitation envoyé.',
      userId:   authUser.user.id,
      inviteUrl: `${process.env.VITE_APP_URL}/set-password?token=${invite.token}`,
    })
  }

  // ── PATCH /api/admin/membres/:id — modifier un élève ────────
  if (event.httpMethod === 'PATCH' && isSubPath) {
    const { prenom, nom, avatar, role, email } = JSON.parse(event.body || '{}')
    const updates = {}
    if (prenom) updates.prenom = prenom
    if (nom)    updates.nom    = nom
    if (avatar) updates.avatar = avatar
    if (role)   updates.role   = role

    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseAdmin.from('profils').update(updates).eq('id', userId)
      if (error) return json(500, { error: error.message })
    }

    if (email) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email })
      if (error) return json(500, { error: error.message })
    }

    return json(200, { message: 'Élève mis à jour.' })
  }

  // ── DELETE /api/admin/membres/:id — supprimer un élève ──────
  if (event.httpMethod === 'DELETE' && isSubPath) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return json(500, { error: error.message })
    return json(200, { message: 'Élève supprimé.' })
  }

  return json(405, { error: 'Méthode non autorisée' })
}
