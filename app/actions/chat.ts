'use server'

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000; // 10 seconds

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function sendMessage(message: string, conversation_id: string, user_id: string) {
  return retryWithBackoff(async () => {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/send_message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation_id,
            user_id,
          }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      throw new Error("Failed to send message: Unknown error");
    }
  }, MAX_RETRIES);
}

export async function createAssistant(topic: string, difficulty_level: string, user_id: string) {
  return retryWithBackoff(async () => {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/create_assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic,
            difficulty_level,
            user_id,
          }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create assistant: ${error.message}`);
      }
      throw new Error("Failed to create assistant: Unknown error");
    }
  }, MAX_RETRIES);
}

export async function getUserConversations(user_id: string) {
  return retryWithBackoff(async () => {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/conversations/${user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get conversations: ${error.message}`);
      }
      throw new Error("Failed to get conversations: Unknown error");
    }
  }, MAX_RETRIES);
}

export async function deleteConversation(conversation_id: string, user_id: string) {
  return retryWithBackoff(async () => {
    try {
      const response = await fetchWithTimeout(
        `${API_URL}/conversation/${conversation_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id }),
        },
        TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
      throw new Error("Failed to delete conversation: Unknown error");
    }
  }, MAX_RETRIES);
} 