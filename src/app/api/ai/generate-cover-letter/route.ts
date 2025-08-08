import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { COVER_LETTER_GENERATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';

export interface CoverLetterRequest {
  targetPosition: string;
  userGoal: string;
  experienceCards: Array<{
    id: string;
    experienceName: string;
    cardDetail: {
      experienceName: string;
      timeAndLocation: string;
      backgroundContext: string;
      myRoleAndTasks: string;
      taskDetails: string;
      reflectionAndResults: string;
      highlightSentence: string;
    };
  }>;
}

export interface CoverLetterSentence {
  sentence: string;
  source: string[];
  type: 'introduction' | 'experience' | 'skills' | 'conclusion';
}

export interface CoverLetterResponse {
  success: boolean;
  data?: {
    cover_letter: {
      sentences: CoverLetterSentence[];
      metadata: {
        target_position: string;
        generated_at: string;
        word_count: number;
      };
    };
  };
  error?: string;
  processingTime?: number;
}

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-cover-letter - Request received');

  try {
    const requestData: CoverLetterRequest = await request.json();
    const { targetPosition, userGoal, experienceCards } = requestData;

    console.log('📋 [API] Request parameters:', {
      targetPosition,
      userGoal: userGoal?.substring(0, 100) + '...',
      experienceCardsCount: experienceCards?.length || 0
    });

    // Log the complete user input to console
    consoleLog.userInput('生成求职信API', `目标岗位: ${targetPosition}, 目标: ${userGoal}`, experienceCards);

    if (!targetPosition || !userGoal || !experienceCards || experienceCards.length === 0) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'Target position, user goal, and experience cards are required' },
        { status: 400 }
      );
    }

    // Format experience cards for AI prompt
    const formattedCards = experienceCards.map(card => ({
      卡片名称: card.experienceName,
      时间地点: card.cardDetail.timeAndLocation,
      背景情况: card.cardDetail.backgroundContext,
      我的角色和任务: card.cardDetail.myRoleAndTasks,
      任务详情: card.cardDetail.taskDetails,
      反思和结果: card.cardDetail.reflectionAndResults,
      亮点句子: card.cardDetail.highlightSentence
    }));

    // Prepare the prompt
    const prompt = COVER_LETTER_GENERATION_PROMPT
      .replace('{targetPosition}', targetPosition)
      .replace('{userGoal}', userGoal)
      .replace('{experienceCards}', JSON.stringify(formattedCards, null, 2));

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);

    // Log the complete AI request to console
    consoleLog.aiRequest('生成求职信API', prompt, '求职信生成', {
      目标岗位: targetPosition,
      用户目标: userGoal,
      经验卡片数量: experienceCards.length
    });

    // Generate response with Gemini
    const aiStartTime = Date.now();
    const response = await generateWithGemini(prompt);
    const aiEndTime = Date.now();
    const responseTime = aiEndTime - aiStartTime;

    console.log('📥 [API] Received response from Gemini AI');
    console.log('📥 [API] Response length:', response.length);

    // Try to parse JSON response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = jsonMatch ? jsonMatch[1] : response;

    console.log('🔄 [API] JSON extraction result:', {
      foundJsonBlock: !!jsonMatch,
      jsonStringLength: jsonString.length
    });

    // Clean JSON string
    jsonString = jsonString
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const parsedResponse = JSON.parse(jsonString);

    // Log the complete AI response to console
    consoleLog.aiResponse('生成求职信API', response, parsedResponse, responseTime);

    console.log('✅ [API] Successfully generated cover letter');

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      processingTime: responseTime
    });

  } catch (error) {
    console.error('❌ [API] Critical error in generate-cover-letter API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate cover letter. Please check your input and try again.' 
      },
      { status: 500 }
    );
  }
}
