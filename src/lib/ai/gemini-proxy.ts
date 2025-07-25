import { GoogleGenerativeAI } from '@google/generative-ai';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Proxy configuration - set these if you have a proxy
const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';

// Initialize Gemini AI with proxy support
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to generate content with Gemini using proxy
export async function generateWithGeminiProxy(prompt: string): Promise<string> {
  try {
    console.log('🤖 [GEMINI-PROXY] Starting Gemini API call with proxy support');
    console.log('🤖 [GEMINI-PROXY] Proxy URL:', PROXY_URL ? PROXY_URL.substring(0, 20) + '...' : 'No proxy configured');
    console.log('🤖 [GEMINI-PROXY] Prompt length:', prompt.length);

    // Create fetch with proxy support
    const fetchWithProxy = async (url: string, options: any) => {
      if (PROXY_URL) {
        const agent = new HttpsProxyAgent(PROXY_URL);
        options.agent = agent;
      }
      
      // Use node-fetch or built-in fetch
      const fetch = (await import('node-fetch')).default;
      return fetch(url, options);
    };

    // Direct API call with proxy support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ [GEMINI-PROXY] Request timeout after 60 seconds');
      controller.abort();
    }, 60000);

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

    console.log('🤖 [GEMINI-PROXY] Making request to Gemini API...');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const requestOptions: any = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
      timeout: 60000
    };

    // Add proxy agent if configured
    if (PROXY_URL) {
      const { HttpsProxyAgent } = await import('https-proxy-agent');
      requestOptions.agent = new HttpsProxyAgent(PROXY_URL);
    }

    const response = await fetchWithProxy(apiUrl, requestOptions);
    clearTimeout(timeoutId);

    console.log('🤖 [GEMINI-PROXY] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GEMINI-PROXY] HTTP error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 1000)
      });
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('🤖 [GEMINI-PROXY] Response data structure:', {
      hasCandidates: !!data.candidates,
      candidatesCount: data.candidates?.length || 0
    });

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🤖 [GEMINI-PROXY] Extracted text length:', text.length);

    if (!text) {
      console.error('❌ [GEMINI-PROXY] No text content in response:', data);
      throw new Error('No text content in Gemini response');
    }

    console.log('✅ [GEMINI-PROXY] Successfully generated content');
    return text;

  } catch (error) {
    console.error('❌ [GEMINI-PROXY] Error generating content:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ [GEMINI-PROXY] Request was aborted (timeout)');
      throw new Error('Gemini API request timed out after 60 seconds');
    }

    throw new Error(`Failed to generate content with Gemini AI: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Alternative: Use a different AI service or mock for testing
export async function generateWithFallback(prompt: string): Promise<string> {
  console.log('🔄 [FALLBACK] Using fallback AI generation');
  
  // This is a simple mock response for testing when Gemini is not available
  const mockResponse = {
    "RecommendedFields": [
      {
        "CardPreview": {
          "FieldName": "Digital Product Management",
          "FieldSummary": "Lead cross-functional teams to design, build, and grow digital products.",
          "FieldTags": ["Cross-functional", "Product Thinking", "User Insight"]
        },
        "CardDetail": {
          "FieldOverview": "数字产品管理是一个快速发展的领域，专注于数字产品的全生命周期管理。",
          "SuitableForYouIf": [
            "你具备良好的沟通和协调能力",
            "你对用户体验和市场趋势敏感",
            "你有技术背景或对技术产品感兴趣"
          ],
          "TypicalTasksAndChallenges": [
            "制定产品路线图和优先级",
            "收集和分析用户反馈",
            "协调跨部门团队合作",
            "平衡用户需求与技术可行性"
          ],
          "FieldTags": ["产品策略", "用户研究", "数据分析", "团队协作"]
        }
      }
    ]
  };

  return JSON.stringify(mockResponse);
}
