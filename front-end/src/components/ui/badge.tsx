import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: string
  children?: ReactNode
}

export function Badge({ tone, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn('badge', tone && `badge-${tone}`, className)} {...props}>
      {children}
    </span>
  )
}
