import { gql } from '@apollo/client';

export const GET_GUIDE_REVIEWS = gql`
  query GetGuideReviews($guideId: String!) {
    getGuideReviews(guideId: $guideId) {
      id
      rating
      comment
      createdAt
      user {
        id
        username
        fullName
      }
      tour {
        id
        title
      }
    }
  }
`;

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    getMyReviews {
      id
      rating
      comment
      createdAt
      user {
        id
        username
        fullName
      }
      tour {
        id
        title
      }
    }
  }
`;
