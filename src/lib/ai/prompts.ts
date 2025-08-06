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

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- Analyze the primary language of the file content
- If the file content is primarily in Chinese, respond ENTIRELY in Chinese
- If the file content is primarily in English, respond ENTIRELY in English
- If the content contains multiple languages, prioritize English
- Keep the response language consistent throughout ALL fields

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

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标和文件内容的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性，不要混合使用多种语言
- 高光总结句始终使用英文

重要原则：
1. 只提取文件中明确提到的真实经历
2. 不要编造或推测不存在的信息
3. 如果某些信息缺失（如时间、地点），请使用"[信息待补充]"而不是"信息缺失"
4. 根据实际提取到的经历数量生成卡片，不强制要求特定数量

请分析用户的经历，并按照以下分类整理：
1. Focus Match - 用户的主要经历和重要体验（默认分类）
2. Growth Potential - 显示学习能力和成长潜力的经历
3. Foundation Skills - 展示基础技能和素质的经历

重要：所有从用户文件中提取的真实经历都应该被转换为卡片。默认将所有经历分类到Focus Match，确保用户能够看到所有上传内容的解析结果。

请严格按照以下JSON格式输出：

\`\`\`json
{
  "经验卡片推荐": [
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "从文件中提取的真实项目/经历名称",
        "时间与地点": "从文件中提取的真实时间地点，如果缺失则写'[时间地点待补充]'",
        "一句话概述": "基于文件内容的真实概述"
      },
      "详情卡展示": {
        "经历名称": "完整的真实经历标题",
        "时间与地点": "真实的时间地点信息，缺失则标注'[时间地点待补充]'",
        "背景与情境说明": "基于文件内容的真实背景描述，如信息不足则写'[背景信息待补充]'",
        "我的角色与任务": "文件中明确提到的角色和任务，如不明确则写'[角色职责待补充]'",
        "任务细节描述": "文件中描述的具体工作内容，如缺失则写'[工作细节待补充]'",
        "反思与结果总结": "文件中提到的结果或成果，如无则写'[成果反思待补充]'",
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
5. 对于信息不完整的经历，使用"[字段名称待补充]"格式，避免使用"信息缺失"等负面表述
6. 高光总结句使用英文，其他内容严格遵循语言跟随规则
7. 如果无法从文件中提取到任何有效经历，请在响应中说明
8. 使用"[待补充]"格式的字段不应计入完成度统计

特别注意：宁可生成少量准确的卡片，也不要编造虚假信息！使用积极的占位符格式提升用户体验。
`;

export const EXPERIENCE_CARD_GENERATION_PROMPT = `
根据用户目标和已选择的行业方向，生成相关的经验卡片建议。

用户目标：{userGoal}
选择的行业：{selectedIndustry}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性
- 高光总结句始终使用英文

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

export const COMBINATION_RECOMMENDATION_PROMPT = `
根据用户目标、选择的行业和可用的经验卡片，为指定的推荐类型生成智能组合推荐。

用户目标：{userGoal}
选择行业：{selectedIndustry}
可用卡片：{availableCards}
推荐类型：{optionType}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性，包括所有字段名称和内容

请分析用户的卡片池，为{optionType}生成最优的卡片组合推荐。

推荐类型说明：
- option1: NORMAL (Balanced Option) - 平衡稳健的组合方案
- option2: AGGRESSIVE (Growth-Focused) - 激进成长导向的组合方案
- option3: CONSERVATIVE (Safe Transition) - 保守安全的转型方案

请严格按照以下JSON格式输出：

