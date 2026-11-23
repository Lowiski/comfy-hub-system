export type BadgeTone =
  | 'teal'
  | 'blue'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

const badgeTones: BadgeTone[] = [
  'teal', 'blue', 'amber', 'rose', 'violet',
  'pending', 'confirmed', 'completed', 'cancelled',
]

export function badgeTone(tone: string, fallback: BadgeTone = 'blue'): BadgeTone {
  return badgeTones.includes(tone as BadgeTone) ? (tone as BadgeTone) : fallback
}
