import { gql } from '@apollo/client';

export const CLAIMS_BY_GUIDE = gql`
  query ClaimsByGuide {
    claimsByGuide {
      id
      type
      description
      status
      resolution
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CLAIM = gql`
  mutation CreateClaim($input: CreateClaimInput!) {
    createClaim(input: $input) {
      id
      type
      description
      status
      createdAt
    }
  }
`;

export const RESOLVE_CLAIM = gql`
  mutation ResolveClaim($id: String!, $resolution: String!) {
    resolveClaim(id: $id, resolution: $resolution) {
      id
      status
      resolution
      updatedAt
    }
  }
`;
