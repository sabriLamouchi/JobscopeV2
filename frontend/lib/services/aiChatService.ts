import { ChatResponse, Job, SearchHistory } from "@/lib/types";

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:5001";

export const aiChatService = {
  // Send a message to the AI service
  async sendMessage(
    message: string,
    jobs: Job[] = [],
    searchHistory: SearchHistory[] = [],
    conversationId?: string
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          jobs,
          search_history: searchHistory,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      return await response.json();
    } catch (error) {
      return {
        status: "error",
        conversation_id: conversationId || "unknown",
        message: "",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "An error occurred",
        code: "CHAT_ERROR",
      };
    }
  },

  // Get conversation history
  async getConversation(conversationId: string) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/conversation/${conversationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId: string) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/conversation/${conversationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Check if AI service is available
  async checkHealth() {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
