import Counselor from '@/components/features/counselor'
import { RoleGate } from '@/components/common/role-gate'

export default function CounselorPage() {
  return <RoleGate allow={['counselor', 'admin']}><Counselor /></RoleGate>
}
