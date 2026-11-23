import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'

type StatCardProps = {
  icon: IconName
  value: ReactNode
  label: ReactNode
  tone?: string
  className?: string
}

export function StatCard({ icon, value, label, tone = '', className }: StatCardProps) {
  return (
    <article className={cn('stat-card', className)}>
      <span className={cn('stat-icon', tone)}><Icon name={icon} size={20} /></span>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </article>
  )
}
