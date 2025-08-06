import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { SMART_CARD_CLASSIFICATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/classify-cards - Request received');

  try {
    const requestData = await request.json();
    const { userGoal, selectedIndustry, dynamicDirections, experienceCards } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry,
      directionsCount: dynamicDirections?.length || 0,
      cardsCount: experienceCards?.length || 0
    });

    // Log the complete user input to console
    consoleLog.userInput('智能卡片分类API', `目标: ${userGoal}, 行业: ${selectedIndustry}`, []);

    if (!userGoal || !selectedIndustry || !dynamicDirections || !experienceCards) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'User goal, selected industry, dynamic directions, and experience cards are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(dynamicDirections) || dynamicDirections.length !== 3) {
      console.error('❌ [API] Invalid dynamic directions format');
      return NextResponse.json(
        { error: 'Dynamic directions must be an array of 3 directions' },
        { status: 400 }
      );
    }

    if (!Array.isArray(experienceCards) || experienceCards.length === 0) {
      console.error('❌ [API] No experience cards provided');
      return NextResponse.json(
        { error: 'At least one experience card is required for classification' },
        { status: 400 }
      );
    }

    // 格式化方向信息供AI理解
    const formattedDirections = dynamicDirections.map((dir, index) => ({
      方向ID: dir.方向ID || `direction-${index + 1}`,
      方向标题: dir.方向标题 || `Direction ${index + 1}`,
      方向副标题: dir.方向副标题 || '',
      方向描述: dir.方向描述 || '',
      对齐程度: dir.对齐程度 || 'medium'
    }));

    // 格式化卡片信息供AI分析
    const formattedCards = experienceCards.map((card, index) => ({
      序号: index + 1,
      卡片名称: card.cardPreview?.experienceName || card.小卡展示?.经历名称 || `Card ${index + 1}`,
      时间地点: card.cardPreview?.timeAndLocation || card.小卡展示?.时间与地点 || 'Not specified',
      概述: card.cardPreview?.oneSentenceSummary || card.小卡展示?.一句话概述 || 'No summary',
      背景情境: card.cardDetail?.backgroundContext || card.详情卡展示?.背景与情境说明 || '',
      角色任务: card.cardDetail?.myRoleAndTasks || card.详情卡展示?.我的角色与任务 || '',
      任务细节: card.cardDetail?.taskDetails || card.详情卡展示?.任务细节描述 || '',
      反思结果: card.cardDetail?.reflectionAndResults || card.详情卡展示?.反思与结果总结 || '',
      高光总结: card.cardDetail?.highlightSentence || card.详情卡展示?.高光总结句 || ''
    }));

    console.log('🔄 [API] Formatted data for AI:', {
      directionsCount: formattedDirections.length,
      cardsCount: formattedCards.length,
      directionTitles: formattedDirections.map(d => d.方向标题),
      cardNames: formattedCards.map(c => c.卡片名称)
    });

    // 构建AI提示词
    const prompt = SMART_CARD_CLASSIFICATION_PROMPT
      .replace('{userGoal}', userGoal)
      .replace('{selectedIndustry}', selectedIndustry)
      .replace('{dynamicDirections}', JSON.stringify(formattedDirections, null, 2))
      .replace('{experienceCards}', JSON.stringify(formattedCards, null, 2));

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);

    // Log the complete AI request to console
    consoleLog.aiRequest('智能卡片分类API', prompt, '卡片智能分类', {
      用户目标: userGoal,
      选择行业: selectedIndustry,
      方向数量: formattedDirections.length,
      卡片数量: formattedCards.length
    });

    // Generate response with Gemini
    let parsedResponse;
    try {
      const aiStartTime = Date.now();
      const response = await generateWithGemini(prompt);
      const aiEndTime = Date.now();
      const responseTime = aiEndTime - aiStartTime;

      console.log('📥 [API] Raw AI response received:', {
        responseLength: response.length,
        responseTime: `${responseTime}ms`
      });

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
      consoleLog.aiResponse('智能卡片分类API', response, parsedResponse, responseTime);

      console.log('✅ [API] AI response parsed successfully:', {
        hasClassificationResults: !!parsedResponse.卡片分类结果,
        classificationsCount: parsedResponse.卡片分类结果?.length || 0,
        classificationSummary: parsedResponse.卡片分类结果?.reduce((acc: Record<string, number>, item: { 分配方向: string }) => {
          acc[item.分配方向] = (acc[item.分配方向] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      });

    } catch (error) {
      console.error('❌ [API] AI generation or parsing failed:', error);
      
      // Fallback to simple round-robin distribution
      console.log('🔄 [API] Using fallback round-robin distribution');
      const fallbackResults = formattedCards.map((card, index) => ({
        卡片名称: card.卡片名称,
        分配方向: `direction-${(index % 3) + 1}`,
        分配理由: `基于轮询分配策略的自动分配（AI分类失败时的降级处理）`
      }));
      
      parsedResponse = {
        卡片分类结果: fallbackResults
      };
    }

    console.log('🎉 [API] Successfully prepared response');
    console.log('🎉 [API] Response data:', {
      hasClassificationResults: !!parsedResponse.卡片分类结果,
      classificationsCount: parsedResponse.卡片分类结果?.length || 0,
      firstClassification: parsedResponse.卡片分类结果?.[0] || 'N/A'
    });

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('❌ [API] Critical error in classify-cards API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { error: 'Failed to classify cards. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