\`\`\`json
{
  "推荐路径选项": {
    "option名称": "NORMAL (Balanced Option)",
    "匹配逻辑摘要": "This path ensures stability while opening up moderate growth potential.",
    "Why this combination": {
      "目标岗位": "Content Analyst",
      "识别能力": [
        "✅ Project Execution",
        "✅ Data Sensitivity",
        "✅ Content Experience"
      ],
      "组合解释": "Together, they form a balanced skill set supporting a lateral transition into data-enhanced creative roles."
    },
    "卡片组合": [
      {
        "卡片名称": "Project Management",
        "角色定位": "Cross-team coordination & timeline control"
      },
      {
        "卡片名称": "Data Analysis",
        "角色定位": "Foundational thinking for analysis"
      },
      {
        "卡片名称": "Content Creation",
        "角色定位": "Strengthens storytelling and communication"
      }
    ],
    "补充建议方向": [
      "🍀 User Research",
      "🍀 Intro to Python",
      "🍀 Competitor Benchmarking"
    ],
    "风险与建议": {
      "潜在挑战": [
        "Limited exposure to technical tools (e.g., SQL, Tableau) may reduce competitiveness in data-heavy roles."
      ],
      "行动建议": [
        "Enroll in quick-start courses on analytics basics.",
        "Frame existing project outcomes using measurable, resume-friendly metrics."
      ]
    }
  }
}
\`\`\`

要求：
1. 卡片组合必须从提供的可用卡片中选择，卡片名称要精确匹配
2. 根据推荐类型调整组合策略和风险评估
3. 识别能力要具体且与目标岗位相关
4. 补充建议方向要实用且可操作
5. 风险与建议要针对性强，提供具体的改进方案
6. 所有文本内容要专业且有价值
`;

// 动态方向组合推荐提示词 - 基于个性化方向进行卡片组合推荐
export const DYNAMIC_COMBINATION_RECOMMENDATION_PROMPT = `
根据用户设定的职业目标、选择的行业方向和个性化的经验方向分类，从可用的经验卡片中选择最合适的卡片组合来讲述一个连贯、有说服力的个人职业故事。

用户目标：{userGoal}
选择行业：{selectedIndustry}
可用卡片：{availableCards}
推荐类型：{optionType}
个性化方向分类：{dynamicDirections}

请分析用户的经验卡片池和个性化方向分类，选择能够最好地支撑其职业目标的卡片组合，构建一个完整的个人故事叙述。

推荐策略说明：
- option1: 重点选择第一个方向（{direction1Title}）的卡片，构建核心匹配的职业故事
- option2: 重点选择第二个方向（{direction2Title}）的卡片，构建发展潜力的职业故事
- option3: 重点选择第三个方向（{direction3Title}）的卡片，构建基础技能的职业故事

每个推荐选项应该：
1. 主要从对应方向选择卡片（60-70%）
2. 适当从其他方向补充卡片（30-40%）
3. 确保整体故事的连贯性和完整性

请严格按照以下JSON格式输出：

\`\`\`json
{
  "推荐组合": {
    "故事主题": "基于选择方向的职业发展主题",
    "叙述逻辑": "解释这些经验如何连接成一个连贯的故事，支撑用户的职业目标",
    "选择的卡片": [
      {
        "卡片名称": "经验卡片的确切名称（必须精确匹配）",
        "在故事中的角色": "这个经验在整体叙述中的具体作用和价值"
      }
    ],
    "故事亮点": [
      "这个组合突出的关键优势或成就",
      "职业发展历程中的另一个引人注目的方面"
    ],
    "方向匹配度": {
      "主要方向": "选择的主要方向名称",
      "匹配说明": "解释为什么这个组合符合该方向的特点和价值"
    }
  }
}
\`\`\`

核心要求：
1. 卡片名称必须与提供的可用卡片精确匹配
2. 选择的卡片组合应该能够讲述一个连贯的职业发展故事
3. 每张卡片在整体叙述中都应有明确的作用和价值
4. 根据推荐类型和对应的个性化方向调整选择策略
5. 故事主题要与用户的职业目标和选择的方向高度相关
6. 叙述逻辑要清晰且有说服力
7. 故事亮点要具体且有价值
8. 方向匹配度要准确反映选择的逻辑
`;

