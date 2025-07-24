import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';
import { INDUSTRY_RECOMMENDATION_PROMPT } from '@/lib/ai/prompts';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userInput = formData.get('userInput') as string;
    const files = formData.getAll('files') as File[];

    if (!userInput) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    // Process uploaded files
    let fileContent = '';
    if (files && files.length > 0) {
      for (const file of files) {
        const text = await file.text();
        fileContent += `\n文件名: ${file.name}\n内容: ${text}\n`;
      }
    }

    // Prepare the prompt
    const prompt = INDUSTRY_RECOMMENDATION_PROMPT
      .replace('{userInput}', userInput)
      .replace('{fileContent}', fileContent || '无上传文件');

    // Generate response with Gemini
    let parsedResponse;
    try {
      const response = await generateWithGemini(prompt);

      // Try to parse JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;
      parsedResponse = JSON.parse(jsonString);
    } catch (error) {
      console.error('AI generation failed, using mock data:', error);

      // Fallback to mock data for testing
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

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error in analyze-goal API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
