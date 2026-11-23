import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Icon } from '@/components/ui/icon'

type AuthShellProps = {
  children: ReactNode
  subtitle: string
  title: string
  wide?: boolean
}


export default function AuthShell({ children, subtitle, title, wide = false }: AuthShellProps) {
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <Link className="brand brand-light" to="/" aria-label="ComfyHub home">
          <span className="brand-mark"><Icon name="heart" size={20} strokeWidth={2.2} /></span>
          
        </Link>

        <div className="auth-side-quote">
          <span className="eyebrow" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: '#d8f5ef' }}>
            Your school wellbeing hub
          </span>
          <h2 style={{ marginTop: 20 }}>Support that starts with feeling safe.</h2>
          <p>
            A private place to ask questions, book time with a counselor, and build small habits that help
            school feel a little lighter.
          </p>
          <div className="auth-side-points">
            <span className="auth-side-point"><Icon name="lock" size={18} /> Confidential student spaces</span>
            <span className="auth-side-point"><Icon name="calendar" size={18} /> Simple appointment booking</span>
            <span className="auth-side-point"><Icon name="heart" size={18} /> Daily wellbeing tools</span>
          </div>
        </div>

        <p className="auth-side-footer">© {new Date().getFullYear()} ComfyHub · Built for student wellbeing</p>
      </aside>

      <main className="auth-main">
        <div className={cn('auth-card', wide ? 'wide' : '')}>
          <div className="auth-card-top">
            <Link className="text-link" to="/"><span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Icon name="arrowRight" size={15} /></span> Back to home</Link>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
