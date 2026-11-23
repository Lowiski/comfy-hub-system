import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHead,
  Chip,
  ConfirmModal,
  Field,
  FieldRow,
  Icon,
  IconButton,
  Input,
  ManageHead,
  ManageRow,
  ManageTable,
  Modal,
  ModalActions,
  ModalBody,
  ModalHead,
  SearchField,
  Select,
  type IconName,
} from '@/components/ui'
import type { AccountFilter, useAdminPanel } from '@/hooks'
import type { Role } from '@/lib/data'
import AdminActivity from './admin-activity'
import AdminImport from './admin-import'

type Admin = ReturnType<typeof useAdminPanel>

type Props = {
  admin: Admin
}

const filters: { id: AccountFilter; label: string }[] = [
  { id: 'all', label: 'All users' },
  { id: 'student', label: 'Students' },
  { id: 'counselor', label: 'Counselors' },
  { id: 'admin', label: 'Administrators' },
]

const roleLabels: Record<Role, string> = {
  student: 'Student',
  counselor: 'Counselor',
  admin: 'Admin',
}

const roleTones: Record<Role, string> = {
  student: 'teal',
  counselor: 'blue',
  admin: 'violet',
}

const roleIcons: Record<Role, IconName> = {
  student: 'graduation',
  counselor: 'shield',
  admin: 'key',
}

