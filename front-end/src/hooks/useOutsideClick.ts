import { useEffect } from 'react'


export function useOutsideClick(handler: (event: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => handler(event)
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [handler])
}
