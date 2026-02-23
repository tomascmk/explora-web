import { gql } from '@apollo/client'

export const ADMIN_GET_AUDIT_LOG = gql`
  query GetAuditLog($limit: Int, $offset: Int) {
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
`

export const ADMIN_GET_ENTITY_AUDIT_LOG = gql`
  query GetEntityAuditLog($entity: String!, $entityId: ID!) {
    entityAuditLog(entity: $entity, entityId: $entityId) {
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
`
