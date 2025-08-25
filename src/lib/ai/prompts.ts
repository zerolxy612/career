// AI Prompts for Career Profiling System

export const INDUSTRY_RECOMMENDATION_PROMPT = `
请根据用户输入的目标行业方向文本及上传的文件内容，生成岗位推荐，具体规则如下：

User Input: {userInput}
File Content: {fileContent}

## 优先级规则：

1. **当同时存在用户输入文本和上传文件时：**
   - 以用户输入的文本为主，文件仅作为补充信息
   - 从文件中提取与文本方向高度相关的经历/技能信息，结合文本生成推荐

2. **当仅有文件时：**
   - 根据文件内容分析并生成四个推荐的行业方向

3. **当仅有文本时：**
   - 以文本为核心，结合常规岗位匹配逻辑生成四个推荐的行业方向

## 输出要求：

共生成4个推荐方向，每个方向必须包含：
- **FieldName**：具体行业名称（例如：Digital Product Management）
- **FieldSummary**：一句话概述该行业/方向（例如：跨职能协作，设计与落地数字产品）
- **FieldTags**：3-6个能力或关键词标签（例如：["Cross-functional","Agile","Product Strategy"]）
- **RecommendationReason**：推荐理由，基于方向与文件/文本匹配的依据，需包含该方向的典型任务或技能要求

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
        "FieldName": "具体行业名称",
        "FieldSummary": "一句话概述（如：跨职能协作，设计与落地数字产品）",
        "FieldTags": [
          "Cross-functional",
          "Agile",
          "Product Strategy"
        ]
      },
      "CardDetail": {
        "FieldOverview": "Detailed industry overview including characteristics, trends, and core values",
        "RecommendationReason": "推荐理由，基于方向与文件/文本匹配的依据，需包含该方向的典型任务或技能要求",
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
3. FieldTags should accurately reflect industry characteristics (3-6 tags)
4. RecommendationReason must be based on matching evidence from user input/file content
5. SuitableForYouIf should be personalized based on user input and file content
6. Output must be valid JSON format
7. All text content should be professional and valuable
8. Follow the language rules specified above - respond in the same language as user input, prioritizing English for mixed languages
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
请根据以下用户上传的文件内容和目标方向，完成两个任务：
1. 提取文件中的真实经历信息
2. 推测具备该目标的人群可能拥有的经历

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

## 任务1：提取真实经历
重要原则：
1. 只提取文件中明确提到的真实经历
2. 不要编造或推测不存在的信息
3. 如果某些信息缺失（如时间、地点），请使用"[信息待补充]"而不是"信息缺失"
4. 根据实际提取到的经历数量生成卡片，不强制要求特定数量

## 任务2：推测可能经历
根据用户过往上传的文件内容和目标方向，推测具备该目标的人群可能拥有的经历。重点挖掘：
- 兴趣爱好相关活动
- 项目活动参与
- 日常社交场景
- 自主学习经历
- 学术研究活动
- 线上社区参与
- 兴趣小组活动
- 创意项目实践
- 志愿服务经历
- 个人挑战项目

生成的经历必须：
1. 与目标方向高度相关
2. 包含可感知、可操作的细节
3. 能够真实还原可能的行为场景（如"参与本地设计爱好者线下分享会"而非笼统的"参加活动"）
4. 体现互动对象、成果产出、具体情境
5. 反推目标行业所需的软技能、兴趣偏好、学习方式

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
  ],
  "AI推测经历": [
    {
      "卡片分组": "Focus Match",
      "小卡展示": {
        "经历名称": "AI推测的具体经历名称（如：城市可持续设计竞赛参与者）",
        "时间与地点": "（例如：北京 | 2023年夏季）",
        "一句话概述": "（例如：为公共设施设计环保材料应用方案）"
      },
      "详情卡展示": {
        "经历名称": "AI推测的具体经历名称",
        "时间与地点": "（例如：北京 | 2023年夏季）",
        "背景与情境说明": "（例如：受邀参加由市政府和设计协会联合举办的创新竞赛，旨在提出可落地的环保解决方案）",
        "我的角色与任务": "（例如：担任方案设计师，负责概念构思与可视化呈现）",
        "任务细节描述": "（例如：使用SketchUp完成3D建模，并组织两次线上团队讨论）",
        "反思与结果总结": "（例如：方案获二等奖，提升了跨领域协作能力）",
        "高光总结句": "（例如：This experience helped me strengthen my stakeholder communication skills.）",
        "灰色提示": {
          "经历名称": "（例如：城市可持续设计竞赛参与者）",
          "一句话概述": "（例如：为公共设施设计环保材料应用方案）",
          "背景与情境说明": "（例如：受邀参加由市政府和设计协会联合举办的创新竞赛，旨在提出可落地的环保解决方案）",
          "我的角色与任务": "（例如：担任方案设计师，负责概念构思与可视化呈现）",
          "任务细节描述": "（例如：使用SketchUp完成3D建模，并组织两次线上团队讨论）",
          "反思与结果总结": "（例如：方案获二等奖，提升了跨领域协作能力）",
          "高光总结句": "（例如：This experience helped me strengthen my stakeholder communication skills.）"
        },
        "生成来源": {
          "类型": "ai_generated",
          "推测依据": "基于用户目标和已有经历推测的可能兴趣活动"
        }
      }
    }
  ]
}
\`\`\`

严格要求：

## 对于真实经历提取：
1. 只生成文件中有明确依据的经历卡片
2. 不要编造时间、地点、公司名称等具体信息
3. 如果文件中经历很少，生成的卡片数量也应该相应减少
4. 每张卡片必须标注置信度（high/medium/low）
5. 对于信息不完整的经历，使用"[字段名称待补充]"格式，避免使用"信息缺失"等负面表述

## 对于AI推测经历：
1. **严格要求：必须生成6个AI推测经历卡片（每个方向2个，共3个方向）**
2. **卡片分组分布：Focus Match方向2个，Adjacent Field方向2个，Stretch Goal方向2个**
3. 重点关注兴趣、活动等非结构化经历
4. 必须与目标方向高度相关且具体可信
5. 包含详细的灰色提示文本，指导用户应该输入什么内容
6. 推测经历要具体到场景、互动对象、成果产出
7. 避免笼统描述，要有可感知的细节
8. AI推测经历的内容字段应为占位符格式，用户需要编辑替换
9. **即使文件内容较少，也必须生成6个AI推测卡片，基于目标方向的典型活动模式**

## 通用要求：
1. 高光总结句使用英文，其他内容严格遵循语言跟随规则
2. 如果无法从文件中提取到任何有效经历，请在响应中说明
3. 使用"[待补充]"格式的字段不应计入完成度统计
4. AI推测经历的灰色提示要具体且有指导性

特别注意：
1. 真实经历宁可生成少量准确的卡片，也不要编造虚假信息！
2. **AI推测经历必须严格生成6个卡片，不能少于6个！**
3. AI推测经历要基于目标方向的典型行为模式，具体且可信。
4. **确保"AI推测经历"数组中包含6个完整的卡片对象。**
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

// Job Recommendation Prompt - 基于目标职位的工作推荐
export const JOB_RECOMMENDATION_PROMPT = `
你是一位专业的职业顾问和招聘专家。请基于用户的职业画像分析结果、目标行业和经验卡片，联网搜索并访问 O*NET-SOC 职业分类（Occupation）数据库，确保数据真实可靠，不得虚构职业信息。

