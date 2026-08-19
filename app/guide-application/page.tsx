'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  GET_LANGUAGES,
  GuideApplication,
  MY_GUIDE_APPLICATION,
  REQUEST_GUIDE_ACCESS,
} from '@/graphql/guideApplications'

/**
 * PLAN-071 §2C — Solicitud para ser guía.
 *
 * Hasta ahora `/register` prometía "Create Guide Account" y no podía cumplirlo:
 * la API crea siempre un TOURIST y el middleware del portal exige rol GUIDE.
 * Esta pantalla es el camino real: se solicita, un admin aprueba, y recién ahí
 * el usuario entra al portal.
 */
/**
 * El contenido va aparte a propósito. `getApolloClient()` devuelve null en el
 * servidor, así que durante el prerender de Next NO hay ApolloProvider y
 * cualquier `useQuery` explota (el build fallaba con un Invariant de Apollo).
 * El wrapper de abajo corta antes de montar esto, igual que hace el layout del
 * portal en `app/(guide)/layout.tsx`.
 */
function GuideApplicationForm() {
  const { data, loading, refetch } = useQuery<{
    myGuideApplication: GuideApplication | null
  }>(MY_GUIDE_APPLICATION, { fetchPolicy: 'network-only' })
  const { data: langData } = useQuery<{
    findAllLanguages: { id: string; name: string }[]
  }>(GET_LANGUAGES)
  const [requestAccess, { loading: submitting }] =
    useMutation(REQUEST_GUIDE_ACCESS)

  const [form, setForm] = useState({ motivation: '', city: '', country: '' })
  const [languageIds, setLanguageIds] = useState<string[]>([])
  const [error, setError] = useState('')

  const application = data?.myGuideApplication
  const languages = langData?.findAllLanguages ?? []

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.motivation.trim().length < 20) {
      setError('Contanos un poco más: al menos 20 caracteres.')
      return
    }
    if (languageIds.length === 0) {
      setError('Elegí al menos un idioma.')
      return
    }
    try {
      await requestAccess({
        variables: {
          input: {
            motivation: form.motivation.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            languageIds,
          },
        },
      })
      await refetch()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No pudimos enviar tu solicitud. Intentá de nuevo.',
      )
    }
  }

  const toggleLanguage = (id: string) =>
    setLanguageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  if (loading) {
    return <p className='p-8 text-sm'>Cargando…</p>
  }

  // Ya hay una solicitud: mostrar su estado. Sólo si fue rechazada se puede
  // volver a postular — la API impone una sola abierta a la vez.
  if (application && application.status !== 'REJECTED') {
    return (
      <div className='max-w-xl mx-auto p-8' data-testid='application-status'>
        <h1
          className='text-2xl font-bold mb-2'
          style={{ color: 'var(--color-text-heading)' }}
        >
          {application.status === 'APPROVED'
            ? '¡Ya sos guía!'
            : 'Tu solicitud está en revisión'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {application.status === 'APPROVED'
            ? 'Tu solicitud fue aprobada. Ya podés entrar al portal de guías.'
            : 'Nuestro equipo la está revisando. Te avisamos cuando haya novedades.'}
        </p>
        <Link
          href={application.status === 'APPROVED' ? '/dashboard' : '/'}
          className='inline-block mt-6 px-4 py-2 rounded-lg text-white font-semibold'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {application.status === 'APPROVED' ? 'Ir al portal' : 'Volver al inicio'}
        </Link>
      </div>
    )
  }

  return (
    <div className='max-w-xl mx-auto p-8'>
      <h1
        className='text-2xl font-bold mb-2'
        style={{ color: 'var(--color-text-heading)' }}
      >
        Solicitar acceso de guía
      </h1>
      <p className='mb-6' style={{ color: 'var(--color-text-secondary)' }}>
        Contanos sobre vos. Un miembro del equipo revisa cada solicitud.
      </p>

      {application?.status === 'REJECTED' && (
        <div
          className='mb-6 px-4 py-3 rounded-lg text-sm'
          style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
          }}
          data-testid='previous-rejection'
        >
          Tu solicitud anterior fue rechazada
          {application.reviewNote ? `: ${application.reviewNote}` : ''}. Podés
          volver a postularte.
        </div>
      )}

      {error && (
        <div
          role='alert'
          className='mb-4 px-4 py-3 rounded-lg text-sm'
          style={{
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={submit} className='space-y-4'>
        <label className='block text-sm'>
          ¿Por qué querés ser guía?
          <textarea
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            rows={5}
            className='w-full mt-1 px-3 py-2 rounded-lg border'
            placeholder='Contanos tu experiencia y qué conocés de tu ciudad'
          />
        </label>

        <div className='grid grid-cols-2 gap-4'>
          <label className='block text-sm'>
            Ciudad
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className='w-full mt-1 px-3 py-2 rounded-lg border'
              required
            />
          </label>
          <label className='block text-sm'>
            País
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className='w-full mt-1 px-3 py-2 rounded-lg border'
              required
            />
          </label>
        </div>

        <fieldset>
          <legend className='text-sm mb-2'>Idiomas en los que guiás</legend>
          <div className='flex flex-wrap gap-2'>
            {languages.map((lang) => (
              <button
                type='button'
                key={lang.id}
                onClick={() => toggleLanguage(lang.id)}
                className='px-3 py-1.5 rounded-full text-sm border'
                style={{
                  backgroundColor: languageIds.includes(lang.id)
                    ? 'var(--color-primary)'
                    : 'transparent',
                  color: languageIds.includes(lang.id)
                    ? 'white'
                    : 'var(--color-text-body)',
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type='submit'
          disabled={submitting}
          className='w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50'
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {submitting ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  )
}

/**
 * Gate de autenticación. La ruta está en `publicPrefixes` del middleware —
 * tiene que estarlo, porque quien solicita ser guía es un TOURIST que todavía
 * no tiene el rol que el portal exige — así que el redirect a login lo hace
 * esta pantalla, no el middleware.
 */
export default function GuideApplicationPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/guide-application')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return (
      <p className='p-8 text-sm' style={{ color: 'var(--color-text-secondary)' }}>
        Cargando…
      </p>
    )
  }

  return <GuideApplicationForm />
}
