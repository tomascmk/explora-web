import { gql } from '@apollo/client';

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    user(id: $id) {
      id
      username
      fullName
      email
      createdAt
      media {
        id
        url
        type
      }
    }
  }
`;
