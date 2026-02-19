import { gql } from '@apollo/client';

const USER_SCHEDULE_FIELDS = gql`
  fragment UserScheduleFields on UserSchedule {
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
    tour {
      id
      title
    }
  }
`;

export const GET_USER_SCHEDULES_BY_USER = gql`
  ${USER_SCHEDULE_FIELDS}
  query GetUserSchedulesByUser($userId: String!) {
    userSchedulesByUser(userId: $userId) {
      ...UserScheduleFields
    }
  }
`;

export const CREATE_MY_USER_SCHEDULE = gql`
  ${USER_SCHEDULE_FIELDS}
  mutation CreateMyUserSchedule($input: CreateMyUserScheduleInput!) {
    createMyUserSchedule(input: $input) {
      ...UserScheduleFields
    }
  }
`;

export const UPDATE_USER_SCHEDULE = gql`
  ${USER_SCHEDULE_FIELDS}
  mutation UpdateUserSchedule($input: UpdateUserScheduleInput!) {
    updateUserSchedule(input: $input) {
      ...UserScheduleFields
    }
  }
`;

export const REMOVE_USER_SCHEDULE = gql`
  mutation RemoveUserSchedule($id: String!) {
    removeUserSchedule(id: $id)
  }
`;
