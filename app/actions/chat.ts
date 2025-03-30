'use server'

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function sendMessage(message: string, conversation_id: string, user_id: string) {
  try {
    const response = await fetch(`${API_URL}/send_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversation_id,
        user_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get response from backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
}

export async function createAssistant(topic: string, difficulty_level: string, user_id: string) {
  try {
    const response = await fetch(`${API_URL}/create_assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        difficulty_level,
        user_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create assistant");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createAssistant:", error);
    throw error;
  }
}

export async function getUserConversations(user_id: string) {
  try {
    const response = await fetch(`${API_URL}/conversations/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to get conversations");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    throw error;
  }
}

export async function deleteConversation(conversation_id: string, user_id: string) {
  try {
    const response = await fetch(`${API_URL}/conversation/${conversation_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to delete conversation");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    throw error;
  }
} 