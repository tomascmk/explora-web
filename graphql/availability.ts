import { gql } from '@apollo/client';

export const GET_MY_AVAILABILITY = gql`
  query GetMyAvailability($startDate: DateTime!, $endDate: DateTime!) {
    myAvailability(startDate: $startDate, endDate: $endDate) {
      id
      date
      startTime
      endTime
      available
      tourId
      tour {
        id
        title
      }
    }
  }
`;

export const CREATE_AVAILABILITY = gql`
  mutation CreateAvailability($input: CreateAvailabilityInput!) {
    createAvailability(input: $input) {
      id
      date
      startTime
      endTime
      available
    }
  }
`;

export const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailability($id: ID!, $input: UpdateAvailabilityInput!) {
    updateAvailability(id: $id, input: $input) {
      id
      available
    }
  }
`;

export const DELETE_AVAILABILITY = gql`
  mutation DeleteAvailability($id: ID!) {
    deleteAvailability(id: $id)
  }
`;

export const GET_TOUR_RESERVATIONS_BY_DATE = gql`
  query GetTourReservationsByDate($startDate: DateTime!, $endDate: DateTime!) {
    tourReservationsByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      reservation_status
      created_at
      tour {
        id
        title
      }
      user {
        id
        fullName
      }
    }
  }
`;
