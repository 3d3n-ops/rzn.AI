'use server'

export async function summarizeContent(file: File, outputType: string = 'summary') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_type', outputType);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout

    const response = await fetch('https://ryzn-ai-server.onrender.com/api/summarize', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      if (response.status === 504) {
        throw new Error('Request timed out. The file might be too large or complex. Please try a smaller file or split it into parts.');
      }
      
      if (response.status === 503) {
        throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
      }
      
      if (response.status === 413) {
        throw new Error('File size exceeds the maximum limit. Please upload a smaller file.');
      }
      
      throw new Error(`Failed to summarize content: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error summarizing content:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The file might be too large or complex. Please try a smaller file or split it into parts.');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
    }
    
    throw error;
  }
} 