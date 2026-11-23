import Admin from '@/components/features/admin'
import { RoleGate } from '@/components/common/role-gate'

export default function AdminPage() {
  return <RoleGate allow={['admin']}><Admin /></RoleGate>
}
