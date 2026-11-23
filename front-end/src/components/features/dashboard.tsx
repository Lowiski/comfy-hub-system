import { cn } from '@/lib/cn'
import { Link } from 'react-router'
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHead,
  EmptyState,
  Icon,
  Input,
  StatCard,
  type IconName,
} from '@/components/ui'
import { moodOptions, useCurrentUser } from '@/lib/data'
import { appointmentStatusLabels, formatAppointmentDate } from '@/lib/appointments'
import { useDashboardOverview } from '@/hooks'

export default function Dashboard() {
  const user = useCurrentUser()
  const {
    db,
    counselors,
    resources,
    mood,
    setMood,
    note,
    setNote,
    savedMood,
    firstName,
    greeting,
    upcoming,
    latestMood,
    stats,
    myAppointments,
    submitMood,
  } = useDashboardOverview(user)

  return (
    <>
      <section className="welcome-card">
        <div>
          <h2>{greeting}, {firstName} 👋</h2>
          <p>
            You are in a safe space. Take a breath, check in with yourself, and reach out whenever you need to.
          </p>
          <div className="welcome-actions" style={{ marginTop: 20 }}>
            <ButtonLink size="sm" to="/appointment" variant="light">
              <Icon name="calendar" size={16} /> Book a session
            </ButtonLink>
            <ButtonLink
              size="sm"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
              to="/messages"
              variant="ghost"
            >
              <Icon name="message" size={16} /> Message a counselor
            </ButtonLink>
          </div>
        </div>
        <div style={{ position: 'relative', textAlign: 'center', minWidth: 150 }}>
          <span style={{ fontSize: 54, lineHeight: 1 }}>🌿</span>
          <p style={{ fontSize: 11.5, color: '#c9e4f5', marginTop: 6 }}>One step at a time</p>
        </div>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard
            icon={stat.icon as IconName}
            key={stat.label}
            label={stat.label}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="stack">
          <Card>
            <CardHead
              actions={latestMood && <Badge tone="teal">Last: {latestMood.mood}</Badge>}
              as="h2"
              subtitle="A quick check-in helps you notice patterns over time."
              title="How are you feeling today?"
            />
            <form onSubmit={submitMood}>
              <div className="mood-strip">
                {moodOptions.map((option) => (
                  <button
                    aria-label={`Feeling ${option.value}`}
                    className={cn('mood-button', mood === option.value ? 'selected' : '')}
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    type="button"
                  >
                    <span className="mood-emoji">{option.emoji}</span>
                    <small>{option.value}</small>
                  </button>
                ))}
              </div>
              <div className="input-inline">
                <Input
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Anything you want to note? (optional)"
                  value={note}
                />
                <Button disabled={!mood} type="submit" variant="teal">Save</Button>
              </div>
              {savedMood && (
                <p className="hint" style={{ color: 'var(--teal)', marginTop: 9 }}>Thank you — your check-in has been saved.</p>
              )}
            </form>
          </Card>

          <Card>
            <CardHead
              actions={<Link className="text-link" to="/appointment">Manage <Icon name="arrowRight" size={15} /></Link>}
              as="h2"
              subtitle="Your next conversations with the counseling team."
              title="Upcoming appointments"
            />
            {upcoming.length === 0 ? (
              <EmptyState icon="calendar" iconSize={26}>
                <p>No upcoming sessions yet. Booking one takes less than a minute.</p>
                <Link className="text-link" style={{ marginTop: 10 }} to="/appointment">
                  Book a session <Icon name="arrowRight" size={15} />
                </Link>
              </EmptyState>
            ) : (
              <div className="appt-list">
                {upcoming.map((item) => {
                  const when = formatAppointmentDate(item.date).split(' ')
                  return (
                    <div className="upcoming" key={item.id}>
                      <div className="upcoming-date">
                        <strong>{new Date(`${item.date}T12:00:00`).getDate()}</strong>
                        <small>{when[1]}</small>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4>{item.counselorName}</h4>
                        <p>{item.topic} · {item.time} · {item.format}</p>
                        <Badge tone={item.status}>{appointmentStatusLabels[item.status]}</Badge>
                      </div>
                      <ButtonLink size="sm" to="/appointment" variant="secondary">View</ButtonLink>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHead as="h2" subtitle="Someone is always ready to listen." title="Your counseling team" />
            <div className="mini-list">
              {counselors.map((counselor) => (
                <div className="mini-item" key={counselor.id}>
                  <Avatar className="avatar-teal" name={counselor.name} src={counselor.avatar ?? undefined} />
                  <div>
                    <strong>{counselor.name}</strong>
                    <small>{counselor.department ?? 'School counselor'}</small>
                  </div>
                  <Link className="badge badge-teal" to="/messages">Message</Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card>
            <CardHead as="h2" title="Recommended for you" />
            <div className="mini-list">
              {resources.slice(0, 4).map((resource) => {
                const saved = db.savedResources.includes(resource.id)
                return (
                  <div className="mini-item" key={resource.id}>
                    <span className={cn('resource-icon', resource.tone)} style={{ width: 36, height: 36 }}>
                      <Icon name={resource.icon as IconName} size={17} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 12.5 }}>{resource.title}</strong>
                      <small>{resource.category} · {resource.readTime}</small>
                    </div>
                    <Badge tone={saved ? 'teal' : undefined}>{saved ? 'Saved' : 'New'}</Badge>
                  </div>
                )
              })}
            </div>
            <Link className="text-link" style={{ marginTop: 16 }} to="/resources">Explore all resources <Icon name="arrowRight" size={15} /></Link>
          </Card>

          <div className="tip-card">
            <span className="icon-tile amber"><Icon name="sparkles" size={19} /></span>
            <h4>Wellness tip of the day</h4>
            <p>Before your next class, unclench your jaw and let your shoulders drop. One slow breath out can reset your whole moment.</p>
            <Link className="text-link" style={{ marginTop: 12 }} to="/wellness">More wellness tools <Icon name="arrowRight" size={15} /></Link>
          </div>

          <Card>
            <CardHead as="h2" title="Your progress" />
            <div className="progress-wrap">
              <div className="progress-label"><span>Mood check-ins</span><span>{Math.min(db.moods.length, 7)}/7 this week</span></div>
              <div className="progress-bar"><span style={{ width: `${Math.min(db.moods.length / 7, 1) * 100}%` }} /></div>
            </div>
            <div className="progress-wrap">
              <div className="progress-label"><span>Resources explored</span><span>{resources.length} available</span></div>
              <div className="progress-bar"><span style={{ width: '68%' }} /></div>
            </div>
            <div className="progress-wrap">
              <div className="progress-label"><span>Sessions booked</span><span>{myAppointments.length} total</span></div>
              <div className="progress-bar"><span style={{ width: `${Math.min(db.appointments.length * 25, 100)}%` }} /></div>
            </div>
          </Card>

          <Card>
            <CardHead as="h2" title="Recent activity" />
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot"><Icon name="check" size={14} /></span>
                <div><strong>Account ready</strong><small>You joined the ComfyHub community</small></div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot"><Icon name="calendar" size={14} /></span>
                <div><strong>Session scheduled</strong><small>{myAppointments[0] ? `${formatAppointmentDate(myAppointments[0].date)} with ${myAppointments[0].counselorName}` : 'Book your first session'}</small></div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot"><Icon name="bookmark" size={14} /></span>
                <div><strong>Resources saved</strong><small>{db.savedResources.length} guide{db.savedResources.length === 1 ? '' : 's'} in your collection</small></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
