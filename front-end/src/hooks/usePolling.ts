import { useEffect } from 'react'


export function usePolling(load: () => void | Promise<void>, intervalMs = 2500) {
  useEffect(() => {
    void load()
    const timer = window.setInterval(() => {
      void load()
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [load, intervalMs])
}
