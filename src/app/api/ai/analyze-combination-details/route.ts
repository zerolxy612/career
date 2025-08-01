import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { DETAILED_COMBINATION_ANALYSIS_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/analyze-combination-details - Request received');

  try {
    const requestData = await request.json();
    const { userGoal, selectedIndustry, optionType, recommendedCards, availableCards } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry,
      optionType,
      recommendedCardsCount: recommendedCards?.length || 0,
      availableCardsCount: availableCards?.length || 0
    });

    // Log the complete user input to console
    consoleLog.userInput('分析组合详情API', `目标: ${userGoal}, 行业: ${selectedIndustry}, 选项: ${optionType}`, []);

    if (!userGoal || !selectedIndustry || !optionType || !recommendedCards) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'User goal, selected industry, option type, and recommended cards are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(recommendedCards) || recommendedCards.length === 0) {
      console.error('❌ [API] No recommended cards provided');
      return NextResponse.json(
        { error: 'Recommended cards are required for generating detailed analysis' },
        { status: 400 }
      );
    }

    // 格式化推荐卡片信息
    const formattedRecommendedCards = recommendedCards.map((card, index) => ({
      序号: index + 1,
      卡片名称: card.卡片名称 || card.cardPreview?.experienceName || `Card ${index + 1}`,
      在故事中的角色: card.在故事中的角色 || card.角色定位 || 'Not specified',
      时间地点: card.cardPreview?.timeAndLocation || 'Not specified',
      概述: card.cardPreview?.oneSentenceSummary || 'No summary'
    }));

    // 格式化可用卡片信息
    const formattedAvailableCards = availableCards?.map((card: {
      cardPreview?: {
        experienceName?: string;
        timeAndLocation?: string;
        oneSentenceSummary?: string;
      };
      category?: string;
    }, index: number) => ({
      序号: index + 1,
      卡片名称: card.cardPreview?.experienceName || `Card ${index + 1}`,
      时间地点: card.cardPreview?.timeAndLocation || 'Not specified',
      概述: card.cardPreview?.oneSentenceSummary || 'No summary',
      分类: card.category || 'Unknown'
    })) || [];

    console.log('🔄 [API] Formatted cards for AI:', {
      recommendedCards: formattedRecommendedCards.length,
      availableCards: formattedAvailableCards.length
    });

    // 构建AI提示词
    const prompt = DETAILED_COMBINATION_ANALYSIS_PROMPT
      .replace('{userGoal}', userGoal)
      .replace('{selectedIndustry}', selectedIndustry)
      .replace('{optionType}', optionType)
      .replace('{recommendedCards}', JSON.stringify(formattedRecommendedCards, null, 2))
      .replace('{availableCards}', JSON.stringify(formattedAvailableCards, null, 2));

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);

    // Log the complete AI request to console
    consoleLog.aiRequest('分析组合详情API', prompt, '详细组合分析', {
      用户目标: userGoal,
      选择行业: selectedIndustry,
      推荐类型: optionType,
      推荐卡片数量: recommendedCards.length
    });

    // Generate response with Gemini
    let parsedResponse;
    try {
      const aiStartTime = Date.now();
      const response = await generateWithGemini(prompt);
      const aiEndTime = Date.now();
      const responseTime = aiEndTime - aiStartTime;

      console.log('📥 [API] Raw AI response received');
      console.log('📥 [API] Response length:', response.length);
      console.log('📥 [API] Response time:', responseTime + 'ms');

      // Try to parse JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      console.log('🔄 [API] JSON extraction result:', {
        foundJsonBlock: !!jsonMatch,
        jsonStringLength: jsonString.length
      });

      parsedResponse = JSON.parse(jsonString);

      // Log the complete AI response to console
      consoleLog.aiResponse('分析组合详情API', response, parsedResponse, responseTime);

      // 验证响应结构
      if (!parsedResponse.推荐路径选项) {
        console.error('❌ [API] Invalid response structure - missing 推荐路径选项');
        throw new Error('Invalid AI response structure');
      }

      console.log('✅ [API] AI response validation passed');
      console.log('✅ [API] Analysis data:', {
        optionName: parsedResponse.推荐路径选项.option名称,
        targetPosition: parsedResponse.推荐路径选项['Why this combination']?.目标岗位,
        cardCombinationCount: parsedResponse.推荐路径选项.卡片组合?.length || 0
      });

    } catch (error) {
      console.error('❌ [API] AI generation or parsing failed:', error);
      throw error;
    }

    console.log('🎉 [API] Successfully prepared detailed analysis response');
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('❌ [API] Request processing failed:', error);
    console.error('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to generate detailed combination analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
