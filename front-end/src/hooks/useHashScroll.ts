import { useEffect } from 'react'


export function useHashScroll(hash: string) {
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(hash.slice(1))
    if (target) window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [hash])
}
