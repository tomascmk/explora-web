'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { AdminDataTable, AdminColumn } from '@/components/admin/AdminDataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  ADMIN_GET_ALL_TOURS,
  ADMIN_GET_ALL_PLACES,
  ADMIN_GET_ALL_EVENTS,
  ADMIN_REMOVE_TOUR,
  ADMIN_REMOVE_PLACE,
  ADMIN_REMOVE_EVENT,
  ADMIN_UPDATE_TOUR,
  AdminTour,
  AdminPlace,
  AdminEvent,
  AdminToursData,
  AdminPlacesData,
  AdminEventsData,
} from '@/graphql/admin/tours'
import { Compass, MapPin, Calendar, Trash2, CheckCircle, XCircle, LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatMoney } from '@/lib/formatMoney';

type TabKey = 'tours' | 'places' | 'events'
type AdminContentItem = AdminTour | AdminPlace | AdminEvent

export default function AdminToursPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('tours')

  const { data: toursData, loading: toursLoading, refetch: refetchTours } = useQuery<AdminToursData>(ADMIN_GET_ALL_TOURS)
  const { data: placesData, loading: placesLoading, refetch: refetchPlaces } = useQuery<AdminPlacesData>(ADMIN_GET_ALL_PLACES)
  const { data: eventsData, loading: eventsLoading, refetch: refetchEvents } = useQuery<AdminEventsData>(ADMIN_GET_ALL_EVENTS)

  const [removeTour] = useMutation(ADMIN_REMOVE_TOUR)
  const [removePlace] = useMutation(ADMIN_REMOVE_PLACE)
  const [removeEvent] = useMutation(ADMIN_REMOVE_EVENT)
  const [updateTour] = useMutation(ADMIN_UPDATE_TOUR)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    type: TabKey
    item: AdminContentItem | null
  }>({ open: false, type: 'tours', item: null })

  const tabs: { key: TabKey; label: string; icon: LucideIcon; count: number }[] = [
    { key: 'tours', label: 'Tours', icon: Compass, count: toursData?.tours?.length || 0 },
    { key: 'places', label: 'Places', icon: MapPin, count: placesData?.places?.length || 0 },
    { key: 'events', label: 'Events', icon: Calendar, count: eventsData?.events?.length || 0 },
  ]

  // Tours
  const filteredTours = useMemo(() => {
    const tours = toursData?.tours || []
    if (!search) return tours
    const q = search.toLowerCase()
    return tours.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.guide?.fullName?.toLowerCase().includes(q) ||
        t.guide?.username?.toLowerCase().includes(q)
    )
  }, [toursData, search])

  // Places
  const filteredPlaces = useMemo(() => {
    const places = placesData?.places || []
    if (!search) return places
    const q = search.toLowerCase()
    return places.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.address?.city?.toLowerCase().includes(q)
    )
  }, [placesData, search])

  // Events
  const filteredEvents = useMemo(() => {
    const events = eventsData?.events || []
    if (!search) return events
    const q = search.toLowerCase()
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.createdBy?.fullName?.toLowerCase().includes(q)
    )
  }, [eventsData, search])

  const handleDelete = async () => {
    if (!deleteModal.item) return
    try {
      if (deleteModal.type === 'tours') {
        await removeTour({ variables: { id: deleteModal.item.id } })
        refetchTours()
      } else if (deleteModal.type === 'places') {
        await removePlace({ variables: { id: deleteModal.item.id } })
        refetchPlaces()
      } else {
        await removeEvent({ variables: { id: deleteModal.item.id } })
        refetchEvents()
      }
      setDeleteModal({ open: false, type: 'tours', item: null })
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleUpdateTourStatus = async (tourId: string, status: string) => {
    try {
      await updateTour({
        variables: {
          updateTourInput: { id: tourId, status },
        },
      })
      refetchTours()
    } catch (error) {
      console.error('Failed to update tour status:', error)
    }
  }

  const tourColumns: AdminColumn<AdminTour>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (t) => (
        <div>
          <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
            {t.title}
          </p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
            {t.tourType}
          </p>
        </div>
      ),
    },
    {
      key: 'guide',
      header: 'Guide',
      render: (t) => t.guide?.fullName || t.guide?.username || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'pricing',
      header: 'Price',
      align: 'right',
      render: (t) => {
        const pricing = t.tourPricings?.[0]
        return pricing ? (
          <span className='text-sm font-medium'>
            {formatMoney(pricing.price, pricing.currency)}
          </span>
        ) : (
          <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>No pricing</span>
        )
      },
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (t) => (
        <div className='flex flex-wrap gap-1'>
          {(t.categories || []).slice(0, 2).map((c) => (
            <span
              key={c.id}
              className='text-xs px-1.5 py-0.5 rounded'
              style={{
                backgroundColor: 'var(--color-section-bg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {c.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (t) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (t) => (
        <div className='flex items-center gap-1 justify-end'>
          {t.status === 'DRAFT' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateTourStatus(t.id, 'PUBLISHED')
              }}
              className='p-1.5 rounded-md transition-colors'
              title='Approve'
              style={{ color: 'var(--color-success)' }}
            >
              <CheckCircle size={16} />
            </button>
          )}
          {t.status === 'PUBLISHED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleUpdateTourStatus(t.id, 'DRAFT')
              }}
              className='p-1.5 rounded-md transition-colors'
              title='Unpublish'
              style={{ color: 'var(--color-warning)' }}
            >
              <XCircle size={16} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteModal({ open: true, type: 'tours', item: t })
            }}
            className='p-1.5 rounded-md transition-colors'
            title='Delete'
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#EF4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const placeColumns: AdminColumn<AdminPlace>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (p) => (
        <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
          {p.name}
        </p>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (p) => p.address?.city || 'N/A',
    },
    {
      key: 'rate',
      header: 'Rating',
      align: 'center',
      render: (p) =>
        p.rate ? (
          <span className='text-sm font-medium'>{p.rate.toFixed(1)}</span>
        ) : (
          <span className='text-xs' style={{ color: 'var(--color-text-muted)' }}>N/A</span>
        ),
    },
    {
      key: 'entryPrice',
      header: 'Entry',
      render: (p) => p.entryPrice || 'Free',
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (p) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDeleteModal({ open: true, type: 'places', item: p })
          }}
          className='p-1.5 rounded-md transition-colors'
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  const eventColumns: AdminColumn<AdminEvent>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (e) => (
        <p className='font-medium' style={{ color: 'var(--color-text-heading)' }}>
          {e.title}
        </p>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (e) => (
        <span
          className='text-xs px-1.5 py-0.5 rounded'
          style={{
            backgroundColor: 'var(--color-section-bg)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {e.category || 'event'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (e) => e.createdBy?.fullName || 'N/A',
    },
    {
      key: 'startTime',
      header: 'Start',
      sortable: true,
      render: (e) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(e.startTime).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (e) => (
        <button
          onClick={(ev) => {
            ev.stopPropagation()
            setDeleteModal({ open: true, type: 'events', item: e })
          }}
          className='p-1.5 rounded-md transition-colors'
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(ev) => {
            ev.currentTarget.style.color = '#EF4444'
          }}
          onMouseLeave={(ev) => {
            ev.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  const getActiveData = (): {
    columns: AdminColumn<AdminContentItem>[]
    data: AdminContentItem[]
    total: number
    loading: boolean
  } => {
    switch (activeTab) {
      case 'places':
        return {
          columns: placeColumns as AdminColumn<AdminContentItem>[],
          data: filteredPlaces.slice((page - 1) * pageSize, page * pageSize),
          total: filteredPlaces.length,
          loading: placesLoading,
        }
      case 'events':
        return {
          columns: eventColumns as AdminColumn<AdminContentItem>[],
          data: filteredEvents.slice((page - 1) * pageSize, page * pageSize),
          total: filteredEvents.length,
          loading: eventsLoading,
        }
      case 'tours':
      default:
        return {
          columns: tourColumns as AdminColumn<AdminContentItem>[],
          data: filteredTours.slice((page - 1) * pageSize, page * pageSize),
          total: filteredTours.length,
          loading: toursLoading,
        }
    }
  }

  const activeData = getActiveData()

  return (
    <>
      <PageHeader title='Tours, Places & Events' subtitle='Manage all content' />

      {/* Tabs */}
      <div
        className='flex items-center gap-1 p-1 rounded-lg mb-6 w-fit'
        style={{ backgroundColor: 'var(--color-section-bg)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setPage(1)
              setSearch('')
            }}
            className='flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all'
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--color-card-bg)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-text-heading)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <tab.icon size={16} />
            {tab.label}
            <span
              className='text-xs px-1.5 py-0.5 rounded-full'
              style={{
                backgroundColor: activeTab === tab.key ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <AdminDataTable
        columns={activeData.columns}
        data={activeData.data}
        keyExtractor={(item) => item.id}
        loading={activeData.loading}
        emptyMessage={`No ${activeTab} found`}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={`Search ${activeTab}...`}
        page={page}
        pageSize={pageSize}
        totalCount={activeData.total}
        onPageChange={setPage}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={(key, dir) => {
          setSortKey(key)
          setSortDirection(dir)
        }}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: 'tours', item: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'tours' ? 'Tour' : deleteModal.type === 'places' ? 'Place' : 'Event'}`}
        description={`Are you sure you want to delete "${
          deleteModal.item
            ? 'title' in deleteModal.item
              ? deleteModal.item.title
              : deleteModal.item.name
            : ''
        }"? This action cannot be undone.`}
        variant='danger'
        confirmText='Delete'
      />
    </>
  )
}
