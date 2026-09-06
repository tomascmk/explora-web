import { gql } from '@apollo/client/core';

export interface GuideTourListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  tourType: string;
  isFreeWalkingTour: boolean;
  isCustom: boolean;
  createdAt: string;
  guide: {
    id: string;
    fullName: string;
    username: string;
  };
  tourSteps: {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    order: number;
  }[];
  tourPricings: {
    id: string;
    price: number;
    currency: string;
    minParticipants: number;
    maxParticipants: number;
  }[];
  tourSchedules: {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    maxCapacity: number;
    specialInfo: string;
  }[];
  media: {
    id: string;
    url: string;
    type: string;
  }[];
  categories: {
    id: string;
    name: string;
  }[];
}

export interface ToursByGuideData {
  toursByGuide: GuideTourListItem[];
}

export interface TourByIdStep {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  order: number;
  place: {
    id: string;
    name: string;
  } | null;
}

export interface TourByIdData {
  tour: {
    id: string;
    title: string;
    description: string;
    status: string;
    tourType: string;
    isFreeWalkingTour: boolean;
    isCustom: boolean;
    createdAt: string;
    guide: {
      id: string;
      fullName: string;
      username: string;
    };
    tourSteps: TourByIdStep[];
    tourPricings: {
      id: string;
      price: number;
      currency: string;
      startDate: string;
      endDate: string;
      minParticipants: number;
      maxParticipants: number;
    }[];
    tourSchedules: {
      id: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      maxCapacity: number;
      specialInfo: string;
    }[];
    media: {
      id: string;
      url: string;
      type: string;
    }[];
    categories: {
      id: string;
      name: string;
    }[];
  } | null;
}

export interface CreateTourData {
  createTour: {
    id: string;
    title: string;
    description: string;
    tourType: string;
  };
}

export const GET_TOURS_BY_GUIDE = gql`
  query GetToursByGuide($guideId: String!) {
    toursByGuide(guideId: $guideId) {
      id
      title
      description
      status
      tourType
      isFreeWalkingTour
      isCustom
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
        createdAt
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
        # PLAN-071 §3b — para avisar en la UI antes de intentar borrar un
        # horario con reservas. La regla real vive en el servidor.
        reservations {
          id
        }
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
      isFreeWalkingTour
      isCustom
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

// PLAN-071 §3b — Gestion de disponibilidad. Ojo con los tipos: la API es
// inconsistente entre estas dos. `UpdateTourScheduleInput.id` es ID!, pero
// `removeTourSchedule(id:)` toma String!. Copiar el patron equivocado
// reintroduciria la clase de bug que arreglo PLAN-071 §1.
export const UPDATE_TOUR_SCHEDULE = gql`
  mutation UpdateTourSchedule($input: UpdateTourScheduleInput!) {
    updateTourSchedule(input: $input) {
      id
      startTime
      endTime
      isAvailable
      maxCapacity
      specialInfo
    }
  }
`;

export const REMOVE_TOUR_SCHEDULE = gql`
  mutation RemoveTourSchedule($id: String!) {
    removeTourSchedule(id: $id)
  }
`;
