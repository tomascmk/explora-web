import { gql } from '@apollo/client';

export const GET_GUIDE_RESERVATIONS = gql`
  query GetGuideReservations($guideId: String!) {
    tourReservationsByGuide(guideId: $guideId) {
      id
      reservationStatus
      paymentStatus
      totalAmount
      createdAt
      schedule {
        id
        startTime
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
      total_amount
      created_at
      updated_at
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
