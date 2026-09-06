import { gql } from '@apollo/client';

export const GET_MY_COUPONS = gql`
  query GetMyCoupons {
    myCoupons {
      id
      code
      type
      value
      currency
      minPurchase
      maxDiscount
      usageLimit
      usageCount
      startDate
      endDate
      active
      userGroups
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CreateCouponInput!) {
    createCoupon(input: $input) {
      id
      code
      type
      value
      active
    }
  }
`;

export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: ID!, $input: UpdateCouponInput!) {
    updateCoupon(id: $id, input: $input) {
      id
      code
      active
    }
  }
`;

export const DEACTIVATE_COUPON = gql`
  mutation DeactivateCoupon($id: ID!) {
    deactivateCoupon(id: $id) {
      id
      active
    }
  }
`;

export const VALIDATE_COUPON = gql`
  query ValidateCoupon($input: ValidateCouponInput!) {
    validateCoupon(input: $input) {
      valid
      discountAmount
      finalAmount
      message
    }
  }
`;
