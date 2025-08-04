import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { consoleLog } from '@/lib/logger';
import { CareerProfileAnalysisRequest, CareerProfileAnalysisResponse } from '@/types/career-profile';

// 职业画像分析提示词
const CAREER_PROFILE_ANALYSIS_PROMPT = `
你是一位专业的职业发展顾问和心理测评专家。请基于用户提供的职业目标、行业选择和经验卡片组合，生成完整的职业画像分析报告。

用户信息：
- 职业目标：{userGoal}
- 目标行业：{selectedIndustry}
- 选择的经验卡片组合：{selectedCards}
{combinationContext}

请严格按照以下JSON格式输出分析结果，所有文本使用第二人称（"你"）：

\`\`\`json
{
  "radarData": {
    "interestOrientation": 75,
    "selfEfficacy": 82,
    "goalOrientation": 88,
    "outcomeExpectation": 70,
    "cognitiveAgility": 85,
    "affectiveReadiness": 78,
    "interpersonalReadiness": 80,
    "professionalAwareness": 72
  },
  "quadrantData": {
    "externalDriven": 65,
    "internalDriven": 75,
    "structuredAnalytical": 80,
    "expressiveInterpersonal": 70
  },
  "abilityPoints": [
    {
      "id": "analytical-thinking",
      "name": "Analytical Thinking",
      "x": -60,
      "y": 40,
      "description": "You demonstrate strong analytical capabilities through systematic problem-solving approaches in your project management experience.",
      "evidence": "Derived from project coordination and strategic planning activities"
    },
    {
      "id": "team-collaboration",
      "name": "Team Collaboration", 
      "x": 50,
      "y": 30,
      "description": "Your cross-functional team leadership shows excellent interpersonal and collaborative skills.",
      "evidence": "Supported by workshop facilitation and team coordination experiences"
    }
  ],
  "selfCognitionSummary": "You demonstrate a balanced profile with strong goal orientation and cognitive agility. Your analytical mindset is complemented by solid interpersonal skills, positioning you well for leadership roles that require both strategic thinking and team coordination.",
  "competenceStructure": {
    "objectiveAbilities": {
      "displayType": "table",
      "abilities": [
        {
          "name": "Project Execution",
          "evidence": "Derived from [Project Coordination Card] and uploaded resume section.",
          "confidenceLevel": "high"
        },
        {
          "name": "Cross-team Communication", 
          "evidence": "Supported by [Workshop Facilitation Card].",
          "confidenceLevel": "high"
        },
        {
          "name": "Strategic Planning",
          "evidence": "Evidenced through goal-setting and outcome tracking in multiple experiences.",
          "confidenceLevel": "medium"
        }
      ]
    },
    "subjectiveAbilities": {
      "displayType": "text_blocks",
      "selfStatements": [
        {
          "label": "Quick Learning",
          "userInput": "You consistently adapt to new environments and acquire new skills rapidly.",
          "insight": "This adaptability is a key strength for transitioning into your target industry."
        },
        {
          "label": "Abstract Thinking",
          "userInput": "You excel at connecting concepts and seeing patterns across different domains.",
          "insight": "This cognitive flexibility will serve you well in complex problem-solving scenarios."
        }
      ]
    },
    "developmentPotential": {
      "skills": [
        {
          "name": "Data Analysis Tools",
          "currentStatus": "Beginner level with basic Excel skills",
          "suggestion": "Consider taking online courses in SQL, Python, or Tableau to enhance your analytical toolkit.",
          "priority": "high"
        },
        {
          "name": "Technical Communication",
          "currentStatus": "Strong verbal communication, developing written technical skills",
          "suggestion": "Practice creating technical documentation and presenting complex ideas to non-technical audiences.",
          "priority": "medium"
        },
        {
          "name": "Industry-Specific Knowledge",
          "currentStatus": "General business understanding, limited industry depth",
          "suggestion": "Engage with industry publications, attend webinars, and connect with professionals in your target field.",
          "priority": "high"
        }
      ]
    },
    "structureSummary": {
      "evaluationText": "You show strong execution ability backed by solid team experience and analytical thinking. Your combination of interpersonal skills and strategic mindset creates a foundation for leadership roles. Expanding your technical tool fluency and industry-specific knowledge will help you unlock broader opportunities in data-enhanced environments and position you as a well-rounded professional in your target industry."
    }
  },
  "analysisMetadata": {
    "confidenceScore": 85,
    "keyStrengths": ["Goal-oriented execution", "Team collaboration", "Analytical thinking"],
    "developmentAreas": ["Technical skills", "Industry knowledge", "Data literacy"]
  }
}
\`\`\`

分析要求：
1. 雷达图8个维度的分数应基于卡片内容的具体证据，范围0-100
2. 象限图4个维度反映用户的工作风格和能力倾向
3. 能力点应具体且有证据支撑，坐标范围-100到100
4. 客观能力必须有明确的证据来源
5. 主观能力要结合用户自述和AI洞察
6. 发展建议要具体可行，与目标行业相关
7. 所有评价使用第二人称，积极正面但客观准确
8. 置信度分数要反映分析的可靠程度
`;

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/analyze-career-profile - Request received');

  try {
    const requestData: CareerProfileAnalysisRequest = await request.json();
    const { userGoal, selectedIndustry, selectedCards, combinationContext } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry,
      cardsCount: selectedCards?.length || 0,
      hasCombinationContext: !!combinationContext
    });

    // 验证必需参数
    if (!userGoal || !selectedIndustry || !selectedCards || selectedCards.length === 0) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json({
        success: false,
        error: 'User goal, selected industry, and selected cards are required'
      } as CareerProfileAnalysisResponse, { status: 400 });
    }

    // 格式化卡片信息
    const formattedCards = selectedCards.map((card, index) => 
      `卡片${index + 1}: ${card.experienceName}
      - 类别: ${card.category}
      - 时间地点: ${card.cardDetail.timeAndLocation}
      - 背景情境: ${card.cardDetail.backgroundContext}
      - 角色任务: ${card.cardDetail.myRoleAndTasks}
      - 任务细节: ${card.cardDetail.taskDetails}
      - 反思结果: ${card.cardDetail.reflectionAndResults}
      - 亮点总结: ${card.cardDetail.highlightSentence}`
    ).join('\n\n');

    // 格式化组合上下文
    const formattedCombinationContext = combinationContext 
      ? `\n组合背景：
      - 组合名称: ${combinationContext.combinationName}
      - 组合描述: ${combinationContext.combinationDescription}
      - 选择理由: ${combinationContext.whyThisCombination}`
      : '';

    // 构建完整提示词
    const prompt = CAREER_PROFILE_ANALYSIS_PROMPT
      .replace('{userGoal}', userGoal)
      .replace('{selectedIndustry}', selectedIndustry)
      .replace('{selectedCards}', formattedCards)
      .replace('{combinationContext}', formattedCombinationContext);

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);

    // 记录完整的AI请求
    consoleLog.aiRequest('职业画像分析API', prompt, '职业画像生成', {
      用户目标: userGoal,
      目标行业: selectedIndustry,
      卡片数量: selectedCards.length,
      有组合上下文: !!combinationContext
    });

    // 调用Gemini API
    const aiStartTime = Date.now();
    const response = await generateWithGemini(prompt);
    const aiEndTime = Date.now();
    const responseTime = aiEndTime - aiStartTime;

    console.log('📥 [API] Raw AI response received:', {
      responseLength: response.length,
      responseTime: `${responseTime}ms`
    });

    // 解析JSON响应
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    console.log('🔄 [API] JSON extraction result:', {
      foundJsonBlock: !!jsonMatch,
      jsonStringLength: jsonString.length
    });

    const parsedResponse = JSON.parse(jsonString);

    // 添加元数据
    parsedResponse.analysisMetadata = {
      ...parsedResponse.analysisMetadata,
      basedOnCards: selectedCards.map(card => card.id),
      userGoal,
      selectedIndustry,
      analysisTimestamp: Date.now()
    };

    // 记录完整的AI响应
    consoleLog.aiResponse('职业画像分析API', response, parsedResponse, responseTime);

    console.log('✅ [API] Career profile analysis completed successfully');

    const apiResponse: CareerProfileAnalysisResponse = {
      success: true,
      data: parsedResponse,
      processingTime: responseTime
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('❌ [API] Critical error in analyze-career-profile API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorResponse: CareerProfileAnalysisResponse = {
      success: false,
      error: 'Failed to analyze career profile. Please check your input and try again.'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
