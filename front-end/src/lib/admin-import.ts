import type { AdminAccountInput, ApiRole } from './api'

export type ImportRow = AdminAccountInput & { key: string }

export type ParseOutcome = {
  rows: ImportRow[]
  sourceName: string
  note?: string
  preview?: string
}

type Field = keyof AdminAccountInput

const aliases: Record<string, Field> = {
  name: 'name',
  fullname: 'name',
  full_name: 'name',
  studentname: 'name',
  student_name: 'name',
  email: 'email',
  emailaddress: 'email',
  email_address: 'email',
  gmail: 'email',
  schoolid: 'schoolId',
  school_id: 'schoolId',
  studentid: 'schoolId',
  student_id: 'schoolId',
  id: 'schoolId',
  lrn: 'schoolId',
  role: 'role',
  accounttype: 'role',
  account_type: 'role',
  type: 'role',
  birthday: 'birthday',
  birthdate: 'birthday',
  birth_date: 'birthday',
  dob: 'birthday',
  dateofbirth: 'birthday',
  date_of_birth: 'birthday',
  grade: 'grade',
  yearlevel: 'grade',
  year_level: 'grade',
  year: 'grade',
  section: 'grade',
  department: 'department',
  office: 'department',
}

const key = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const fieldOf = (value: string): Field | undefined => aliases[key(value)]

function clean(value: unknown): string {
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).replace(/\u00a0/g, ' ').trim()
}

function normalizeRole(value: string): ApiRole {
  const text = value.toLowerCase()
  if (text.includes('admin')) return 'admin'
  if (text.includes('counsel') || text.includes('teacher')) return 'counselor'
  return 'student'
}

function normalizeBirthday(value: string): string {
  const text = clean(value)
  if (!text) return ''
  const iso = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`
  const slash = text.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/)
  if (slash) {
    const first = Number(slash[1])
    const second = Number(slash[2])
    const month = first > 12 ? second : first
    const day = first > 12 ? first : second
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${slash[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  const monthName = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/i)
  if (monthName) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const month = months.indexOf(monthName[1].toLowerCase()) + 1
    if (month) return `${monthName[3]}-${String(month).padStart(2, '0')}-${monthName[2].padStart(2, '0')}`
  }
  return ''
}

function toRow(values: Partial<Record<Field, string>>): ImportRow {
  const role = normalizeRole(clean(values.role) || 'student')
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: clean(values.name),
    email: clean(values.email).toLowerCase(),
    schoolId: clean(values.schoolId),
    birthday: normalizeBirthday(values.birthday ?? ''),
    role,
    grade: role === 'student' ? clean(values.grade ?? '') : undefined,
    department: role !== 'student' ? clean(values.department ?? '') : undefined,
  }
}

function splitDelimited(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { current += '"'; index += 1 }
      else quoted = !quoted
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim())
      current = ''
    } else current += char
  }
  cells.push(current.trim())
  return cells
}

function parseDelimited(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const delimiter = ['\t', ',', ';'].sort((a, b) => (lines[0].split(b).length - lines[0].split(a).length))[0]
  return lines.map((line) => splitDelimited(line, delimiter))
}

function headerMap(row: unknown[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {}
  row.forEach((cell, index) => {
    const field = fieldOf(clean(cell))
    if (field && map[field] === undefined) map[field] = index
  })
  return map
}

function matrixToRows(matrix: unknown[][]): ImportRow[] {
  if (!matrix.length) return []
  let headerIndex = matrix.findIndex((row) => Object.keys(headerMap(row)).length >= 2)
  const map = headerIndex >= 0
    ? headerMap(matrix[headerIndex])
    : { name: 0, email: 1, schoolId: 2, role: 3, birthday: 4, grade: 5, department: 6 }
  if (headerIndex < 0) headerIndex = -1

  return matrix.slice(headerIndex + 1).map((cells) => {
    const values: Partial<Record<Field, string>> = {}
    ;(Object.entries(map) as [Field, number][]).forEach(([field, index]) => {
      values[field] = clean(cells[index])
    })
    return toRow(values)
  }).filter((row) => row.name || row.email || row.schoolId)
}

function splitTextCells(line: string): string[] {
  if (line.includes('\t') || line.includes('|')) return line.split(/[\t|]/).map((cell) => cell.trim())
  return line.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean)
}

function parseOcrText(text: string): ImportRow[] {
  const rows: ImportRow[] = []
  let current: Partial<Record<Field, string>> = {}
  let order: Field[] = []

  const push = () => {
    if (current.name || current.email || current.schoolId) rows.push(toRow(current))
    current = {}
  }

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) return
    const mapped = headerMap(splitTextCells(line))
    if (Object.keys(mapped).length >= 2) {
      order = Object.entries(mapped).sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0)).map(([field]) => field as Field)
      return
    }

    const colon = line.indexOf(':')
    if (colon > 0) {
      const field = fieldOf(line.slice(0, colon))
      if (field) {
        const value = line.slice(colon + 1).trim()
        if ((field === 'email' && current.email) || (field === 'schoolId' && current.schoolId)) push()
        current[field] = value
        return
      }
    }

    if (order.length) {
      const cells = splitTextCells(line)
      if (cells.length > 1) {
        const next: Partial<Record<Field, string>> = {}
        order.forEach((field, index) => { next[field] = clean(cells[index]) })
        if ((next.email && current.email) || (next.schoolId && current.schoolId)) push()
        current = { ...current, ...next }
      }
    }
  })
  push()
  return rows
}

async function recognizeImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    corePath: '/tesseract/tesseract-core',
    gzip: true,
    langPath: '/tesseract',
    logger: (event) => {
      if (event.status === 'recognizing text') onProgress?.(Math.round(event.progress * 100))
    },
    workerBlobURL: false,
    workerPath: '/tesseract/worker.min.js',
  })
  try {
    const result = await worker.recognize(file)
    return result.data.text
  } finally {
    await worker.terminate()
  }
}

export async function parseImportFile(file: File, onProgress?: (progress: number) => void): Promise<ParseOutcome> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(extension) || file.type.startsWith('image/')) {
    const text = await recognizeImage(file, onProgress)
    return {
      rows: parseOcrText(text),
      sourceName: file.name,
      note: 'Image read with OCR. Check every field before importing.',
      preview: text.trim(),
    }
  }
  if (['xlsx', 'xls'].includes(extension)) {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false }) as unknown[][]
    return { rows: matrixToRows(matrix), sourceName: file.name }
  }
  if (['csv', 'tsv', 'txt'].includes(extension) || file.type.includes('csv')) {
    return { rows: matrixToRows(parseDelimited(await file.text())), sourceName: file.name }
  }
  throw new Error('Use an Excel (.xlsx), CSV, or image file.')
}
