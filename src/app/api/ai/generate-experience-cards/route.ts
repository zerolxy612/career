import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { EXPERIENCE_EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { parseFiles, formatParsedContentForAI } from '@/lib/fileParser';



export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/generate-experience-cards - Request received');

  try {
    const formData = await request.formData();
    const userGoal = formData.get('userGoal') as string;
    const selectedIndustry = formData.get('selectedIndustry') as string;
    const files = formData.getAll('files') as File[];

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

    // Process uploaded files if any
    if (files && files.length > 0) {
      console.group('📁 文件解析 - 生成经验卡片API');
      console.log(`开始解析 ${files.length} 个文件`);
      hasFiles = true;

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
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      console.log('🔄 [API] JSON extraction result:', {
        foundJsonBlock: !!jsonMatch,
        jsonStringLength: jsonString.length,
        jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
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
      firstCardName: parsedResponse.经验卡片推荐?.[0]?.小卡展示?.经历名称 || 'N/A'
    });

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('❌ [API] Critical error in generate-experience-cards API:', error);
    console.error('❌ [API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      { error: 'Failed to generate experience cards. Please check your input and try again.' },
      { status: 500 }
    );
  }
}
