import { gql } from '@apollo/client';

export const MY_BALANCE = gql`
  query MyBalance {
    myBalance {
      id
      availableBalance
      pendingBalance
      totalEarnings
      totalPayouts
      stripeAccountId
      createdAt
      updatedAt
    }
  }
`;

export const REQUEST_PAYOUT = gql`
  mutation RequestPayout($amount: Float!) {
    requestPayout(amount: $amount) {
      id
      amount
      status
      requestedAt
      processedAt
      notes
    }
  }
`;

export const MY_PAYOUT_REQUESTS = gql`
  query MyPayoutRequests {
    myPayoutRequests {
      id
      amount
      status
      requestedAt
      processedAt
      notes
    }
  }
`;
