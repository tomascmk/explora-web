import { gql } from '@apollo/client';

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserInput!) {
    updateUser(updateUserInput: $input) {
      id
      username
      fullName
      email
    }
  }
`;
