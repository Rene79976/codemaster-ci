// ================================================================
// api.js — Toutes les interactions avec Supabase + Netlify Functions
// ================================================================
import { supabase } from './supabase'

// ── Auth ──────────────────────────────────────────────────────
export const auth = {
  /** Connexion email + mot de passe */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  /** Déconnexion */
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /** Session courante */
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  /** Profil complet de l'utilisateur connecté */
  async getProfil(userId) {
    const { data, error } = await supabase
      .from('profils')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  /** Modifier son propre profil */
  async updateProfil(userId, updates) {
    const { data, error } = await supabase
      .from('profils')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  /** Changer son mot de passe */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },
}

// ── Cours ─────────────────────────────────────────────────────
export const coursAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('cours')
      .select('*, lecons(id, titre, contenu, video_embed, ordre), questions(id)')
      .order('ordre')
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('cours')
      .select('*, lecons(*, ordre), questions(*)')
      .eq('id', id)
      .order('ordre', { foreignTable: 'lecons' })
      .order('ordre', { foreignTable: 'questions' })
      .single()
    if (error) throw error
    return data
  },

  // Admin
  async create(payload) {
    const { data, error } = await supabase.from('cours').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('cours').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await supabase.from('cours').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Leçons ────────────────────────────────────────────────────
export const leconsAPI = {
  async create(payload) {
    const { data, error } = await supabase.from('lecons').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('lecons').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await supabase.from('lecons').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Questions ─────────────────────────────────────────────────
export const questionsAPI = {
  async getByCours(coursId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('cours_id', coursId)
      .order('ordre')
    if (error) throw error
    return data
  },

  async getAllRandom(limit = 12) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
    if (error) throw error
    return data.sort(() => Math.random() - 0.5).slice(0, limit)
  },

  async create(payload) {
    const { data, error } = await supabase.from('questions').insert(payload).select().single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('questions').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(id) {
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) throw error
  },
}

// ── Scores ────────────────────────────────────────────────────
export const scoresAPI = {
  async submit(userId, coursId, score, total) {
    const { data, error } = await supabase
      .from('scores')
      .insert({ user_id: userId, cours_id: coursId, score, total })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('scores')
      .select('percent, created_at, profils(prenom, nom, avatar)')
      .order('percent', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('scores')
      .select('*, cours(titre, icon)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getProgression(userId) {
    const { data, error } = await supabase
      .from('progression')
      .select('*, cours(titre, icon, couleur)')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
}

// ── Admin ─────────────────────────────────────────────────────
export const adminAPI = {
  /** Récupère tous les membres via Netlify Function (service role) */
  async getMembres() {
    const res = await fetch('/api/admin/membres', {
      headers: await authHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  /** Crée un élève + envoie l'email d'invitation */
  async createMembre(payload) {
    const res = await fetch('/api/admin/membres', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  /** Modifie un élève */
  async updateMembre(userId, payload) {
    const res = await fetch(`/api/admin/membres/${userId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },

  /** Supprime un élève */
  async deleteMembre(userId) {
    const res = await fetch(`/api/admin/membres/${userId}`, {
      method:  'DELETE',
      headers: await authHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
  },

  async getStats() {
    const res = await fetch('/api/admin/stats', {
      headers: await authHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
}

// Helper : injecte le JWT Supabase dans les headers
async function authHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}
