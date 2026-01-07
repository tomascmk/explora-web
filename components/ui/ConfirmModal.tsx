'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ReactNode } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300' />
        <Dialog.Content className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[100] transition-all duration-200'>
          <Dialog.Title className='text-xl font-bold text-gray-900 mb-2'>
            {title}
          </Dialog.Title>
          <Dialog.Description className='text-gray-600 mb-6'>
            {description}
          </Dialog.Description>

          <div className='flex justify-end gap-3 pt-2'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors'
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && (
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              )}
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
