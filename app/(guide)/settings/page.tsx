'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { UPDATE_USER_PROFILE, UPDATE_STRIPE_ACCOUNT } from '@/graphql/settings'
import {
  GET_NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCES
} from '@/graphql/notifications'
import { MY_BALANCE } from '@/graphql/balance'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { PageHeader } from '@/components/ui/PageHeader'

interface NotificationPreferences {
  id: string
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
}

interface Balance {
  id: string
  stripeAccountId?: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')

  return (
    <div>
      <PageHeader title='Settings' />

      {/* Tabs */}
      <div className='flex gap-4 mb-8' style={{ borderBottom: '1px solid var(--color-card-border)' }}>
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          Profile
        </TabButton>
        <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}>
          Preferences
        </TabButton>
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          Security
        </TabButton>
      </div>

      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'preferences' && <PreferencesTab />}
      {activeTab === 'security' && <SecurityTab />}
    </div>
  )
}

function ProfileTab() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [stripeAccountId, setStripeAccountId] = useState('')

  // Hydrate form from `user` when it becomes available after mount.
  // Without this, navigating to /settings while the auth check is still in
  // flight leaves the form permanently empty — useState only reads `user`
  // on the initial render.
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setUsername(user.username || '')
    }
  }, [user])

  const { data: balanceData } = useQuery<{ myBalance: Balance }>(MY_BALANCE, { skip: !user })

  const [updateProfile, { loading: savingProfile }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => toast.success('Profile updated successfully'),
    onError: (error) => toast.error(error.message || 'Failed to update profile')
  })

  const [updateStripe, { loading: savingStripe }] = useMutation(UPDATE_STRIPE_ACCOUNT, {
    onCompleted: () => { toast.success('Stripe account connected successfully'); setStripeAccountId('') },
    onError: (error) => toast.error(error.message || 'Failed to connect Stripe account')
  })

  const stripeConnected = !!balanceData?.myBalance?.stripeAccountId

  const handleSaveProfile = async () => {
    if (!user) return
    if (!fullName.trim()) { toast.error('Full name is required'); return }
    if (!username.trim()) { toast.error('Username is required'); return }
    try {
      await updateProfile({ variables: { input: { id: user.id, fullName: fullName.trim(), username: username.trim() } } })
    } catch { /* Handled by onError */ }
  }

  const handleConnectStripe = async () => {
    if (!user || !stripeAccountId.trim()) { toast.error('Please enter a Stripe Account ID'); return }
    try {
      await updateStripe({ variables: { guideId: user.id, stripeAccountId: stripeAccountId.trim() } })
    } catch { /* Handled by onError */ }
  }

  return (
    <div className='max-w-2xl'>
      <div className='rounded-xl border p-6 mb-6' style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
        <h2 className='text-xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Guide Profile</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Full Name</label>
            <input type='text' value={fullName} onChange={(e) => setFullName(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }} placeholder='Your full name' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Username</label>
            <input type='text' value={username} onChange={(e) => setUsername(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
              style={{ borderColor: 'var(--color-card-border)' }} placeholder='Your username' />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Email</label>
            <input type='email' value={user?.email || ''}
              className='w-full px-4 py-3 border rounded-lg'
              style={{ backgroundColor: 'var(--color-section-bg)', color: 'var(--color-text-muted)', borderColor: 'var(--color-card-border)' }} disabled />
            <p className='text-xs mt-1' style={{ color: 'var(--color-text-muted)' }}>Email cannot be changed. Contact support if needed.</p>
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile}
            className='w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition'
            style={{ backgroundColor: 'var(--color-primary)' }}>
            {savingProfile && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className='rounded-xl border p-6' style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
        <h2 className='text-xl font-semibold mb-4' style={{ color: 'var(--color-text-heading)' }}>Payment Account</h2>
        {stripeConnected ? (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-2 h-2 rounded-full' style={{ backgroundColor: 'var(--color-success)' }}></div>
              <span className='font-medium' style={{ color: 'var(--color-success)' }}>Stripe Connected</span>
            </div>
            <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>
              Account ID: {balanceData?.myBalance?.stripeAccountId?.slice(0, 12)}...
            </p>
            <p className='text-xs mt-2' style={{ color: 'var(--color-text-muted)' }}>
              To change your Stripe account, go to{' '}
              <a href='/settings/payments' style={{ color: 'var(--color-primary)' }} className='hover:underline'>Payment Settings</a>
            </p>
          </div>
        ) : (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-2 h-2 rounded-full' style={{ backgroundColor: 'var(--color-text-muted)' }}></div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Not Connected</span>
            </div>
            <p className='text-sm mb-4' style={{ color: 'var(--color-text-muted)' }}>Connect your Stripe account to receive payouts</p>
            <div className='flex gap-2'>
              <input type='text' value={stripeAccountId} onChange={(e) => setStripeAccountId(e.target.value)}
                placeholder='acct_...' className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }} />
              <button onClick={handleConnectStripe} disabled={savingStripe || !stripeAccountId.trim()}
                className='text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition'
                style={{ backgroundColor: 'var(--color-info)' }}>
                {savingStripe && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
                Connect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PreferencesTab() {
  const [preferences, setPreferences] = useState({ emailEnabled: true, pushEnabled: true, smsEnabled: false })
  const { data, loading } = useQuery<{ myNotificationPreferences: NotificationPreferences }>(GET_NOTIFICATION_PREFERENCES)
  const [updatePreferences, { loading: saving }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES, {
    onCompleted: () => toast.success('Preferences saved successfully'),
    onError: (error) => toast.error(error.message || 'Failed to save preferences')
  })

  useEffect(() => {
    if (data?.myNotificationPreferences) {
      const prefs = data.myNotificationPreferences
      setPreferences({ emailEnabled: prefs.emailEnabled, pushEnabled: prefs.pushEnabled, smsEnabled: prefs.smsEnabled })
    }
  }, [data])

  const handleSave = async () => {
    try { await updatePreferences({ variables: { input: preferences } }) } catch { /* Handled by onError */ }
  }

  if (loading) {
    return (
      <div className='max-w-2xl rounded-xl border p-6' style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
        <div className='animate-pulse space-y-6'>
          {[1, 2, 3].map((i) => (<div key={i} className='h-12 rounded' style={{ backgroundColor: 'var(--color-section-bg)' }}></div>))}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl rounded-xl border p-6' style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
      <h2 className='text-xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Notification Preferences</h2>
      <div className='space-y-6'>
        <ToggleRow label='Email Notifications' description='Receive booking confirmations and updates via email'
          checked={preferences.emailEnabled} onChange={(checked) => setPreferences({ ...preferences, emailEnabled: checked })} />
        <ToggleRow label='Push Notifications' description='Receive real-time browser push notifications'
          checked={preferences.pushEnabled} onChange={(checked) => setPreferences({ ...preferences, pushEnabled: checked })} />
        <ToggleRow label='SMS Notifications' description='Receive important alerts via SMS'
          checked={preferences.smsEnabled} onChange={(checked) => setPreferences({ ...preferences, smsEnabled: checked })} />
      </div>
      <div className='mt-8 pt-6' style={{ borderTop: '1px solid var(--color-card-border)' }}>
        <button onClick={handleSave} disabled={saving}
          className='text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition'
          style={{ backgroundColor: 'var(--color-primary)' }}>
          {saving && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const [updatePassword, { loading: changingPassword }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => { toast.success('Password updated successfully'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') },
    onError: (error) => toast.error(error.message || 'Failed to update password')
  })

  const handleChangePassword = async () => {
    if (!user) return
    if (!currentPassword) { toast.error('Please enter your current password'); return }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    try { await updatePassword({ variables: { input: { id: user.id, password: newPassword } } }) } catch { /* Handled by onError */ }
  }

  return (
    <div className='max-w-2xl rounded-xl border p-6' style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}>
      <h2 className='text-xl font-semibold mb-6' style={{ color: 'var(--color-text-heading)' }}>Security</h2>
      <div className='space-y-6'>
        <div>
          <h3 className='font-medium mb-4' style={{ color: 'var(--color-text-heading)' }}>Change Password</h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Current Password</label>
              <input type='password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }} placeholder='Enter your current password' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>New Password</label>
              <input type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }} placeholder='Minimum 6 characters' />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2' style={{ color: 'var(--color-text-body)' }}>Confirm New Password</label>
              <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none'
                style={{ borderColor: 'var(--color-card-border)' }} placeholder='Repeat your new password' />
            </div>
            <button onClick={handleChangePassword} disabled={changingPassword}
              className='w-full text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition'
              style={{ backgroundColor: 'var(--color-primary)' }}>
              {changingPassword && <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />}
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
        <div className='pt-6' style={{ borderTop: '1px solid var(--color-card-border)' }}>
          <h3 className='font-medium mb-2' style={{ color: 'var(--color-danger)' }}>Danger Zone</h3>
          <p className='text-sm mb-4' style={{ color: 'var(--color-text-secondary)' }}>
            Deactivate your guide account. This can be reversed by contacting support.
          </p>
          <button onClick={() => setShowDeactivateModal(true)}
            className='px-6 py-2 border rounded-lg hover:opacity-80 transition'
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
            Deactivate Account
          </button>
        </div>
      </div>
      <ConfirmModal isOpen={showDeactivateModal} onClose={() => setShowDeactivateModal(false)}
        onConfirm={() => { setShowDeactivateModal(false); toast.info('To deactivate your account, please contact support at support@explora.com') }}
        title='Deactivate Account' description='Account deactivation is handled by our support team. Would you like to proceed with contacting support?'
        confirmText='Contact Support' variant='danger' />
    </div>
  )
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition ${active ? 'border-transparent' : 'border-transparent hover:opacity-80'}`}
      style={active ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : { color: 'var(--color-text-secondary)' }}>
      {children}
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>{label}</p>
        <p className='text-sm' style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      </div>
      <label className='relative inline-flex items-center cursor-pointer'>
        <input type='checkbox' checked={checked} onChange={(e) => onChange(e.target.checked)} className='sr-only peer' />
        <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
      </label>
    </div>
  )
}
