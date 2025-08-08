'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCard } from '@/types/card';
import { CareerProfileAnalysis, CareerProfileAnalysisResponse } from '@/types/career-profile';
import CareerRadarChart from '@/components/visualization/CareerRadarChart';
import CareerAwarenessChart from '@/components/visualization/CareerAwarenessChart';
import CompetenceStructureComponent from '@/components/CompetenceStructure';
import JobRecommendationSection from '@/components/JobRecommendationSection';
import { exportSelfCognitionToPDF } from '@/lib/pdfExport';
import './result.css';



export default function ResultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs'>('profile');
  const [careerProfileData, setCareerProfileData] = useState<CareerProfileAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareerProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load combination data from localStorage
        const storedCombination = localStorage.getItem('selectedCombination');
        const storedUserGoal = localStorage.getItem('userGoal');
        const storedIndustry = localStorage.getItem('selectedIndustry');

        console.log('📋 [RESULT] Loading data for career profile analysis:', {
          hasCombination: !!storedCombination,
          hasUserGoal: !!storedUserGoal,
          hasIndustry: !!storedIndustry
        });

        if (!storedCombination || !storedUserGoal || !storedIndustry) {
          throw new Error('Missing required data for career profile analysis');
        }

        const combinationData = JSON.parse(storedCombination);
        const userGoal = storedUserGoal;
        const industryData = JSON.parse(storedIndustry);

        console.log('✅ [RESULT] Parsed data:', {
          userGoal: userGoal.substring(0, 100) + '...',
          industry: industryData.cardPreview?.fieldName || 'Unknown',
          cardsCount: combinationData.cards?.length || 0,
          cardNames: combinationData.cards?.map((c: ExperienceCard) => c.cardPreview?.experienceName) || []
        });

        // Prepare API request (currently using mock data)
        // const requestData: CareerProfileAnalysisRequest = {
        //   userGoal,
        //   selectedIndustry: industryData.cardPreview?.fieldName || industryData.fieldName || 'Unknown',
        //   selectedCards: combinationData.cards?.map((card: ExperienceCard) => ({
        //     id: card.id,
        //     experienceName: card.cardPreview.experienceName,
        //     category: card.category,
        //     cardDetail: card.cardDetail
        //   })) || [],
        //   combinationContext: combinationData.option ? {
        //     combinationName: combinationData.option.name || 'Selected Combination',
        //     combinationDescription: combinationData.option.description || '',
        //     whyThisCombination: combinationData.option.whyThisCombination || ''
        //   } : undefined
        // };

        console.log('📤 [RESULT] Calling career profile analysis API...');

        // 临时使用模拟数据，避免API配额限制
        console.log('⚠️ [RESULT] Using mock data due to API quota limitations');

        const mockApiResponse: CareerProfileAnalysisResponse = {
          success: true,
          data: {
            radarData: {
              interestOrientation: 75,
              selfEfficacy: 82,
              goalOrientation: 88,
              outcomeExpectation: 70,
              cognitiveAgility: 85,
              affectiveReadiness: 78,
              interpersonalReadiness: 80,
              professionalAwareness: 72
            },
            quadrantData: {
              externalDriven: 65,
              internalDriven: 75,
              structuredAnalytical: 80,
              expressiveInterpersonal: 70
            },
            abilityPoints: [
              {
                id: 'analytical-thinking',
                name: 'Analytical Thinking',
                x: -60,
                y: 40,
                description: 'Strong analytical capabilities through systematic problem-solving approaches.',
                evidence: 'Derived from project coordination experiences'
              },
              {
                id: 'team-collaboration',
                name: 'Team Collaboration',
                x: 50,
                y: 30,
                description: 'Excellent interpersonal and collaborative skills in cross-functional teams.',
                evidence: 'Supported by workshop facilitation experiences'
              },
              {
                id: 'strategic-planning',
                name: 'Strategic Planning',
                x: -40,
                y: -20,
                description: 'Ability to develop and execute long-term strategic initiatives.',
                evidence: 'Evidenced through goal-setting and outcome tracking'
              },
              {
                id: 'creative-problem-solving',
                name: 'Creative Problem Solving',
                x: 30,
                y: -50,
                description: 'Innovative approach to complex challenges and solution development.',
                evidence: 'Demonstrated in various project contexts'
              }
            ],
            selfCognitionSummary: 'You demonstrate a balanced profile with strong goal orientation and cognitive agility. Your analytical mindset is complemented by solid interpersonal skills, positioning you well for leadership roles that require both strategic thinking and team coordination.',
            competenceStructure: {
              objectiveAbilities: {
                displayType: 'table',
                abilities: [
                  {
                    name: 'Project Execution',
                    evidence: 'Derived from project coordination and strategic planning activities.',
                    confidenceLevel: 'high'
                  },
                  {
                    name: 'Cross-team Communication',
                    evidence: 'Supported by workshop facilitation and team coordination experiences.',
                    confidenceLevel: 'high'
                  },
                  {
                    name: 'Strategic Planning',
                    evidence: 'Evidenced through goal-setting and outcome tracking in multiple experiences.',
                    confidenceLevel: 'medium'
                  }
                ]
              },
              subjectiveAbilities: {
                displayType: 'text_blocks',
                selfStatements: [
                  {
                    label: 'Quick Learning',
                    userInput: 'You consistently adapt to new environments and acquire new skills rapidly.',
                    insight: 'This adaptability is a key strength for transitioning into your target industry.'
                  },
                  {
                    label: 'Abstract Thinking',
                    userInput: 'You excel at connecting concepts and seeing patterns across different domains.',
                    insight: 'This cognitive flexibility will serve you well in complex problem-solving scenarios.'
                  }
                ]
              },
              developmentPotential: {
                skills: [
                  {
                    name: 'Data Analysis Tools',
                    currentStatus: 'Beginner level with basic Excel skills',
                    suggestion: 'Consider taking online courses in SQL, Python, or Tableau to enhance your analytical toolkit.',
                    priority: 'high'
                  },
                  {
                    name: 'Technical Communication',
                    currentStatus: 'Strong verbal communication, developing written technical skills',
                    suggestion: 'Practice creating technical documentation and presenting complex ideas to non-technical audiences.',
                    priority: 'medium'
                  },
                  {
                    name: 'Industry-Specific Knowledge',
                    currentStatus: 'General business understanding, limited industry depth',
                    suggestion: 'Engage with industry publications, attend webinars, and connect with professionals in your target field.',
                    priority: 'high'
                  }
                ]
              },
              structureSummary: {
                evaluationText: 'You show strong execution ability backed by solid team experience and analytical thinking. Your combination of interpersonal skills and strategic mindset creates a foundation for leadership roles. Expanding your technical tool fluency and industry-specific knowledge will help you unlock broader opportunities in data-enhanced environments and position you as a well-rounded professional in your target industry.'
              }
            },
            analysisMetadata: {
              basedOnCards: ['mock-card-1', 'mock-card-2'],
              userGoal: userGoal,
              selectedIndustry: industryData.cardPreview?.fieldName || industryData.fieldName || 'Unknown',
              analysisTimestamp: Date.now(),
              confidenceScore: 85
            }
          },
          processingTime: 1000
        };

        const apiResponse = mockApiResponse;

        console.log('✅ [RESULT] Career profile analysis completed:', {
          hasRadarData: !!apiResponse.data?.radarData,
          hasQuadrantData: !!apiResponse.data?.quadrantData,
          abilityPointsCount: apiResponse.data?.abilityPoints?.length || 0,
          hasCompetenceStructure: !!apiResponse.data?.competenceStructure,
          confidenceScore: apiResponse.data?.analysisMetadata?.confidenceScore
        });

        if (apiResponse.data) {
          setCareerProfileData(apiResponse.data);
        }

      } catch (error) {
        console.error('❌ [RESULT] Error loading career profile data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load career profile data');

        // If missing required data, redirect to combination page
        if (error instanceof Error && error.message.includes('Missing required data')) {
          console.warn('⚠️ [RESULT] Missing required data, redirecting to combination page');
          router.push('/combination');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerProfileData();
  }, [router]);

  // Removed unused handlers - functionality will be added later if needed

  return (
    <div className="result-page">
      <div className="result-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">FINAL RESULT</h1>
        </div>

        {/* Main Container */}
        <div className="main-container">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Career Profile Result
            </button>
            <button
              className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Job Recommendation
            </button>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {activeTab === 'profile' ? (
              <CareerProfileResult
                data={careerProfileData}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <JobRecommendation careerProfileData={careerProfileData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Career Profile Result Component
interface CareerProfileResultProps {
  data: CareerProfileAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

const CareerProfileResult: React.FC<CareerProfileResultProps> = ({ data, isLoading, error }) => {
  const [isExporting, setIsExporting] = useState(false);

  // PDF导出处理函数
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      console.log('🔄 [PDF Export] Starting PDF export...');
      await exportSelfCognitionToPDF();
      console.log('✅ [PDF Export] PDF export completed successfully!');
    } catch (error) {
      console.error('❌ [PDF Export] Failed to export PDF:', error);
      alert('导出PDF失败，请稍后重试。');
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="career-profile-section">
        <div className="profile-card main-profile-full" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Analyzing your career profile...
          </p>
        </div>
        <div className="profile-card right-panel" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280'
        }}>
          <p>Loading competence structure...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="career-profile-section">
        <div className="profile-card main-profile-full" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h3 style={{ color: '#ef4444', margin: 0 }}>Analysis Failed</h3>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
        <div className="profile-card right-panel" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280'
        }}>
          <p>Unable to load competence structure</p>
        </div>
      </div>
    );
  }

  // Show data (fallback to default if no data)
  const profileData = data || null;
  return (
    <div className="career-profile-section">
      {/* Left Panel - Complete Career Profile */}
      <div id="self-cognition-panel" className="profile-card main-profile-full">
        {/* Header with centered icon and title */}
        <div className="card-header centered-header">
          <div className="header-content">
            <div className="user-icon">👤</div>
            <h2>Your Career Self-Concept</h2>
          </div>
          <p className="subtitle">Who You Are?</p>
        </div>

        {/* Radar Chart Section */}
        <div className="chart-section">
          <CareerRadarChart
            data={profileData?.radarData}
            isLoading={false}
          />
        </div>

        {/* Career Awareness Chart Section */}
        <div className="chart-section">
          <CareerAwarenessChart
            quadrantData={profileData?.quadrantData}
            abilityPoints={profileData?.abilityPoints}
            isLoading={false}
          />
        </div>

        {/* Self-Cognition Summary Section */}
        <div className="description-section">
          <div className="section-header">
            <h3>Your Self-Cognition & Ability Structure</h3>
          </div>
          <div className="competency-text">
            <p>
              {profileData?.selfCognitionSummary ||
                "Your career profile analysis will appear here once the data is loaded. This section provides insights into your self-awareness and ability structure based on your selected experiences."
              }
            </p>
          </div>

          {/* PDF Export Button */}
          <div className="export-section">
            <button
              className="export-pdf-button"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="export-icon">⏳</span>
                  Exporting...
                </>
              ) : (
                <>
                  <span className="export-icon">📄</span>
                  Export as PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Competence Structure */}
      <div className="profile-card right-panel">
        <CompetenceStructureComponent
          data={profileData?.competenceStructure}
          isLoading={false}
        />



      </div>
    </div>
  );
};

// Job Recommendation Component
interface JobRecommendationProps {
  careerProfileData: CareerProfileAnalysis | null;
}

const JobRecommendation: React.FC<JobRecommendationProps> = ({ careerProfileData }) => {
  return <JobRecommendationSection careerProfileData={careerProfileData} />;
};
