import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: IconName
  iconSize?: number
  loading?: boolean
  children?: ReactNode
}

export function EmptyState({
  icon,
  iconSize = 26,
  loading = false,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)} {...props}>
      {loading ? <Skeleton /> : icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </div>
  )
}
