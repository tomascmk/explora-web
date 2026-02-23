import { gql } from '@apollo/client'

export const ADMIN_GET_ANALYTICS = gql`
  query GetGuideAnalytics($startDate: DateTime, $endDate: DateTime) {
    myGuideAnalytics(startDate: $startDate, endDate: $endDate) {
      totalBookings
      totalRevenue
      averageRating
      conversionRate
      bookingsByPeriod {
        period
        count
        revenue
      }
      revenueByPeriod {
        period
        amount
      }
      topTours {
        tourId
        tourTitle
        bookings
        revenue
      }
      trends {
        bookingGrowth
        revenueGrowth
        ratingTrend
      }
    }
  }
`
