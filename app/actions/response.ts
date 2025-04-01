'use server'

import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "https://ryzn-ai-server.onrender.com";

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL environment variable is not set");
}

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

type ContentContext = {
  transcript?: string;
  notes?: string;
  summary?: string;
};

const cache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
// Rate limit duration: 24 hours
const RATE_LIMIT_DURATION = 24 * 60 * 60 * 1000;

function generateCacheKey(content: ContentContext | string, query: string): string {
  const contentString = typeof content === 'string' 
    ? content.slice(0, 100) 
    : JSON.stringify(content).slice(0, 100);
  return `${contentString}_${query}`;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (now - entry.timestamp > RATE_LIMIT_DURATION) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function getResponse(
  content: ContentContext | string,
  message: string
) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    // Check rate limit
    if (!checkRateLimit(ip)) {
      throw new Error(`Rate limit exceeded. Limited to ${RATE_LIMIT} requests per day.`);
    }

    // Format the request body
    const requestBody = {
      content: typeof content === 'string' ? content : (content || {}),
      user_query: message,
    };

    // Generate cache key
    const cacheKey = generateCacheKey(requestBody.content, requestBody.user_query);

    // Check cache
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
      return cachedResponse.data;
    }

    // Ensure BACKEND_URL is properly formatted
    const apiUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const endpoint = `${apiUrl}/api/response`;

    console.log("Sending request to:", endpoint);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    // Send request to backend
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch (e) {
        errorDetails = await response.text();
      }
      throw new Error(`Backend responded with status ${response.status}. Details: ${errorDetails}`);
    }

    const data = await response.json();
    console.log("Response data:", data);

    // Cache the successful response
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error: any) {
    console.error("Error in getResponse:", error);
    throw error;
  }
} 