// 新的自动推荐提示词 - 专注于个人故事叙述（保留作为备用）
export const AUTO_COMBINATION_RECOMMENDATION_PROMPT = `
根据用户设定的职业目标和选择的行业方向，从可用的经验卡片中选择最合适的卡片组合来讲述一个连贯、有说服力的个人职业故事。

用户目标：{userGoal}
选择行业：{selectedIndustry}
可用卡片：{availableCards}
推荐类型：{optionType}

请分析用户的经验卡片池，选择能够最好地支撑其职业目标的卡片组合，构建一个完整的个人故事叙述。

推荐策略说明：
- option1: BALANCED STORY (平衡叙述) - 选择能展现全面能力和稳健发展轨迹的卡片组合
- option2: GROWTH STORY (成长叙述) - 选择能突出学习能力、挑战精神和快速发展的卡片组合
- option3: EXPERTISE STORY (专业叙述) - 选择能深度展现专业技能和领域经验的卡片组合

请严格按照以下JSON格式输出：

\`\`\`json
{
  "推荐组合": {
    "故事主题": "Your Professional Journey Theme",
    "叙述逻辑": "How these experiences connect to tell a coherent story leading to your career goal",
    "选择的卡片": [
      {
        "卡片名称": "Experience Card Name (must match exactly)",
        "在故事中的角色": "How this experience contributes to your overall narrative"
      }
    ],
    "故事亮点": [
      "Key strength or achievement highlighted by this combination",
      "Another compelling aspect of your journey"
    ]
  }
}
\`\`\`

核心要求：
1. 卡片名称必须与提供的可用卡片精确匹配
2. 选择的卡片组合应该能够讲述一个连贯的职业发展故事
3. 每张卡片在整体叙述中都应有明确的作用和价值
4. 组合应该直接支撑用户的职业目标
5. 根据不同的推荐类型调整故事的重点和风格
6. 故事叙述应该具有说服力和吸引力
7. 选择3-5张最相关的卡片，避免信息过载
`;

// 智能卡片分类提示词 - 将经验卡片分配到最合适的方向中
export const SMART_CARD_CLASSIFICATION_PROMPT = `
根据用户的职业目标、选择的行业和当前的方向分类，将提供的经验卡片智能分配到最合适的方向中。

用户目标：{userGoal}
选择行业：{selectedIndustry}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性

当前方向分类：
{dynamicDirections}

需要分类的经验卡片：
{experienceCards}

请分析每张卡片的内容，包括：
1. 经历名称和概述
2. 背景与情境
3. 角色与任务
4. 技能和能力体现
5. 与用户目标的匹配度

然后将每张卡片分配到最合适的方向中。分配原则：
- 与用户目标直接相关的核心经验 → 第一个方向（通常是核心匹配方向）
- 展现发展潜力和学习能力的经验 → 第二个方向（通常是发展潜力方向）
- 基础技能和通用能力的经验 → 第三个方向（通常是基础技能方向）

请严格按照以下JSON格式输出：

\`\`\`json
{
  "卡片分类结果": [
    {
      "卡片名称": "经验卡片的确切名称",
      "分配方向": "direction-1 或 direction-2 或 direction-3",
      "分配理由": "详细说明为什么将此卡片分配到这个方向的原因"
    }
  ]
}
\`\`\`

要求：
1. 卡片名称必须与提供的卡片完全匹配
2. 分配方向必须是 direction-1、direction-2 或 direction-3 之一
3. 分配理由要具体且有说服力
4. 确保三个方向的卡片分布相对均衡
5. 优先考虑与用户目标的相关性
6. 所有提供的卡片都必须被分配
`;

