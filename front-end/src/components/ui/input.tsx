import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/icon'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('input', className)} {...props} />
}

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: IconName
  iconSize?: number
}

export function IconInput({ icon, iconSize = 17, className, ...props }: IconInputProps) {
  return (
    <div className="input-wrap has-icon">
      <Icon name={icon} size={iconSize} />
      <Input className={className} {...props} />
    </div>
  )
}

type FieldProps = {
  label?: ReactNode
  htmlFor?: string
  optional?: ReactNode
  hint?: ReactNode
  className?: string
  children?: ReactNode
}

export function Field({ label, htmlFor, optional, hint, className, children }: FieldProps) {
  return (
    <div className={cn('field', className)}>
      {label && (
        <label htmlFor={htmlFor}>
          {label}
          {optional && <span className="field-optional">{optional}</span>}
        </label>
      )}
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

type FieldRowProps = {
  className?: string
  children?: ReactNode
}

export function FieldRow({ className, children }: FieldRowProps) {
  return <div className={cn('field-row', className)}>{children}</div>
}

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <label className={cn('search-field', className)}>
      <Icon name="search" size={17} />
      <input {...props} />
    </label>
  )
}
