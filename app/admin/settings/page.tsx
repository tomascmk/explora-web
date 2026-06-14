'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  ADMIN_GET_TOUR_CATEGORIES,
  ADMIN_CREATE_TOUR_CATEGORY,
  ADMIN_REMOVE_TOUR_CATEGORY,
  ADMIN_GET_LANGUAGES,
  ADMIN_CREATE_LANGUAGE,
  ADMIN_REMOVE_LANGUAGE,
  TourCategory,
  TourCategoriesData,
  Language,
  LanguagesData,
} from '@/graphql/admin/settings'
import { Plus, Trash2, Tag, Globe, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function AdminSettingsPage() {
  // Categories
  const {
    data: categoriesData,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery<TourCategoriesData>(ADMIN_GET_TOUR_CATEGORIES)
  const [createCategory] = useMutation(ADMIN_CREATE_TOUR_CATEGORY)
  const [removeCategory] = useMutation(ADMIN_REMOVE_TOUR_CATEGORY)

  // Languages
  const {
    data: languagesData,
    loading: languagesLoading,
    refetch: refetchLanguages,
  } = useQuery<LanguagesData>(ADMIN_GET_LANGUAGES)
  const [createLanguage] = useMutation(ADMIN_CREATE_LANGUAGE)
  const [removeLanguage] = useMutation(ADMIN_REMOVE_LANGUAGE)

  // State
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newLanguageName, setNewLanguageName] = useState('')
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    type: 'category' | 'language'
    item: TourCategory | Language | null
  }>({ open: false, type: 'category', item: null })

  const categories = categoriesData?.findAllTourCategories || []
  const languages = languagesData?.findAllLanguages || []

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategory({
        variables: { input: { name: newCategoryName.trim() } },
      })
      setNewCategoryName('')
      refetchCategories()
    } catch (error) {
      console.error('Failed to create category:', error)
    }
  }

  const handleAddLanguage = async () => {
    if (!newLanguageName.trim()) return
    try {
      await createLanguage({
        variables: { createLanguageDto: { name: newLanguageName.trim() } },
      })
      setNewLanguageName('')
      refetchLanguages()
    } catch (error) {
      console.error('Failed to create language:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.item) return
    try {
      if (deleteModal.type === 'category') {
        await removeCategory({ variables: { id: deleteModal.item.id } })
        refetchCategories()
      } else {
        await removeLanguage({ variables: { id: deleteModal.item.id } })
        refetchLanguages()
      }
      setDeleteModal({ open: false, type: 'category', item: null })
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const loading = categoriesLoading || languagesLoading

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 size={32} className='animate-spin' style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  return (
    <>
      <PageHeader title='Settings' subtitle='Platform configuration' />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Tour Categories */}
        <div
          className='rounded-xl border overflow-hidden'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <div className='px-5 py-4 border-b flex items-center gap-2' style={{ borderColor: 'var(--color-card-border)' }}>
            <Tag size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className='text-base font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              Tour Categories
            </h3>
            <span
              className='text-xs px-1.5 py-0.5 rounded-full ml-auto'
              style={{
                backgroundColor: 'var(--color-section-bg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {categories.length}
            </span>
          </div>

          {/* Add new */}
          <div className='px-5 py-3 border-b flex gap-2' style={{ borderColor: 'var(--color-card-border)' }}>
            <input
              type='text'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder='New category name...'
              className='flex-1 text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className='text-sm px-3 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-1'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* List */}
          <div className='divide-y max-h-80 overflow-y-auto' style={{ borderColor: 'var(--color-card-border)' }}>
            {categories.length === 0 ? (
              <p className='p-5 text-sm text-center' style={{ color: 'var(--color-text-muted)' }}>
                No categories yet
              </p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className='px-5 py-2.5 flex items-center justify-between'>
                  <span className='text-sm' style={{ color: 'var(--color-text-body)' }}>
                    {cat.name}
                  </span>
                  <button
                    onClick={() =>
                      setDeleteModal({ open: true, type: 'category', item: cat })
                    }
                    className='p-1 rounded transition-colors'
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Languages */}
        <div
          className='rounded-xl border overflow-hidden'
          style={{
            backgroundColor: 'var(--color-card-bg)',
            borderColor: 'var(--color-card-border)',
          }}
        >
          <div className='px-5 py-4 border-b flex items-center gap-2' style={{ borderColor: 'var(--color-card-border)' }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            <h3 className='text-base font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              Languages
            </h3>
            <span
              className='text-xs px-1.5 py-0.5 rounded-full ml-auto'
              style={{
                backgroundColor: 'var(--color-section-bg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {languages.length}
            </span>
          </div>

          {/* Add new */}
          <div className='px-5 py-3 border-b flex gap-2' style={{ borderColor: 'var(--color-card-border)' }}>
            <input
              type='text'
              value={newLanguageName}
              onChange={(e) => setNewLanguageName(e.target.value)}
              placeholder='New language name...'
              className='flex-1 text-sm rounded-lg border px-3 py-2 outline-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage()}
            />
            <button
              onClick={handleAddLanguage}
              disabled={!newLanguageName.trim()}
              className='text-sm px-3 py-2 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-1'
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* List */}
          <div className='divide-y max-h-80 overflow-y-auto' style={{ borderColor: 'var(--color-card-border)' }}>
            {languages.length === 0 ? (
              <p className='p-5 text-sm text-center' style={{ color: 'var(--color-text-muted)' }}>
                No languages yet
              </p>
            ) : (
              languages.map((lang) => (
                <div key={lang.id} className='px-5 py-2.5 flex items-center justify-between'>
                  <span className='text-sm' style={{ color: 'var(--color-text-body)' }}>
                    {lang.name}
                  </span>
                  <button
                    onClick={() =>
                      setDeleteModal({ open: true, type: 'language', item: lang })
                    }
                    className='p-1 rounded transition-colors'
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: 'category', item: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Language'}`}
        description={`Are you sure you want to delete "${deleteModal.item?.name}"? This may affect existing ${
          deleteModal.type === 'category' ? 'tours' : 'users and tours'
        }.`}
        variant='danger'
        confirmText='Delete'
      />
    </>
  )
}
