'use server'

export async function transcribeAudio(audioData: string) {
  try {
    const response = await fetch('https://ryzn-ai-server.onrender.com/api/transcribe-recording', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        audio_data: audioData,
        language_code: 'en-US',
        audio_format: 'wav',
        sample_rate: 16000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to transcribe audio: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
} 