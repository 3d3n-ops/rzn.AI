// Text-to-speech using Deepgram TTS API via backend
export async function textToSpeech(
  text: string, 
  options: {
    format?: string;
  } = {}
): Promise<Response> {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  
  try {
    console.log(`Calling TTS API with text length: ${text.length}`);
    
    const response = await fetch(`${API_URL}/text_to_speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        response_format: options.format || 'mp3'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TTS API error:', errorData);
      throw new Error(errorData.detail || 'Failed to convert text to speech');
    }

    return response;
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
}

// Play audio from a response
export function playAudio(audioResponse: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a blob from the response
      audioResponse.blob().then(blob => {
        // Create an audio element
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        
        // Set up event listeners
        audio.onended = () => {
          URL.revokeObjectURL(audio.src);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audio.src);
          reject(new Error(`Audio playback error: ${error}`));
        };
        
        // Play the audio
        audio.play().catch(error => {
          URL.revokeObjectURL(audio.src);
          reject(new Error(`Failed to play audio: ${error}`));
        });
      }).catch(error => {
        reject(new Error(`Failed to create blob: ${error}`));
      });
    } catch (error) {
      reject(new Error(`Audio playback error: ${error}`));
    }
  });
}

// Stream text with TTS using Deepgram
export async function streamTextWithTTS(
  text: string,
  onChunk: (chunk: string) => void,
  options: {
    voice?: string;
    format?: string;
    delayBetweenChunks?: number;
  } = {}
): Promise<void> {
  try {
    console.log(`Starting TTS streaming for ${text.length} chars of text`);
    const delayBetweenChunks = options.delayBetweenChunks || 50;
    
    // Split by sentences for more natural speech chunking
    // Look for sentence endings (., !, ?), followed by a space or end of text
    const sentenceRegex = /[.!?]+(?:\s+|$)/g;
    let lastIndex = 0;
    const sentences = [];
    let match;
    
    // Find all sentence boundaries
    while ((match = sentenceRegex.exec(text)) !== null) {
      if (lastIndex < match.index) {
        sentences.push(text.substring(lastIndex, match.index + match[0].length));
        lastIndex = match.index + match[0].length;
      }
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      sentences.push(text.substring(lastIndex));
    }
    
    // If no sentences were found (no punctuation), split by commas or just use the whole text
    if (sentences.length === 0) {
      const commaRegex = /,(?:\s+|$)/g;
      lastIndex = 0;
      
      while ((match = commaRegex.exec(text)) !== null) {
        if (lastIndex < match.index) {
          sentences.push(text.substring(lastIndex, match.index + match[0].length));
          lastIndex = match.index + match[0].length;
        }
      }
      
      if (lastIndex < text.length) {
        sentences.push(text.substring(lastIndex));
      }
      
      // If still no chunks, just use the whole text
      if (sentences.length === 0) {
        sentences.push(text);
      }
    }
    
    console.log(`Processing ${sentences.length} sentence chunks for TTS`);
    let displayedText = '';
    
    // Process each sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      console.log(`Processing sentence ${i+1}/${sentences.length}: "${sentence.substring(0, 30)}${sentence.length > 30 ? '...' : ''}"`);
      
      try {
        // Update the displayed text
        displayedText += sentence;
        onChunk(displayedText);
        
        // Convert to speech
        const audioResponse = await textToSpeech(sentence, {
          format: options.format
        });
        
        // Play the audio
        await playAudio(audioResponse);
        
        // Short delay between sentences
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
        }
      } catch (error) {
        console.error(`Error processing sentence ${i+1}:`, error);
        // Continue with next sentence even if this one fails
        // We still update the UI even if audio fails
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
        }
      }
    }
    
    console.log('TTS streaming completed successfully');
  } catch (error) {
    console.error('TTS streaming error:', error);
    throw error;
  }
} 