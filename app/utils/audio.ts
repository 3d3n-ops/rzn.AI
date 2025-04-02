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
export async function speechToText(audioBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    // Convert blob to audio URL
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      reject(new Error('Audio playback failed'));
    };

    recognition.start();
    audio.play();
  });
}

// Text-to-speech using Web Speech API
export function textToSpeech(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => resolve();
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => 
      reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Get available voices and select an English voice
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    speechSynthesis.speak(utterance);
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