import { gql } from '@apollo/client/core';

/**
 * F-23: códigos de acceso a custom tours (privados). El guía los genera para
 * su tour privado; dan ACCESO al detalle + permiten reservar pagando (no son
 * una reserva gratis como los `EXPL`).
 */

export interface CustomTourCodeGrant {
  id: string;
  grantedAt: string;
  user?: { id: string; fullName?: string | null; email?: string | null };
}

export interface CustomTourCode {
  id: string;
  code: string;
  maxUses?: number | null;
  usesRemaining?: number | null;
  status: 'ACTIVE' | 'EXHAUSTED' | 'REVOKED' | string;
  expiresAt?: string | null;
  createdAt: string;
  grants?: CustomTourCodeGrant[];
}

export const CUSTOM_TOUR_CODES_FOR_TOUR = gql`
  query CustomTourCodesForTour($tourId: ID!) {
    customTourCodesForTour(tourId: $tourId) {
      id
      code
      maxUses
      usesRemaining
      status
      expiresAt
      createdAt
      grants {
        id
        grantedAt
        user {
          id
          fullName
          email
        }
      }
    }
  }
`;

export const CREATE_CUSTOM_TOUR_CODE = gql`
  mutation CreateCustomTourCode($input: CreateCustomTourCodeInput!) {
    createCustomTourCode(input: $input) {
      id
      code
      maxUses
      usesRemaining
      status
      expiresAt
      createdAt
    }
  }
`;

export const REVOKE_CUSTOM_TOUR_CODE = gql`
  mutation RevokeCustomTourCode($codeId: ID!) {
    revokeCustomTourCode(codeId: $codeId) {
      id
      status
    }
  }
`;
