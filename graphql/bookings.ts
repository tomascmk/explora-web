import { gql } from '@apollo/client';

export const GET_BOOKINGS_BY_USER = gql`
  query GetBookingsByUser($userId: String!) {
    getBookingsByUser(userId: $userId) {
      id
      status
      createdAt
      payment {
        id
        amount
        currency
        status
      }
      tourReservation {
        id
        tour {
          id
          title
        }
      }
    }
  }
`;
