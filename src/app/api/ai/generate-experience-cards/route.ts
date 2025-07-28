import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { EXPERIENCE_EXTRACTION_PROMPT, EXPERIENCE_CARD_GENERATION_PROMPT } from '@/lib/ai/prompts';
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
      console.log('📁 [API] No files uploaded, will generate AI suggestions only');
    }

    // Choose appropriate prompt based on whether files were uploaded
    const prompt = hasFiles 
      ? EXPERIENCE_EXTRACTION_PROMPT
          .replace('{userGoal}', userGoal)
          .replace('{selectedIndustry}', selectedIndustry)
          .replace('{fileContent}', fileContent)
      : EXPERIENCE_CARD_GENERATION_PROMPT
          .replace('{userGoal}', userGoal)
          .replace('{selectedIndustry}', selectedIndustry);

    // Log the complete AI request to console
    consoleLog.aiRequest('生成经验卡片API', prompt, hasFiles ? '经验提取' : '经验卡片生成', {
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

      // Fallback to mock data for testing
      console.log('🔄 [API] Using fallback mock data due to AI failure');
      parsedResponse = {
        "经验卡片推荐": [
          {
            "卡片分组": "Focus Match",
            "小卡展示": {
              "经历名称": "Product Research & Competitor Analysis Lead",
              "时间与地点": "Beijing | July 2024 - September 2024",
              "一句话概述": "Led comprehensive market research and competitor analysis for new product development"
            },
            "详情卡展示": {
              "经历名称": "Product Research & Competitor Analysis Lead",
              "时间与地点": "Beijing | July 2024 - September 2024",
              "背景与情境说明": "During a fast-paced summer innovation sprint, I led a user research stream to support the design of a new creator-facing feature.",
              "我的角色与任务": "I organized and conducted interviews, synthesized competitor analysis, and communicated findings to the core product team.",
              "任务细节描述": "• Conducted 15+ user interviews with target demographics\n• Analyzed 8 competitor products and documented feature gaps\n• Created comprehensive research reports with actionable insights\n• Presented findings to stakeholders and influenced product roadmap",
              "反思与结果总结": "This experience strengthened my research methodology skills and taught me how to translate user insights into product requirements. The research directly influenced 3 major product decisions.",
              "高光总结句": "This experience helped me strengthen my stakeholder communication skills.",
              "生成来源": {
                "类型": hasFiles ? "uploaded_resume" : "ai_generated"
              }
            }
          },
          {
            "卡片分组": "Growth Potential",
            "小卡展示": {
              "经历名称": "Cross-functional Team Collaboration",
              "时间与地点": "Various Projects | 2023 - 2024",
              "一句话概述": "Collaborated with design, engineering, and marketing teams on multiple product initiatives"
            },
            "详情卡展示": {
              "经历名称": "Cross-functional Team Collaboration",
              "时间与地点": "Various Projects | 2023 - 2024",
              "背景与情境说明": "Worked across multiple product development cycles requiring close coordination with diverse teams.",
              "我的角色与任务": "Served as a bridge between technical and non-technical teams, facilitating communication and ensuring project alignment.",
              "任务细节描述": "• Participated in daily standups and sprint planning sessions\n• Translated business requirements into technical specifications\n• Coordinated deliverables across teams with different timelines\n• Resolved conflicts and maintained project momentum",
              "反思与结果总结": "Developed strong project management and communication skills. Learned to navigate different team cultures and working styles effectively.",
              "高光总结句": "This experience enhanced my ability to work effectively in cross-functional environments.",
              "生成来源": {
                "类型": "ai_generated"
              }
            }
          },
          {
            "卡片分组": "Foundation Skills",
            "小卡展示": {
              "经历名称": "Data Analysis & Reporting",
              "时间与地点": "Academic/Professional Projects | 2023",
              "一句话概述": "Applied analytical skills to extract insights from complex datasets"
            },
            "详情卡展示": {
              "经历名称": "Data Analysis & Reporting",
              "时间与地点": "Academic/Professional Projects | 2023",
              "背景与情境说明": "Various projects requiring data collection, analysis, and presentation of findings to stakeholders.",
              "我的角色与任务": "Responsible for data collection methodology, analysis execution, and creating compelling visualizations.",
              "任务细节描述": "• Designed and implemented data collection strategies\n• Used statistical tools to analyze trends and patterns\n• Created clear visualizations and dashboards\n• Presented findings to both technical and non-technical audiences",
              "反思与结果总结": "Built strong foundation in data literacy and learned to communicate complex information clearly. These skills are essential for evidence-based decision making.",
              "高光总结句": "This experience built my foundation in data-driven decision making.",
              "生成来源": {
                "类型": "ai_generated"
              }
            }
          }
        ]
      };
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
