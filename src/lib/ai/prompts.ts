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
请解析以下文件内容，提取关键信息用于职业规划分析：

文件内容：
{fileContent}

请提取以下信息：
1. 教育背景
2. 工作经历
3. 技能和专长
4. 项目经验
5. 个人特质和兴趣

以结构化的方式返回这些信息。
`;

export const EXPERIENCE_EXTRACTION_PROMPT = `
从用户上传的文件中提取经历信息，按照指定结构整理成经历卡片。

文件内容：
{fileContent}

目标行业：
{targetIndustry}

请生成经历卡片，格式如下：
\`\`\`json
{
  "experienceCards": [
    {
      "category": "Focus Match | Growth Potential",
      "cardPreview": {
        "experienceName": "经历名称",
        "timeAndLocation": "时间和地点",
        "oneSentenceSummary": "一句话总结"
      },
      "cardDetail": {
        "experienceName": "详细经历名称",
        "timeAndLocation": "具体时间和地点",
        "backgroundContext": "背景上下文",
        "myRoleAndTasks": "我的角色和任务",
        "taskDetails": "任务详情",
        "reflectionAndResults": "反思和结果",
        "highlightSentence": "亮点句子",
        "editableFields": ["可编辑字段列表"],
        "source": {
          "type": "uploaded_resume"
        }
      }
    }
  ]
}
\`\`\`
`;