用户信息：
- 职业目标：{userGoal}
- 目标行业：{selectedIndustry}
- 职业画像分析：{careerProfileData}
- 经验卡片组合：{selectedCards}

🌐 CRITICAL LANGUAGE REQUIREMENTS:
- 分析用户目标的主要语言
- 如果用户目标主要是中文，则所有输出内容使用中文
- 如果用户目标主要是英文，则所有输出内容使用英文
- 如果语言混合，优先使用英文
- 保持整个响应的语言一致性，包括所有字段名称和内容

请根据以下要求执行任务：
1. 联网搜索并访问 O*NET-SOC 职业分类（Occupation）数据库，确保数据真实可靠，不得虚构职业信息。
2. 分析用户的职业目标与经历卡片内容，推演其可能适合探索的发展方向，提供现有岗位匹配。岗位尽可能来源于现有 JD 或数据库，允许 AI 基于能力结构合理推演方向，但生成内容必须专业、可信、可执行，不可杜撰不合逻辑的方向。输出 5 个岗位方向推荐卡片。
3. 基于以上目标和经历，推荐 5 个真实存在且最符合用户技能与方向的职业，每个职业需提供：
   - Target Position（岗位方向名称）
   - Match Level（推荐匹配程度，1–5 星）
   - Direction Summary：一句话简要介绍该方向的主要职责与应用场景
   - System Recommendation Reason：基于用户卡片内容与表达能力的推荐理由，指出该方向与用户能力之间的关联
   - Explore this Direction（探索建议）：一句自然语言，引导用户如何围绕此方向查找岗位
   - Based on Experience Cards：引用的用户经历卡片（卡片标题即可）
   - Job Requirements：该方向典型的任务或能力要求，列出 3–4 项，语言务实、专业
   - Direction Tags：该方向的能力关键词标签，5 个左右，风格如 #UX Research #AR/VR #Storytelling 等

