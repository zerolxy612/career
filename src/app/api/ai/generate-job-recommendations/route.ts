import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { JOB_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { JobRecommendationRequest, JobRecommendationResponse } from '@/types/job';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-job-recommendations - Request received');

  try {
    const requestData: JobRecommendationRequest = await request.json();
    const { userGoal, selectedIndustry, careerProfileData, selectedCards } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry,
      hasCareerProfileData: !!careerProfileData,
      cardsCount: selectedCards?.length || 0
    });

    // Log the complete user input to console
    consoleLog.userInput('生成工作推荐API', `目标: ${userGoal}, 行业: ${selectedIndustry}`, []);

    // 验证必需参数
    if (!userGoal || !selectedIndustry || !careerProfileData || !selectedCards || selectedCards.length === 0) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json({
        success: false,
        error: 'User goal, selected industry, career profile data, and selected cards are required'
      } as JobRecommendationResponse, { status: 400 });
    }

    // 格式化职业画像数据
    const formattedCareerProfile = JSON.stringify({
      radarData: careerProfileData.analysisResults?.radarData,
      quadrantData: careerProfileData.analysisResults?.quadrantData,
      competenceStructure: {
        objectiveAbilities: careerProfileData.analysisResults?.competenceStructure?.objectiveAbilities,
        subjectiveAbilities: careerProfileData.analysisResults?.competenceStructure?.subjectiveAbilities,
        developmentPotential: careerProfileData.analysisResults?.competenceStructure?.developmentPotential
      },
      metadata: careerProfileData.metadata
    }, null, 2);

    // 格式化卡片信息
    const formattedCards = selectedCards.map((card, index) => 
      `卡片${index + 1}: ${card.experienceName}
      - 类别: ${card.category}
      - 时间地点: ${card.cardDetail.timeAndLocation}
      - 背景情境: ${card.cardDetail.backgroundContext}
      - 角色任务: ${card.cardDetail.myRoleAndTasks}
      - 亮点总结: ${card.cardDetail.highlightSentence}`
    ).join('\n\n');

    // 构建完整提示词
    const prompt = JOB_RECOMMENDATION_PROMPT
      .replace('{userGoal}', userGoal)
      .replace('{selectedIndustry}', selectedIndustry)
      .replace('{careerProfileData}', formattedCareerProfile)
      .replace('{selectedCards}', formattedCards);

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);
    console.log('📤 [API] Prompt preview:', prompt.substring(0, 500) + '...');

    // Log the complete AI request to console
    consoleLog.aiRequest('生成工作推荐API', prompt, '工作推荐生成', {
      用户目标: userGoal,
      选择行业: selectedIndustry,
      卡片数量: selectedCards.length,
      有职业画像: !!careerProfileData
    });

    // 调用Gemini API
    const aiStartTime = Date.now();
    const response = await generateWithGemini(prompt);
    const aiEndTime = Date.now();
    const responseTime = aiEndTime - aiStartTime;

    console.log('📥 [API] Raw AI response received');
    console.log('📥 [API] Response length:', response.length);
    console.log('📥 [API] Response time:', responseTime + 'ms');

    // 解析JSON响应
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;

    console.log('🔄 [API] JSON extraction result:', {
      foundJsonBlock: !!jsonMatch,
      jsonStringLength: jsonString.length,
      jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
    });

    const parsedResponse = JSON.parse(jsonString);

    // Log the complete AI response to console
    consoleLog.aiResponse('生成工作推荐API', response, parsedResponse, responseTime);

    // 验证响应结构
    if (!parsedResponse.directions || !Array.isArray(parsedResponse.directions)) {
      console.error('❌ [API] Invalid response structure - missing directions');
      throw new Error('Invalid AI response structure');
    }

    console.log('✅ [API] AI response validation passed');
    console.log('✅ [API] Job directions data:', {
      directionsCount: parsedResponse.directions.length,
      firstDirection: parsedResponse.directions[0]?.target_position || 'N/A'
    });

    const apiResponse: JobRecommendationResponse = {
      success: true,
      data: parsedResponse,
      processingTime: responseTime
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('❌ [API] Request processing failed:', error);
    console.error('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to generate job recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    } as JobRecommendationResponse, { status: 500 });
  }
}
