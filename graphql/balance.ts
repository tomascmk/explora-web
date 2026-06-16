import { gql } from '@apollo/client';

// PLAN-041: las ganancias se derivan de las reservas marketplace (fuente de
// verdad). El ledger interno + payout manual fueron retirados.
export const MY_EARNINGS = gql`
  query MyEarnings {
    myEarnings {
      inEscrow
      released
      total
      count
    }
  }
`;
