import { useEffect, useRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/components/ui/button'

type ModalProps = {
  children: ReactNode
  onClose: () => void
  className?: string
  closeOn?: 'click' | 'mousedown'
  role?: 'dialog'
  labelledBy?: string
}

export function Modal({
  children,
  onClose,
  className,
  closeOn = 'click',
  role,
  labelledBy,
}: ModalProps) {
  const stop = (event: MouseEvent) => event.stopPropagation()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.focus()

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [])

  return (
    <div
      className="modal-backdrop"
      role={role ? 'presentation' : undefined}
      onClick={closeOn === 'click' ? onClose : undefined}
      onMouseDown={closeOn === 'mousedown' ? onClose : undefined}
    >
      <div
        className={cn('modal', className)}
        ref={panelRef}
        role={role}
        aria-modal={role ? true : undefined}
        aria-labelledby={labelledBy}
        onClick={closeOn === 'click' ? stop : undefined}
        onMouseDown={closeOn === 'mousedown' ? stop : undefined}
      >
        {children}
      </div>
    </div>
  )
}

type ModalHeadProps = {
  children?: ReactNode
  onClose: () => void
  closeLabel?: string
  closeTitle?: string
  closeIconSize?: number
}

export function ModalHead({ children, onClose, closeLabel, closeTitle, closeIconSize = 18 }: ModalHeadProps) {
  return (
    <div className="modal-head">
      <div>{children}</div>
      <IconButton
        aria-label={closeLabel}
        iconSize={closeIconSize}
        name="close"
        onClick={onClose}
        title={closeTitle}
        type="button"
      />
    </div>
  )
}

type ModalBodyProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
}

export function ModalBody({ className, children, ...props }: ModalBodyProps) {
  return <div className={cn('modal-body', className)} {...props}>{children}</div>
}

export function ModalActions({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('modal-actions', className)} {...props}>{children}</div>
}

export function ModalSubmitActions({ onCancel, cancelLabel = 'Cancel', submitLabel = 'Save changes' }: {
  onCancel: () => void
  cancelLabel?: string
  submitLabel?: ReactNode
}) {
  return (
    <ModalActions>
      <Button onClick={onCancel} type="button" variant="secondary">{cancelLabel}</Button>
      <Button type="submit">{submitLabel}</Button>
    </ModalActions>
  )
}