请严格按照以下JSON格式输出，不得包含任何自然语言注释、标题、标头或markdown格式：

{
  "directions": [
    {
      "target_position": "string, recommended job direction title",
      "match_level": "integer (1-5)",
      "direction_summary": "string, one-sentence summary describing the core responsibility or application area of this direction",
      "recommendation_reason": "string, explanation of why this direction is a good fit for the user based on their experience cards or demonstrated abilities",
      "explore_instruction": "string, natural-language sentence suggesting how to explore or search for roles under this direction",
      "based_on_experience_cards": [
        "string, experience card title 1",
        "string, experience card title 2",
        "string, experience card title 3"
      ],
      "job_requirements": [
        "string, typical task or responsibility 1",
        "string, typical task or responsibility 2",
        "string, typical task or responsibility 3"
      ],
      "direction_tags": [
        "#tag1",
        "#tag2",
        "#tag3",
        "#tag4",
        "#tag5"
      ]
    }
  ]
}

要求：
1. 输出结果必须真实、基于权威数据，严禁捏造不存在的职业或任务描述
2. 输出格式必须结构清晰、语义完整，可作为卡片界面展示内容直接使用
3. 每个字段应为完整自然语言表达，不可省略
4. 不得捏造不存在的职业术语或使用虚构岗位名称，必须专业、真实、常见于职场或招聘语境
5. 所有内容要专业、准确且有价值
`;

// Similar Jobs Recommendation Prompt - Adjacent Filed Suggestion区域的跨领域岗位推荐
export const SIMILAR_JOBS_RECOMMENDATION_PROMPT = `
你是一个职业画像系统中的相似岗位推荐解释模块。请根据以下要求，生成推荐岗位的"相似推荐弹窗内容"，用于解释系统为什么在当前岗位目标基础上推荐另一个相似岗位，请注意，这些岗位必须与目标岗位领域不同（跨领域推荐），但核心能力相似：

用户信息：
- 选中的目标岗位：{selectedJob}
- 用户职业目标：{userGoal}
- 用户经验卡片：{selectedCards}

请根据以下要求执行任务：
1. 当前用户已被推荐一个岗位方向（Target Role），例如 "Content Analyst"。
2. 你需要参考用户的过往经历卡片（Experience Cards）内容，理解用户具备的核心能力（如分析能力、执行协调、跨团队沟通等），然后推荐一个与该岗位方向相似的方向的四个岗位（Suggested Role），四个岗位彼此之间也需有所区分，不可过度相似，例如 "Marketing Data Coordinator"。
3. 每个岗位需要包含以下信息：
  - Target Position（岗位方向名称）
  - Match Level（推荐匹配程度，1–5 星）
  - Direction Summary：一句话简要介绍该方向的主要职责与应用场景
  - System Recommendation Reason：基于用户卡片内容与表达能力的推荐理由，指出该方向与用户能力之间的关联
  - Explore this Direction（探索建议）：一句自然语言，引导用户如何围绕此方向查找岗位（如：You can further explore this direction by searching for job postings that emphasize...）
  - Based on Experience Cards：引用的用户经历卡片（卡片标题即可）
  - Job Requirements：该方向典型的任务或能力要求，列出 3–4 项，语言务实、专业
  - Direction Tags：该方向的能力关键词标签，5 个左右，风格如 #UX Research #AR/VR #Storytelling 等
4. 同时，为这 4 个推荐方向统一生成一个弹窗解释结构（similar_reason_popup），用于解释它们为何与当前目标岗位相似，包含：
  - 推荐理由说明（reason_intro）
  - 能力相似点列表（core_similarities），格式为 emoji + 简洁能力名称，如 📊 Market Insight
5. 文案整体需自然、可信、表达专业，面向终端用户，不得捏造不真实技能或岗位职责；
6. 最终输出为一个标准 JSON 结构，仅包含系统弹窗所需字段，不得输出 markdown、注释或附加解释。

