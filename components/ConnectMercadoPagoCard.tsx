'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { CheckCircle2, CreditCard, Link2Off } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { getDisplayError } from '@/utils/errorMessages'
import {
  MY_CONNECTED_ACCOUNT,
  CONNECT_MERCADOPAGO,
  DISCONNECT_MERCADOPAGO,
  type MyConnectedAccountData,
  type ConnectMercadoPagoData,
} from '@/graphql/connected-accounts'

/**
 * Tarjeta de conexión de la cuenta de cobro (MercadoPago) del guía — PLAN-036 Fase 1.
 *
 * Conectada → estado verde + opción de desconectar. Sin conectar → CTA que inicia
 * el OAuth (mutation devuelve la URL de autorización y redirige el browser).
 */
export function ConnectMercadoPagoCard({ enabled = true }: { enabled?: boolean }) {
  const [showDisconnect, setShowDisconnect] = useState(false)

  const { data, loading, refetch } = useQuery<MyConnectedAccountData>(
    MY_CONNECTED_ACCOUNT,
    { skip: !enabled },
  )

  const [connect, { loading: connecting }] = useMutation<ConnectMercadoPagoData>(
    CONNECT_MERCADOPAGO,
    {
      onCompleted: (res) => {
        const url = res?.connectMercadoPago?.authorizationUrl
        if (url) window.location.href = url
      },
      onError: (e) => toast.error(getDisplayError(e)),
    },
  )

  const [disconnect, { loading: disconnecting }] = useMutation(
    DISCONNECT_MERCADOPAGO,
    {
      onCompleted: () => {
        toast.success('Cuenta de MercadoPago desconectada.')
        setShowDisconnect(false)
        refetch()
      },
      onError: (e) => toast.error(getDisplayError(e)),
    },
  )

  const account = data?.myConnectedAccount
  const isConnected = account?.status === 'connected'

  if (loading) {
    return <div className='h-24 rounded-xl border animate-pulse' style={{ borderColor: 'var(--color-card-border)' }} />
  }

  return (
    <div
      className='border rounded-xl p-6 mb-6'
      style={{
        backgroundColor: isConnected ? 'var(--color-success-light)' : 'var(--color-card-bg)',
        borderColor: isConnected ? 'var(--color-success)' : 'var(--color-card-border)',
      }}
    >
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5'>
            {isConnected ? (
              <CheckCircle2 size={22} style={{ color: 'var(--color-success)' }} />
            ) : (
              <CreditCard size={22} style={{ color: 'var(--color-primary)' }} />
            )}
          </div>
          <div>
            <p className='font-semibold' style={{ color: 'var(--color-text-heading)' }}>
              {isConnected ? 'MercadoPago conectado' : 'Conectá tu cuenta de MercadoPago'}
            </p>
            <p className='text-sm mt-1' style={{ color: 'var(--color-text-body)' }}>
              {isConnected
                ? 'Vas a recibir tus cobros en esta cuenta.'
                : 'Necesitás conectar tu cuenta para poder publicar tours/eventos pagos y recibir tus cobros.'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={() => setShowDisconnect(true)}
            className='px-4 py-2 rounded-lg border transition hover:opacity-80 flex items-center gap-2 text-sm'
            style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
          >
            <Link2Off size={16} />
            Desconectar
          </button>
        ) : (
          <button
            onClick={() => connect()}
            disabled={connecting}
            className='text-white px-6 py-2 rounded-lg transition disabled:opacity-50 enabled:hover:opacity-90 flex items-center gap-2'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {connecting && (
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            )}
            {connecting ? 'Redirigiendo...' : 'Conectar MercadoPago'}
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={() => disconnect()}
        title='Desconectar MercadoPago'
        description='Si la desconectás, no vas a poder recibir cobros hasta volver a conectarla. ¿Continuar?'
        confirmText='Desconectar'
        variant='danger'
        loading={disconnecting}
      />
    </div>
  )
}
