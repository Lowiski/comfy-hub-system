import { Link } from 'react-router'
import { Icon } from '@/components/ui/icon'
import { useLoginForm } from '@/hooks'
import type { LoginMode } from '@/lib/api'
import AuthShell from '@/components/auth/auth-shell'

type LoginProps = { mode?: LoginMode }

export default function Login({ mode = 'student' }: LoginProps) {
  const {
    loginAs,
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    isAdmin,
    idLabel,
    changeMode,
    handleSubmit,
    submitting,
    visible,
    inputType,
    toggle,
  } = useLoginForm(mode)

  return (
    <AuthShell
      title={isAdmin ? 'Admin log in' : 'Welcome back'}
      subtitle={isAdmin
        ? 'Administrator access only.'
        : 'Use your school-issued ID to continue to your counseling space.'}
    >
      {!isAdmin && (
        <div className="login-mode-switch" aria-label="Login type">
          <button
            aria-pressed={loginAs === 'student'}
            className={loginAs === 'student' ? 'active' : ''}
            onClick={() => changeMode('student')}
            type="button"
          >
            Log in as Student
          </button>
          <button
            aria-pressed={loginAs === 'teacher'}
            className={loginAs === 'teacher' ? 'active' : ''}
            onClick={() => changeMode('teacher')}
            type="button"
          >
            Log in as Teacher
          </button>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-alert error"><Icon name="alert" size={17} /> {error}</div>}

        <div className="field">
          <label htmlFor="login-id">{idLabel}</label>
          <div className="input-wrap has-icon">
            <Icon name="user" size={17} />
            <input
              autoComplete="username"
              className="input"
              id="login-id"
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={isAdmin ? 'admin@test.com' : 'e.g. 20240748'}
              required
              type="text"
              value={identifier}
            />
          </div>
          <p className="hint">
            {isAdmin
              ? 'This page is reserved for portal administrators.'
              : `Use the ${loginAs === 'teacher' ? 'teacher' : 'student'} ID issued by the school.`}
          </p>
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div className="input-wrap has-icon">
            <Icon name="lock" size={17} />
            <input
              autoComplete="current-password"
              className="input"
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              style={{ paddingRight: 48 }}
              type={inputType}
              value={password}
            />
            <button
              aria-label={visible ? 'Hide password' : 'Show password'}
              className="password-toggle"
              onClick={toggle}
              type="button"
            >
              <Icon name={visible ? 'eyeOff' : 'eye'} size={17} />
            </button>
          </div>
        </div>

        {!isAdmin && (
          <div className="checkbox-row">
            <Link to="/reset-password">Forgot password?</Link>
          </div>
        )}

        <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
          {submitting ? 'Logging in…' : 'Log in'} <Icon name="arrowRight" size={17} />
        </button>
      </form>

      {!isAdmin && (
        <div className="info-panel" style={{ marginTop: 18 }}>
          <h4><Icon name="info" size={16} /> School accounts</h4>
          <p>
            Student and teacher accounts are issued by the school with unique IDs. On first login,
            you will verify your birthday and create your own password.
          </p>
        </div>
      )}
    </AuthShell>
  )
}
