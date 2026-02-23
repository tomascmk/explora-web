import { gql } from '@apollo/client'

export const ADMIN_GET_ALL_PAYMENTS = gql`
  query GetAllPayments {
    findAllPayments {
      id
      amount
      status
      external_transaction_id
      created_at
      reservation {
        id
        total_amount
        reservation_status
        tour {
          id
          title
        }
        user {
          id
          fullName
          email
        }
      }
    }
  }
`

export const ADMIN_GET_PAYMENT = gql`
  query GetPayment($id: String!) {
    findPayment(id: $id) {
      id
      amount
      status
      external_transaction_id
      created_at
      reservation {
        id
        total_amount
        reservation_status
        payment_status
        tour {
          id
          title
        }
        user {
          id
          fullName
          email
        }
      }
    }
  }
`
