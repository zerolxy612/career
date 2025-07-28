import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { EXPERIENCE_EXTRACTION_PROMPT } from '@/lib/ai/prompts';
import { consoleLog } from '@/lib/logger';
import { parseFiles, formatParsedContentForAI } from '@/lib/fileParser';

// Function to generate empty experience cards for user input
function generateEmptyExperienceCards() {
  return {
    "经验卡片推荐": [
      {
        "卡片分组": "Focus Match",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      },
      {
        "卡片分组": "Focus Match",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      },
      {
        "卡片分组": "Growth Potential",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      },
      {
        "卡片分组": "Growth Potential",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      },
      {
        "卡片分组": "Foundation Skills",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      },
      {
        "卡片分组": "Foundation Skills",
        "小卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "一句话概述": ""
        },
        "详情卡展示": {
          "经历名称": "",
          "时间与地点": "",
          "背景与情境说明": "",
          "我的角色与任务": "",
          "任务细节描述": "",
          "反思与结果总结": "",
          "高光总结句": "",
          "生成来源": {
            "类型": "user_input",
            "置信度": "user_provided"
          }
        }
      }
    ]
  };
}

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
      console.log('📁 [API] No files uploaded, will return empty cards for user to fill');
    }

    // If no files uploaded, return empty cards instead of AI suggestions
    if (!hasFiles) {
      console.log('🎯 [API] Returning empty experience cards for user input');
      const emptyCards = generateEmptyExperienceCards();

      return NextResponse.json(emptyCards);
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

      // Fallback to empty cards when AI fails
      console.log('🔄 [API] Using empty cards fallback due to AI failure');
      const emptyCards = generateEmptyExperienceCards();
      return NextResponse.json(emptyCards);
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

    // Return fallback response for critical errors
    const fallbackResponse = {
      "经验卡片推荐": [
        {
          "卡片分组": "Focus Match",
          "小卡展示": {
            "经历名称": "Sample Experience",
            "时间与地点": "Location | Time Period",
            "一句话概述": "A sample experience to demonstrate the system functionality"
          },
          "详情卡展示": {
            "经历名称": "Sample Experience",
            "时间与地点": "Location | Time Period",
            "背景与情境说明": "This is a sample experience card generated due to system error.",
            "我的角色与任务": "Sample role and responsibilities.",
            "任务细节描述": "Sample task details and methodologies used.",
            "反思与结果总结": "Sample reflection and outcomes achieved.",
            "高光总结句": "This is a sample highlight sentence.",
            "生成来源": {
              "类型": "ai_generated"
            }
          }
        }
      ]
    };

    console.log('🔄 [API] Returning fallback response due to critical error');
    return NextResponse.json(fallbackResponse);
  }
}
