import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    console.log("Received request to /api/summarize");
    console.log("Backend URL:", BACKEND_URL);

    // Check if the request contains form data or JSON
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    let requestBody;
    let headers = {};

    if (contentType.includes("multipart/form-data")) {
      // Handle form data (file uploads)
      const formData = await request.formData();
      console.log(
        "Received form data with fields:",
        Array.from(formData.keys())
      );

      // Create a new FormData instance to ensure proper transfer
      requestBody = new FormData();

      // Get the file and output type
      const file = formData.get("file") as File;
      const outputType = formData.get("output_type");

      if (!file) {
        throw new Error("No file provided");
      }

      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Append the file and output type to the new FormData
      requestBody.append("file", file);
      if (outputType) {
        requestBody.append("output_type", outputType as string);
      }
    } else {
      // Handle JSON data
      requestBody = await request.json();
      console.log("Received JSON data:", requestBody);
      headers = {
        "Content-Type": "application/json",
      };
    }

    // Forward the request to the FastAPI backend
    console.log("Sending request to backend...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // Increased timeout to 5 min. Can improve speed on backend.

      console.log("Making request to:", `${BACKEND_URL}/api/summarize`);
      const response = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: "POST",
        headers,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = "";
        try {
          const errorBody = await response.text();
          errorDetails = errorBody;
          console.error("Backend error response:", errorDetails);
        } catch (e) {
          errorDetails = "Could not read error response";
          console.error("Could not read error response:", e);
        }

        throw new Error(
          `Backend responded with status ${response.status}. Details: ${errorDetails}`
        );
      }

      const data = await response.json();
      console.log("Received successful response from backend:", data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error("Request error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
        cause: error.cause,
      });
      throw error;
    }
  } catch (error: any) {
    console.error("Error in /api/summarize:", {
      error: error.message,
      name: error.name,
      code: error.code,
      cause: error.cause,
    });

    // Check for specific error types
    if (
      error.name === "AbortError" ||
      error.code === "UND_ERR_HEADERS_TIMEOUT"
    ) {
      return NextResponse.json(
        {
          error:
            "Request timed out. The file might be too large or the server is taking too long to process.",
          details: {
            message: error.message,
            code: error.code,
            name: error.name,
          },
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: {
          message: error.message,
          code: error.code,
          name: error.name,
        },
      },
      { status: 500 }
    );
  }
}
