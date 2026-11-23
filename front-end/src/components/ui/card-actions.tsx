import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type CardActionsVariant = 'modal' | 'form' | 'row' | 'bubble' | 'chat' | 'hero' | 'cta' | 'welcome'

const variantClasses: Record<CardActionsVariant, string> = {
  modal: 'modal-actions',
  form: 'form-footer',
  row: 'row-actions',
  bubble: 'bubble-edit-actions',
  chat: 'chat-head-actions',
  hero: 'hero-actions',
  cta: 'cta-actions',
  welcome: 'welcome-actions',
}

type CardActionsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardActionsVariant
}

export function CardActions({ variant = 'modal', className, children, ...props }: CardActionsProps) {
  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  )
}
