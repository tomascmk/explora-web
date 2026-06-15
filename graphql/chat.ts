import { gql } from '@apollo/client'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export interface ConversationSummary {
  id: string
  otherUserId: string
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCount: number
}

export const MY_CONVERSATIONS = gql`
  query MyConversations {
    myConversations {
      id
      otherUserId
      lastMessageAt
      lastMessagePreview
      unreadCount
    }
  }
`

export const MY_UNREAD_CHAT_COUNT = gql`
  query MyUnreadChatCount {
    myUnreadChatCount
  }
`

export const CONVERSATION_MESSAGES = gql`
  query ConversationMessages($conversationId: String!, $limit: Int, $offset: Int) {
    conversationMessages(
      conversationId: $conversationId
      limit: $limit
      offset: $offset
    ) {
      id
      conversationId
      senderId
      body
      createdAt
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      senderId
      body
      createdAt
    }
  }
`

export const MARK_CONVERSATION_READ = gql`
  mutation MarkConversationRead($conversationId: String!) {
    markConversationRead(conversationId: $conversationId)
  }
`
