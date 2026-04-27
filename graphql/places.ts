import { gql } from '@apollo/client/core'

/**
 * Autocomplete de places para el selector de stops en el tour builder.
 * Reusa el resolver `searchPlaces` del backend (ILIKE sobre name/city,
 * min 2 chars, ordenado por rate DESC). Ver
 * explora-api/src/modules/places/places.resolver.ts para detalles.
 */
export const SEARCH_PLACES = gql`
  query SearchPlacesForTourBuilder($query: String!, $limit: Int) {
    searchPlaces(query: $query, limit: $limit) {
      id
      name
      description
      rate
      address {
        id
        city
        country
        latitude
        longitude
      }
      categories {
        id
        nameEn
        nameEs
      }
      media {
        id
        url
        type
      }
    }
  }
`

/**
 * Places cercanos al centro del mapa del tour builder. Sin `media` para
 * aligerar el payload — la card grande solo se renderiza cuando el guía
 * selecciona el place y es ahí donde reusamos `SEARCH_PLACES`.
 */
export const PLACES_IN_RADIUS_FOR_TOUR_BUILDER = gql`
  query PlacesInRadiusForTourBuilder($input: PlaceInRadiusInput!) {
    getPlacesInRadius(placeInRadiusInput: $input) {
      id
      name
      rate
      address {
        id
        city
        country
        latitude
        longitude
      }
      categories {
        id
        nameEn
        nameEs
      }
    }
  }
`
