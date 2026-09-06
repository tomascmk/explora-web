import { gql } from '@apollo/client'

export const ADMIN_GET_ALL_RESERVATIONS = gql`
  query GetAllReservations {
    tourReservations {
      id
      reservation_status
      payment_status
      total_amount
      currency
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
      currency
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

export interface AdminReservation {
  id: string
  reservation_status: string
  payment_status: string
  total_amount: number
  currency?: string | null
  created_at: string
  cancellation_reason: string | null
  paid_at: string | null
  is_invoice_generated: boolean
  invoice_number: string | null
  schedule: {
    id: string
    startTime: string
    endTime: string
    maxCapacity: number
  } | null
  tour: { id: string; title: string } | null
  user: {
    id: string
    username: string
    fullName: string | null
    email: string
  } | null
}

export interface AdminReservationsData {
  tourReservations: AdminReservation[]
}
