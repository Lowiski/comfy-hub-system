import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'

type ButtonVariant = '' | 'primary' | 'secondary' | 'teal' | 'ghost' | 'light' | 'danger' | 'danger-soft'

type SharedStyleProps = {
  variant?: ButtonVariant
  size?: 'sm'
  block?: boolean
  className?: string
  children?: ReactNode
  loading?: boolean
}

function buttonClass({ variant = '', size, block, className, loading }: SharedStyleProps) {
  return cn('btn', variant && `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', loading && 'btn-loading', className)
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & SharedStyleProps

export function Button({ variant, size, block, className, children, loading = false, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className, loading })}
      disabled={disabled || loading}
    >
      {loading && <span aria-hidden="true" className="spinner spinner-inline" />}
      {children}
    </button>
  )
}

type ButtonLinkProps = Omit<LinkProps, 'className'> & SharedStyleProps

export function ButtonLink({ variant, size, block, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, block, className })} {...props}>
      {children}
    </Link>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: IconName
  iconSize?: number
  danger?: boolean
}

export function IconButton({ name, iconSize = 18, danger, className, children, ...props }: IconButtonProps) {
  return (
    <button className={cn('icon-button', danger && 'icon-button-danger', className)} {...props}>
      <Icon name={name} size={iconSize} />
      {children}
    </button>
  )
}

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button className={cn('chip', active && 'active', className)} {...props}>
      {children}
    </button>
  )
}

type LinkButtonProps = Omit<LinkProps, 'className'> & {
  primary?: boolean
  danger?: boolean
  className?: string
}

export function LinkButton({ primary, danger, className, children, ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn('link-button', primary && 'primary', danger && 'link-button-danger', className)}
      {...props}
    >
      {children}
    </Link>
  )
}
