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

      // Fallback to mock data for testing
      console.log('🔄 [API] Using fallback mock data due to AI failure');
      parsedResponse = {
        "RecommendedFields": [
          {
            "CardPreview": {
              "FieldName": "Digital Product Management",
              "FieldSummary": "Lead cross-functional teams to design, build, and grow digital products.",
              "FieldTags": ["Cross-functional", "Product Thinking", "User Insight"]
            },
            "CardDetail": {
              "FieldOverview": "数字产品管理是一个快速发展的领域，专注于通过数据驱动的决策来创造用户价值。",
              "SuitableForYouIf": [
                "你喜欢跨团队协作",
                "你对用户体验有敏锐的洞察",
                "你善于分析数据和市场趋势"
              ],
              "TypicalTasksAndChallenges": [
                "制定产品路线图",
                "协调设计和开发团队",
                "分析用户反馈和数据",
                "平衡商业目标和用户需求"
              ],
              "FieldTags": ["产品策略", "用户研究", "数据分析", "团队协作"]
            }
          },
          {
            "CardPreview": {
              "FieldName": "UX/UI Design",
              "FieldSummary": "Create intuitive and engaging user experiences for digital products.",
              "FieldTags": ["User Research", "Design Systems", "Prototyping"]
            },
            "CardDetail": {
              "FieldOverview": "用户体验设计专注于创造直观、美观且功能性强的数字产品界面。",
              "SuitableForYouIf": [
                "你有强烈的视觉美感",
                "你关注用户需求和行为",
                "你喜欢创造性的问题解决"
              ],
              "TypicalTasksAndChallenges": [
                "用户研究和访谈",
                "创建线框图和原型",
                "设计系统维护",
                "与开发团队协作实现设计"
              ],
              "FieldTags": ["视觉设计", "交互设计", "用户研究", "原型制作"]
            }
          },
          {
            "CardPreview": {
              "FieldName": "Data Science",
              "FieldSummary": "Extract insights from data to drive business decisions and innovation.",
              "FieldTags": ["Machine Learning", "Analytics", "Statistical Modeling"]
            },
            "CardDetail": {
              "FieldOverview": "数据科学结合统计学、编程和业务知识，从大量数据中提取有价值的洞察。",
              "SuitableForYouIf": [
                "你对数学和统计学有兴趣",
                "你喜欢编程和技术挑战",
                "你善于发现数据中的模式"
              ],
              "TypicalTasksAndChallenges": [
                "数据清洗和预处理",
                "构建机器学习模型",
                "数据可视化和报告",
                "与业务团队沟通技术结果"
              ],
              "FieldTags": ["Python/R", "机器学习", "数据可视化", "统计分析"]
            }
          },
          {
            "CardPreview": {
              "FieldName": "Software Engineering",
              "FieldSummary": "Build scalable and robust software solutions for various platforms.",
              "FieldTags": ["Full-stack", "System Design", "Code Quality"]
            },
            "CardDetail": {
              "FieldOverview": "软件工程涉及设计、开发和维护高质量的软件系统和应用程序。",
              "SuitableForYouIf": [
                "你喜欢逻辑思维和问题解决",
                "你对技术和编程有热情",
                "你注重细节和代码质量"
              ],
              "TypicalTasksAndChallenges": [
                "编写和维护代码",
                "系统架构设计",
                "代码审查和测试",
                "技术债务管理"
              ],
              "FieldTags": ["编程语言", "系统设计", "软件架构", "DevOps"]
            }
          }
        ]
      };
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

    // Return fallback data even in case of critical error
    const fallbackResponse = {
      "RecommendedFields": [
        {
          "CardPreview": {
            "FieldName": "Technology",
            "FieldSummary": "Technology field offers diverse opportunities in software development, data analysis, and digital innovation.",
            "FieldTags": ["Programming", "Innovation", "Problem-Solving"]
          },
          "CardDetail": {
            "FieldOverview": "The technology industry is rapidly evolving with opportunities in various specializations including software development, data science, cybersecurity, and cloud computing.",
            "SuitableForYouIf": [
              "You enjoy problem-solving and logical thinking",
              "You are interested in continuous learning",
              "You want to work with cutting-edge technologies"
            ],
            "TypicalTasksAndChallenges": [
              "Developing software solutions",
              "Analyzing data and systems",
              "Staying updated with new technologies",
              "Collaborating with cross-functional teams"
            ],
            "FieldTags": ["Software Development", "Data Science", "Cloud Computing", "AI/ML"]
          }
        }
      ]
    };

    console.log('🔄 [API] Returning fallback response due to critical error');
    return NextResponse.json(fallbackResponse);
  }
}
