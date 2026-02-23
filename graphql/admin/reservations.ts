import { gql } from '@apollo/client'

export const ADMIN_GET_ALL_RESERVATIONS = gql`
  query GetAllReservations {
    tourReservations {
      id
      reservation_status
      payment_status
      total_amount
      created_at
      cancellation_reason
      paid_at
      is_invoice_generated
      invoice_number
      schedule {
        id
        startTime
        endTime
        maxCapacity
      }
      tour {
        id
        title
      }
      user {
        id
        username
        fullName
        email
      }
    }
  }
`

export const ADMIN_GET_RESERVATION = gql`
  query GetReservation($id: ID!) {
    tourReservation(id: $id) {
      id
      reservation_status
      payment_status
      total_amount
      created_at
      cancellation_reason
      paid_at
      is_invoice_generated
      invoice_number
      schedule {
        id
        startTime
        endTime
        maxCapacity
        specialInfo
      }
      tour {
        id
        title
        description
        guide {
          id
          fullName
          email
        }
      }
      user {
        id
        fullName
        email
        username
      }
    }
  }
`

export const ADMIN_UPDATE_RESERVATION = gql`
  mutation AdminUpdateReservation($id: ID!, $input: UpdateTourReservationInput!) {
    updateTourReservation(id: $id, input: $input) {
      id
      reservation_status
      payment_status
      cancellation_reason
    }
  }
`
