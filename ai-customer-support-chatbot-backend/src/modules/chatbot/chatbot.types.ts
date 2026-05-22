import { ConversationStatus, SenderType } from "../../generated";

export interface CreateConversationInput {
  customerId?: string;
}

export interface CreateMessageInput {
  conversationId: string;
  senderType: SenderType;
  senderId?: string | null;
  content: string;
}

export interface ConversationResponse {
  id: string;
  customerId: string | null;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDetailsResponse extends ConversationResponse {
  _count: {
    messages: number;
  };
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: Date;
}
