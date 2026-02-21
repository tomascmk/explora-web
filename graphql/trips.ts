import { gql } from '@apollo/client/core'

export const TRIP_BY_SHARE_CODE = gql`
  query TripByShareCode($shareCode: String!) {
    tripByShareCode(shareCode: $shareCode) {
      id
      title
      description
      startDate
      endDate
      isPublic
      shareCode
      createdAt
      user {
        id
        fullName
        username
      }
      tripPosts {
        id
        order
        createdAt
        post {
          id
          content
          location
          signature
          latitude
          longitude
          city
          country
          author {
            id
            fullName
            username
          }
          createdAt
        }
      }
    }
  }
`

// ── Types ──

export interface TripPostData {
  id: string
  order: number
  createdAt: string
  post: {
    id: string
    content: string
    location?: string
    signature?: string
    latitude?: number
    longitude?: number
    city?: string
    country?: string
    author: {
      id: string
      fullName: string
      username: string
    }
    createdAt: string
  }
}

export interface TripData {
  id: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  isPublic: boolean
  shareCode: string
  createdAt: string
  user: {
    id: string
    fullName: string
    username: string
  }
  tripPosts: TripPostData[]
}

export interface TripByShareCodeResult {
  tripByShareCode: TripData
}

export interface TripByShareCodeVars {
  shareCode: string
}
