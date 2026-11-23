import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type DateGroupHeaderProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode
}

export function DateGroupHeader({ className, children, ...props }: DateGroupHeaderProps) {
  return <span className={cn('chat-day', className)} {...props}>{children}</span>
}
