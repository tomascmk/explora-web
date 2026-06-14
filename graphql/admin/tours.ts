import { gql } from '@apollo/client'

export const ADMIN_GET_ALL_TOURS = gql`
  query GetAllTours {
    tours {
      id
      title
      description
      status
      tourType
      createdAt
      updatedAt
      guide {
        id
        fullName
        username
        email
      }
      tourPricings {
        id
        price
        currency
        minParticipants
        maxParticipants
      }
      categories {
        id
        name
      }
      media {
        id
        url
        type
      }
    }
  }
`

export const ADMIN_GET_TOUR = gql`
  query GetTour($id: String!) {
    tour(id: $id) {
      id
      title
      description
      status
      tourType
      createdAt
      updatedAt
      guide {
        id
        fullName
        username
        email
      }
      tourSteps {
        id
        title
        description
        latitude
        longitude
        order
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
      categories {
        id
        name
      }
      media {
        id
        url
        type
      }
    }
  }
`

export const ADMIN_UPDATE_TOUR = gql`
  mutation AdminUpdateTour($updateTourInput: UpdateTourInput!) {
    updateTour(updateTourInput: $updateTourInput) {
      id
      title
      description
      status
      tourType
    }
  }
`

export const ADMIN_REMOVE_TOUR = gql`
  mutation AdminRemoveTour($id: String!) {
    removeTour(id: $id) {
      success
      message
    }
  }
`

// Places
export const ADMIN_GET_ALL_PLACES = gql`
  query GetAllPlaces {
    places {
      id
      name
      description
      entryPrice
      rate
      createdAt
      updatedAt
      address {
        id
        street
        city
        state
        country
      }
      media {
        id
        url
        type
      }
    }
  }
`

export const ADMIN_REMOVE_PLACE = gql`
  mutation AdminRemovePlace($id: ID!) {
    removePlace(id: $id) {
      success
      message
    }
  }
`

// Events
export const ADMIN_GET_ALL_EVENTS = gql`
  query GetAllEvents {
    events {
      id
      title
      description
      location
      startTime
      endTime
      category
      createdAt
      updatedAt
      createdBy {
        id
        fullName
        email
      }
    }
  }
`

export const ADMIN_REMOVE_EVENT = gql`
  mutation AdminRemoveEvent($id: String!) {
    removeEvent(id: $id) {
      success
      message
    }
  }
`

export interface AdminMedia {
  id: string
  url: string
  type: string
}

export interface AdminTourPricing {
  id: string
  price: number
  currency: string
  startDate?: string | null
  endDate?: string | null
  minParticipants: number
  maxParticipants: number
}

export interface AdminTourCategory {
  id: string
  name: string
}

export interface AdminTour {
  id: string
  title: string
  description: string
  status: string
  tourType: string
  createdAt: string
  updatedAt: string
  guide: {
    id: string
    fullName: string | null
    username: string | null
    email: string
  } | null
  tourPricings: AdminTourPricing[]
  categories: AdminTourCategory[]
  media: AdminMedia[]
}

export interface AdminToursData {
  tours: AdminTour[]
}

export interface AdminPlace {
  id: string
  name: string
  description: string
  entryPrice: number | null
  rate: number | null
  createdAt: string
  updatedAt: string
  address: {
    id: string
    street: string
    city: string
    state: string
    country: string
  } | null
  media: AdminMedia[]
}

export interface AdminPlacesData {
  places: AdminPlace[]
}

export interface AdminEvent {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  category: string | null
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    fullName: string | null
    email: string
  } | null
}

export interface AdminEventsData {
  events: AdminEvent[]
}
