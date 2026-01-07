import { gql } from '@apollo/client/core';

export const GET_TOURS_BY_GUIDE = gql`
  query GetToursByGuide($guideId: String!) {
    toursByGuide(guideId: $guideId) {
      id
      title
      description
      createdAt
      guide {
        id
        fullName
        username
      }
      tourSteps {
        id
        title
        latitude
        longitude
        order
      }
      media {
        id
        url
        type
      }
      categories {
        id
        name
      }
    }
  }
`;

export const DELETE_TOUR = gql`
  mutation DeleteTour($id: String!) {
    removeTour(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_TOUR = gql`
  mutation CreateTour($input: CreateTourInput!) {
    createTour(createTourInput: $input) {
      id
      title
      description
    }
  }
`;

export const UPDATE_TOUR = gql`
  mutation UpdateTour($input: UpdateTourInput!) {
    updateTour(updateTourInput: $input) {
      id
      title
      description
    }
  }
`;
