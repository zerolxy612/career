import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { DYNAMIC_COMBINATION_RECOMMENDATION_PROMPT, AUTO_COMBINATION_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-combination-recommendations - Request received');

  try {
    const requestData = await request.json();
    const { userGoal, selectedIndustry, availableCards, optionType, dynamicDirections } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry,
      availableCardsCount: availableCards?.length || 0,
      optionType,
      hasDynamicDirections: !!dynamicDirections
    });

    // Log the complete user input to console
    consoleLog.userInput('生成组合推荐API', `目标: ${userGoal}, 行业: ${selectedIndustry}, 选项: ${optionType}`, []);

    if (!userGoal || !selectedIndustry || !optionType) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'User goal, selected industry, and option type are required' },
        { status: 400 }
      );
    }

    if (!availableCards || !Array.isArray(availableCards) || availableCards.length === 0) {
      console.error('❌ [API] No available cards provided');
      return NextResponse.json(
        { error: 'Available cards are required for generating recommendations' },
        { status: 400 }
      );
    }

    // 格式化可用卡片信息，只提取关键信息给AI
    const formattedCards = availableCards.map((card, index) => ({
      序号: index + 1,
      卡片名称: card.cardPreview?.experienceName || `Card ${index + 1}`,
      时间地点: card.cardPreview?.timeAndLocation || 'Not specified',
      概述: card.cardPreview?.oneSentenceSummary || 'No summary',
      分类: card.category || 'Unknown',
      来源类型: card.source?.type || 'unknown'
    }));

    console.log('🔄 [API] Formatted cards for AI:', {
      totalCards: formattedCards.length,
      cardsByCategory: {
        'Focus Match': formattedCards.filter(c => c.分类 === 'Focus Match').length,
        'Growth Potential': formattedCards.filter(c => c.分类 === 'Growth Potential').length,
        'Foundation Skills': formattedCards.filter(c => c.分类 === 'Foundation Skills').length
      }
    });

    // 构建AI提示词 - 优先使用动态方向提示词
    let prompt;
    if (dynamicDirections && Array.isArray(dynamicDirections) && dynamicDirections.length === 3) {
      console.log('🎯 [API] Using dynamic directions prompt');
      prompt = DYNAMIC_COMBINATION_RECOMMENDATION_PROMPT
        .replace('{userGoal}', userGoal)
        .replace('{selectedIndustry}', selectedIndustry)
        .replace('{availableCards}', JSON.stringify(formattedCards, null, 2))
        .replace(/{optionType}/g, optionType)
        .replace('{dynamicDirections}', JSON.stringify(dynamicDirections, null, 2))
        .replace('{direction1Title}', dynamicDirections[0]?.方向标题 || 'Direction 1')
        .replace('{direction2Title}', dynamicDirections[1]?.方向标题 || 'Direction 2')
        .replace('{direction3Title}', dynamicDirections[2]?.方向标题 || 'Direction 3');
    } else {
      console.log('⚠️ [API] Using fallback auto combination prompt');
      prompt = AUTO_COMBINATION_RECOMMENDATION_PROMPT
        .replace('{userGoal}', userGoal)
        .replace('{selectedIndustry}', selectedIndustry)
        .replace('{availableCards}', JSON.stringify(formattedCards, null, 2))
        .replace(/{optionType}/g, optionType);
    }

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);
    console.log('📤 [API] Prompt preview:', prompt.substring(0, 500) + '...');

    // Log the complete AI request to console
    consoleLog.aiRequest('生成组合推荐API', prompt, '组合推荐生成', {
      用户目标: userGoal,
      选择行业: selectedIndustry,
      推荐类型: optionType,
      可用卡片数量: availableCards.length
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
        jsonStringLength: jsonString.length,
        jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
      });

      parsedResponse = JSON.parse(jsonString);

      // Log the complete AI response to console
      consoleLog.aiResponse('生成组合推荐API', response, parsedResponse, responseTime);

      // 验证响应结构
      if (!parsedResponse.推荐组合) {
        console.error('❌ [API] Invalid response structure - missing 推荐组合');
        throw new Error('Invalid AI response structure');
      }

      console.log('✅ [API] AI response validation passed');
      console.log('✅ [API] Recommendation data:', {
        storyTheme: parsedResponse.推荐组合.故事主题,
        narrativeLogic: parsedResponse.推荐组合.叙述逻辑,
        selectedCardsCount: parsedResponse.推荐组合.选择的卡片?.length || 0,
        storyHighlightsCount: parsedResponse.推荐组合.故事亮点?.length || 0
      });

    } catch (error) {
      console.error('❌ [API] AI generation or parsing failed:', error);
      console.error('❌ [API] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    console.log('🎉 [API] Successfully prepared recommendation response');
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('❌ [API] Request processing failed:', error);
    console.error('❌ [API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to generate combination recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
