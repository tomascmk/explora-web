import { gql } from '@apollo/client'

/**
 * PLAN-100 — Registro de auditoría de TODO el sistema.
 *
 * Antes esta consulta pedía `myAuditLog`, que devuelve únicamente las acciones
 * del usuario logueado. La pantalla se presenta como el audit log del sistema,
 * así que un admin revisando qué pasó veía una lista vacía y concluía que no
 * había pasado nada — cuando en realidad no podía ver lo que hizo nadie más.
 *
 * `adminAuditLog` exige rol ADMIN o SUPER_ADMIN en la API. La pantalla también
 * deja entrar a SUPPORT, que ahora recibe un mensaje de permisos en vez de un
 * error crudo.
 */
export const ADMIN_GET_AUDIT_LOG = gql`
  query GetAuditLog($limit: Int, $offset: Int, $action: String, $userId: String) {
    adminAuditLog(limit: $limit, offset: $offset, action: $action, userId: $userId) {
      id
      action
      entity
      entityId
      changes
      metadata
      ipAddress
      userAgent
      createdAt
      user {
        id
        fullName
        email
      }
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

export interface AuditLogEntry {
  id: string
  action: string
  entity: string
  entityId: string
  changes: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  /** Quién hizo la acción. `AuditLog.user` es no-nullable en el schema. */
  user: { id: string; fullName: string | null; email: string | null }
}

export interface AuditLogData {
  adminAuditLog: AuditLogEntry[]
}
