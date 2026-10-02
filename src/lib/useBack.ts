import { useNavigate } from 'react-router-dom'

/** History-aware back: returns to the previous screen (state preserved) or a sensible parent. */
export function useBack(fallback: string) {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }
}
