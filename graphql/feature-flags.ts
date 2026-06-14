import { gql } from '@apollo/client';

export interface FeatureFlags {
  tourCreationEnabled: boolean;
  discountGroupsEnabled: boolean;
  claimsEnabled: boolean;
  reviewsEnabled: boolean;
  selfGuidedToursEnabled: boolean;
  inPersonToursEnabled: boolean;
  chatEnabled: boolean;
}

export interface FeatureFlagsData {
  featureFlags: FeatureFlags;
}

/**
 * Feature flags globales de la plataforma (PLAN-035). Solo expone booleanos,
 * sin datos sensibles. Requiere usuario autenticado.
 */
export const FEATURE_FLAGS = gql`
  query FeatureFlags {
    featureFlags {
      tourCreationEnabled
      discountGroupsEnabled
      claimsEnabled
      reviewsEnabled
      selfGuidedToursEnabled
      inPersonToursEnabled
      chatEnabled
    }
  }
`;
