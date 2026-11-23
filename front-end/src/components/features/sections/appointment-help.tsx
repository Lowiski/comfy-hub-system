import { ButtonLink, Card, CardHead, Icon } from '@/components/ui'

export default function AppointmentHelp() {
  return (
    <>
      <div className="info-panel">
        <h4><Icon name="info" size={17} /> What to expect</h4>
        <p>Your first session is a conversation, not a test. Your counselor will ask what brought you in and what you hope will change.</p>
        <ul>
          <li>Online sessions meet in your private Messages space.</li>
          <li>Arrive a few minutes early if you are meeting in person.</li>
          <li>You can pause or skip any question you do not want to answer.</li>
        </ul>
      </div>

      <Card className="help-card">
        <CardHead title="Need to talk sooner?" />
        <p>For urgent support between appointments, send a message or visit the counseling office during school hours.</p>
        <ButtonLink size="sm" to="/messages" variant="teal"><Icon name="message" size={16} /> Send a message</ButtonLink>
      </Card>
    </>
  )
}
