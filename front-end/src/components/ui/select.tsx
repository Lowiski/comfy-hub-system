import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  unstyled?: boolean
}

export function Select({ unstyled, className, ...props }: SelectProps) {
  return <select className={cn(!unstyled && 'input', className)} {...props} />
}
