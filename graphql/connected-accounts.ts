import { gql } from '@apollo/client';

export type ConnectedAccountStatus = 'connected' | 'expired' | 'revoked';

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string | null;
  scope: string | null;
  status: ConnectedAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MyConnectedAccountData {
  myConnectedAccount: ConnectedAccount | null;
}

/** Estado de la cuenta de pago conectada del guía autenticado (PLAN-036 Fase 1). */
export const MY_CONNECTED_ACCOUNT = gql`
  query MyConnectedAccount {
    myConnectedAccount {
      id
      provider
      providerUserId
      status
      createdAt
      updatedAt
    }
  }
`;

export interface ConnectMercadoPagoData {
  connectMercadoPago: { authorizationUrl: string };
}

/** Inicia el OAuth: devuelve la URL a la que redirigir al guía para autorizar. */
export const CONNECT_MERCADOPAGO = gql`
  mutation ConnectMercadoPago {
    connectMercadoPago {
      authorizationUrl
    }
  }
`;

export const DISCONNECT_MERCADOPAGO = gql`
  mutation DisconnectMercadoPago {
    disconnectMercadoPago {
      id
      status
    }
  }
`;
