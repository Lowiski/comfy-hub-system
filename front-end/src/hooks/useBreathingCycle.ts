import { useEffect, useState } from 'react'

const phases = [
  { label: 'Breathe in', seconds: 4, scale: 1.2 },
  { label: 'Hold', seconds: 4, scale: 1.2 },
  { label: 'Breathe out', seconds: 6, scale: 1 },
]
const cycleLength = phases.reduce((total, phase) => total + phase.seconds, 0)


export function useBreathingCycle() {
  const [breathing, setBreathing] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!breathing) return
    const timer = window.setInterval(() => setTick((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [breathing])

  const position = tick % cycleLength
  const phase = position < 4 ? phases[0] : position < 8 ? phases[1] : phases[2]

  function toggle() {
    if (breathing) {
      setBreathing(false)
      setTick(0)
    } else {
      setTick(0)
      setBreathing(true)
    }
  }

  return { breathing, tick, phase, cycleLength, toggle }
}
