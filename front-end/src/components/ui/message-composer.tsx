import type { FormEvent, KeyboardEvent } from 'react'
import { Icon } from '@/components/ui/icon'

type MessageComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  placeholder: string
  ariaLabel: string
  sendLabel: string
  note: string
  disabled?: boolean
  enterToSend?: boolean
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  sendLabel,
  note,
  disabled = false,
  enterToSend = false,
}: MessageComposerProps) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(event)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!enterToSend) return
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form className="compose-area" onSubmit={submit}>
      <div className="compose-row">
        <textarea
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={value}
        />
        <button aria-label={sendLabel} className="send-button" disabled={disabled} type="submit">
          <Icon name="send" size={19} />
        </button>
      </div>
      <p className="chat-note">{note}</p>
    </form>
  )
}
