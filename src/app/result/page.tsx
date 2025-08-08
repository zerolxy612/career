'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCard } from '@/types/card';
import { CareerProfileAnalysis, CareerProfileAnalysisResponse, CareerProfileAnalysisRequest } from '@/types/career-profile';
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // 重试机制的API调用函数
  const callCareerProfileAPI = async (requestData: CareerProfileAnalysisRequest, attemptNumber: number = 1): Promise<CareerProfileAnalysisResponse> => {
    const maxRetries = 3;

    console.log(`📤 [RESULT] API attempt ${attemptNumber}/${maxRetries}...`);

    try {
      const response = await fetch('/api/ai/analyze-career-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const apiResponse: CareerProfileAnalysisResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API returned unsuccessful response');
      }

      if (!apiResponse.data) {
        throw new Error('API returned no data');
      }

      return apiResponse;
    } catch (error) {
      console.error(`❌ [RESULT] API attempt ${attemptNumber} failed:`, error);

      if (attemptNumber < maxRetries) {
        const delay = Math.pow(2, attemptNumber - 1) * 2000; // 指数退避：2s, 4s, 8s
        console.log(`⏳ [RESULT] Retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callCareerProfileAPI(requestData, attemptNumber + 1);
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    const loadCareerProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsRetrying(false);

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



        // Prepare API request data
        const requestData: CareerProfileAnalysisRequest = {
          userGoal,
          selectedIndustry: industryData.cardPreview?.fieldName || industryData.fieldName || 'Unknown',
          selectedCards: combinationData.cards?.map((card: ExperienceCard) => ({
            id: card.id,
            experienceName: card.cardPreview.experienceName,
            category: card.category,
            cardDetail: card.cardDetail
          })) || [],
          combinationContext: combinationData.option ? {
            combinationName: combinationData.option.name || 'Selected Combination',
            combinationDescription: combinationData.option.description || '',
            whyThisCombination: combinationData.option.whyThisCombination || ''
          } : undefined
        };

        console.log('📤 [RESULT] Calling career profile analysis API with data:', {
          userGoal: requestData.userGoal.substring(0, 100) + '...',
          selectedIndustry: requestData.selectedIndustry,
          cardsCount: requestData.selectedCards.length,
          cardNames: requestData.selectedCards.map((c) => c.experienceName),
          hasCombinationContext: !!requestData.combinationContext
        });

        // 必须使用真实API数据，不允许fallback到默认数据
        console.log('🚫 [RESULT] No fallback data allowed - must use real AI analysis');
        setIsRetrying(true);

        const apiResponse = await callCareerProfileAPI(requestData);

        setIsRetrying(false);

        console.log('✅ [RESULT] Career profile analysis completed:', {
          hasRadarData: !!apiResponse.data?.radarData,
          hasQuadrantData: !!apiResponse.data?.quadrantData,
          abilityPointsCount: apiResponse.data?.abilityPoints?.length || 0,
          hasCompetenceStructure: !!apiResponse.data?.competenceStructure,
          confidenceScore: apiResponse.data?.analysisMetadata?.confidenceScore
        });

        // 必须有真实数据才能设置，不允许使用默认数据
        if (apiResponse.data) {
          setCareerProfileData(apiResponse.data);
          setRetryCount(0); // 重置重试计数
          console.log('🎉 [RESULT] Real AI data loaded successfully - no fallback data used');
        } else {
          throw new Error('API returned empty data - refusing to use fallback');
        }

      } catch (error) {
        console.error('❌ [RESULT] Error loading career profile data:', error);
        setIsRetrying(false);

        // 增加重试计数
        setRetryCount(prev => prev + 1);

        const errorMessage = error instanceof Error ? error.message : 'Failed to load career profile data';
        setError(`${errorMessage} (Attempt ${retryCount + 1})`);

        // If missing required data, redirect to combination page
        if (error instanceof Error && error.message.includes('Missing required data')) {
          console.warn('⚠️ [RESULT] Missing required data, redirecting to combination page');
          router.push('/combination');
          return;
        }

        console.log('🚫 [RESULT] No fallback data will be used - user must retry for real AI analysis');
      } finally {
        setIsLoading(false);
      }
    };

    loadCareerProfileData();
  }, [router, retryCount]); // callCareerProfileAPI is stable, no need to include

  // 手动重试函数
  const handleRetry = () => {
    console.log('🔄 [RESULT] Manual retry triggered');
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  };

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
                isRetrying={isRetrying}
                retryCount={retryCount}
                onRetry={handleRetry}
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
  isRetrying: boolean;
  retryCount: number;
  onRetry: () => void;
}

const CareerProfileResult: React.FC<CareerProfileResultProps> = ({ data, isLoading, error, isRetrying, retryCount, onRetry }) => {
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
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{ color: '#4285f4', margin: 0 }}>
            {isRetrying ? 'Retrying Analysis...' : 'Generating Your Career Profile'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', textAlign: 'center' }}>
            {isRetrying
              ? 'Previous attempt failed, trying again with real AI analysis...'
              : 'Analyzing your career profile with AI - no fallback data will be used...'
            }
          </p>
          {retryCount > 0 && (
            <p style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
              Attempt {retryCount + 1} - Ensuring real AI data only
            </p>
          )}
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
          <h3 style={{ color: '#ef4444', margin: 0 }}>Real AI Analysis Failed</h3>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '500px' }}>
            {error}
          </p>
          <p style={{ color: '#f59e0b', fontSize: '0.9rem', textAlign: 'center' }}>
            🚫 No fallback data will be used - only real AI analysis is allowed
          </p>
          {retryCount > 0 && (
            <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
              Failed attempts: {retryCount}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onRetry}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Retry Real AI Analysis
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Go Back
            </button>
          </div>
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

  // Only show data if we have real AI data - no fallback allowed
  if (!data) {
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
          <div style={{ fontSize: '3rem' }}>🤖</div>
          <h3 style={{ color: '#6b7280', margin: 0 }}>No Real AI Data Available</h3>
          <p style={{ color: '#6b7280', textAlign: 'center', maxWidth: '400px' }}>
            Career profile analysis requires real AI-generated data. No fallback data will be displayed.
          </p>
          <button
            onClick={onRetry}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Generate Real AI Analysis
          </button>
        </div>
      </div>
    );
  }

  const profileData = data;
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
