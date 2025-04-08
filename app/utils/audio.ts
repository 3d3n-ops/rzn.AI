// Type definitions for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

// Speech-to-text using Web Speech API
export async function speechToText(audioBlob: Blob, language: string = 'en-US'): Promise<string> {
  // Instead of trying to use the audio blob directly, we'll use the Web Speech API
  // to transcribe the audio from the microphone
  return new Promise((resolve, reject) => {
    try {
      // Check if speech recognition is supported
      if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
        reject(new Error('Speech recognition is not supported in this browser'));
        return;
      }

      // Create a recognition instance
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      let hasResult = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        hasResult = true;
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        if (!hasResult) {
          reject(new Error('No speech detected. Please try speaking again.'));
        }
      };

      // Start recognition
      recognition.start();

      // Set a timeout to stop recognition if no result is received
      setTimeout(() => {
        if (!hasResult) {
          recognition.stop();
        }
      }, 10000); // 10 second timeout
    } catch (error) {
      reject(new Error(`Speech recognition not supported: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

// Text-to-speech using Web Speech API
export function textToSpeech(text: string, options: {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
} = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;
      if (options.language) utterance.lang = options.language;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => 
        reject(new Error(`Speech synthesis error: ${event.error}`));
      
      // Get available voices and select a voice
      const voices = speechSynthesis.getVoices();
      
      if (options.voice) {
        // Find the specified voice
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        // Default to an English voice if available
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      reject(new Error(`Speech synthesis not supported: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

// Get available voices
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
      };
    }
  });
}

// Initialize voices for text-to-speech
export function initializeVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (speechSynthesis.getVoices().length > 0) {
      resolve();
    } else {
      speechSynthesis.onvoiceschanged = () => resolve();
    }
  });
}

// Check if speech recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
}

// Check if speech synthesis is supported
export function isSpeechSynthesisSupported(): boolean {
  return !!window.speechSynthesis;
} 