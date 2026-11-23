import { Button } from '@/components/ui/button'
import { Modal, ModalActions, ModalHead } from '@/components/ui/modal'

export type ConfirmModalProps = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <ModalHead closeLabel="Close" onClose={onCancel}>
        <h2>{title}</h2>
        <p className="card-sub">{message}</p>
      </ModalHead>
      <ModalActions>
        <Button disabled={loading} onClick={onCancel} type="button" variant="secondary">{cancelLabel}</Button>
        <Button loading={loading} onClick={onConfirm} type="button" variant={danger ? 'danger' : 'primary'}>
          {loading ? 'Working...' : confirmLabel}
        </Button>
      </ModalActions>
    </Modal>
  )
}
