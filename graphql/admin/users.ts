import { gql } from '@apollo/client'

export const ADMIN_GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      username
      fullName
      email
      roles
      oauthProvider
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      username
      fullName
      email
      roles
      createdAt
    }
  }
`

export const ADMIN_GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      username
      fullName
      email
      roles
      oauthProvider
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      username
      fullName
      email
      roles
    }
  }
`

export const ADMIN_REMOVE_USER = gql`
  mutation RemoveUser($id: String!) {
    removeUser(id: $id) {
      id
    }
  }
`
