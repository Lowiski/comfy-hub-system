import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TableProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
}

export function ManageTable({ className, children, ...props }: TableProps) {
  return <div className={cn('manage-table', className)} {...props}>{children}</div>
}

export function ManageHead({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className="manage-head" {...props}>{children}</div>
}

export function ManageRow({ className, children, ...props }: TableProps) {
  return <div className={cn('manage-row', className)} {...props}>{children}</div>
}
