'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { AdminDataTable, AdminColumn } from '@/components/admin/AdminDataTable'
import { UserRoleBadge } from '@/components/admin/UserRoleBadge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ADMIN_GET_ALL_USERS, ADMIN_REMOVE_USER, ADMIN_UPDATE_USER } from '@/graphql/admin/users'
import { useAuth } from '@/contexts/AuthContext'
import { Trash2, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'

interface UserItem {
  id: string
  username: string
  fullName: string
  email: string
  roles: string[]
  oauthProvider?: string
  createdAt: string
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { data, loading, refetch } = useQuery(ADMIN_GET_ALL_USERS)
  const [updateUser] = useMutation(ADMIN_UPDATE_USER)
  const [removeUser] = useMutation(ADMIN_REMOVE_USER)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Modals
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: UserItem | null }>({
    open: false,
    user: null,
  })
  const [roleModal, setRoleModal] = useState<{ open: boolean; user: UserItem | null; newRole: string }>({
    open: false,
    user: null,
    newRole: '',
  })

  const allUsers: UserItem[] = useMemo(() => (data as any)?.users || [], [data])

  const filteredUsers = useMemo(() => {
    let result = allUsers

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      )
    }

    // Role filter
    if (roleFilter) {
      result = result.filter((u) => u.roles?.includes(roleFilter))
    }

    // Sort
    result = [...result].sort((a: any, b: any) => {
      const aVal = a[sortKey] || ''
      const bVal = b[sortKey] || ''
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [allUsers, search, roleFilter, sortKey, sortDirection])

  // Paginate
  const totalCount = filteredUsers.length
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return
    try {
      await removeUser({ variables: { id: deleteModal.user.id } })
      setDeleteModal({ open: false, user: null })
      refetch()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleChangeRole = async () => {
    if (!roleModal.user || !roleModal.newRole) return
    try {
      await updateUser({
        variables: {
          updateUserInput: {
            id: roleModal.user.id,
            roles: [roleModal.newRole],
          },
        },
      })
      setRoleModal({ open: false, user: null, newRole: '' })
      refetch()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const columns: AdminColumn<UserItem>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div>
          <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
            {u.fullName || u.username}
          </p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
            @{u.username}
          </p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (u) => u.email,
    },
    {
      key: 'roles',
      header: 'Role',
      render: (u) => (
        <div className='flex flex-wrap gap-1'>
          {u.roles?.map((role) => (
            <UserRoleBadge key={role} role={role} />
          ))}
        </div>
      ),
    },
    {
      key: 'oauthProvider',
      header: 'Auth',
      render: (u) => (
        <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
          {u.oauthProvider || 'Email'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortable: true,
      render: (u) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className='flex items-center gap-1 justify-end'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setRoleModal({ open: true, user: u, newRole: u.roles?.[0] || 'TOURIST' })
            }}
            className='p-1.5 rounded-md transition-colors'
            title='Change role'
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            <Shield size={16} />
          </button>
          {u.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setDeleteModal({ open: true, user: u })
              }}
              className='p-1.5 rounded-md transition-colors'
              title='Delete user'
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.color = '#EF4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title='Users'
        subtitle={`${allUsers.length} total users`}
      />

      <AdminDataTable
        columns={columns}
        data={paginatedUsers}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyMessage='No users found'
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder='Search by name or email...'
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, dir) => {
          setSortKey(key)
          setSortDirection(dir)
        }}
        filters={
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className='text-sm rounded-lg border px-3 py-2 outline-none'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
              color: 'var(--color-text-body)',
            }}
          >
            <option value=''>All roles</option>
            <option value='SUPER_ADMIN'>Super Admin</option>
            <option value='ADMIN'>Admin</option>
            <option value='SUPPORT'>Support</option>
            <option value='GUIDE'>Guide</option>
            <option value='TOURIST'>Tourist</option>
          </select>
        }
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={handleDeleteUser}
        title='Delete User'
        description={`Are you sure you want to delete ${deleteModal.user?.fullName || deleteModal.user?.username}? This action cannot be undone.`}
        variant='danger'
        confirmText='Delete'
      />

      {/* Role Change Modal */}
      {roleModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div
            className='rounded-xl border p-6 w-full max-w-md'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
            }}
          >
            <h3 className='text-lg font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
              Change Role
            </h3>
            <p className='text-sm mb-4' style={{ color: 'var(--color-text-secondary)' }}>
              Change role for {roleModal.user?.fullName || roleModal.user?.username}
            </p>
            <select
              value={roleModal.newRole}
              onChange={(e) => setRoleModal({ ...roleModal, newRole: e.target.value })}
              className='w-full text-sm rounded-lg border px-3 py-2.5 mb-4 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            >
              <option value='SUPER_ADMIN'>Super Admin</option>
              <option value='ADMIN'>Admin</option>
              <option value='SUPPORT'>Support</option>
              <option value='GUIDE'>Guide</option>
              <option value='TOURIST'>Tourist</option>
            </select>
            <div className='flex items-center gap-3 justify-end'>
              <button
                onClick={() => setRoleModal({ open: false, user: null, newRole: '' })}
                className='text-sm px-4 py-2 rounded-lg border transition-colors'
                style={{
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-body)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeRole}
                className='text-sm px-4 py-2 rounded-lg text-white font-medium transition-colors'
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
