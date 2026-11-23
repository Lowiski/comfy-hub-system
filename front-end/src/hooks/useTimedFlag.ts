import { useCallback, useEffect, useRef, useState } from 'react'


export function useTimedFlag<T = boolean>(initial: T, delay = 4000) {
  const [value, setValue] = useState<T>(initial)
  const timer = useRef<number | undefined>(undefined)

  const clear = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current)
      timer.current = undefined
    }
  }, [])

  const set = useCallback((next: T) => {
    clear()
    setValue(next)
    if (next !== initial) {
      timer.current = window.setTimeout(() => {
        setValue(initial)
        timer.current = undefined
      }, delay)
    }
  }, [clear, delay, initial])

  const reset = useCallback(() => {
    clear()
    setValue(initial)
  }, [clear, initial])

  useEffect(() => clear, [clear])

  return [value, set, reset] as const
}
