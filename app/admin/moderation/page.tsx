'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { PageHeader } from '@/components/ui/PageHeader'
import { AdminDataTable, AdminColumn } from '@/components/admin/AdminDataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  ADMIN_GET_ALL_CLAIMS,
  ADMIN_RESOLVE_CLAIM,
  ADMIN_REJECT_CLAIM,
  ADMIN_GET_FEEDBACK_REPORTS,
  ADMIN_APPROVE_FEEDBACK_REPORT,
  ADMIN_REJECT_FEEDBACK_REPORT,
  ADMIN_GET_ALL_REVIEWS,
  ADMIN_REMOVE_REVIEW,
  AdminClaim,
  AdminClaimsData,
  FeedbackReport,
  FeedbackReportsData,
  AdminReview,
  AdminReviewsData,
} from '@/graphql/admin/moderation'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Flag, Star, CheckCircle, XCircle, Trash2, LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatMoney } from '@/lib/formatMoney';

type TabKey = 'claims' | 'reports' | 'reviews'
type ModerationItem = AdminClaim | FeedbackReport | AdminReview

export default function AdminModerationPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('claims')

  const { data: claimsData, loading: claimsLoading, refetch: refetchClaims } = useQuery<AdminClaimsData>(ADMIN_GET_ALL_CLAIMS)
  const { data: reportsData, loading: reportsLoading, refetch: refetchReports } = useQuery<FeedbackReportsData>(ADMIN_GET_FEEDBACK_REPORTS)
  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery<AdminReviewsData>(ADMIN_GET_ALL_REVIEWS)

  const [resolveClaim] = useMutation(ADMIN_RESOLVE_CLAIM)
  const [rejectClaim] = useMutation(ADMIN_REJECT_CLAIM)
  const [approveReport] = useMutation(ADMIN_APPROVE_FEEDBACK_REPORT)
  const [rejectReport] = useMutation(ADMIN_REJECT_FEEDBACK_REPORT)
  const [removeReview] = useMutation(ADMIN_REMOVE_REVIEW)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)

  // Resolve/reject modals
  const [resolveModal, setResolveModal] = useState<{
    open: boolean
    type: 'claim' | 'report'
    item: AdminClaim | FeedbackReport | null
    action: 'resolve' | 'reject'
    text: string
    refundAmount: string
  }>({ open: false, type: 'claim', item: null, action: 'resolve', text: '', refundAmount: '' })

  const [deleteReviewModal, setDeleteReviewModal] = useState<{ open: boolean; review: AdminReview | null }>({
    open: false,
    review: null,
  })

  const tabs: { key: TabKey; label: string; icon: LucideIcon; count: number }[] = [
    { key: 'claims', label: 'Claims', icon: Shield, count: claimsData?.claims?.length || 0 },
    { key: 'reports', label: 'Reports', icon: Flag, count: reportsData?.feedbackReports?.length || 0 },
    { key: 'reviews', label: 'Reviews', icon: Star, count: reviewsData?.tourReviews?.length || 0 },
  ]

  const handleResolveAction = async () => {
    if (!resolveModal.item || !user) return
    try {
      if (resolveModal.type === 'claim') {
        if (resolveModal.action === 'resolve') {
          await resolveClaim({
            variables: {
              id: resolveModal.item.id,
              resolution: resolveModal.text,
              resolvedById: user.id,
              refundAmount: resolveModal.refundAmount ? parseFloat(resolveModal.refundAmount) : undefined,
            },
          })
        } else {
          await rejectClaim({
            variables: {
              id: resolveModal.item.id,
              reason: resolveModal.text,
              rejectedById: user.id,
            },
          })
        }
        refetchClaims()
      } else {
        if (resolveModal.action === 'resolve') {
          await approveReport({
            variables: {
              id: resolveModal.item.id,
              adminId: user.id,
              response: resolveModal.text || undefined,
            },
          })
        } else {
          await rejectReport({
            variables: {
              id: resolveModal.item.id,
              adminId: user.id,
              response: resolveModal.text,
            },
          })
        }
        refetchReports()
      }
      setResolveModal({ open: false, type: 'claim', item: null, action: 'resolve', text: '', refundAmount: '' })
    } catch (error) {
      console.error('Failed to process:', error)
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteReviewModal.review) return
    try {
      await removeReview({ variables: { id: deleteReviewModal.review.id } })
      setDeleteReviewModal({ open: false, review: null })
      refetchReviews()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  // Filter data
  const filteredClaims = useMemo<AdminClaim[]>(() => {
    const claims = claimsData?.claims || []
    if (!search) return claims
    const q = search.toLowerCase()
    return claims.filter(
      (c) =>
        c.reason?.toLowerCase().includes(q) ||
        c.claimant?.fullName?.toLowerCase().includes(q) ||
        c.tour?.title?.toLowerCase().includes(q)
    )
  }, [claimsData, search])

  const filteredReports = useMemo<FeedbackReport[]>(() => {
    const reports = reportsData?.feedbackReports || []
    if (!search) return reports
    const q = search.toLowerCase()
    return reports.filter(
      (r) =>
        r.reason?.toLowerCase().includes(q) ||
        r.reporter?.fullName?.toLowerCase().includes(q)
    )
  }, [reportsData, search])

  const filteredReviews = useMemo<AdminReview[]>(() => {
    const reviews = reviewsData?.tourReviews || []
    if (!search) return reviews
    const q = search.toLowerCase()
    return reviews.filter(
      (r) =>
        r.comment?.toLowerCase().includes(q) ||
        r.user?.fullName?.toLowerCase().includes(q) ||
        r.tour?.title?.toLowerCase().includes(q)
    )
  }, [reviewsData, search])

  const claimColumns: AdminColumn<AdminClaim>[] = [
    {
      key: 'claimant',
      header: 'Claimant',
      render: (c) => (
        <div>
          <p className='font-medium text-sm' style={{ color: 'var(--color-text-heading)' }}>
            {c.claimant?.fullName || 'N/A'}
          </p>
          <p className='text-xs' style={{ color: 'var(--color-text-muted)' }}>
            {c.claimant?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (c) => (
        <p className='text-sm max-w-xs truncate'>{c.reason}</p>
      ),
    },
    {
      key: 'tour',
      header: 'Tour',
      render: (c) => c.tour?.title || c.reservation?.tour?.title || 'N/A',
    },
    {
      key: 'refundAmount',
      header: 'Refund',
      align: 'right',
      render: (c) =>
        c.refundAmount ? (
          <span className='font-medium'>{formatMoney(c.refundAmount, c.reservation?.currency)}</span>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>-</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (c) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) =>
        c.status === 'PENDING' || c.status === 'OPEN' ? (
          <div className='flex items-center gap-1 justify-end'>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setResolveModal({ open: true, type: 'claim', item: c, action: 'resolve', text: '', refundAmount: '' })
              }}
              className='p-1.5 rounded-md'
              title='Resolve'
              style={{ color: 'var(--color-success)' }}
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setResolveModal({ open: true, type: 'claim', item: c, action: 'reject', text: '', refundAmount: '' })
              }}
              className='p-1.5 rounded-md'
              title='Reject'
              style={{ color: 'var(--color-danger)' }}
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : null,
    },
  ]

  const reportColumns: AdminColumn<FeedbackReport>[] = [
    {
      key: 'reporter',
      header: 'Reporter',
      render: (r) => r.reporter?.fullName || 'N/A',
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <p className='text-sm max-w-xs truncate'>{r.reason}</p>,
    },
    {
      key: 'review',
      header: 'Reported Review',
      render: (r) => (
        <p className='text-sm max-w-xs truncate' style={{ color: 'var(--color-text-secondary)' }}>
          &quot;{r.review?.comment || 'No comment'}&quot;
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) =>
        r.status === 'PENDING' ? (
          <div className='flex items-center gap-1 justify-end'>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setResolveModal({ open: true, type: 'report', item: r, action: 'resolve', text: '', refundAmount: '' })
              }}
              className='p-1.5 rounded-md'
              title='Approve'
              style={{ color: 'var(--color-success)' }}
            >
              <CheckCircle size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setResolveModal({ open: true, type: 'report', item: r, action: 'reject', text: '', refundAmount: '' })
              }}
              className='p-1.5 rounded-md'
              title='Reject'
              style={{ color: 'var(--color-danger)' }}
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : null,
    },
  ]

  const reviewColumns: AdminColumn<AdminReview>[] = [
    {
      key: 'user',
      header: 'Reviewer',
      render: (r) => r.user?.fullName || r.user?.username || 'N/A',
    },
    {
      key: 'tour',
      header: 'Tour',
      render: (r) => r.tour?.title || 'N/A',
    },
    {
      key: 'average_rating',
      header: 'Rating',
      align: 'center',
      render: (r) => (
        <span className='font-semibold text-sm'>
          {r.average_rating?.toFixed(1) || 'N/A'}
        </span>
      ),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (r) => (
        <p className='text-sm max-w-xs truncate'>{r.comment || 'No comment'}</p>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (r) => (
        <span className='text-xs' style={{ color: 'var(--color-text-secondary)' }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setDeleteReviewModal({ open: true, review: r })
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

  const getActiveData = (): {
    columns: AdminColumn<ModerationItem>[]
    data: ModerationItem[]
    loading: boolean
  } => {
    switch (activeTab) {
      case 'reports':
        return {
          columns: reportColumns as AdminColumn<ModerationItem>[],
          data: filteredReports,
          loading: reportsLoading,
        }
      case 'reviews':
        return {
          columns: reviewColumns as AdminColumn<ModerationItem>[],
          data: filteredReviews,
          loading: reviewsLoading,
        }
      case 'claims':
      default:
        return {
          columns: claimColumns as AdminColumn<ModerationItem>[],
          data: filteredClaims,
          loading: claimsLoading,
        }
    }
  }

  const activeData = getActiveData()
  const paginatedData = activeData.data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <PageHeader title='Moderation' subtitle='Manage claims, reports, and reviews' />

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
        data={paginatedData}
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
        totalCount={activeData.data.length}
        onPageChange={setPage}
      />

      {/* Resolve/Reject Modal */}
      {resolveModal.open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div
            className='rounded-xl border p-6 w-full max-w-md'
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-card-border)',
            }}
          >
            <h3 className='text-lg font-semibold mb-2' style={{ color: 'var(--color-text-heading)' }}>
              {resolveModal.action === 'resolve' ? 'Resolve' : 'Reject'} {resolveModal.type === 'claim' ? 'Claim' : 'Report'}
            </h3>
            <textarea
              value={resolveModal.text}
              onChange={(e) => setResolveModal({ ...resolveModal, text: e.target.value })}
              placeholder={resolveModal.action === 'resolve' ? 'Resolution details...' : 'Rejection reason...'}
              rows={3}
              className='w-full text-sm rounded-lg border px-3 py-2.5 mb-3 outline-none resize-none'
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-card-border)',
                color: 'var(--color-text-body)',
              }}
            />
            {resolveModal.type === 'claim' && resolveModal.action === 'resolve' && (
              <input
                type='number'
                value={resolveModal.refundAmount}
                onChange={(e) => setResolveModal({ ...resolveModal, refundAmount: e.target.value })}
                placeholder='Refund amount (optional)'
                className='w-full text-sm rounded-lg border px-3 py-2.5 mb-4 outline-none'
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-body)',
                }}
              />
            )}
            <div className='flex items-center gap-3 justify-end'>
              <button
                onClick={() => setResolveModal({ ...resolveModal, open: false })}
                className='text-sm px-4 py-2 rounded-lg border'
                style={{
                  borderColor: 'var(--color-card-border)',
                  color: 'var(--color-text-body)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResolveAction}
                disabled={!resolveModal.text && resolveModal.action === 'reject'}
                className='text-sm px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50'
                style={{
                  backgroundColor:
                    resolveModal.action === 'resolve' ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {resolveModal.action === 'resolve' ? 'Resolve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Modal */}
      <ConfirmModal
        isOpen={deleteReviewModal.open}
        onClose={() => setDeleteReviewModal({ open: false, review: null })}
        onConfirm={handleDeleteReview}
        title='Delete Review'
        description='Are you sure you want to delete this review? This action cannot be undone.'
        variant='danger'
        confirmText='Delete'
      />
    </>
  )
}
