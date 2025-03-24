import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { message, conversation_id, user_id } = await req.json();

    // Send message to Python backend
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
      throw new Error(
        errorData.detail || "Failed to get response from backend"
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An error occurred" },
      { status: 500 }
    );
  }
}

// Create a new learning assistant session
export async function PUT(req: Request) {
  try {
    const { topic, difficulty_level, user_id } = await req.json();

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create assistant" },
      { status: 500 }
    );
  }
}

// Get user conversations
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to get conversations" },
      { status: 500 }
    );
  }
}

// Delete conversation
export async function DELETE(req: Request) {
  try {
    const { conversation_id, user_id } = await req.json();

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
