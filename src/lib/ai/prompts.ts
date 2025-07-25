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
请根据以下用户上传的文件内容，将经历进行提取和分类，并且严格按照以下的结构进行经历重新整理

用户目标：{userGoal}
用户选择的行业方向：{selectedIndustry}
文件内容：{fileContent}

请分析用户的经历，并按照以下三个分类生成经验卡片：
1. Focus Match - 与目标行业高度匹配的经历
2. Growth Potential - 有成长潜力的经历
3. Foundation Skills - 基础技能相关的经历

每个分类生成2-3张卡片，包括：
- 从文件中提取的真实经历（标记为"uploaded_resume"）
- AI推测的可能经历（标记为"ai_generated"，基于现有经历推测用户可能拥有的相关经验）

请严格按照以下JSON格式输出：

\`\`\`json
{
  "经验卡片推荐": [
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "项目或实践标题",
        "时间与地点": "Beijing | Jul 2023 – Sept 2023",
        "一句话概述": "用一句话概括你在此经历中的核心贡献或任务"
      },
      "详情卡展示": {
        "经历名称": "完整经历标题",
        "时间与地点": "Beijing | Jul 2023 – Sept 2023",
        "背景与情境说明": "这段经历发生的背景、项目目标或任务前情",
        "我的角色与任务": "你在其中承担的角色，以及所完成的关键任务",
        "任务细节描述": "具体做了什么、采用了什么方法或工具",
        "反思与结果总结": "输出结果、个人成长、对后续工作的影响",
        "高光总结句": "This experience helped me strengthen my stakeholder communication skills.",
        "生成来源": {
          "类型": "uploaded_resume"
        }
      }
    },
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "AI推测的相关经历标题",
        "时间与地点": "Estimated timeframe",
        "一句话概述": "基于现有经历推测的可能经验"
      },
      "详情卡展示": {
        "经历名称": "AI推测的完整经历标题",
        "时间与地点": "Estimated timeframe",
        "背景与情境说明": "基于用户现有经历推测的可能背景",
        "我的角色与任务": "推测的角色和任务",
        "任务细节描述": "推测的具体工作内容",
        "反思与结果总结": "推测的学习收获和成果",
        "高光总结句": "推测的核心价值总结",
        "生成来源": {
          "类型": "ai_generated"
        }
      }
    }
  ]
}
\`\`\`

要求：
1. 必须生成6-9张卡片，分布在三个分类中
2. 每个分类至少包含1张真实经历和1张AI推测经历
3. AI推测的经历应该基于用户现有经历合理推测
4. 所有字段必须填写完整
5. 时间格式统一为"Location | Month Year – Month Year"
6. 高光总结句使用英文
7. 其他内容根据用户文件语言决定
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