export default function AdminAccounts({ admin }: Props) {
  const {
    accountFilter,
    accountForm,
    accountQuery,
    activities,
    addOpen,
    closeAccountModal,
    db,
    editingId,
    openAdd,
    openEdit,
    pending,
    pendingRemove,
    removeAccount,
    saveAccount,
    setAccountFilter,
    setAccountForm,
    setAccountQuery,
    setPendingRemove,
    user,
  } = admin
  const [importOpen, setImportOpen] = useState(false)

  const query = accountQuery.trim().toLowerCase()
  const users = db.users.filter((account) => {
    const matchesRole = accountFilter === 'all' || account.role === accountFilter
    const haystack = [account.name, account.email, account.studentId, account.schoolId, account.department]
    const matchesQuery = !query || haystack.some((value) => value?.toLowerCase().includes(query))
    return matchesRole && matchesQuery
  })

  return (
    <div className="stack">
      <Card>
        <CardHead
          actions={(
            <div className="row-actions">
              <Button disabled={pending} onClick={() => setImportOpen(true)} size="sm" variant="secondary"><Icon name="file" size={15} /> Bulk import</Button>
              <Button disabled={pending} onClick={openAdd} size="sm" variant="teal"><Icon name="plus" size={15} /> Add account</Button>
            </div>
          )}
          subtitle="Add, import, update, filter, or delete portal accounts."
          title="Accounts"
        />
        <div className="admin-filter-row">
          <div className="filter-bar">
            {filters.map((filter) => (
              <Chip active={accountFilter === filter.id} key={filter.id} onClick={() => setAccountFilter(filter.id)} type="button">
                {filter.label}
              </Chip>
            ))}
          </div>
          <SearchField
            onChange={(event) => setAccountQuery(event.target.value)}
            placeholder="Search name, email, or school ID"
            value={accountQuery}
          />
        </div>
        <ManageTable>
          <ManageHead><span>Name</span><span>Email</span><span>Role</span><span>Details</span><span>Actions</span></ManageHead>
          {users.map((account) => (
            <ManageRow key={account.id}>
              <div>
                <strong>{account.name}</strong>
                <small>{account.id === user?.id ? 'You' : 'Portal user'}</small>
              </div>
              <div>{account.email}</div>
              <div>
                <Badge tone={roleTones[account.role]}><Icon name={roleIcons[account.role]} size={12} /> {roleLabels[account.role]}</Badge>
              </div>
              <div><small>{account.studentId ?? account.schoolId ?? account.department ?? '—'}</small></div>
              <div className="row-actions">
                <IconButton
                  disabled={pending}
                  iconSize={15}
                  name="edit"
                  onClick={() => openEdit(account)}
                  title="Update account"
                  type="button"
                />
                {account.id === user?.id
                  ? <Badge tone="violet">You</Badge>
                  : (
                    <IconButton
                      danger
                      disabled={pending}
                      iconSize={15}
                      name="trash"
                      onClick={() => setPendingRemove(account)}
                      title="Delete account"
                      type="button"
                    />
                  )}
              </div>
            </ManageRow>
          ))}
        </ManageTable>
      </Card>

      <AdminActivity items={activities} />

      {addOpen && (
        <Modal labelledBy="admin-account-modal" onClose={closeAccountModal} role="dialog">
          <ModalHead closeLabel="Close" onClose={closeAccountModal}>
            <h2 id="admin-account-modal">{editingId ? 'Update account' : 'Add an account'}</h2>
            <p className="card-sub">
              {editingId
                ? 'Update the account details saved in the school database.'
                : 'New accounts start with password 123456. School ID and birthday are used to verify the first-login reset.'}
            </p>
          </ModalHead>
          <form onSubmit={saveAccount}>
            <ModalBody>
              <Field htmlFor="account-name" label="Full name">
                <Input
                  id="account-name"
                  onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })}
                  required
                  value={accountForm.name}
                />
              </Field>
              <FieldRow>
                <Field htmlFor="account-email" label="Email">
                  <Input
                    id="account-email"
                    onChange={(event) => setAccountForm({ ...accountForm, email: event.target.value })}
                    required
                    type="email"
                    value={accountForm.email}
                  />
                </Field>
                <Field htmlFor="account-school-id" label="School ID">
                  <Input
                    id="account-school-id"
                    onChange={(event) => setAccountForm({ ...accountForm, schoolId: event.target.value })}
                    required
                    value={accountForm.schoolId}
                  />
                </Field>
              </FieldRow>
              <Field htmlFor="account-birthday" label="Birthday">
                <Input
                  id="account-birthday"
                  onChange={(event) => setAccountForm({ ...accountForm, birthday: event.target.value })}
                  required
                  type="date"
                  value={accountForm.birthday}
                />
              </Field>
              <FieldRow>
                <Field htmlFor="account-role" label="Role">
                  <Select
                    id="account-role"
                    onChange={(event) => setAccountForm({ ...accountForm, role: event.target.value as Role })}
                    value={accountForm.role}
                  >
                    <option value="student">Student</option>
                    <option value="counselor">Counselor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Field>
                <Field htmlFor="account-detail" label="Grade or department">
                  <Input
                    id="account-detail"
                    onChange={(event) => setAccountForm({
                      ...accountForm,
                      grade: accountForm.role === 'student' ? event.target.value : accountForm.grade,
                      department: accountForm.role !== 'student' ? event.target.value : accountForm.department,
                    })}
                    value={accountForm.role === 'student' ? accountForm.grade : accountForm.department}
                  />
                </Field>
              </FieldRow>
            </ModalBody>
            <ModalActions>
              <Button disabled={pending} onClick={closeAccountModal} type="button" variant="secondary">Cancel</Button>
              <Button loading={pending} type="submit" variant="teal"><Icon name={editingId ? 'edit' : 'plus'} size={15} /> {editingId ? 'Save changes' : 'Add account'}</Button>
            </ModalActions>
          </form>
        </Modal>
      )}

      {importOpen && <AdminImport admin={admin} onClose={() => setImportOpen(false)} open={importOpen} />}

      {pendingRemove && (
        <ConfirmModal
          confirmLabel="Delete account"
          danger
          loading={pending}
          message={`Delete ${pendingRemove.name} from the portal? This cannot be undone.`}
          onCancel={() => setPendingRemove(null)}
          onConfirm={() => removeAccount(pendingRemove.id)}
          title="Delete account"
        />
      )}
    </div>
  )
}
