'use client';

import { useState } from 'react';
import IndustryCardList from '../../components/cards/IndustryCardList';
import { IndustryRecommendation } from '../../types/api';

const mockIndustries: IndustryRecommendation[] = [
  {
    cardPreview: {
      fieldName: "Digital Product Management",
      fieldSummary: "Lead cross-functional teams to design, build, and grow digital products.",
      fieldTags: ["Cross-functional", "Product Thinking", "User Insight"]
    },
    cardDetail: {
      fieldOverview: "数字产品管理是一个快速发展的领域，专注于通过数据驱动的决策来创造用户价值。",
      suitableForYouIf: [
        "你喜欢跨团队协作",
        "你对用户体验有敏锐的洞察",
        "你善于分析数据和市场趋势"
      ],
      typicalTasksAndChallenges: [
        "制定产品路线图",
        "协调设计和开发团队",
        "分析用户反馈和数据",
        "平衡商业目标和用户需求"
      ],
      fieldTags: ["产品策略", "用户研究", "数据分析", "团队协作"]
    }
  },
  {
    cardPreview: {
      fieldName: "UX/UI Design",
      fieldSummary: "Create intuitive and engaging user experiences for digital products.",
      fieldTags: ["User Research", "Design Systems", "Prototyping"]
    },
    cardDetail: {
      fieldOverview: "用户体验设计专注于创造直观、美观且功能性强的数字产品界面。",
      suitableForYouIf: [
        "你有强烈的视觉美感",
        "你关注用户需求和行为",
        "你喜欢创造性的问题解决"
      ],
      typicalTasksAndChallenges: [
        "用户研究和访谈",
        "创建线框图和原型",
        "设计系统维护",
        "与开发团队协作实现设计"
      ],
      fieldTags: ["视觉设计", "交互设计", "用户研究", "原型制作"]
    }
  },
  {
    cardPreview: {
      fieldName: "Data Science",
      fieldSummary: "Extract insights from data to drive business decisions and innovation.",
      fieldTags: ["Machine Learning", "Analytics", "Statistical Modeling"]
    },
    cardDetail: {
      fieldOverview: "数据科学结合统计学、编程和业务知识，从大量数据中提取有价值的洞察。",
      suitableForYouIf: [
        "你对数学和统计学有兴趣",
        "你喜欢编程和技术挑战",
        "你善于发现数据中的模式"
      ],
      typicalTasksAndChallenges: [
        "数据清洗和预处理",
        "构建机器学习模型",
        "数据可视化和报告",
        "与业务团队沟通技术结果"
      ],
      fieldTags: ["Python/R", "机器学习", "数据可视化", "统计分析"]
    }
  },
  {
    cardPreview: {
      fieldName: "Software Engineering",
      fieldSummary: "Build scalable and robust software solutions for various platforms.",
      fieldTags: ["Full-stack", "System Design", "Code Quality"]
    },
    cardDetail: {
      fieldOverview: "软件工程涉及设计、开发和维护高质量的软件系统和应用程序。",
      suitableForYouIf: [
        "你喜欢逻辑思维和问题解决",
        "你对技术和编程有热情",
        "你注重细节和代码质量"
      ],
      typicalTasksAndChallenges: [
        "编写和维护代码",
        "系统架构设计",
        "代码审查和测试",
        "技术债务管理"
      ],
      fieldTags: ["编程语言", "系统设计", "软件架构", "DevOps"]
    }
  }
];

export default function TestGoalPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#4285f4',
        fontSize: '1.5rem',
        fontWeight: '900',
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        GOAL SETTING - TEST
      </h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%' 
        }}>
          <IndustryCardList
            industries={mockIndustries}
            onSelectionChange={setSelectedIndustry}
          />
          
          {selectedIndustry && (
            <div style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <button
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
