import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUser(updateUserInput: $input) {
      id
      username
      fullName
      email
    }
  }
`;

export const UPDATE_STRIPE_ACCOUNT = gql`
  mutation UpdateStripeAccount($guideId: String!, $stripeAccountId: String!) {
    updateStripeAccount(guideId: $guideId, stripeAccountId: $stripeAccountId) {
      id
      stripeAccountId
    }
  }
`;
