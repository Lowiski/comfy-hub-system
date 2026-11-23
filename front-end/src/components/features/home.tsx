import { cn } from '@/lib/cn'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Icon, type IconName } from '@/components/ui/icon'
import { publicApi, type ApiCounselor } from '@/lib/api'
import heroImage from '@/assets/img.jpg'


const supportCards: { icon: IconName; title: string; text: string; tone: string; link: string }[] = [
  {
    icon: 'message',
    title: 'One-to-one counseling',
    text: 'Talk privately with a trained counselor about academics, friendships, or anything else on your mind.',
    tone: '',
    link: '/appointment',
  },
  {
    icon: 'users',
    title: 'Group & peer support',
    text: 'Join guided small-group sessions and learn from students who are navigating similar challenges.',
    tone: 'blue',
    link: '/resources',
  },
  {
    icon: 'shield',
    title: 'A confidential space',
    text: 'You choose what to share. Your records stay within the school counseling team and are handled with care.',
    tone: 'violet',
    link: '/login',
  },
]

const steps = [
  {
    title: 'Log in with your ID',
    text: 'Your school account is ready. Use your unique school ID and set your own password on first login.',
  },
  {
    title: 'Choose your support',
    text: 'Book a session, message a counselor, or explore self-help resources at your own pace.',
  },
  {
    title: 'Feel heard & supported',
    text: 'Meet with someone who listens, understands your school context, and helps you find a way forward.',
  },
]

const faqs = [
  {
    q: 'Is counseling free for students?',
    a: 'Yes. ComfyHub is provided by your school at no cost to students. You can book a session and use every resource without payment.',
  },
  {
    q: 'Will my teacher or parents see what I share?',
    a: 'Your conversations are private and only shared with the counseling team. If there is a serious safety concern, a counselor will involve the right trusted adults to keep you safe.',
  },
  {
    q: 'What if I am not sure I need counseling?',
    a: 'That is completely okay. A check-in conversation can help you work out what you need — even if the answer is simply a few coping tools.',
  },
  {
    q: 'Can I message a counselor instead of booking a session?',
    a: 'Yes. Messaging is available for shorter questions and check-ins. Your counselor may suggest a face-to-face session if your topic needs more time.',
  },
]

