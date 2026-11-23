import { cn } from '@/lib/cn'
type AvatarProps = {
  src?: string
  name?: string
  className?: string
}

export function Avatar({ src, name = 'Student', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return <img alt="" className={cn('avatar', className)} src={src} />
  }

  return <span className={cn('avatar', className)}>{initials || 'S'}</span>
}
