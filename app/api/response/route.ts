import { NextResponse } from "next/server";
import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_CHAT_RESPONSE;
const RATE_LIMIT = 30; // requests per day

// Simple in-memory cache
type CacheEntry = {
  data: any;
  timestamp: number;
};

type RateLimitEntry = {
  count: number;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
// Rate limit duration: 24 hours
const RATE_LIMIT_DURATION = 24 * 60 * 60 * 1000;

// Clean up old cache entries every hour
const cleanup = () => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
  // Clean up old rate limit entries
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.timestamp > RATE_LIMIT_DURATION) {
      rateLimitMap.delete(key);
    }
  }
};

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CACHE_DURATION);
}

function generateCacheKey(text: string, query: string): string {
  // Create a cache key from the text and query
  return `${text.slice(0, 100)}_${query}`;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Check if the entry is expired
  if (now - entry.timestamp > RATE_LIMIT_DURATION) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  // Check if rate limit is exceeded
  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  // Increment the counter
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    console.log("Received request to /api/response");
    console.log("Backend URL:", BACKEND_URL);

    // Get client IP for rate limiting
    const headersList = headers();
    const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again tomorrow.",
          details: `Limited to ${RATE_LIMIT} requests per day.`,
        },
        { status: 429 }
      );
    }

    // Check if the request contains form data or JSON
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    let requestBody;
    const requestHeaders = {
      "Content-Type": "application/json",
    };

    // Parse the incoming request
    const incomingData = await request.json();
    console.log("Received data:", incomingData);

    // Format the request body according to ChatRequest model
    requestBody = {
      text: incomingData.text || "", // The context text from the uploaded file
      user_query: incomingData.message, // The user's question
    };

    // Generate cache key
    const cacheKey = generateCacheKey(requestBody.text, requestBody.user_query);

    // Check cache
    const cachedResponse = cache.get(cacheKey);
    if (
      cachedResponse &&
      Date.now() - cachedResponse.timestamp < CACHE_DURATION
    ) {
      console.log("Cache hit! Returning cached response");
      return NextResponse.json(cachedResponse.data);
    }

    console.log("Cache miss. Sending request to backend...");
    const response = await fetch(`${BACKEND_URL}/api/response`, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch (e) {
        errorDetails = await response.text();
      }
      console.error("Backend error response:", errorDetails);
      throw new Error(
        `Backend responded with status ${response.status}. Details: ${errorDetails}`
      );
    }

    const data = await response.json();
    console.log("Received response from backend:", data);

    // Cache the successful response
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/response:", error);

    // Check for specific error types
    if (
      error.name === "TimeoutError" ||
      error.code === "UND_ERR_HEADERS_TIMEOUT"
    ) {
      return NextResponse.json(
        {
          error:
            "Request timed out. Please check if the backend server is running and accessible.",
          details: error.message,
        },
        { status: 504 }
      );
    }

    // Handle validation errors
    if (error.message.includes("422")) {
      return NextResponse.json(
        {
          error:
            "Invalid request format. Please ensure both text and message are provided.",
          details: error.message,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
