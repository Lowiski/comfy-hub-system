import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: Extract<ElementType, 'div' | 'section' | 'article'>
}

export function Card({ as = 'section', className, ...props }: CardProps) {
  return createElement(as, { className: cn('card', className), ...props })
}

type CardHeadProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  as?: 'h2' | 'h3' | 'h4'
  children?: ReactNode
}

export function CardHead({ title, subtitle, actions, as = 'h3', children, ...props }: CardHeadProps) {
  const heading = title ? createElement(as, { className: 'card-title' }, title) : null
  const copy = subtitle ? <p className="card-sub">{subtitle}</p> : null
  const hasCopy = Boolean(subtitle || actions)

  return (
    <div className="card-head" {...props}>
      {children ?? (hasCopy ? <div>{heading}{copy}</div> : heading)}
      {actions}
    </div>
  )
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h2' | 'h3' | 'h4'
}

export function CardTitle({ as = 'h3', className, children, ...props }: CardTitleProps) {
  return createElement(as, { className: cn('card-title', className), ...props }, children)
}

export function CardSub({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('card-sub', className)} {...props}>{children}</p>
}
