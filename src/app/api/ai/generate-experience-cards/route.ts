import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { EXPERIENCE_EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { parseFiles, formatParsedContentForAI, ParsedFileContent } from '@/lib/fileParser';

// Define types for AI response structure
interface AICardResponse {
  卡片分组: string;
  小卡展示: {
    经历名称: string;
    时间与地点: string;
    一句话概述: string;
  };
  详情卡展示: {
    经历名称: string;
    时间与地点: string;
    背景与情境说明: string;
    我的角色与任务: string;
    任务细节描述: string;
    反思与结果总结: string;
    高光总结句: string;
    生成来源: {
      类型: string;
      置信度?: string;
    };
    灰色提示?: {
      经历名称?: string;
      一句话概述?: string;
      背景与情境说明?: string;
      我的角色与任务?: string;
      任务细节描述?: string;
      反思与结果总结?: string;
      高光总结句?: string;
    };
  };
}



export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-experience-cards - Request received');
  console.log('📋 [API] === 开始经验卡片生成流程 ===');

  try {
    const formData = await request.formData();
    const userGoal = formData.get('userGoal') as string;
    const selectedIndustry = formData.get('selectedIndustry') as string;
    const rawFiles = formData.getAll('files') as File[];

    console.log('📥 [API] FormData解析结果:', {
      userGoal: userGoal?.substring(0, 100) + (userGoal?.length > 100 ? '...' : ''),
      selectedIndustry,
      rawFilesCount: rawFiles.length,
      rawFilesInfo: rawFiles.map(f => ({
        name: f?.name || 'undefined',
        type: f?.type || 'undefined',
        size: f?.size || 'undefined',
        isValid: !!(f && f.name && f.size > 0)
      }))
    });

    // 过滤掉无效的文件对象
    const files = rawFiles.filter(file => file && file.name && file.size > 0);

    console.log('🔍 [API] 文件过滤结果:', {
      原始文件数: rawFiles.length,
      有效文件数: files.length,
      有效文件列表: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
    });

    // Log the complete user input to console
    consoleLog.userInput('生成经验卡片API', `目标: ${userGoal}, 行业: ${selectedIndustry}`, files);

    if (!userGoal || !selectedIndustry) {
      console.error('❌ [API] Missing required parameters');
      return NextResponse.json(
        { error: 'User goal and selected industry are required' },
        { status: 400 }
      );
    }

    let fileContent = '';
    let hasFiles = false;
    let parsedFilesData: ParsedFileContent[] = [];

    // Process uploaded files if any
    if (files && files.length > 0) {
      console.log('📁 [API] === 开始文件解析阶段 ===');
      console.log(`📁 [API] 准备解析 ${files.length} 个文件:`, files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size + ' bytes'
      })));
      hasFiles = true;

      try {
        console.log('🔄 [API] 调用parseFiles函数...');
        const parsedFiles = await parseFiles(files);
        parsedFilesData = parsedFiles; // 保存解析结果供后续使用
        console.log('📊 [API] parseFiles返回结果:', {
          返回数组长度: parsedFiles.length,
          详细结果: parsedFiles.map(f => ({
            fileName: f.fileName,
            parseSuccess: f.parseSuccess,
            extractedTextLength: f.extractedTextLength,
            parseError: f.parseError || 'none',
            parsingMethod: f.metadata?.parsingMethod || 'unknown'
          }))
        });

        console.log('🔄 [API] 调用formatParsedContentForAI函数...');
        fileContent = formatParsedContentForAI(parsedFiles);
        console.log('📝 [API] 格式化后的文件内容:', {
          内容长度: fileContent.length,
          内容预览: fileContent.substring(0, 300) + (fileContent.length > 300 ? '...' : '')
        });

        console.log('✅ [API] 所有文件解析完成');
        console.log('📊 [API] 解析结果摘要:', {
          文件总数: parsedFiles.length,
          解析成功: parsedFiles.filter(f => f.parseSuccess).length,
          解析失败: parsedFiles.filter(f => !f.parseSuccess).length,
          总文本长度: parsedFiles.reduce((sum, f) => sum + f.extractedTextLength, 0),
          格式化后内容长度: fileContent.length
        });

        // 显示每个文件的解析结果
        parsedFiles.forEach((parsed, index) => {
          console.group(`📄 文件 ${index + 1}: ${parsed.fileName}`);
          console.log('解析状态:', parsed.parseSuccess ? '✅ 成功' : '❌ 失败');
          console.log('提取文本长度:', parsed.extractedTextLength);
          if (parsed.parseError) {
            console.log('错误信息:', parsed.parseError);
          }
          if (parsed.extractedText && parsed.extractedText.length > 0) {
            console.log('📄 提取的文本内容:');
            console.log(parsed.extractedText.substring(0, 500) + (parsed.extractedText.length > 500 ? '\n... (内容已截断，完整内容已发送给AI)' : ''));
          }
          console.groupEnd();
        });

      } catch (parseError) {
        console.error('❌ 文件解析过程失败:', parseError);
        fileContent = `File parsing failed: ${parseError}`;
      }

      console.groupEnd();
    } else {
      console.log(`📁 [API] No files uploaded (hasFiles: ${hasFiles}), returning empty response`);
      // 🔧 FIX: When no files are uploaded, return empty cards array instead of generating placeholder content
      return NextResponse.json({
        经验卡片推荐: []
      });
    }

    // Only use AI when files are uploaded to extract real experiences
    const prompt = EXPERIENCE_EXTRACTION_PROMPT
        .replace('{userGoal}', userGoal)
        .replace('{selectedIndustry}', selectedIndustry)
        .replace('{fileContent}', fileContent);

    // Log the complete AI request to console
    consoleLog.aiRequest('生成经验卡片API', prompt, '经验提取', {
      用户目标: userGoal,
      选择行业: selectedIndustry,
      有文件内容: fileContent.length > 0,
      文件内容长度: fileContent.length
    });

    // Generate response with Gemini
    let parsedResponse;
    try {
      const aiStartTime = Date.now();
      const response = await generateWithGemini(prompt);
      const aiEndTime = Date.now();
      const responseTime = aiEndTime - aiStartTime;

      // Try to parse JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      let jsonString = jsonMatch ? jsonMatch[1] : response;

      console.log('🔄 [API] JSON extraction result:', {
        foundJsonBlock: !!jsonMatch,
        jsonStringLength: jsonString.length,
        jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
      });

      // 清理JSON字符串中的控制字符
      console.log('🧹 [API] 清理JSON字符串中的控制字符...');
      jsonString = jsonString
        .replace(/[\x00-\x1F\x7F]/g, ' ') // 移除控制字符
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim();

      console.log('🔄 [API] 清理后的JSON预览:', {
        cleanedLength: jsonString.length,
        cleanedPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
      });

      parsedResponse = JSON.parse(jsonString);

      // Log the complete AI response to console
      consoleLog.aiResponse('生成经验卡片API', response, parsedResponse, responseTime);

    } catch (error) {
      console.error('❌ [API] AI generation failed:', error);
      throw error; // Re-throw the error instead of using fallback data
    }

    console.log('🎉 [API] Successfully prepared response');
    console.log('🎉 [API] Response data:', {
      hasExperienceCards: !!parsedResponse.经验卡片推荐,
      cardsCount: parsedResponse.经验卡片推荐?.length || 0,
      firstCardName: parsedResponse.经验卡片推荐?.[0]?.小卡展示?.经历名称 || 'N/A',
      hasAISuggestedCards: !!parsedResponse.AI推测经历,
      aiSuggestedCardsCount: parsedResponse.AI推测经历?.length || 0,
      firstAISuggestedCardName: parsedResponse.AI推测经历?.[0]?.小卡展示?.经历名称 || 'N/A'
    });

    // 🔧 VALIDATION: 验证AI推测卡片数量
    const aiSuggestedCount = parsedResponse.AI推测经历?.length || 0;
    if (aiSuggestedCount < 6) {
      console.warn('⚠️ [API] AI推测卡片数量不足:', {
        expected: 6,
        actual: aiSuggestedCount,
        missing: 6 - aiSuggestedCount
      });

      // 记录详细的卡片分组信息
      if (parsedResponse.AI推测经历) {
        const groupCounts = parsedResponse.AI推测经历.reduce((acc: Record<string, number>, card: AICardResponse) => {
          const group = card.卡片分组 || 'Unknown';
          acc[group] = (acc[group] || 0) + 1;
          return acc;
        }, {});
        console.warn('⚠️ [API] AI推测卡片分组统计:', groupCounts);
      }
    } else {
      console.log('✅ [API] AI推测卡片数量正确:', aiSuggestedCount);
    }

    // 🔍 [DEBUG] 添加文件解析详情到响应中，供前端调试使用
    const responseWithDebugInfo = {
      ...parsedResponse,
      文件解析详情: parsedFilesData
    };

    console.log('🔍 [API] 添加调试信息到响应:', {
      包含文件解析详情: responseWithDebugInfo.文件解析详情.length > 0,
      文件解析详情数量: responseWithDebugInfo.文件解析详情.length
    });

    return NextResponse.json(responseWithDebugInfo);
  } catch (error) {
    console.error('❌ [API] Critical error in generate-experience-cards API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { error: 'Failed to generate experience cards. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
