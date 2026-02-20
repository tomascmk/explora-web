'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import {
  GET_NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCES
} from '@/graphql/notifications'
import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'

interface NotificationPreferences {
  id: string
  emailEnabled: boolean
  pushEnabled: boolean
  smsEnabled: boolean
  categories?: string[]
}

export default function NotificationSettingsPage() {
  const { data, loading } = useQuery<{
    myNotificationPreferences: NotificationPreferences
  }>(GET_NOTIFICATION_PREFERENCES)

  const [updatePreferences, { loading: updating }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES, {
    onCompleted: () => {
      toast.success('Preferences updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences')
    }
  })

  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false
  })

  // Initialize local state when query data loads
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
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2' style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title='Notification Preferences' />

      <div
        className='rounded-xl border p-6 max-w-2xl'
        style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg' style={{ backgroundColor: 'var(--color-primary-light)' }}>
                <Mail className='w-6 h-6' style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h3 className='font-medium' style={{ color: 'var(--color-text-heading)' }}>Email Notifications</h3>
                <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>Receive notifications via email</p>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={preferences.emailEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, emailEnabled: e.target.checked })
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg' style={{ backgroundColor: 'var(--color-success-light)' }}>
                <Bell className='w-6 h-6' style={{ color: 'var(--color-success)' }} />
              </div>
              <div>
                <h3 className='font-medium' style={{ color: 'var(--color-text-heading)' }}>Push Notifications</h3>
                <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>Receive browser push notifications</p>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={preferences.pushEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, pushEnabled: e.target.checked })
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg' style={{ backgroundColor: 'var(--color-info-light)' }}>
                <MessageSquare className='w-6 h-6' style={{ color: 'var(--color-info)' }} />
              </div>
              <div>
                <h3 className='font-medium' style={{ color: 'var(--color-text-heading)' }}>SMS Notifications</h3>
                <p className='text-sm' style={{ color: 'var(--color-text-muted)' }}>Receive notifications via SMS</p>
              </div>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={preferences.smsEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, smsEnabled: e.target.checked })
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" style={{ backgroundColor: 'var(--color-section-bg)' }}></div>
            </label>
          </div>
        </div>

        <div className='mt-8 pt-6 border-t' style={{ borderColor: 'var(--color-card-border)' }}>
          <button
            onClick={handleSave}
            disabled={updating}
            className='px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {updating && (
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            )}
            {updating ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
