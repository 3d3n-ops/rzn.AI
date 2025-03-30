'use server'

import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;
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

function generateCacheKey(text: string, query: string): string {
  return `${text.slice(0, 100)}_${query}`;
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

export async function getResponse(text: string, message: string) {
  try {
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();

    // Check rate limit
    if (!checkRateLimit(ip)) {
      throw new Error(`Rate limit exceeded. Limited to ${RATE_LIMIT} requests per day.`);
    }

    // Format the request body
    const requestBody = {
      text: text || "",
      user_query: message,
    };

    // Generate cache key
    const cacheKey = generateCacheKey(requestBody.text, requestBody.user_query);

    // Check cache
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
      return cachedResponse.data;
    }

    // Send request to backend
    const response = await fetch(`${BACKEND_URL}/api/response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      throw new Error(`Backend responded with status ${response.status}. Details: ${errorDetails}`);
    }

    const data = await response.json();

    // Cache the successful response
    cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error: any) {
    console.error("Error in getResponse:", error);
    throw error;
  }
} 