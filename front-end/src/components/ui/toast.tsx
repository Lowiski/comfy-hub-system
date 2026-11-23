import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'

type ToastProps = {
  children: ReactNode
  tone?: 'success' | 'error'
  icon?: IconName
  role?: 'alert' | 'status'
  className?: string
}

export function Toast({ children, tone = 'success', icon, role, className }: ToastProps) {
  return (
    <div
      className={cn('toast', tone === 'error' && 'toast-error', className)}
      role={role ?? (tone === 'error' ? 'alert' : 'status')}
    >
      <Icon name={icon ?? (tone === 'error' ? 'alert' : 'checkCircle')} size={18} />
      {children}
    </div>
  )
}
