import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuideApplicationPage from './page'

const requestMock = vi.fn()
let myApplication: unknown = null

vi.mock('@apollo/client/react', () => ({
  useQuery: (doc: { __which?: string }) => {
    const which = (doc as unknown as { __which: string }).__which
    if (which === 'languages') {
      return {
        data: {
          findAllLanguages: [
            { id: 'l1', name: 'Español' },
            { id: 'l2', name: 'English' },
          ],
        },
        loading: false,
      }
    }
    return {
      data: { myGuideApplication: myApplication },
      loading: false,
      refetch: vi.fn(),
    }
  },
  useMutation: () => [requestMock, { loading: false }],
}))

vi.mock('@/graphql/guideApplications', () => ({
  MY_GUIDE_APPLICATION: { __which: 'mine' },
  GET_LANGUAGES: { __which: 'languages' },
  REQUEST_GUIDE_ACCESS: { __which: 'request' },
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: /por qué/i }), 'Guío hace diez años en mi ciudad')
  await user.type(screen.getByRole('textbox', { name: /ciudad/i }), 'Rosario')
  await user.type(screen.getByRole('textbox', { name: /país/i }), 'Argentina')
}

describe('GuideApplicationPage', () => {
  beforeEach(() => {
    requestMock.mockReset().mockResolvedValue({})
    myApplication = null
  })

  it('envía la solicitud con los idiomas elegidos', async () => {
    const user = userEvent.setup()
    render(<GuideApplicationPage />)

    await fill(user)
    await user.click(screen.getByRole('button', { name: 'Español' }))
    await user.click(screen.getByRole('button', { name: /Enviar solicitud/i }))

    await waitFor(() => expect(requestMock).toHaveBeenCalled())
    expect(requestMock.mock.calls[0][0].variables.input).toMatchObject({
      city: 'Rosario',
      country: 'Argentina',
      languageIds: ['l1'],
    })
  })

  it('exige al menos un idioma', async () => {
    const user = userEvent.setup()
    render(<GuideApplicationPage />)

    await fill(user)
    await user.click(screen.getByRole('button', { name: /Enviar solicitud/i }))

    expect(requestMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos un idioma/i)
  })

  it('exige una motivación mínima', async () => {
    const user = userEvent.setup()
    render(<GuideApplicationPage />)

    await user.type(screen.getByRole('textbox', { name: /por qué/i }), 'corto')
    await user.type(screen.getByRole('textbox', { name: /ciudad/i }), 'Rosario')
    await user.type(screen.getByRole('textbox', { name: /país/i }), 'Argentina')
    await user.click(screen.getByRole('button', { name: 'Español' }))
    await user.click(screen.getByRole('button', { name: /Enviar solicitud/i }))

    expect(requestMock).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos 20 caracteres/i)
  })

  // Decisión de producto: una sola solicitud abierta a la vez.
  it('con una solicitud pendiente muestra el estado en vez del formulario', () => {
    myApplication = { id: 'a1', status: 'PENDING', city: 'Rosario' }
    render(<GuideApplicationPage />)

    expect(screen.getByTestId('application-status')).toHaveTextContent(/en revisión/i)
    expect(screen.queryByRole('button', { name: /Enviar solicitud/i })).toBeNull()
  })

  it('aprobada, ofrece entrar al portal', () => {
    myApplication = { id: 'a1', status: 'APPROVED', city: 'Rosario' }
    render(<GuideApplicationPage />)

    expect(screen.getByRole('link', { name: /Ir al portal/i })).toHaveAttribute(
      'href',
      '/dashboard',
    )
  })

  // La otra mitad de la decisión: tras un rechazo se puede volver a postular.
  it('rechazada, muestra el motivo y deja volver a postularse', () => {
    myApplication = {
      id: 'a1',
      status: 'REJECTED',
      reviewNote: 'Falta experiencia',
    }
    render(<GuideApplicationPage />)

    expect(screen.getByTestId('previous-rejection')).toHaveTextContent(/Falta experiencia/)
    expect(screen.getByRole('button', { name: /Enviar solicitud/i })).toBeInTheDocument()
  })
})
