import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the Gemini Flash model
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Configuration for generation
export const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

// Safety settings
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper function to generate content with Gemini
export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    console.log('🤖 [GEMINI] Starting Gemini API call');
    console.log('🤖 [GEMINI] Prompt length:', prompt.length);
    console.log('🤖 [GEMINI] API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('🤖 [GEMINI] API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    console.log('🤖 [GEMINI] Prompt preview:', prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''));

    // Check for network connectivity issues
    console.log('🌐 [GEMINI] Testing network connectivity...');

    // Use direct fetch call to Gemini API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ [GEMINI] Request timeout after 60 seconds');
      controller.abort();
    }, 60000); // 60 second timeout

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    console.log('🤖 [GEMINI] Making request to Gemini API');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY || '',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('🤖 [GEMINI] Response received:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GEMINI] HTTP error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 1000) + (errorText.length > 1000 ? '...' : '')
      });
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ [GEMINI] Response processed successfully, text length:', text.length);

    if (!text) {
      console.error('❌ [GEMINI] No text content in response');
      throw new Error('No text content in Gemini response');
    }

    return text;

  } catch (error) {
    console.error('❌ [GEMINI] Error generating content:', error);
    console.error('❌ [GEMINI] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ [GEMINI] Error message:', error instanceof Error ? error.message : String(error));
    console.error('❌ [GEMINI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Detailed error analysis
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        console.error('🌐 [GEMINI] Network connectivity issue detected');
        console.error('💡 [GEMINI] Possible causes: DNS resolution failure, firewall, or proxy blocking');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('🚫 [GEMINI] Connection refused - service may be blocked');
      } else if (error.message.includes('timeout') || error.name === 'AbortError') {
        console.error('⏰ [GEMINI] Request timeout - slow network or service unavailable');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.error('🔑 [GEMINI] Authentication error - check API key');
      }
    }

    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ [GEMINI] Request was aborted (timeout)');
      throw new Error('Gemini API request timed out after 60 seconds');
    }

    throw new Error(`Failed to generate content with Gemini AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}
