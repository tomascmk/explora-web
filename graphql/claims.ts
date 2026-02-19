import { gql } from '@apollo/client';

export const CLAIMS_BY_GUIDE = gql`
  query ClaimsByGuide($guideId: String!) {
    claimsByGuide(guideId: $guideId) {
      id
      reason
      status
      resolution
      refundAmount
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
    }
  }
`;

export const RESOLVE_CLAIM = gql`
  mutation ResolveClaim($id: String!, $resolution: String!, $resolvedById: String!, $refundAmount: Float) {
    resolveClaim(id: $id, resolution: $resolution, resolvedById: $resolvedById, refundAmount: $refundAmount) {
      id
      status
      resolution
      resolvedAt
      refundAmount
    }
  }
`;

export const REJECT_CLAIM = gql`
  mutation RejectClaim($id: String!, $reason: String!, $rejectedById: String!) {
    rejectClaim(id: $id, reason: $reason, rejectedById: $rejectedById) {
      id
      status
      updatedAt
    }
  }
`;
