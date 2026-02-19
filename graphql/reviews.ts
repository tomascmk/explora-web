import { gql } from '@apollo/client';

export const GET_MY_REVIEWS = gql`
  query GetMyReviews {
    getMyReviews {
      id
      guide_rating
      tour_rating
      average_rating
      comment
      created_at
      best_tour_part
      worst_tour_part
      best_guide_part
      worst_guide_part
      user {
        id
        username
        fullName
      }
      tour {
        id
        title
      }
      reservation {
        id
      }
    }
  }
`;

export const GET_GUIDE_REVIEWS = gql`
  query TourReviewByGuide($guideId: ID!) {
    tourReviewByGuide(id: $guideId) {
      id
      guide_rating
      tour_rating
      average_rating
      comment
      created_at
      best_tour_part
      worst_tour_part
      best_guide_part
      worst_guide_part
      user {
        id
        username
        fullName
      }
      tour {
        id
        title
      }
      reservation {
        id
      }
    }
  }
`;

export const CREATE_FEEDBACK_REPORT = gql`
  mutation CreateFeedbackReport($input: CreateFeedbackReportDto!) {
    createFeedbackReport(input: $input) {
      id
      status
      reason
      createdAt
    }
  }
`;
