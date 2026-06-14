import { gql } from '@apollo/client';

export interface DiscountGroupInput {
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  startDate: string;
  endDate: string;
  tourIds: string[];
  isActive: boolean;
  discountPercentage?: number;
  discountAmount?: number;
}

export const DISCOUNT_GROUPS_BY_GUIDE = gql`
  query DiscountGroupsByGuide($guideId: String!) {
    discountGroupsByGuide(guideId: $guideId) {
      id
      name
      description
      discountType
      discountPercentage
      discountAmount
      startDate
      endDate
      isActive
      tours {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_DISCOUNT_GROUP = gql`
  mutation CreateDiscountGroup($input: CreateDiscountGroupDto!) {
    createDiscountGroup(input: $input) {
      id
      name
      description
      discountType
      discountPercentage
      discountAmount
      startDate
      endDate
      isActive
      tours {
        id
        title
      }
    }
  }
`;

export const UPDATE_DISCOUNT_GROUP = gql`
  mutation UpdateDiscountGroup($id: String!, $input: UpdateDiscountGroupDto!) {
    updateDiscountGroup(id: $id, input: $input) {
      id
      name
      description
      discountType
      discountPercentage
      discountAmount
      startDate
      endDate
      isActive
      tours {
        id
        title
      }
    }
  }
`;

export const DELETE_DISCOUNT_GROUP = gql`
  mutation DeleteDiscountGroup($id: String!) {
    deleteDiscountGroup(id: $id) {
      success
      message
    }
  }
`;
