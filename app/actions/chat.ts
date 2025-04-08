'use server'

import { APIError, Conversation } from './types';

const API_URL = process.env.BACKEND_URL || "http://localhost:8000";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000; // 10 seconds

// Helper function to handle API errors
function handleAPIError(error: unknown): never {
  if (error instanceof APIError) {
    throw error;
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response: { data?: { detail?: string }, status: number } };
    throw new APIError(
      apiError.response.data?.detail || 'An error occurred',
      apiError.response.status,
      'API_ERROR'
    );
  }
  
  throw new APIError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  );
}

// Helper function to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timed out', 408, 'TIMEOUT');
    }
    throw error;
  }
}

// Helper function to retry failed requests with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx) except for rate limits (429)
      if (error instanceof APIError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Get current user ID (replace with actual auth logic)
async function getCurrentUserId(): Promise<string> {
  throw new Error('User is not authenticated');
}

// Send a message to the assistant
export async function sendMessage(content: string, conversationId: string, userId: string) {
  console.log('Sending message:', { content, conversationId, userId });
  
  try {
    const response = await fetchWithTimeout(`${API_URL}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        conversation_id: conversationId,
        user_id: userId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend error:', errorData);
      
      // Check for Groq-specific errors
      if (errorData.detail && errorData.detail.includes('Groq API')) {
        throw new APIError(
          `Groq API error: ${errorData.detail}`,
          response.status,
          'GROQ_API_ERROR'
        );
      }
      
      throw new APIError(
        errorData.detail || 'Failed to send message',
        response.status,
        'SEND_MESSAGE_ERROR'
      );
    }

    const data = await response.json();
    console.log('Backend response:', data);
    return {
      response: data.response,
      conversationId: data.conversation_id,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error sending message:', error);
    if (error instanceof APIError) {
    throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to send message',
      500,
      'SEND_MESSAGE_ERROR'
    );
  }
}

// Create a new assistant
export async function createAssistant(
  topic: string,
  difficultyLevel: string = 'beginner',
  userId?: string
): Promise<{ conversationId: string; topic: string }> {
  if (!userId) {
    throw new APIError('User is not authenticated', 401, 'UNAUTHORIZED');
  }
  
  try {
    const response = await retryWithBackoff(() =>
      fetchWithTimeout(`${API_URL}/create_assistant`, {
        method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
          difficulty_level: difficultyLevel,
          user_id: userId,
      }),
      })
    );

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail || 'Failed to create assistant',
        response.status,
        'CREATE_ASSISTANT_ERROR'
      );
    }
    
    const data = await response.json();
    // Convert snake_case to camelCase
    return {
      conversationId: data.conversation_id,
      topic: data.topic
    };
  } catch (error) {
    handleAPIError(error);
  }
}

// Get user's conversations
export async function getUserConversations(
  userId?: string
): Promise<Conversation[]> {
  if (!userId) {
    throw new APIError('User is not authenticated', 401, 'UNAUTHORIZED');
  }
  
  try {
    const response = await retryWithBackoff(() =>
      fetchWithTimeout(`${API_URL}/conversations/${userId}`)
    );

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail || 'Failed to get conversations',
        response.status,
        'GET_CONVERSATIONS_ERROR'
      );
    }

    return await response.json();
  } catch (error) {
    handleAPIError(error);
  }
}

// Delete a conversation
export async function deleteConversation(
  conversationId: string,
  userId?: string
): Promise<void> {
  if (!userId) {
    throw new APIError('User is not authenticated', 401, 'UNAUTHORIZED');
  }
  
  try {
    const response = await retryWithBackoff(() =>
      fetchWithTimeout(`${API_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
      },
        body: JSON.stringify({ user_id: userId }),
      })
    );

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.detail || 'Failed to delete conversation',
        response.status,
        'DELETE_CONVERSATION_ERROR'
      );
    }
  } catch (error) {
    handleAPIError(error);
  }
}

// Transcribe audio to text
export async function transcribeAudio(
  formData: FormData
): Promise<{ text: string }> {
  try {
    // Validate audio file
    const audioFile = formData.get('file') as File;
    if (!audioFile) {
      throw new APIError('No audio file provided', 400, 'INVALID_REQUEST');
    }
    
    if (!audioFile.type.startsWith('audio/')) {
      throw new APIError('Invalid file type. Only audio files are supported.', 400, 'INVALID_FILE_TYPE');
    }
    
    const response = await retryWithBackoff(() =>
      fetchWithTimeout(`${API_URL}/transcribe_audio`, {
        method: 'POST',
        body: formData,
      })
    );

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error cases
      if (response.status === 429) {
        throw new APIError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
      } else if (response.status === 503) {
        throw new APIError('Connection error with Deepgram API. Please try again later.', 503, 'API_CONNECTION_ERROR');
      } else if (response.status === 500 && error.detail?.includes('Deepgram API key')) {
        throw new APIError('Deepgram API key not configured. Please contact support.', 500, 'API_CONFIG_ERROR');
      }
      
      throw new APIError(
        error.detail || 'Failed to transcribe audio',
        response.status,
        'TRANSCRIBE_AUDIO_ERROR'
      );
    }

    return await response.json();
  } catch (error) {
    handleAPIError(error);
  }
}

// Stream text with TTS
export async function streamTextWithTTS(
  text: string,
  onChunk: (chunk: string) => void,
  options: {
    voice?: string;
    format?: string;
    chunkSize?: number;
    delayBetweenChunks?: number;
  } = {}
): Promise<void> {
  try {
    const {
      voice = 'alloy',
      format = 'mp3',
      chunkSize = 100,
      delayBetweenChunks = 50
    } = options;

    // Process text into natural language chunks (by sentences or punctuation)
    const textChunks = text
      .replace(/([.!?])\s+/g, "$1|")
      .split("|")
      .filter(chunk => chunk.trim().length > 0);
    
    console.log(`Processing ${textChunks.length} chunks for TTS`);
    
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`Processing chunk ${i+1}/${textChunks.length}: "${chunk.substring(0, 30)}${chunk.length > 30 ? '...' : ''}"`);
      
      try {
        // Send chunk to backend for TTS
        const response = await fetchWithTimeout(`${API_URL}/text_to_speech`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: chunk,
            voice,
            response_format: format,
          }),
          timeout: 10000, // 10 second timeout for TTS generation
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('TTS API error:', errorData);
          throw new APIError(
            errorData.detail || 'Failed to convert text to speech',
            response.status,
            'TTS_ERROR'
          );
        }

        // Play audio chunk
        await playAudio(response);
        
        // Update UI with text chunk
        onChunk(chunk);
        
        // Add delay between chunks if not the last chunk
        if (i < textChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
        }
      } catch (error) {
        console.error(`Error processing chunk ${i+1}:`, error);
        // Continue with next chunk instead of failing entirely
        onChunk(chunk); // Still show the text even if audio failed
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }
    }
  } catch (error) {
    console.error('Error in streamTextWithTTS:', error);
    if (error instanceof APIError) {
    throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to process TTS',
      500,
      'TTS_PROCESSING_ERROR'
    );
  }
}

// Play audio from response
async function playAudio(response: Response): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      await audio.play();
    } catch (error) {
      reject(error);
    }
  });
}

// Check backend health
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${API_URL}/health`, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
} 