export default function Home() {
  const location = useLocation()
  const [team, setTeam] = useState<ApiCounselor[]>([])

  useEffect(() => {
    void publicApi.counselors()
      .then((result) => setTeam(Array.isArray(result.counselors) ? result.counselors : []))
      .catch(() => setTeam([]))
  }, [])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const target = document.getElementById(id)
    if (target) window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [location.hash])

  const featuredCounselor = team.find((counselor) => counselor.name === 'Michael Tura') ?? {
    id: '',
    name: 'Michael Tura',
    schoolId: null,
    department: null,
    avatar: null,
  }

  return (
    <>
      <div className="announcement">
        <div className="container">
          <Icon name="sparkles" size={15} />
          <span>Appointments are open for the term.</span>
          <Link to="/appointment">Book your session</Link>
        </div>
      </div>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="heart" size={14} /> Student counseling, made approachable</span>
            <h1 className="hero-title">
              A calmer school day starts with{' '}
              <span>someone who listens.</span>
            </h1>
            <p className="hero-text">
              ComfyHub brings your school’s counseling team into one private, easy-to-use space.
              Book a session, send a message, and find tools that help you feel more like yourself.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/login">
                Log in with school ID <Icon name="arrowRight" size={17} />
              </Link>
              <Link className="btn btn-secondary" to="/#how-it-works">
                <Icon name="info" size={17} /> How it works
              </Link>
            </div>
            <div className="hero-trust">
              <span className="hero-trust-item"><Icon name="shield" size={17} /> Confidential by default</span>
              <span className="hero-trust-item"><Icon name="users" size={17} /> Trusted school counselors</span>
              <span className="hero-trust-item"><Icon name="checkCircle" size={17} /> Free for students</span>
            </div>
          </div>

          
          <div className="hero-visual">
            <div className="float-card one">
              <span className="float-icon"><Icon name="message" size={18} /></span>
              <div><strong>Safe to talk</strong><small>Private student space</small></div>
            </div>
            <div className="hero-frame">
              <img alt="A counselor supporting a student in a calm school setting" src={heroImage} />
              <div className="hero-frame-caption">
                <div>
                  <strong>Your wellbeing matters</strong>
                  <small>Support is a click away</small>
                </div>
                <span className="badge badge-teal"><Icon name="check" size={13} /> Verified team</span>
              </div>
            </div>
            <div className="float-card two">
              <span className="float-icon blue"><Icon name="calendar" size={18} /></span>
              <div><strong>1,200+ sessions</strong><small>Supported this year</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="support">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">How we help</span>
            <h2 className="section-title">Support that fits your journey</h2>
            <p className="section-sub">
              There is no “right” reason to reach out. Choose the kind of support that feels right for you today.
            </p>
          </div>
          <div className="grid-3">
            {supportCards.map((card) => (
              <article className="feature-card" key={card.title}>
                <span className={cn('icon-tile', card.tone)}><Icon name={card.icon} size={23} /></span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link className="text-link" to={card.link}>Learn more <Icon name="arrowRight" size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">Simple by design</span>
            <h2 className="section-title">Getting support takes three steps</h2>
            <p className="section-sub">We removed the awkward parts so asking for help feels as normal as any other school task.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card" key={step.title}>
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container split">
          <div className="split-visual">
            <div className="split-visual-inner">
              <span className="quote-mark">“</span>
              <div className="testimonial-card">
                <blockquote>
                  I used to dread walking into the counseling office. With ComfyHub I could write down what
                  was bothering me first, and by the time we met I actually felt ready to talk.
                </blockquote>
                <div className="person">
                  <span className="avatar avatar-teal">LP</span>
                  <div><strong>Louie P.</strong><small>3rd year college</small></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="section-kicker">A safe space</span>
            <h2 className="section-title">Built around trust, not paperwork</h2>
            <p className="section-sub">
              Counseling works best when you feel comfortable. Every part of ComfyHub is designed to make
              that first step easier — and to keep your story yours.
            </p>
            <div className="promise-list">
              <div className="promise-item"><Icon name="lock" size={18} /> Private conversations with your counseling team</div>
              <div className="promise-item"><Icon name="clock" size={18} /> Flexible booking around your school day</div>
              <div className="promise-item"><Icon name="brain" size={18} /> Tools created for real student pressures</div>
              <div className="promise-item"><Icon name="heart" size={18} /> Counselors who know your school community</div>
            </div>
            <div style={{ marginTop: 26 }}>
              <Link className="btn btn-primary" to="/login">Log in to ComfyHub <Icon name="arrowRight" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="counselors">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">Meet the team</span>
            <h2 className="section-title">Real people, ready to listen</h2>
            <p className="section-sub">Our counseling team brings different strengths so you can find the right fit.</p>
          </div>
          <div className="counselor-single">
            <article className="counselor-card" key={featuredCounselor.id || 'michael-tura'}>
              <span className={cn('counselor-avatar', 'teal')}>
                {featuredCounselor.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </span>
              <h3>{featuredCounselor.name}</h3>
              <p className="role">{featuredCounselor.department ?? 'School counselor'}</p>
              <p>Here to listen, support you, and help you find a way forward.</p>
              <Link className="text-link" to="/appointment">
                Book with {featuredCounselor.name.split(' ').slice(-1)[0]} <Icon name="arrowRight" size={15} />
              </Link>
              <span className="badge badge-teal" style={{ marginTop: 12 }}>Available now</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-tint" id="faq">
        <div className="container">
          <div className="section-head center">
            <span className="section-kicker">Good to know</span>
            <h2 className="section-title">Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>You do not have to figure it out alone.</h2>
            <p>Take the first small step. Log in with your school ID and connect with someone who cares.</p>
            <div className="cta-actions">
              <Link className="btn btn-light" to="/login">Log in with school ID <Icon name="arrowRight" size={16} /></Link>
            </div>
            <div className="trust-strip">
              <span><Icon name="lock" size={14} /> Private</span>
              <span><Icon name="checkCircle" size={14} /> Free for students</span>
              <span><Icon name="shield" size={14} /> School-supported</span>
            </div>
          </div>
        </div>
      </section>

      
    </>
  )
}
