import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { INDUSTRY_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { parseFiles, formatParsedContentForAI } from '@/lib/fileParser';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/analyze-goal - Request received');

  try {
    const formData = await request.formData();
    const userInput = formData.get('userInput') as string;
    const files = formData.getAll('files') as File[];

    // Log the complete user input to console
    consoleLog.userInput('分析目标API', userInput, files);

    if (!userInput) {
      console.error('❌ [API] No user input provided');
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    // Process uploaded files with proper parsing
    let fileContent = '';
    if (files && files.length > 0) {
      console.group('📁 文件解析 - 分析目标API');
      console.log(`开始解析 ${files.length} 个文件`);

      try {
        const parsedFiles = await parseFiles(files);
        fileContent = formatParsedContentForAI(parsedFiles);

        console.log('✅ 所有文件解析完成');
        console.log('📊 解析结果摘要:', {
          文件总数: parsedFiles.length,
          解析成功: parsedFiles.filter(f => f.parseSuccess).length,
          解析失败: parsedFiles.filter(f => !f.parseSuccess).length,
          总文本长度: parsedFiles.reduce((sum, f) => sum + f.extractedTextLength, 0)
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
      console.log('📁 [API] No files uploaded');
      fileContent = 'No files uploaded';
    }

    // Prepare the prompt
    const prompt = INDUSTRY_RECOMMENDATION_PROMPT
      .replace('{userInput}', userInput)
      .replace('{fileContent}', fileContent || 'No files uploaded');

    // Log the complete AI request to console
    consoleLog.aiRequest('分析目标API', prompt, '行业推荐', {
      用户输入: userInput,
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
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      console.log('🔄 [API] JSON extraction result:', {
        foundJsonBlock: !!jsonMatch,
        jsonStringLength: jsonString.length,
        jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
      });

      parsedResponse = JSON.parse(jsonString);

      // Log the complete AI response to console
      consoleLog.aiResponse('分析目标API', response, parsedResponse, responseTime);

    } catch (error) {
      console.error('❌ [API] AI generation failed:', error);
      throw error; // Re-throw the error instead of using fallback data
    }

    console.log('🎉 [API] Successfully prepared response');
    console.log('🎉 [API] Response data:', {
      hasRecommendedFields: !!parsedResponse.RecommendedFields,
      fieldsCount: parsedResponse.RecommendedFields?.length || 0,
      firstFieldName: parsedResponse.RecommendedFields?.[0]?.CardPreview?.FieldName || 'N/A'
    });

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('❌ [API] Critical error in analyze-goal API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ [API] Error type:', typeof error);
    console.error('❌ [API] Error constructor:', error?.constructor?.name);

    return NextResponse.json(
      { error: 'Failed to analyze goal. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
