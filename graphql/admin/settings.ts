import { gql } from '@apollo/client'

// Tour Categories
export const ADMIN_GET_TOUR_CATEGORIES = gql`
  query GetTourCategories {
    findAllTourCategories {
      id
      name
    }
  }
`

export const ADMIN_CREATE_TOUR_CATEGORY = gql`
  mutation CreateTourCategory($input: CreateTourCategoryInput!) {
    createTourCategory(input: $input) {
      id
      name
    }
  }
`

export const ADMIN_UPDATE_TOUR_CATEGORY = gql`
  mutation UpdateTourCategory($input: UpdateTourCategoryInput!) {
    updateTourCategory(input: $input) {
      id
      name
    }
  }
`

export const ADMIN_REMOVE_TOUR_CATEGORY = gql`
  mutation RemoveTourCategory($id: String!) {
    removeTourCategory(id: $id) {
      success
      message
    }
  }
`

// Languages
export const ADMIN_GET_LANGUAGES = gql`
  query GetLanguages {
    findAllLanguages {
      id
      name
    }
  }
`

export const ADMIN_CREATE_LANGUAGE = gql`
  mutation CreateLanguage($createLanguageDto: CreateLanguageDto!) {
    createLanguage(createLanguageDto: $createLanguageDto) {
      id
      name
    }
  }
`

export const ADMIN_REMOVE_LANGUAGE = gql`
  mutation RemoveLanguage($id: String!) {
    removeLanguage(id: $id) {
      success
      message
    }
  }
`

export interface TourCategory {
  id: string
  name: string
}

export interface TourCategoriesData {
  findAllTourCategories: TourCategory[]
}

export interface Language {
  id: string
  name: string
}

export interface LanguagesData {
  findAllLanguages: Language[]
}
