import { gql } from '@apollo/client';

export const GET_GUIDE_ANALYTICS = gql`
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
`;
