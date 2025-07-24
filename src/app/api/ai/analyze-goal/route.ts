import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { INDUSTRY_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  console.log('🔥 [API] /api/ai/analyze-goal - Request received');

  try {
    const formData = await request.formData();
    const userInput = formData.get('userInput') as string;
    const files = formData.getAll('files') as File[];

    console.log('📝 [API] User input received:', userInput);
    console.log('📁 [API] Number of files received:', files.length);

    if (!userInput) {
      console.error('❌ [API] No user input provided');
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    // Process uploaded files
    let fileContent = '';
    if (files && files.length > 0) {
      console.log('📁 [API] Processing uploaded files...');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📁 [API] Processing file ${i + 1}/${files.length}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });

        try {
          const text = await file.text();
          console.log(`📁 [API] File ${i + 1} content extracted:`, {
            fileName: file.name,
            contentLength: text.length,
            contentPreview: text.substring(0, 200) + (text.length > 200 ? '...' : '')
          });

          fileContent += `\nFile name: ${file.name}\nContent: ${text}\n`;
        } catch (fileError) {
          console.error(`❌ [API] Failed to read file ${file.name}:`, fileError);
          fileContent += `\nFile name: ${file.name}\nContent: [File reading failed: ${fileError}]\n`;
        }
      }

      console.log('📁 [API] All files processed. Total content length:', fileContent.length);
    } else {
      console.log('📁 [API] No files uploaded');
    }

    // Prepare the prompt
    console.log('🤖 [API] Preparing AI prompt...');
    const prompt = INDUSTRY_RECOMMENDATION_PROMPT
      .replace('{userInput}', userInput)
      .replace('{fileContent}', fileContent || 'No files uploaded');

    console.log('🤖 [API] Final prompt prepared:', {
      promptLength: prompt.length,
      hasFileContent: fileContent.length > 0,
      fileContentLength: fileContent.length
    });

    // Generate response with Gemini
    let parsedResponse;
    try {
      console.log('🤖 [API] Calling Gemini AI...');
      const aiStartTime = Date.now();

      const response = await generateWithGemini(prompt);

      const aiEndTime = Date.now();
      console.log(`🤖 [API] Gemini AI response received in ${aiEndTime - aiStartTime}ms`);
      console.log('🤖 [API] Raw AI response length:', response.length);
      console.log('🤖 [API] Raw AI response preview:', response.substring(0, 500) + (response.length > 500 ? '...' : ''));

      // Try to parse JSON response
      console.log('🔄 [API] Parsing AI response...');
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      console.log('🔄 [API] JSON extraction result:', {
        foundJsonBlock: !!jsonMatch,
        jsonStringLength: jsonString.length,
        jsonStringPreview: jsonString.substring(0, 300) + (jsonString.length > 300 ? '...' : '')
      });

      parsedResponse = JSON.parse(jsonString);
      console.log('✅ [API] AI response parsed successfully');
      console.log('✅ [API] Parsed response structure:', {
        hasRecommendedFields: !!parsedResponse.RecommendedFields,
        fieldsCount: parsedResponse.RecommendedFields?.length || 0
      });
    } catch (error) {
      console.error('❌ [API] AI generation failed, using mock data:', error);

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

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
