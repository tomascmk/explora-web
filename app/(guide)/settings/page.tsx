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
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Settings</h1>

      {/* Tabs */}
      <div className='flex gap-4 mb-8 border-b'>
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          Profile
        </TabButton>
        <TabButton
          active={activeTab === 'preferences'}
          onClick={() => setActiveTab('preferences')}
        >
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

/* ============================================
   PROFILE TAB
   ============================================ */
function ProfileTab() {
  const { user } = useAuth()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [username, setUsername] = useState(user?.username || '')
  const [stripeAccountId, setStripeAccountId] = useState('')

  const { data: balanceData } = useQuery<{ myBalance: Balance }>(MY_BALANCE, {
    skip: !user
  })

  const [updateProfile, { loading: savingProfile }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile')
    }
  })

  const [updateStripe, { loading: savingStripe }] = useMutation(UPDATE_STRIPE_ACCOUNT, {
    onCompleted: () => {
      toast.success('Stripe account connected successfully')
      setStripeAccountId('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to connect Stripe account')
    }
  })

  const stripeConnected = !!balanceData?.myBalance?.stripeAccountId

  const handleSaveProfile = async () => {
    if (!user) return

    if (!fullName.trim()) {
      toast.error('Full name is required')
      return
    }

    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    try {
      await updateProfile({
        variables: {
          input: {
            id: user.id,
            fullName: fullName.trim(),
            username: username.trim()
          }
        }
      })
    } catch {
      // Handled by onError
    }
  }

  const handleConnectStripe = async () => {
    if (!user || !stripeAccountId.trim()) {
      toast.error('Please enter a Stripe Account ID')
      return
    }

    try {
      await updateStripe({
        variables: {
          guideId: user.id,
          stripeAccountId: stripeAccountId.trim()
        }
      })
    } catch {
      // Handled by onError
    }
  }

  return (
    <div className='max-w-2xl'>
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-6'>Guide Profile</h2>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Full Name</label>
            <input
              type='text'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              placeholder='Your full name'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Username</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              placeholder='Your username'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <input
              type='email'
              value={user?.email || ''}
              className='w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-500'
              disabled
            />
            <p className='text-xs text-gray-400 mt-1'>
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
          >
            {savingProfile && (
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            )}
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Stripe Account */}
      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold mb-4'>Payment Account</h2>
        {stripeConnected ? (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span className='text-green-700 font-medium'>Stripe Connected</span>
            </div>
            <p className='text-sm text-gray-600'>
              Account ID: {balanceData?.myBalance?.stripeAccountId?.slice(0, 12)}...
            </p>
            <p className='text-xs text-gray-400 mt-2'>
              To change your Stripe account, go to{' '}
              <a href='/settings/payments' className='text-blue-600 hover:underline'>
                Payment Settings
              </a>
            </p>
          </div>
        ) : (
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <div className='w-2 h-2 bg-gray-400 rounded-full'></div>
              <span className='text-gray-600'>Not Connected</span>
            </div>
            <p className='text-sm text-gray-500 mb-4'>
              Connect your Stripe account to receive payouts
            </p>
            <div className='flex gap-2'>
              <input
                type='text'
                value={stripeAccountId}
                onChange={(e) => setStripeAccountId(e.target.value)}
                placeholder='acct_...'
                className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
              />
              <button
                onClick={handleConnectStripe}
                disabled={savingStripe || !stripeAccountId.trim()}
                className='bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2'
              >
                {savingStripe && (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                )}
                Connect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   PREFERENCES TAB
   ============================================ */
function PreferencesTab() {
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false
  })

  const { data, loading } = useQuery<{
    myNotificationPreferences: NotificationPreferences
  }>(GET_NOTIFICATION_PREFERENCES)

  const [updatePreferences, { loading: saving }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES, {
    onCompleted: () => {
      toast.success('Preferences saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save preferences')
    }
  })

  useEffect(() => {
    if (data?.myNotificationPreferences) {
      const prefs = data.myNotificationPreferences
      setPreferences({
        emailEnabled: prefs.emailEnabled,
        pushEnabled: prefs.pushEnabled,
        smsEnabled: prefs.smsEnabled
      })
    }
  }, [data])

  const handleSave = async () => {
    try {
      await updatePreferences({
        variables: {
          input: preferences
        }
      })
    } catch {
      // Handled by onError
    }
  }

  if (loading) {
    return (
      <div className='max-w-2xl bg-white rounded-lg shadow p-6'>
        <div className='animate-pulse space-y-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='h-12 bg-gray-200 rounded'></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-2xl bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold mb-6'>Notification Preferences</h2>
      <div className='space-y-6'>
        <ToggleRow
          label='Email Notifications'
          description='Receive booking confirmations and updates via email'
          checked={preferences.emailEnabled}
          onChange={(checked) =>
            setPreferences({ ...preferences, emailEnabled: checked })
          }
        />
        <ToggleRow
          label='Push Notifications'
          description='Receive real-time browser push notifications'
          checked={preferences.pushEnabled}
          onChange={(checked) =>
            setPreferences({ ...preferences, pushEnabled: checked })
          }
        />
        <ToggleRow
          label='SMS Notifications'
          description='Receive important alerts via SMS'
          checked={preferences.smsEnabled}
          onChange={(checked) =>
            setPreferences({ ...preferences, smsEnabled: checked })
          }
        />
      </div>

      <div className='mt-8 pt-6 border-t'>
        <button
          onClick={handleSave}
          disabled={saving}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2'
        >
          {saving && (
            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
          )}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}

/* ============================================
   SECURITY TAB
   ============================================ */
function SecurityTab() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  const [updatePassword, { loading: changingPassword }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update password')
    }
  })

  const handleChangePassword = async () => {
    if (!user) return

    if (!currentPassword) {
      toast.error('Please enter your current password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await updatePassword({
        variables: {
          input: {
            id: user.id,
            password: newPassword
          }
        }
      })
    } catch {
      // Handled by onError
    }
  }

  return (
    <div className='max-w-2xl bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold mb-6'>Security</h2>
      <div className='space-y-6'>
        <div>
          <h3 className='font-medium mb-4'>Change Password</h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Current Password</label>
              <input
                type='password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Enter your current password'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>New Password</label>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Minimum 6 characters'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Confirm New Password</label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                placeholder='Repeat your new password'
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword}
              className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
            >
              {changingPassword && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        <div className='pt-6 border-t'>
          <h3 className='font-medium mb-2 text-red-600'>Danger Zone</h3>
          <p className='text-sm text-gray-600 mb-4'>
            Deactivate your guide account. This can be reversed by contacting support.
          </p>
          <button
            onClick={() => setShowDeactivateModal(true)}
            className='px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50'
          >
            Deactivate Account
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={() => {
          setShowDeactivateModal(false)
          toast.info(
            'To deactivate your account, please contact support at support@explora.com'
          )
        }}
        title='Deactivate Account'
        description='Account deactivation is handled by our support team. Would you like to proceed with contacting support?'
        confirmText='Contact Support'
        variant='danger'
      />
    </div>
  )
}

/* ============================================
   SHARED COMPONENTS
   ============================================ */
function TabButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <p className='font-medium'>{label}</p>
        <p className='text-sm text-gray-600'>{description}</p>
      </div>
      <label className='relative inline-flex items-center cursor-pointer'>
        <input
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className='sr-only peer'
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}
