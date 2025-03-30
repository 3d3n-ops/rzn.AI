'use server'

export async function summarizeContent(file: File, outputType: string = 'summary') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_type', outputType);

    const response = await fetch('https://ryzn-ai-server.onrender.com/api/summarize', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Failed to summarize content: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw error;
  }
} 