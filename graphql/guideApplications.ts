import { gql } from '@apollo/client'

/** PLAN-071 §2C — Solicitud para convertirse en guía. */

export interface GuideApplication {
  id: string
  motivation: string
  city: string
  country: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNote: string | null
  createdAt: string
  languages: { id: string; name: string }[] | null
}

export const MY_GUIDE_APPLICATION = gql`
  query MyGuideApplication {
    myGuideApplication {
      id
      motivation
      city
      country
      status
      reviewNote
      createdAt
      languages {
        id
        name
      }
    }
  }
`

export const REQUEST_GUIDE_ACCESS = gql`
  mutation RequestGuideAccess($input: RequestGuideAccessInput!) {
    requestGuideAccess(input: $input) {
      id
      status
      city
      country
    }
  }
`

export const GET_LANGUAGES = gql`
  query GuideApplicationLanguages {
    findAllLanguages {
      id
      name
    }
  }
`
