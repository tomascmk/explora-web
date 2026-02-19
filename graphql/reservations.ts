import { gql } from '@apollo/client';

export const GET_GUIDE_RESERVATIONS = gql`
  query GetGuideReservations($guideId: String!) {
    tourReservationsByGuide(guideId: $guideId) {
      id
      reservation_status
      payment_status
      total_amount
      created_at
      cancellation_reason
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
`;

export const GET_RESERVATION_DETAIL = gql`
  query GetReservationDetail($id: ID!) {
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
      }
      user {
        id
        fullName
        email
        username
      }
    }
  }
`;

export const UPDATE_RESERVATION_STATUS = gql`
  mutation UpdateReservationStatus($id: ID!, $input: UpdateTourReservationInput!) {
    updateTourReservation(id: $id, input: $input) {
      id
      reservation_status
      payment_status
      cancellation_reason
    }
  }
`;
