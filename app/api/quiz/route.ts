import { NextRequest, NextResponse } from "next/server";

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export async function POST(request: NextRequest) {
  console.log("Quiz API route called");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes`);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_QUIZ;
    console.log(`Forwarding to backend: ${backendUrl}`);

    if (!backendUrl) {
      console.error("Backend API URL is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file, file.name);

    const contentType = request.headers.get("content-type");
    console.log(`Original content type: ${contentType}`);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: backendFormData,
    });

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      return NextResponse.json(
        { error: "Failed to generate quiz" },
        { status: response.status }
      );
    }

    const quiz = await response.json();
    console.log("Quiz generated successfully");
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error in quiz API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
