'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<
    'profile' | 'preferences' | 'security'
  >('profile')

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-8'>Settings</h1>

      {/* Tabs */}
      <div className='flex gap-4 mb-8 border-b'>
        <TabButton
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </TabButton>
        <TabButton
          active={activeTab === 'preferences'}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </TabButton>
        <TabButton
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
        >
          Security
        </TabButton>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className='max-w-2xl'>
          <div className='bg-white rounded-lg shadow p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-6'>Guide Profile</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  defaultValue={user?.fullName || user?.username}
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Email</label>
                <input
                  type='email'
                  defaultValue={user?.email}
                  className='w-full px-4 py-3 border rounded-lg bg-gray-50'
                  disabled
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Bio</label>
                <textarea
                  className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  rows={4}
                  placeholder='Tell tourists about yourself and your experience as a guide...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Languages
                </label>
                <div className='flex gap-2 flex-wrap'>
                  {['English', 'Spanish', 'Portuguese', 'French'].map(
                    (lang) => (
                      <label
                        key={lang}
                        className='flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50'
                      >
                        <input type='checkbox' />
                        <span className='text-sm'>{lang}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <button className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700'>
                Save Changes
              </button>
            </div>
          </div>

          {/* Stripe Account */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-4'>Payment Account</h2>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>Stripe Account</p>
                <p className='text-lg font-medium'>Not Connected</p>
              </div>
              <button className='bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700'>
                Connect Stripe
              </button>
            </div>
            <p className='text-sm text-gray-500 mt-4'>
              Connect your Stripe account to receive payouts
            </p>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className='max-w-2xl bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-6'>Preferences</h2>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Email Notifications</p>
                <p className='text-sm text-gray-600'>
                  Receive booking confirmations
                </p>
              </div>
              <input type='checkbox' defaultChecked className='w-5 h-5' />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>New Review Alerts</p>
                <p className='text-sm text-gray-600'>
                  Get notified of new reviews
                </p>
              </div>
              <input type='checkbox' defaultChecked className='w-5 h-5' />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Claim Alerts</p>
                <p className='text-sm text-gray-600'>
                  Immediate notification for new claims
                </p>
              </div>
              <input type='checkbox' defaultChecked className='w-5 h-5' />
            </div>
            <div>
              <label className='block font-medium mb-2'>Payout Frequency</label>
              <select className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'>
                <option>Weekly</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <button className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700'>
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className='max-w-2xl bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-6'>Security</h2>
          <div className='space-y-6'>
            <div>
              <h3 className='font-medium mb-4'>Change Password</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Current Password
                  </label>
                  <input
                    type='password'
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    New Password
                  </label>
                  <input
                    type='password'
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <button className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700'>
                  Update Password
                </button>
              </div>
            </div>

            <div className='pt-6 border-t'>
              <h3 className='font-medium mb-2 text-red-600'>Danger Zone</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Deactivate your guide account. This can be reversed by
                contacting support.
              </p>
              <button className='px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50'>
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
