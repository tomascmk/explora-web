import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import type { AuditLogEntry } from '@/graphql/admin/audit-log'

const queryMock = vi.fn()

vi.mock('@apollo/client/react', () => ({
  useQuery: () => queryMock(),
}))

import AdminAuditLogPage from './page'

const entry = (over: Partial<AuditLogEntry> = {}): AuditLogEntry => ({
  id: 'a1',
  action: 'DELETE_TOUR',
  entity: 'Tour',
  entityId: 't1',
  changes: null,
  metadata: null,
  ipAddress: '1.2.3.4',
  userAgent: null,
  createdAt: '2026-08-26T10:00:00Z',
  user: { id: 'u1', fullName: 'Otra Admin', email: 'otra@explora.app' },
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe('AdminAuditLogPage', () => {
  it('muestra las acciones de TODOS los admins, no sólo las propias', () => {
    // PLAN-100: la pantalla pedía `myAuditLog` y sólo devolvía las acciones del
    // admin que la miraba. Un admin revisando qué pasó veía una lista vacía y
    // concluía que no había pasado nada.
    queryMock.mockReturnValue({
      data: { adminAuditLog: [entry()] },
      loading: false,
      error: undefined,
    })

    render(<AdminAuditLogPage />)

    // Aparece en la fila y como opción del filtro de acciones.
    expect(screen.getAllByText('DELETE_TOUR').length).toBeGreaterThan(0)
    expect(screen.getByText('Otra Admin')).toBeTruthy()
  })

  it('dice quién hizo cada acción', () => {
    // Sin la columna de usuario el registro no sirve para lo que existe.
    queryMock.mockReturnValue({
      data: { adminAuditLog: [entry()] },
      loading: false,
      error: undefined,
    })

    render(<AdminAuditLogPage />)

    expect(screen.getByText('Otra Admin')).toBeTruthy()
    expect(screen.getByText('otra@explora.app')).toBeTruthy()
  })

  it('no rompe si el usuario vino incompleto', () => {
    queryMock.mockReturnValue({
      data: {
        adminAuditLog: [
          entry({ user: { id: 'u2', fullName: null, email: null } }),
        ],
      },
      loading: false,
      error: undefined,
    })

    render(<AdminAuditLogPage />)

    expect(screen.getByText('Unknown')).toBeTruthy()
  })

  it('explica el permiso en vez de mostrar un error crudo de GraphQL', () => {
    // `adminAuditLog` exige ADMIN o SUPER_ADMIN, pero el layout deja entrar
    // también a SUPPORT.
    queryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Forbidden resource'),
    })

    render(<AdminAuditLogPage />)

    expect(
      screen.getByText('This log is available to administrators only.'),
    ).toBeTruthy()
    expect(screen.queryByText('Forbidden resource')).toBeNull()
  })
})
