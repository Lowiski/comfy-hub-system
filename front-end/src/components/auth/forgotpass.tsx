import { Link, useLocation, useNavigate } from 'react-router'
import { Icon } from '@/components/ui/icon'
import { passwordRules } from '@/lib/password'
import { usePasswordVisibility, usePasswordReset, type ResetState } from '@/hooks'
import AuthShell from '@/components/auth/auth-shell'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const incoming = (location.state ?? {}) as ResetState
  const { visible, inputType, toggle } = usePasswordVisibility()
  const {
    step,
    schoolId,
    setSchoolId,
    birthday,
    setBirthday,
    password,
    setPassword,
    confirm,
    setConfirm,
    error,
    submitting,
    verifiedName,
    isFirstLogin,
    currentStep,
    today,
    titles,
    goToId,
    handleId,
    handleBirthday,
    handlePassword,
  } = usePasswordReset(incoming)

  return (
    <AuthShell title={titles[step].title} subtitle={titles[step].subtitle}>
      <div className="reset-steps" aria-label="Password reset progress">
        {['School ID', 'Birthday', 'New password'].map((label, index) => (
          <span className={index <= currentStep ? 'active' : ''} key={label}>
            <b>{index + 1}</b> {label}
          </span>
        ))}
      </div>

      {step !== 'done' && error && (
        <div className="form-alert error" style={{ marginTop: 18 }}>
          <Icon name="alert" size={17} /> {error}
        </div>
      )}

      {isFirstLogin && step !== 'done' && (
        <div className="form-alert success" style={{ marginTop: 18 }}>
          <Icon name="info" size={17} />
          <span>Welcome, {verifiedName || 'student'}. You are using the default password, so please set your own now.</span>
        </div>
      )}

      {step === 'id' && (
        <form className="auth-form" style={{ marginTop: 18 }} onSubmit={handleId}>
          <div className="field">
            <label htmlFor="reset-id">School ID</label>
            <div className="input-wrap has-icon">
              <Icon name="user" size={17} />
              <input
                autoComplete="username"
                className="input"
                id="reset-id"
                onChange={(event) => setSchoolId(event.target.value)}
                placeholder="e.g. 20240748"
                required
                type="text"
                value={schoolId}
              />
            </div>
            <p className="hint">Use the ID issued by the school, not your email.</p>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Checking…' : 'Continue'} <Icon name="arrowRight" size={16} />
          </button>
          <p className="auth-footer">Remembered it? <Link to="/login">Back to log in</Link></p>
        </form>
      )}

      {step === 'birthday' && (
        <form className="auth-form" style={{ marginTop: 18 }} onSubmit={handleBirthday}>
          <div className="account-chip">
            <Icon name="user" size={16} />
            <span>School ID: <strong>{schoolId}</strong></span>
            <button onClick={goToId} type="button">Change</button>
          </div>
          <div className="field">
            <label htmlFor="reset-birthday">Birthday</label>
            <div className="input-wrap has-icon">
              <Icon name="calendar" size={17} />
              <input
                autoComplete="bday"
                className="input"
                id="reset-birthday"
                max={today}
                min="1900-01-01"
                onClick={(event) => {
                  if ('showPicker' in event.currentTarget) event.currentTarget.showPicker()
                }}
                onChange={(event) => setBirthday(event.target.value)}
                required
                type="date"
                value={birthday}
              />
            </div>
            <p className="hint">Choose the birthday saved on your school record from the calendar.</p>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Verifying…' : 'Verify birthday'} <Icon name="arrowRight" size={16} />
          </button>
          <p className="auth-footer">Remembered it? <Link to="/login">Back to log in</Link></p>
        </form>
      )}

      {step === 'password' && (
        <form className="auth-form" style={{ marginTop: 18 }} onSubmit={handlePassword}>
          <div className="field">
            <label htmlFor="reset-new-password">New password</label>
            <div className="input-wrap has-icon">
              <Icon name="lock" size={17} />
              <input
                autoComplete="new-password"
                className="input"
                id="reset-new-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
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
          <div className="field">
            <label htmlFor="reset-confirm-password">Confirm new password</label>
            <div className="input-wrap has-icon">
              <Icon name="lock" size={17} />
              <input
                autoComplete="new-password"
                className="input"
                id="reset-confirm-password"
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat your new password"
                required
                type={inputType}
                value={confirm}
              />
            </div>
            <div className="password-rules" aria-label="Password requirements">
              {passwordRules.map((rule) => {
                const passed = rule.test(password)
                return (
                  <span className={passed ? 'passed' : ''} key={rule.id}>
                    <Icon name={passed ? 'checkCircle' : 'check'} size={13} /> {rule.label}
                  </span>
                )
              })}
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Saving…' : 'Save new password'} <Icon name="checkCircle" size={16} />
          </button>
        </form>
      )}

      {step === 'done' && (
        <>
          <div className="form-alert success" style={{ marginTop: 18 }}>
            <Icon name="checkCircle" size={18} />
            <span>Your password has been updated. You are now signed in.</span>
          </div>
          <div className="info-panel" style={{ marginTop: 18 }}>
            <h4><Icon name="info" size={16} /> Keep it private</h4>
            <p>Use only your own password. Never share it with classmates or staff.</p>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/dashboard')} type="button">
              Continue to dashboard <Icon name="arrowRight" size={16} />
            </button>
            <Link className="btn btn-secondary btn-block" to="/login">Back to log in</Link>
          </div>
        </>
      )}
    </AuthShell>
  )
}
