import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Badge, Button, Icon, IconButton, Modal, ModalActions, ModalBody, ModalHead } from '@/components/ui'
import type { useAdminPanel } from '@/hooks'
import type { AdminAccountInput, BulkAccountResult } from '@/lib/api'
import { parseImportFile, type ImportRow } from '@/lib/admin-import'
import type { Role } from '@/lib/data'

type Admin = ReturnType<typeof useAdminPanel>

type Props = {
  admin: Admin
  onClose: () => void
  open: boolean
}

const empty = { rows: [] as ImportRow[], note: '', preview: '', error: '' }
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_ROWS = 200

export default function AdminImport({ admin, onClose, open }: Props) {
  const [rows, setRows] = useState<ImportRow[]>(empty.rows)
  const [note, setNote] = useState(empty.note)
  const [preview, setPreview] = useState(empty.preview)
  const [error, setError] = useState(empty.error)
  const [results, setResults] = useState<BulkAccountResult[] | null>(null)
  const [reading, setReading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [bulkBirthday, setBulkBirthday] = useState('')

  if (!open) return null

  const reset = () => {
    setRows(empty.rows)
    setNote(empty.note)
    setPreview(empty.preview)
    setError(empty.error)
    setResults(null)
    setReading(false)
    setImporting(false)
    setProgress(0)
    setBulkBirthday('')
    onClose()
  }

  const readFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setReading(true)
    setError('')
    setResults(null)
    setNote('')
    setPreview('')
    setProgress(0)
    const collected: ImportRow[] = []
    const messages: string[] = []
    const previews: string[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        messages.push(`${file.name} is larger than 10 MB and was skipped.`)
        continue
      }
      try {
        const outcome = await parseImportFile(file, setProgress)
        collected.push(...outcome.rows)
        if (outcome.note) messages.push(outcome.note)
        if (outcome.preview) previews.push(`${file.name}\n${outcome.preview}`)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : `Could not read ${file.name}.`)
      }
    }

    if (collected.length > MAX_ROWS) {
      messages.push(`Only the first ${MAX_ROWS} rows were kept.`)
    }
    setRows(collected.slice(0, MAX_ROWS))
    setNote(messages.join(' '))
    setPreview(previews.join('\n\n'))
    setReading(false)
    setProgress(0)
    event.target.value = ''
  }

  const updateRow = (key: string, patch: Partial<ImportRow>) => {
    setRows((current) => current.map((row) => row.key === key ? { ...row, ...patch } : row))
  }

  const invalidCount = rows.filter((row) => !row.name.trim() || !row.email.trim() || !row.schoolId.trim() || !row.birthday).length
  const adminRowCount = rows.filter((row) => row.role === 'admin').length

  const runImport = async () => {
    if (!rows.length || invalidCount) return
    setImporting(true)
    setError('')
    try {
      const accounts: AdminAccountInput[] = rows.map((row) => ({
        name: row.name,
        email: row.email,
        schoolId: row.schoolId,
        birthday: row.birthday,
        role: row.role,
        grade: row.grade,
        department: row.department,
      }))
      const outcome = await admin.importAccounts(accounts)
      setResults(outcome.results)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not import the accounts.')
    } finally {
      setImporting(false)
    }
  }

  const added = results?.filter((item) => item.status === 'added').length ?? 0
  const skipped = results?.filter((item) => item.status === 'already_added').length ?? 0

  return (
    <Modal labelledBy="admin-import-modal" onClose={reset} role="dialog">
      <ModalHead closeLabel="Close" onClose={reset}>
        <h2 id="admin-import-modal">Bulk import accounts</h2>
        <p className="card-sub">Upload Excel, CSV, or a picture of the form. Review the rows and fill in birthdays before importing.</p>
      </ModalHead>
      <ModalBody>
        {importing && (
          <div className="import-loading" role="status">
            <span aria-hidden="true" className="spinner spinner-large" />
            <strong>Importing accounts...</strong>
            <small>Saving the accounts to the school database.</small>
          </div>
        )}
        <label className="file-drop" htmlFor="admin-import-file">
          <Icon name="file" size={22} />
          <strong>Choose files</strong>
          <span>Excel .xlsx / .xls, CSV, or images</span>
          <input
            accept=".xlsx,.xls,.csv,.tsv,.txt,image/*"
            id="admin-import-file"
            multiple
            onChange={readFiles}
            type="file"
          />
        </label>

        {reading && <div className="import-progress"><span style={{ width: `${progress || 12}%` }} /></div>}
        {error && <div className="inline-error"><Icon name="alert" size={15} /> {error}</div>}
        {note && <p className="import-note">{note}</p>}
        {adminRowCount > 0 && !results && (
          <div className="inline-error">
            <Icon name="alert" size={15} /> {adminRowCount} row{adminRowCount === 1 ? '' : 's'} will be created with administrator access. Review carefully before importing.
          </div>
        )}
        {preview && <details className="import-preview"><summary>Show read text</summary><pre>{preview}</pre></details>}

        {rows.length > 0 && !results && (
          <div className="import-review">
            <div className="import-toolbar">
              <strong>{rows.length} row{rows.length === 1 ? '' : 's'} found</strong>
              <div className="import-bulk-date">
                <input aria-label="Birthday for all rows" onChange={(event) => setBulkBirthday(event.target.value)} type="date" value={bulkBirthday} />
                <Button
                  disabled={!bulkBirthday}
                  onClick={() => setRows((current) => current.map((row) => ({ ...row, birthday: bulkBirthday })))}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Apply to all
                </Button>
              </div>
            </div>
            {invalidCount > 0 && <p className="inline-error">{invalidCount} row{invalidCount === 1 ? ' needs' : 's need'} a name, email, school ID, and birthday.</p>}
            <div className="import-rows">
              {rows.map((row) => (
                <div className="import-row" key={row.key}>
                  <input aria-label="Name" onChange={(event) => updateRow(row.key, { name: event.target.value })} placeholder="Name" value={row.name} />
                  <input aria-label="Email" onChange={(event) => updateRow(row.key, { email: event.target.value })} placeholder="Email" value={row.email} />
                  <input aria-label="School ID" onChange={(event) => updateRow(row.key, { schoolId: event.target.value })} placeholder="School ID" value={row.schoolId} />
                  <select aria-label="Role" onChange={(event) => updateRow(row.key, { role: event.target.value as Role })} value={row.role}>
                    <option value="student">Student</option>
                    <option value="counselor">Counselor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input
                    aria-label="Birthday"
                    className={row.birthday ? '' : 'missing'}
                    onChange={(event) => updateRow(row.key, { birthday: event.target.value })}
                    type="date"
                    value={row.birthday}
                  />
                  <input
                    aria-label="Grade or department"
                    onChange={(event) => updateRow(row.key, row.role === 'student'
                      ? { grade: event.target.value }
                      : { department: event.target.value })}
                    placeholder={row.role === 'student' ? 'Grade' : 'Department'}
                    value={row.role === 'student' ? row.grade ?? '' : row.department ?? ''}
                  />
                  <IconButton
                    aria-label="Remove row"
                    name="close"
                    onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                    title="Remove row"
                    type="button"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="import-results">
            <div className="import-summary">
              <Badge tone="teal">{added} added</Badge>
              <Badge tone="amber">{skipped} already added</Badge>
            </div>
            {results.map((item, index) => (
              <div className="mini-item" key={`${item.name}-${index}`}>
                <Icon name={item.status === 'added' ? 'checkCircle' : 'alert'} size={17} />
                <div><strong>{item.name}</strong><small>{item.message}</small></div>
                <Badge tone={item.status === 'added' ? 'teal' : 'amber'}>{item.status === 'added' ? 'Added' : 'Already added'}</Badge>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalActions>
        {results ? (
          <Button onClick={reset} type="button" variant="teal">Done</Button>
        ) : (
          <>
            <Button disabled={importing} onClick={reset} type="button" variant="secondary">Close</Button>
            <Button
              disabled={!rows.length || invalidCount > 0 || reading}
              loading={importing}
              onClick={runImport}
              type="button"
              variant="teal"
            >
              <Icon name="check" size={15} /> {importing ? 'Importing...' : `Import ${rows.length || ''} account${rows.length === 1 ? '' : 's'}`}
            </Button>
          </>
        )}
      </ModalActions>
    </Modal>
  )
}
