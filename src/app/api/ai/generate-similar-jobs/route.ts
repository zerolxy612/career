import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { SIMILAR_JOBS_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { SimilarJobsRequest, SimilarJobsResponse } from '@/types/job';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-similar-jobs - Request received');

  try {
    const requestData: SimilarJobsRequest = await request.json();
    const { selectedJob, userGoal, selectedCards } = requestData;

    console.log('📋 [API] Request parameters:', {
      selectedJobTitle: selectedJob?.target_position,
      userGoal: userGoal?.substring(0, 100) + '...',
      cardsCount: selectedCards?.length || 0
    });

    // Log the complete user input to console
    consoleLog.userInput('生成相似岗位推荐API', `选中岗位: ${selectedJob?.target_position}, 目标: ${userGoal}`, []);

    // 验证必需参数
    if (!selectedJob || !userGoal || !selectedCards || selectedCards.length === 0) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json({
        success: false,
        error: 'Selected job, user goal, and selected cards are required'
      } as SimilarJobsResponse, { status: 400 });
    }

    // 格式化选中的岗位信息
    const formattedSelectedJob = JSON.stringify({
      target_position: selectedJob.target_position,
      match_level: selectedJob.match_level,
      direction_summary: selectedJob.direction_summary,
      recommendation_reason: selectedJob.recommendation_reason,
      job_requirements: selectedJob.job_requirements,
      direction_tags: selectedJob.direction_tags
    }, null, 2);

    // 格式化卡片信息
    const formattedCards = selectedCards.map((card, index) => 
      `卡片${index + 1}: ${card.experienceName}
      - 类别: ${card.category}
      - 时间地点: ${card.cardDetail.timeAndLocation || 'N/A'}
      - 背景情境: ${card.cardDetail.backgroundContext || 'N/A'}
      - 角色任务: ${card.cardDetail.myRoleAndTasks || 'N/A'}
      - 亮点总结: ${card.cardDetail.highlightSentence || 'N/A'}`
    ).join('\n\n');

    // 构建完整提示词
    const prompt = SIMILAR_JOBS_RECOMMENDATION_PROMPT
      .replace('{selectedJob}', formattedSelectedJob)
      .replace('{userGoal}', userGoal)
      .replace('{selectedCards}', formattedCards);

    console.log('📤 [API] Sending prompt to Gemini AI');
    console.log('📤 [API] Prompt length:', prompt.length);
    console.log('📤 [API] Prompt preview:', prompt.substring(0, 500) + '...');

    // Log the complete AI request to console
    consoleLog.aiRequest('生成相似岗位推荐API', prompt, '相似岗位推荐生成', {
      选中岗位: selectedJob.target_position,
      用户目标: userGoal,
      卡片数量: selectedCards.length
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
    consoleLog.aiResponse('生成相似岗位推荐API', response, parsedResponse, responseTime);

    // 验证响应结构
    if (!parsedResponse.similar_jobs || !Array.isArray(parsedResponse.similar_jobs)) {
      console.error('❌ [API] Invalid response structure - missing similar_jobs');
      throw new Error('Invalid AI response structure');
    }

    console.log('✅ [API] AI response validation passed');
    console.log('✅ [API] Similar jobs data:', {
      similarJobsCount: parsedResponse.similar_jobs.length,
      targetRole: parsedResponse.recommendation_context?.target_role || 'N/A',
      sharedCompetenciesCount: parsedResponse.recommendation_context?.shared_competencies?.length || 0
    });

    const apiResponse: SimilarJobsResponse = {
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
      error: 'Failed to generate similar jobs recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    } as SimilarJobsResponse, { status: 500 });
  }
}
