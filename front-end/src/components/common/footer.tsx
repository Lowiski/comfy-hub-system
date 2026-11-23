import { Link } from 'react-router'
import { Icon } from '@/components/ui/icon'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Link className="brand brand-light" to="/" aria-label="ComfyHub home">
              <span className="brand-mark"><Icon name="heart" size={20} strokeWidth={2.2} /></span>
              <span className="brand-name">Comfy<span>Hub</span></span>
            </Link>
            <p>
              A confidential counseling space where students can ask for support, track their wellbeing,
              and find trusted guidance — all in one place.
            </p>
            <div className="footer-contact">
              <span><Icon name="mail" size={16} /> support@comfyhub.school</span>
              <span><Icon name="location" size={16} /> Student Services Building, Room 204</span>
            </div>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#counselors">Meet the team</Link>
            <Link to="/#faq">FAQ</Link>
          </div>
          <div className="footer-col">
            <h3>Student portal</h3>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/appointment">Book an appointment</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/wellness">Wellness</Link>
          </div>
          <div className="footer-col">
            <h3>Get started</h3>
            <Link to="/login">Log in with school ID</Link>
            <Link to="/login">Teacher log in</Link>
            <Link to="/reset-password">Reset password</Link>
            <Link to="/login">Log in</Link>
          </div>
        </div>
        <div className="footer-notice">
          <Icon name="info" size={17} />
          <p>
            ComfyHub offers school-based support and is not an emergency service. If you are in immediate
            danger, contact local emergency services or a trusted adult right away.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ComfyHub. Built for student wellbeing.</span>
          <span className="footer-badges">
            <span><Icon name="lock" size={14} /> Private by design</span>
            <span><Icon name="shield" size={14} /> Safeguarding first</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
