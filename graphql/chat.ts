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
  otherUserName: string | null
  lastMessageAt: string | null
  lastMessagePreview: string | null
  unreadCount: number
}

export const MY_CONVERSATIONS = gql`
  query MyConversations {
    myConversations {
      id
      otherUserId
      otherUserName
      lastMessageAt
      lastMessagePreview
      unreadCount
    }
  }
`

export const CONVERSATION = gql`
  query Conversation($conversationId: String!) {
    conversation(conversationId: $conversationId) {
      id
      otherUserId
      otherUserName
    }
  }
`

export const GET_OR_CREATE_CONVERSATION = gql`
  mutation GetOrCreateConversation($otherUserId: String!) {
    getOrCreateConversation(otherUserId: $otherUserId) {
      id
      touristUserId
      guideUserId
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
