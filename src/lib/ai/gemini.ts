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
    console.log('Calling Gemini API with prompt length:', prompt.length);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));

    // Use direct fetch call to Gemini API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Response text length:', text.length);

    return text;

    // Fallback mock response if needed
    /*
    const mockResponse = `
{
  "RecommendedFields": [
    {
      "CardPreview": {
        "FieldName": "数字产品管理",
        "FieldSummary": "跨职能协作，设计与落地数字产品",
        "FieldTags": [
          "Cross-functional",
          "Agile",
          "Product Strategy"
        ]
      },
      "CardDetail": {
        "FieldOverview": "数字产品管理是一个快速发展的领域，专注于数字产品的全生命周期管理，从概念到上市。产品经理需要与设计师、工程师、市场团队等多个部门协作，确保产品满足用户需求并实现商业目标。",
        "SuitableForYouIf": [
          "你具备良好的沟通和协调能力",
          "你对用户体验和市场趋势敏感",
          "你有技术背景或对技术产品感兴趣",
          "你善于数据分析和决策制定"
        ],
        "TypicalTasksAndChallenges": [
          "制定产品路线图和优先级",
          "收集和分析用户反馈",
          "协调跨部门团队合作",
          "平衡用户需求与技术可行性",
          "应对快速变化的市场环境",
          "管理产品发布和迭代周期"
        ],
        "FieldTags": [
          "Product Management",
          "User Experience",
          "Data Analysis",
          "Agile Development",
          "Market Research",
          "Strategic Planning"
        ]
      }
    },
    {
      "CardPreview": {
        "FieldName": "用户体验设计",
        "FieldSummary": "以用户为中心，创造直观易用的数字体验",
        "FieldTags": [
          "User-Centered",
          "Design Thinking",
          "Prototyping"
        ]
      },
      "CardDetail": {
        "FieldOverview": "用户体验设计专注于创造有意义且相关的用户体验。UX设计师通过研究用户行为、设计信息架构、创建原型等方式，确保数字产品既美观又实用。",
        "SuitableForYouIf": [
          "你对用户心理和行为感兴趣",
          "你具备创意思维和设计敏感度",
          "你善于观察和分析问题",
          "你喜欢通过设计解决实际问题"
        ],
        "TypicalTasksAndChallenges": [
          "进行用户研究和可用性测试",
          "创建用户旅程图和信息架构",
          "设计线框图和交互原型",
          "与开发团队协作实现设计",
          "平衡美观性与功能性",
          "适应不同设备和平台的设计需求"
        ],
        "FieldTags": [
          "User Research",
          "Information Architecture",
          "Interaction Design",
          "Usability Testing",
          "Design Systems",
          "Accessibility"
        ]
      }
    },
    {
      "CardPreview": {
        "FieldName": "技术产品经理",
        "FieldSummary": "结合技术深度与产品视野，推动技术产品创新",
        "FieldTags": [
          "Technical",
          "Innovation",
          "API Management"
        ]
      },
      "CardDetail": {
        "FieldOverview": "技术产品经理专注于技术驱动的产品，需要深入理解技术架构、API设计、数据流等技术细节，同时具备产品思维，能够将技术能力转化为用户价值。",
        "SuitableForYouIf": [
          "你有扎实的技术背景",
          "你能够理解复杂的技术架构",
          "你善于将技术概念转化为商业价值",
          "你对新兴技术趋势敏感"
        ],
        "TypicalTasksAndChallenges": [
          "定义技术产品的功能规格",
          "与工程团队深度协作",
          "评估技术方案的可行性",
          "管理API和平台产品",
          "平衡技术债务与新功能开发",
          "向非技术团队解释技术概念"
        ],
        "FieldTags": [
          "Technical Architecture",
          "API Design",
          "Platform Management",
          "Developer Experience",
          "Technical Documentation",
          "System Integration"
        ]
      }
    },
    {
      "CardPreview": {
        "FieldName": "数据产品经理",
        "FieldSummary": "利用数据驱动决策，构建智能化产品体验",
        "FieldTags": [
          "Data-Driven",
          "Analytics",
          "Machine Learning"
        ]
      },
      "CardDetail": {
        "FieldOverview": "数据产品经理专注于数据驱动的产品开发，通过分析用户行为数据、市场数据等信息，指导产品决策和优化。需要具备数据分析能力和对机器学习等技术的理解。",
        "SuitableForYouIf": [
          "你具备强大的数据分析能力",
          "你对统计学和机器学习有一定了解",
          "你善于从数据中发现洞察",
          "你能够将数据结果转化为产品策略"
        ],
        "TypicalTasksAndChallenges": [
          "设计和分析产品指标体系",
          "进行A/B测试和实验设计",
          "与数据科学团队协作",
          "构建数据驱动的产品功能",
          "处理数据质量和隐私问题",
          "向团队传达数据洞察"
        ],
        "FieldTags": [
          "Data Analysis",
          "A/B Testing",
          "Business Intelligence",
          "Predictive Analytics",
          "Data Visualization",
          "Statistical Modeling"
        ]
      }
    }
  ]
}`;

    */
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(`Failed to generate content with Gemini AI: ${error}`);
  }
}
