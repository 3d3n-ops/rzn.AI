'use server'

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const POLLING_INTERVAL = 2000; // 2 seconds

async function splitAudioIntoChunks(audioData: string): Promise<string[]> {
  const binaryData = atob(audioData);
  const chunks: string[] = [];
  
  for (let i = 0; i < binaryData.length; i += CHUNK_SIZE) {
    const chunk = binaryData.slice(i, i + CHUNK_SIZE);
    chunks.push(btoa(chunk));
  }
  
  return chunks;
}

async function pollProgress(chunkId: string): Promise<any> {
  const response = await fetch(`https://ryzn-ai-server.onrender.com/api/transcription-progress/${chunkId}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get progress: ${errorText}`);
  }
  
  return response.json();
}

export async function transcribeAudio(file: File) {
  try {
    console.log("Preparing audio transcription request...");
    console.log("File type:", file.type);
    console.log("File size:", file.size);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_type', 'notes');

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    console.log("Sending request to transcription API...");
    // Send the file to the backend
    const response = await fetch('https://ryzn-ai-server.onrender.com/api/transcribe-audio', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log("Response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to transcribe audio: ${errorText}`);
    }

    const data = await response.json();
    console.log("Successfully received transcription data");
    
    return {
      transcript: data.transcript,
      notes: data.notes
    };
    
  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The audio file might be too large. Please try a smaller file.');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('413')) {
        throw new Error('File size exceeds the maximum limit. Please upload a smaller file.');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid file type. Please upload an audio file (MP3, WAV, M4A, etc.).');
      }
    }
    
    throw error;
  }
} 