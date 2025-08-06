import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { DYNAMIC_DIRECTIONS_GENERATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-dynamic-directions - Request received');

  try {
    const requestData = await request.json();
    const { userGoal, selectedIndustry } = requestData;

    console.log('📋 [API] Request parameters:', {
      userGoal: userGoal?.substring(0, 100) + '...',
      selectedIndustry
    });

    // Log the complete user input to console
    consoleLog.userInput('生成动态方向API', `目标: ${userGoal}, 行业: ${selectedIndustry}`, []);

    if (!userGoal || !selectedIndustry) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'User goal and selected industry are required' },
        { status: 400 }
      );
    }

    // 构建AI提示词
    const prompt = DYNAMIC_DIRECTIONS_GENERATION_PROMPT
      .replace('{userGoal}', userGoal)
      .replace('{selectedIndustry}', selectedIndustry);

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);

    // Log the complete AI request to console
    consoleLog.aiRequest('生成动态方向API', prompt, '个性化方向生成', {
      用户目标: userGoal,
      选择行业: selectedIndustry
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
      consoleLog.aiResponse('生成动态方向API', response, parsedResponse, responseTime);

      console.log('✅ [API] AI response parsed successfully:', {
        hasDirections: !!parsedResponse.个性化方向分类,
        directionsCount: parsedResponse.个性化方向分类?.length || 0,
        directionTitles: parsedResponse.个性化方向分类?.map((d: { 方向标题: string }) => d.方向标题) || []
      });

    } catch (error) {
      console.error('❌ [API] AI generation or parsing failed:', error);
      
      // Fallback to default directions if AI fails
      console.log('🔄 [API] Using fallback default directions');
      parsedResponse = {
        个性化方向分类: [
          {
            方向ID: "direction-1",
            方向标题: "核心匹配经验",
            方向副标题: "与目标岗位高度匹配的核心经验",
            方向描述: "添加与您的职业目标直接相关的核心经验和技能",
            默认展开: true,
            对齐程度: "high"
          },
          {
            方向ID: "direction-2",
            方向标题: "发展潜力经验",
            方向副标题: "展现学习能力和成长潜力的经验",
            方向描述: "添加能够展现您学习能力、适应性和发展潜力的经验",
            默认展开: false,
            对齐程度: "medium"
          },
          {
            方向ID: "direction-3",
            方向标题: "基础技能经验",
            方向副标题: "支撑职业发展的基础技能和经验",
            方向描述: "添加为职业发展提供基础支撑的技能和经验",
            默认展开: false,
            对齐程度: "low"
          }
        ]
      };
    }

    console.log('🎉 [API] Successfully prepared response');
    console.log('🎉 [API] Response data:', {
      hasDirections: !!parsedResponse.个性化方向分类,
      directionsCount: parsedResponse.个性化方向分类?.length || 0,
      firstDirectionTitle: parsedResponse.个性化方向分类?.[0]?.方向标题 || 'N/A'
    });

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('❌ [API] Critical error in generate-dynamic-directions API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { error: 'Failed to generate dynamic directions. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
