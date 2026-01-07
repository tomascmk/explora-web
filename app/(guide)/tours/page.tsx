'use client'

import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GET_TOURS_BY_GUIDE, DELETE_TOUR } from '@/graphql/tours'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Tour {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  media?: Array<{ url: string }>
  categories?: Array<{ name: string }>
  tourSteps?: Array<{ id: string }>
}

interface GetToursByGuideData {
  toursByGuide: Tour[]
}

interface GetToursByGuideVars {
  guideId: string | undefined
}

export default function ToursPage() {
  const { user } = useAuth()
  console.log('Rendering ToursPage with user:', user?.id)
  const router = useRouter()
  const [filter, setFilter] = useState('all')

  const { data, loading, refetch } = useQuery<GetToursByGuideData, GetToursByGuideVars>(GET_TOURS_BY_GUIDE, {
    variables: { guideId: user?.id },
    skip: !user?.id,
  })

  const [deleteTour, { loading: deleting }] = useMutation(DELETE_TOUR, {
    onCompleted: () => {
      toast.success('Tour eliminado correctamente')
      refetch()
    },
    onError: (error) => {
      toast.error('Error al eliminar el tour: ' + error.message)
    }
  })

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    tourId: string
    tourTitle: string
  }>({
    isOpen: false,
    tourId: '',
    tourTitle: ''
  })

  const handleDeleteClick = (id: string, title: string) => {
    setModalConfig({
      isOpen: true,
      tourId: id,
      tourTitle: title
    })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTour({ variables: { id: modalConfig.tourId } })
    } finally {
      setModalConfig((prev) => ({ ...prev, isOpen: false }))
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/tours/${id}/edit`)
  }

  const tours = data?.toursByGuide || []

  // Filter tours based on selected filter
  const filteredTours = tours.filter((tour) => {
    if (filter === 'all') return true
    return tour.status === filter
  })

  // Calculate counts for each status
  const counts = {
    all: tours.length,
    active: tours.filter((t) => t.status === 'active').length,
    draft: tours.filter((t) => t.status === 'draft').length,
    archived: tours.filter((t) => t.status === 'archived').length
  }

  if (loading) {
    return (
      <div className='p-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-gray-600'>Cargando tours...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>Real Tours List</h1>
        <Link
          href='/tours/create'
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition'
        >
          + Create New Tour
        </Link>
      </div>

      {/* Filters */}
      <div className='flex gap-4 mb-6'>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Tours ({counts.all})
        </FilterButton>
        <FilterButton
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        >
          Active ({counts.active})
        </FilterButton>
        <FilterButton
          active={filter === 'draft'}
          onClick={() => setFilter('draft')}
        >
          Draft ({counts.draft})
        </FilterButton>
        <FilterButton
          active={filter === 'archived'}
          onClick={() => setFilter('archived')}
        >
          Archived ({counts.archived})
        </FilterButton>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className='text-center py-16'>
          <p className='text-gray-500 text-lg mb-4'>No tours yet</p>
          <Link
            href='/tours/create'
            className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'
          >
            Create your first tour
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredTours.map((tour: any) => (
            <TourCard
              key={tour.id}
              id={tour.id}
              title={tour.title}
              description={tour.description}
              stepsCount={tour.tourSteps?.length || 0}
              image={tour.media?.[0]?.url}
              categories={tour.categories}
              createdAt={tour.createdAt}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              deleting={deleting && modalConfig.tourId === tour.id}
            />
          ))}
        </div>
      )}

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title='¿Eliminar Tour?'
        description={`¿Estás seguro de que quieres eliminar "${modalConfig.tourTitle}"? Esta acción no se puede deshacer.`}
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='danger'
        loading={deleting}
      />
    </div>
  )
}

function FilterButton({
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
      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function TourCard({
  id,
  title,
  description,
  stepsCount,
  image,
  categories,
  createdAt,
  onEdit,
  onDelete,
  deleting
}: {
  id: string
  title: string
  description: string
  stepsCount: number
  image?: string
  categories?: any[]
  createdAt: string
  onEdit: (id: string) => void
  onDelete: (id: string, title: string) => void
  deleting: boolean
}) {
  const formattedDate = new Date(createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition'>
      {image ? (
        <div
          className='h-48 bg-cover bg-center'
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : (
        <div className='h-48 bg-gradient-to-r from-blue-400 to-indigo-500' />
      )}
      <div className='p-6'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='text-lg font-semibold'>{title}</h3>
          {categories && categories.length > 0 && (
            <span className='px-2 py-1 rounded text-xs bg-blue-100 text-blue-800'>
              {categories[0].name}
            </span>
          )}
        </div>
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{description}</p>
        <div className='flex justify-between items-center text-sm mb-4'>
          <div className='text-gray-600'>
            <span className='font-semibold'>{stepsCount}</span> paradas
          </div>
          <div className='text-gray-500 text-xs'>{formattedDate}</div>
        </div>
        <div className='pt-4 border-t flex gap-2'>
          <button
            onClick={() => onEdit(id)}
            className='flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm font-medium'
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id, title)}
            disabled={deleting}
            className='flex-1 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium disabled:opacity-50'
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
