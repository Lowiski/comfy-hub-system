import { cn } from '@/lib/cn'
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHead,
  CardTitle,
  EmptyState,
  Icon,
  Input,
  PageHeader,
  type IconName,
} from '@/components/ui'
import { addJournal, addMood, getDB, moodOptions } from '@/lib/data'
import { useBreathingCycle, useTimedFlag } from '@/hooks'

const tips: { icon: IconName; title: string; text: string; tone: string }[] = [
  { icon: 'sun', title: 'Get morning light', text: 'A few minutes of daylight helps your body clock and your mood.', tone: 'amber' },
  { icon: 'heart', title: 'Move gently', text: 'A short walk counts. Movement does not have to be a workout.', tone: 'rose' },
  { icon: 'brain', title: 'Take a brain break', text: 'Look away from your screen every 20 minutes for about 20 seconds.', tone: 'violet' },
  { icon: 'moon', title: 'Protect your sleep', text: 'Keep a steady wake-up time and put your phone away before bed.', tone: 'blue' },
]

export default function Wellness() {
  const [db, setDb] = useState(getDB())
  const [mood, setMood] = useState('')
  const [moodNote, setMoodNote] = useState('')
  const [journalText, setJournalText] = useState('')
  const [message, flashMessage] = useTimedFlag('', 4000)
  const { breathing, tick, phase, cycleLength, toggle } = useBreathingCycle()
  const latestMood = db.moods[0]

  function submitMood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!mood) return
    addMood(mood, moodNote)
    setMood('')
    setMoodNote('')
    setDb(getDB())
    flashMessage('Check-in saved. Well done for noticing how you feel.')
  }

  function submitJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!journalText.trim()) return
    addJournal(journalText.trim())
    setJournalText('')
    setDb(getDB())
  }

  return (
    <>
      <PageHeader
        badge={<Badge tone="teal"><Icon name="leaf" size={13} /> Your space to reset</Badge>}
        subtitle="Small, repeatable habits that help you feel steadier through the school term."
        title="Wellness"
      />

      <div className="wellness-hero">
        <Card className="mood-card">
          <CardHead
            actions={latestMood && <Badge tone="teal">Last: {latestMood.mood}</Badge>}
            subtitle="There is no good or bad answer — just honest one."
            title="Today’s mood check-in"
          />
          <form onSubmit={submitMood}>
            <div className="mood-strip">
              {moodOptions.map((option) => (
                <button
                  aria-label={`Feeling ${option.value}`}
                  className={cn('mood-button', mood === option.value ? 'selected' : '')}
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  title={option.note}
                  type="button"
                >
                  <span className="mood-emoji">{option.emoji}</span>
                  <small>{option.value}</small>
                </button>
              ))}
            </div>
            <div className="input-inline">
              <Input
                onChange={(event) => setMoodNote(event.target.value)}
                placeholder="What is behind that feeling? (optional)"
                value={moodNote}
              />
              <Button disabled={!mood} type="submit" variant="teal">Save check-in</Button>
            </div>
            {message && <p className="hint" style={{ color: 'var(--teal)', marginTop: 9 }}>{message}</p>}
          </form>
          {latestMood && (
            <div className="mood-status">
              <Icon name="sparkles" size={17} />
              {' '}Your last check-in: <strong>{latestMood.mood}</strong>{latestMood.note ? ` — “${latestMood.note}”` : ''}
            </div>
          )}
        </Card>

        <Card className="breathing-card">
          <CardTitle>Take three slow breaths</CardTitle>
          <p className="card-sub">Follow the circle. In for four, hold for four, out for six.</p>
          <div className="breath-circle" style={{ transform: `scale(${breathing ? phase.scale : 1})` }}>
            <span>{breathing ? phase.label : 'Ready?'}</span>
          </div>
          <div className="breath-controls">
            <Button onClick={toggle} size="sm" type="button" variant={breathing ? 'secondary' : 'teal'}>
              <Icon name={breathing ? 'pause' : 'play'} size={16} />
              {' '}{breathing ? 'Pause' : 'Start breathing'}
            </Button>
          </div>
          <p className="hint" style={{ marginTop: 12, textAlign: 'center' }}>
            {breathing ? `Cycle ${Math.floor(tick / cycleLength) + 1} · ${phase.seconds}s` : 'Repeat a few times, or as long as you like.'}
          </p>
        </Card>
      </div>

      <div className="wellness-grid">
        <div className="stack">
          <Card>
            <CardHead
              actions={<Badge tone="violet">{db.journal.length} entries</Badge>}
              subtitle="Noticing one good thing can gently shift your focus."
              title="Gratitude journal"
            />
            <form className="input-inline" onSubmit={submitJournal} style={{ marginTop: 0 }}>
              <Input
                onChange={(event) => setJournalText(event.target.value)}
                placeholder="One thing I am grateful for today..."
                value={journalText}
              />
              <Button disabled={!journalText.trim()} type="submit">
                <Icon name="plus" size={16} /> Add
              </Button>
            </form>
            <div className="divider" />
            {db.journal.length === 0 ? (
              <EmptyState icon="book" iconSize={25}>
                <p>Your journal is empty. Add one small thing that went well today.</p>
              </EmptyState>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {db.journal.slice(0, 5).map((entry) => (
                  <article className="journal-entry" key={entry.id}>
                    <span className="icon-tile rose" style={{ width: 32, height: 32 }}><Icon name="heart" size={16} /></span>
                    <div>
                      <p>{entry.text}</p>
                      <small>{new Date(`${entry.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHead title="Little things that help" />
            <div className="tip-grid">
              {tips.map((tip) => (
                <article className="tip-tile" key={tip.title}>
                  <h4>
                    <span className={cn('icon-tile', tip.tone)} style={{ width: 30, height: 30 }}>
                      <Icon name={tip.icon} size={16} />
                    </span>
                    {' '}{tip.title}
                  </h4>
                  <p>{tip.text}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card>
            <CardHead title="Your check-in streak" />
            <p className="streak-number">{db.moods.length}</p>
            <p className="card-sub">check-ins recorded so far</p>
            <div className="progress-wrap">
              <div className="progress-label"><span>Weekly goal</span><span>{Math.min(db.moods.length, 5)}/5</span></div>
              <div className="progress-bar"><span style={{ width: `${Math.min(db.moods.length / 5, 1) * 100}%` }} /></div>
            </div>
            <p className="hint" style={{ marginTop: 14 }}>
              Consistency matters more than intensity. Even a one-word check-in counts.
            </p>
          </Card>

          <Card>
            <CardHead title="A simple daily routine" />
            <div className="habit-row"><Icon name="sun" size={17} /> Morning: water + daylight <small>2 min</small></div>
            <div className="habit-row"><Icon name="brain" size={17} /> Between classes: one stretch <small>1 min</small></div>
            <div className="habit-row"><Icon name="heart" size={17} /> After school: name one feeling <small>1 min</small></div>
            <div className="habit-row"><Icon name="moon" size={17} /> Evening: phone away before bed <small>30 min</small></div>
          </Card>

          <div className="info-panel">
            <h4><Icon name="info" size={17} /> When self-care is not enough</h4>
            <p>If low mood, worry, or stress is getting in the way of your day, talking with a counselor can help. You do not need to wait for a crisis.</p>
            <ButtonLink size="sm" style={{ marginTop: 12 }} to="/appointment" variant="teal">Book a session</ButtonLink>
          </div>
        </div>
      </div>
    </>
  )
}
