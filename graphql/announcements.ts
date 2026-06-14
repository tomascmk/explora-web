import { gql } from '@apollo/client';

export type AnnouncementType = 'INFO' | 'WARNING' | 'PROMOTION';
export type AnnouncementAudience = 'ALL' | 'GUIDES' | 'TOURISTS';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  targetAudience: AnnouncementAudience;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveAnnouncementsData {
  activeAnnouncements: Announcement[];
}

/**
 * Anuncios activos para el usuario autenticado. El backend filtra por audiencia
 * (ALL / GUIDES / TOURISTS) a partir del rol del JWT, así que no recibe
 * variables: desde la web de guías solo llegan los de audiencia ALL o GUIDES.
 * Ver PLAN-035.
 */
export const ACTIVE_ANNOUNCEMENTS = gql`
  query ActiveAnnouncements {
    activeAnnouncements {
      id
      title
      message
      type
      targetAudience
      isActive
      expiresAt
      createdAt
      updatedAt
    }
  }
`;
