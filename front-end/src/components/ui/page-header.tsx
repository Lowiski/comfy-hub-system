import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
}

type SectionHeadProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode
  kicker?: ReactNode
  subtitle?: ReactNode
  center?: boolean
}

export function SectionHead({ title, kicker, subtitle, center, className, ...props }: SectionHeadProps) {
  return (
    <div className={cn('section-head', center && 'center', className)} {...props}>
      {kicker && <span className="section-kicker">{kicker}</span>}
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-sub">{subtitle}</p>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('page-head', className)} {...props}>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="page-title" style={eyebrow ? { marginTop: 12 } : undefined}>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {badge}
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}
