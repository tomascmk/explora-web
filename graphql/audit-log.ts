import { gql } from '@apollo/client';

export const GET_MY_AUDIT_LOG = gql`
  query GetMyAuditLog($limit: Int, $offset: Int) {
    myAuditLog(limit: $limit, offset: $offset) {
      id
      action
      entity
      entityId
      changes
      metadata
      ipAddress
      userAgent
      createdAt
    }
  }
`;
