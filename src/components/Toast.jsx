import { useState, useCallback, useRef } from 'react'

/**
 * Hook simple de notification toast.
 * Usage :
 *   const { toast, showToast } = useToast()
 *   showToast("Cours créé !")
 *   showToast("Erreur", false)
 *   <Toast toast={toast} />
 */
export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 2200)
  }, [])

  return { toast, showToast }
}

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`toast ${toast.ok ? 'toast-ok' : 'toast-err'}`}>
      {toast.ok ? '✓' : '✕'} {toast.msg}
    </div>
  )
}