/*
Instructions:
Please strictly return the result as a valid JSON object following the exact structure below.
- Do NOT include any natural language commentary, titles, headers, or markdown formatting (e.g., no \`\`\`json or "Here is the result:").
- Do NOT explain the JSON after outputting it.
- DO include all fields exactly as defined, even if some are left empty.
- Use English strings. Match keys and nesting exactly.
*/

{
  "directions": [
    {
      "target_position": "string, recommended job direction title",
      "match_level": "integer (1-5) or string in stars format (e.g. \"★★★★☆\")",
      "direction_summary": "string, one-sentence summary describing the core responsibility or application area of this direction",
      "recommendation_reason": "string, explanation of why this direction is a good fit for the user based on their experience cards or demonstrated abilities",
      "explore_instruction": "string, natural-language sentence suggesting how to explore or search for roles under this direction",
      "based_on_experience_cards": [
        "string, experience card title 1",
        "string, experience card title 2",
        "string, experience card title 3"
      ],
      "job_requirements": [
        "string, typical task or responsibility 1",
        "string, typical task or responsibility 2",
        "string, typical task or responsibility 3",
        "string, typical task or responsibility 4"
      ],
      "direction_tags": [
        "#tag1",
        "#tag2",
        "#tag3",
        "#tag4",
        "#tag5"
      ]
    }
  ],
  "similar_reason_popup": {
    "reason_intro": "string, explanation of why these recommended directions are similar to the current target role based on shared competencies or structural similarities",
    "core_similarities": [
      "📊 Data Insight",
      "📋 Structured Reporting",
      "🤝 Cross-functional Collaboration",
      "🔍 Analytical Thinking"
    ]
  }
}

要求：
1. 推荐4个跨领域岗位，必须与目标岗位领域不同，但核心能力相似，必须真实存在，基于实际招聘市场数据
2. 四个岗位彼此之间也需有所区分，不可过度相似
3. 匹配度应该在3-5之间（因为是相似岗位）
4. 能力相似点应该有4个，每个都要有合适的emoji图标
5. 推荐理由要具体且有逻辑性，基于用户卡片内容与表达能力
6. 所有内容要专业、准确且有价值，不得捏造不真实技能或岗位职责
`;

// Cover Letter Generation Prompt - 基于岗位和经验卡片生成个性化求职信
export const COVER_LETTER_GENERATION_PROMPT = `
你是一个专业的求职信生成助手。请根据用户的目标岗位和经验卡片，生成一份个性化的求职信草稿。

用户信息：
- 目标岗位：{targetPosition}
- 用户职业目标：{userGoal}
- 用户经验卡片：{experienceCards}

请根据以下要求生成求职信：

1. 求职信应该包含以下部分：
   - 开头段落：表达对岗位的兴趣和简要自我介绍
   - 经验段落：基于用户的经验卡片，突出相关经验和成就
   - 技能段落：强调与目标岗位匹配的核心技能
   - 结尾段落：表达期待和下一步行动

2. 每个句子都需要标注来源：
   - 如果来源于特定的经验卡片，标注卡片名称
   - 如果是基于用户目标的推理，标注为"用户目标"
   - 如果是通用求职信语言，标注为"通用"

3. 求职信应该：
   - 语言自然、专业
   - 突出用户的独特价值
   - 与目标岗位高度相关
   - 长度适中（3-4段）

4. 输出格式为JSON，包含句子和来源标注

/*
Instructions:
Please strictly return the result as a valid JSON object following the exact structure below.
- Do NOT include any natural language commentary, titles, headers, or markdown formatting.
- Do NOT explain the JSON after outputting it.
- DO include all fields exactly as defined.
- Use English for the cover letter content.
*/

{
  "cover_letter": {
    "sentences": [
      {
        "sentence": "string, the actual sentence content",
        "source": ["string, source card name or 'User Goal' or 'General'"],
        "type": "introduction" | "experience" | "skills" | "conclusion"
      }
    ],
    "metadata": {
      "target_position": "string, the target position",
      "generated_at": "string, ISO timestamp",
      "word_count": "number, approximate word count"
    }
  }
}

要求：
1. 求职信内容要专业、自然、有说服力
2. 每个句子都要有明确的来源标注
3. 内容要与目标岗位高度相关
4. 避免使用过于夸张或虚假的表述
5. 保持求职信的标准格式和语调
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
