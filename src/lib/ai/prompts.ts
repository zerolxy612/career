// AI Prompts for Career Profiling System

export const INDUSTRY_RECOMMENDATION_PROMPT = `
Please generate four recommended industry directions based on the user's input and uploaded files.

User Input: {userInput}
File Content: {fileContent}

CRITICAL LANGUAGE REQUIREMENTS:
- If the user input is primarily in English, respond ENTIRELY in English
- If the user input is primarily in Chinese, respond ENTIRELY in Chinese
- If the user input contains multiple languages, prioritize English
- Keep the response language consistent throughout ALL fields (FieldName, FieldSummary, FieldOverview, etc.)
- DO NOT mix languages within the response

Please output strictly in the following JSON format with no additional text:

{
  "RecommendedFields": [
    {
      "CardPreview": {
        "FieldName": "Specific Industry Name",
        "FieldSummary": "One sentence overview",
        "FieldTags": ["Tag1", "Tag2", "Tag3"]
      },
      "CardDetail": {
        "FieldOverview": "Detailed industry overview including characteristics, trends, and core values",
        "SuitableForYouIf": [
          "If you have certain qualities or skills",
          "If you are interested in a specific field",
          "If you have relevant experience background"
        ],
        "TypicalTasksAndChallenges": [
          "Typical work task 1",
          "Typical work task 2",
          "Main challenge 1",
          "Main challenge 2"
        ],
        "FieldTags": ["Detailed Tag1", "Detailed Tag2", "Detailed Tag3", "Detailed Tag4"]
      }
    }
  ]
}

Requirements:
1. Generate exactly 4 recommended industries
2. Each industry must have complete CardPreview and CardDetail information
3. FieldTags should accurately reflect industry characteristics
4. SuitableForYouIf should be personalized based on user input and file content
5. Output must be valid JSON format
6. All text content should be professional and valuable
7. Follow the language rules specified above - respond in the same language as user input, prioritizing English for mixed languages
`;

export const FILE_PARSING_PROMPT = `
Please parse the following file content and extract key information for career planning analysis:

File Content:
{fileContent}

Please extract the following information:
1. Educational background
2. Work experience
3. Skills and expertise
4. Project experience
5. Personal traits and interests

Return this information in a structured format.
`;

export const EXPERIENCE_EXTRACTION_PROMPT = `
请根据以下用户上传的文件内容，提取真实的经历信息，并按照相关性进行分类。

用户目标：{userGoal}
用户选择的行业方向：{selectedIndustry}
文件内容：{fileContent}

重要原则：
1. 只提取文件中明确提到的真实经历
2. 不要编造或推测不存在的信息
3. 如果某些信息缺失（如时间、地点），请标记为"信息缺失"或留空
4. 根据实际提取到的经历数量生成卡片，不强制要求特定数量

请分析用户的经历，并按照以下分类整理：
1. Focus Match - 与目标行业高度匹配的经历
2. Growth Potential - 有成长潜力的经历
3. Foundation Skills - 基础技能相关的经历

请严格按照以下JSON格式输出：

\`\`\`json
{
  "经验卡片推荐": [
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "从文件中提取的真实项目/经历名称",
        "时间与地点": "从文件中提取的真实时间地点，如果缺失则写'时间地点信息缺失'",
        "一句话概述": "基于文件内容的真实概述"
      },
      "详情卡展示": {
        "经历名称": "完整的真实经历标题",
        "时间与地点": "真实的时间地点信息，缺失则标注'信息缺失'",
        "背景与情境说明": "基于文件内容的真实背景描述",
        "我的角色与任务": "文件中明确提到的角色和任务",
        "任务细节描述": "文件中描述的具体工作内容",
        "反思与结果总结": "文件中提到的结果或成果，如无则写'结果信息缺失'",
        "高光总结句": "基于真实经历的核心价值总结（英文）",
        "生成来源": {
          "类型": "uploaded_resume",
          "置信度": "high/medium/low - 基于文件中信息的完整程度"
        }
      }
    }
  ]
}
\`\`\`

严格要求：
1. 只生成文件中有明确依据的经历卡片
2. 不要编造时间、地点、公司名称等具体信息
3. 如果文件中经历很少，生成的卡片数量也应该相应减少
4. 每张卡片必须标注置信度（high/medium/low）
5. 对于信息不完整的经历，诚实标注"信息缺失"
6. 高光总结句使用英文，其他内容根据用户文件语言决定
7. 如果无法从文件中提取到任何有效经历，请在响应中说明

特别注意：宁可生成少量准确的卡片，也不要编造虚假信息！
`;

export const EXPERIENCE_CARD_GENERATION_PROMPT = `
根据用户目标和已选择的行业方向，生成相关的经验卡片建议。

用户目标：{userGoal}
选择的行业：{selectedIndustry}

请为用户生成AI推荐的经验卡片，帮助用户思考可能需要补充的经历。

按照以下JSON格式输出：

\`\`\`json
{
  "经验卡片推荐": [
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "建议的经历标题",
        "时间与地点": "Suggested timeframe",
        "一句话概述": "建议经历的核心价值"
      },
      "详情卡展示": {
        "经历名称": "完整的建议经历标题",
        "时间与地点": "Suggested timeframe",
        "背景与情境说明": "建议的经历背景和情境",
        "我的角色与任务": "建议的角色定位和关键任务",
        "任务细节描述": "建议的具体工作内容和方法",
        "反思与结果总结": "预期的学习收获和成果",
        "高光总结句": "This experience would help develop key skills for the target industry.",
        "生成来源": {
          "类型": "ai_generated"
        }
      }
    }
  ]
}
\`\`\`

要求：
1. 生成6-9张AI推荐卡片
2. 分布在Focus Match、Growth Potential、Foundation Skills三个分类
3. 卡片内容应该与用户目标和选择行业高度相关
4. 提供具体、可操作的经历建议
5. 高光总结句使用英文
`;
