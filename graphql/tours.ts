import { gql } from '@apollo/client/core';

export const GET_TOURS_BY_GUIDE = gql`
  query GetToursByGuide($guideId: String!) {
    toursByGuide(guideId: $guideId) {
      id
      title
      description
      status
      tourType
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
      tourPricings {
        id
        price
        currency
        minParticipants
        maxParticipants
      }
      tourSchedules {
        id
        startTime
        endTime
        isAvailable
        maxCapacity
        specialInfo
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

export const GET_TOUR_BY_ID = gql`
  query GetTour($id: String!) {
    tour(id: $id) {
      id
      title
      description
      status
      tourType
      createdAt
      guide {
        id
        fullName
        username
      }
      tourSteps {
        id
        title
        description
        latitude
        longitude
        order
        place {
          id
          name
        }
      }
      tourPricings {
        id
        price
        currency
        startDate
        endDate
        minParticipants
        maxParticipants
      }
      tourSchedules {
        id
        startTime
        endTime
        isAvailable
        maxCapacity
        specialInfo
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
      tourType
    }
  }
`;

export const UPDATE_TOUR = gql`
  mutation UpdateTour($input: UpdateTourInput!) {
    updateTour(updateTourInput: $input) {
      id
      title
      description
      tourType
    }
  }
`;

export const UPDATE_TOUR_STEP = gql`
  mutation UpdateTourStep($input: UpdateTourStepInput!) {
    updateTourStep(input: $input) {
      id
      title
      description
      latitude
      longitude
      order
    }
  }
`;

export const DELETE_TOUR_STEP = gql`
  mutation DeleteTourStep($id: String!) {
    removeTourStep(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_TOUR_STEP = gql`
  mutation CreateTourStep($input: CreateTourStepInput!) {
    createTourStep(input: $input) {
      id
      title
      order
    }
  }
`;

export const CREATE_TOUR_PRICING = gql`
  mutation CreateTourPricing($input: CreateTourPricingInput!) {
    createTourPricing(input: $input) {
      id
      price
      currency
      startDate
      endDate
      minParticipants
      maxParticipants
    }
  }
`;

export const UPDATE_TOUR_PRICING = gql`
  mutation UpdateTourPricing($input: UpdateTourPricingInput!) {
    updateTourPricing(input: $input) {
      id
      price
      currency
      startDate
      endDate
      minParticipants
      maxParticipants
    }
  }
`;

export const CREATE_TOUR_SCHEDULE = gql`
  mutation CreateTourSchedule($input: CreateTourScheduleInput!) {
    createTourSchedule(input: $input) {
      id
      startTime
      endTime
      isAvailable
      maxCapacity
      specialInfo
    }
  }
`;
