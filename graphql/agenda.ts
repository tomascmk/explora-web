import { gql } from '@apollo/client';

export const GET_USER_SCHEDULES_BY_USER = gql`
  query GetUserSchedulesByUser($userId: String!) {
    userSchedulesByUser(userId: $userId) {
      id
      title
      description
      startTime
      endTime
      type
      location
      isConfirmed
      user {
        id
      }
    }
  }
`;

export const CREATE_MY_USER_SCHEDULE = gql`
  mutation CreateMyUserSchedule($input: CreateMyUserScheduleInput!) {
    createMyUserSchedule(input: $input) {
      id
      title
      description
      startTime
      endTime
      type
      location
      isConfirmed
      user {
        id
      }
    }
  }
`;
