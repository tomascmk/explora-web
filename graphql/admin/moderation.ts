import { gql } from '@apollo/client'

// Claims
export const ADMIN_GET_ALL_CLAIMS = gql`
  query GetAllClaims($status: String) {
    claims(status: $status) {
      id
      reason
      status
      resolution
      refundAmount
      category
      createdAt
      updatedAt
      resolvedAt
      claimant {
        id
        username
        fullName
        email
      }
      reservation {
        id
        total_amount
        tour {
          id
          title
        }
      }
      tour {
        id
        title
      }
      resolvedBy {
        id
        fullName
      }
    }
  }
`

export const ADMIN_RESOLVE_CLAIM = gql`
  mutation ResolveClaim($id: String!, $resolution: String!, $resolvedById: String!, $refundAmount: Float) {
    resolveClaim(id: $id, resolution: $resolution, resolvedById: $resolvedById, refundAmount: $refundAmount) {
      id
      status
      resolution
      resolvedAt
      refundAmount
    }
  }
`

export const ADMIN_REJECT_CLAIM = gql`
  mutation RejectClaim($id: String!, $reason: String!, $rejectedById: String!) {
    rejectClaim(id: $id, reason: $reason, rejectedById: $rejectedById) {
      id
      status
      updatedAt
    }
  }
`

// Feedback Reports
export const ADMIN_GET_FEEDBACK_REPORTS = gql`
  query GetFeedbackReports($status: String) {
    feedbackReports(status: $status) {
      id
      reason
      status
      adminResponse
      createdAt
      updatedAt
      reporter {
        id
        fullName
        email
      }
      review {
        id
        comment
        tour_rating
        guide_rating
        tour {
          id
          title
        }
        user {
          id
          fullName
        }
      }
      reviewedBy {
        id
        fullName
      }
    }
  }
`

export const ADMIN_APPROVE_FEEDBACK_REPORT = gql`
  mutation ApproveFeedbackReport($id: String!, $adminId: String!, $response: String) {
    approveFeedbackReport(id: $id, adminId: $adminId, response: $response) {
      id
      status
      adminResponse
      updatedAt
    }
  }
`

export const ADMIN_REJECT_FEEDBACK_REPORT = gql`
  mutation RejectFeedbackReport($id: String!, $adminId: String!, $response: String!) {
    rejectFeedbackReport(id: $id, adminId: $adminId, response: $response) {
      id
      status
      updatedAt
    }
  }
`

// Reviews
export const ADMIN_GET_ALL_REVIEWS = gql`
  query GetAllReviews {
    tourReviews {
      id
      guide_rating
      tour_rating
      average_rating
      comment
      created_at
      best_tour_part
      worst_tour_part
      best_guide_part
      worst_guide_part
      user {
        id
        username
        fullName
      }
      tour {
        id
        title
      }
    }
  }
`

export const ADMIN_REMOVE_REVIEW = gql`
  mutation AdminRemoveReview($id: ID!) {
    removeTourReview(id: $id) {
      success
      message
    }
  }
`

export interface AdminClaim {
  id: string
  reason: string
  status: string
  resolution: string | null
  refundAmount: number | null
  category: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  claimant: {
    id: string
    username: string
    fullName: string | null
    email: string
  } | null
  reservation: {
    id: string
    total_amount: number
    tour: { id: string; title: string } | null
  } | null
  tour: { id: string; title: string } | null
  resolvedBy: { id: string; fullName: string | null } | null
}

export interface AdminClaimsData {
  claims: AdminClaim[]
}

export interface FeedbackReport {
  id: string
  reason: string
  status: string
  adminResponse: string | null
  createdAt: string
  updatedAt: string
  reporter: {
    id: string
    fullName: string | null
    email: string
  } | null
  review: {
    id: string
    comment: string | null
    tour_rating: number | null
    guide_rating: number | null
    tour: { id: string; title: string } | null
    user: { id: string; fullName: string | null } | null
  } | null
  reviewedBy: { id: string; fullName: string | null } | null
}

export interface FeedbackReportsData {
  feedbackReports: FeedbackReport[]
}

export interface AdminReview {
  id: string
  guide_rating: number | null
  tour_rating: number | null
  average_rating: number | null
  comment: string | null
  created_at: string
  best_tour_part: string | null
  worst_tour_part: string | null
  best_guide_part: string | null
  worst_guide_part: string | null
  user: {
    id: string
    username: string
    fullName: string | null
  } | null
  tour: { id: string; title: string } | null
}

export interface AdminReviewsData {
  tourReviews: AdminReview[]
}