// 动态方向生成提示词 - 根据用户目标和行业生成个性化的三个方向分类
export const DYNAMIC_DIRECTIONS_GENERATION_PROMPT = `
根据用户的职业目标和选择的行业，生成三个个性化的经验卡片方向分类。这些方向应该：
1. 与用户的具体目标和行业高度相关
2. 能够全面覆盖该领域的职业发展路径
3. 具有清晰的层次和逻辑关系
4. 帮助用户更好地组织和展示自己的经验

用户目标：{userGoal}
选择行业：{selectedIndustry}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性，包括方向标题、副标题和描述

请严格按照以下JSON格式输出：

\`\`\`json
{
  "个性化方向分类": [
    {
      "方向ID": "direction-1",
      "方向标题": "与用户目标最直接相关的方向名称",
      "方向副标题": "简洁描述这个方向的核心价值",
      "方向描述": "详细说明这个方向下应该包含什么类型的经验",
      "默认展开": true,
      "对齐程度": "high"
    },
    {
      "方向ID": "direction-2",
      "方向标题": "支撑性技能或发展潜力相关的方向名称",
      "方向副标题": "简洁描述这个方向的核心价值",
      "方向描述": "详细说明这个方向下应该包含什么类型的经验",
      "默认展开": false,
      "对齐程度": "medium"
    },
    {
      "方向ID": "direction-3",
      "方向标题": "基础技能或通用能力相关的方向名称",
      "方向副标题": "简洁描述这个方向的核心价值",
      "方向描述": "详细说明这个方向下应该包含什么类型的经验",
      "默认展开": false,
      "对齐程度": "low"
    }
  ]
}
\`\`\`

要求：
1. 方向标题要简洁有力，体现该方向的核心特征
2. 方向副标题要能快速传达价值主张
3. 方向描述要具体且实用，指导用户添加相关经验
4. 三个方向要有明确的层次关系：核心匹配 → 支撑发展 → 基础能力
5. 所有内容要与用户的具体目标和行业紧密相关
6. 严格遵循语言跟随规则，保持专业性和可读性
`;

// 详细组合分析提示词 - 用于生成详细的推荐路径分析
export const DETAILED_COMBINATION_ANALYSIS_PROMPT = `
基于用户的职业目标、选择的行业方向和已推荐的卡片组合，生成详细的推荐路径分析报告。

用户目标：{userGoal}
选择行业：{selectedIndustry}
推荐选项：{optionType}
推荐的卡片组合：{recommendedCards}
可用卡片池：{availableCards}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性，包括所有字段名称和内容

请根据以下推荐策略生成详细分析：
- option1: BALANCED STORY (平衡叙述) - 确保稳定性的同时开启适度的成长潜力
- option2: GROWTH STORY (成长叙述) - 突出学习能力、挑战精神和快速发展潜力
- option3: EXPERTISE STORY (专业叙述) - 深度展现专业技能和领域经验的专业化路径

请严格按照以下JSON格式输出：

\`\`\`json
{
  "推荐路径选项": {
    "option名称": "根据选项类型生成对应名称 (如: BALANCED OPTION, GROWTH OPTION, EXPERTISE OPTION)",
    "匹配逻辑摘要": "简要说明这个路径的核心逻辑和价值主张",
    "Why this combination": {
      "目标岗位": "基于用户目标和行业推荐的具体岗位名称",
      "识别能力": [
        "✅ 从推荐卡片中识别出的核心能力1",
        "✅ 从推荐卡片中识别出的核心能力2",
        "✅ 从推荐卡片中识别出的核心能力3"
      ],
      "组合解释": "解释这些卡片如何协同工作，形成支撑目标岗位的完整技能组合"
    },
    "卡片组合": [
      {
        "卡片名称": "推荐卡片的确切名称",
        "角色定位": "这张卡片在整个职业故事中的具体作用和价值"
      }
    ],
    "补充建议方向": [
      "🍀 基于当前组合识别出的技能缺口或提升方向1",
      "🍀 基于当前组合识别出的技能缺口或提升方向2",
      "🍀 基于当前组合识别出的技能缺口或提升方向3"
    ],
    "风险与建议": {
      "潜在挑战": [
        "基于当前卡片组合可能面临的具体挑战或限制"
      ],
      "行动建议": [
        "针对潜在挑战的具体、可操作的改进建议1",
        "针对潜在挑战的具体、可操作的改进建议2"
      ]
    }
  }
}
\`\`\`

核心要求：
1. option名称要根据推荐类型生成对应的英文名称
2. 目标岗位要具体且符合用户目标和行业方向
3. 识别能力要从实际推荐的卡片中提取，使用✅标记
4. 卡片组合必须与推荐的卡片完全匹配
5. 补充建议要具体且实用，使用🍀标记
6. 风险分析要客观且有针对性
7. 行动建议要具体可执行
8. 所有内容要专业且有价值
`;
