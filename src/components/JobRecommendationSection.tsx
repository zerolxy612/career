import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import JobRecommendationCard from './JobRecommendationCard';
import SimilarJobCard from './SimilarJobCard';
import JobDetailModal from './JobDetailModal';
import { JobDirection, JobRecommendationRequest, JobRecommendationResponse, SimilarJobsRequest, SimilarJobsResponse, SimilarJob, RecommendationContext, SharedCompetency } from '@/types/job';
import { CareerProfileAnalysis } from '@/types/career-profile';

interface JobRecommendationSectionProps {
  careerProfileData: CareerProfileAnalysis | null;
}

// Interface for card data from localStorage
interface StoredCard {
  id: string;
  category: string;
  cardPreview: {
    experienceName: string;
  };
  cardDetail: {
    experienceName: string;
    timeAndLocation: string;
    backgroundContext: string;
    myRoleAndTasks: string;
    taskDetails: string;
    reflectionAndResults: string;
    highlightSentence: string;
  };
}

const JobRecommendationSection: React.FC<JobRecommendationSectionProps> = ({ careerProfileData }) => {
  const [jobDirections, setJobDirections] = useState<JobDirection[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDirection | null>(null);
  const [similarJobs, setSimilarJobs] = useState<SimilarJob[]>([]);
  const [recommendationContext, setRecommendationContext] = useState<RecommendationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimilarJobsLoading, setIsSimilarJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 从localStorage获取用户数据
  const getUserData = () => {
    try {
      const userGoal = localStorage.getItem('userGoal');
      const selectedIndustry = localStorage.getItem('selectedIndustry');
      const selectedCombination = localStorage.getItem('selectedCombination');

      if (!userGoal || !selectedIndustry || !selectedCombination) {
        throw new Error('Missing required user data');
      }

      const industryData = JSON.parse(selectedIndustry);
      const combinationData = JSON.parse(selectedCombination);

      return {
        userGoal,
        selectedIndustry: industryData.cardPreview?.fieldName || industryData.fieldName || 'Unknown',
        selectedCards: combinationData.cards?.map((card: StoredCard) => ({
          id: card.id,
          experienceName: card.cardPreview.experienceName,
          category: card.category,
          cardDetail: card.cardDetail
        })) || []
      };
    } catch (error) {
      console.error('❌ [JOB_RECOMMENDATION] Error getting user data:', error);
      throw error;
    }
  };

  // 加载工作推荐
  const loadJobRecommendations = useCallback(async (showLoading = true) => {
    if (!careerProfileData) {
      console.log('⚠️ [JOB_RECOMMENDATION] No career profile data available');
      return;
    }

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      console.log('🔄 [JOB_RECOMMENDATION] Loading job recommendations...');

      const userData = getUserData();
      
      const requestData: JobRecommendationRequest = {
        userGoal: userData.userGoal,
        selectedIndustry: userData.selectedIndustry,
        careerProfileData: careerProfileData ? {
          userGoal: userData.userGoal,
          selectedIndustry: userData.selectedIndustry,
          analysisResults: {
            radarData: careerProfileData.radarData,
            quadrantData: careerProfileData.quadrantData,
            competenceStructure: careerProfileData.competenceStructure
          },
          metadata: {
            analysisTimestamp: careerProfileData.analysisMetadata?.analysisTimestamp,
            confidenceScore: careerProfileData.analysisMetadata?.confidenceScore
          }
        } : {
          userGoal: userData.userGoal,
          selectedIndustry: userData.selectedIndustry
        },
        selectedCards: userData.selectedCards
      };

      console.log('📤 [JOB_RECOMMENDATION] Sending request:', {
        userGoal: userData.userGoal.substring(0, 100) + '...',
        selectedIndustry: userData.selectedIndustry,
        hasCareerProfile: !!careerProfileData,
        cardsCount: userData.selectedCards.length
      });

      const response = await fetch('/api/ai/generate-job-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: JobRecommendationResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to get job recommendations');
      }

      console.log('✅ [JOB_RECOMMENDATION] Job directions loaded:', {
        directionsCount: data.data.directions.length,
        processingTime: data.processingTime + 'ms'
      });

      setJobDirections(data.data.directions);
      setHasLoadedOnce(true);

    } catch (error) {
      console.error('❌ [JOB_RECOMMENDATION] Error loading job recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load job recommendations');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [careerProfileData]);

  // 自动加载推荐（仅在有职业画像数据时）
  useEffect(() => {
    if (careerProfileData && !hasLoadedOnce) {
      loadJobRecommendations();
    }
  }, [careerProfileData, hasLoadedOnce, loadJobRecommendations]);

  // 加载相似岗位推荐
  const loadSimilarJobs = async (job: JobDirection) => {
    try {
      setIsSimilarJobsLoading(true);

      const userData = getUserData();

      const requestData: SimilarJobsRequest = {
        selectedJob: job,
        userGoal: userData.userGoal,
        selectedCards: userData.selectedCards
      };

      console.log('📤 [SIMILAR_JOBS] Sending request for similar jobs:', job.target_position);

      const response = await fetch('/api/ai/generate-similar-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimilarJobsResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to get similar jobs');
      }

      console.log('✅ [SIMILAR_JOBS] Similar jobs loaded:', {
        similarJobsCount: data.data.similar_jobs.length,
        targetRole: data.data.recommendation_context.target_role
      });

      setSimilarJobs(data.data.similar_jobs);
      setRecommendationContext(data.data.recommendation_context);

    } catch (error) {
      console.error('❌ [SIMILAR_JOBS] Error loading similar jobs:', error);
    } finally {
      setIsSimilarJobsLoading(false);
    }
  };

  // 处理岗位选择
  const handleJobSelect = (job: JobDirection) => {
    if (selectedJob?.target_position === job.target_position) {
      // 如果点击的是已选中的岗位，显示详情弹窗
      setIsModalOpen(true);
    } else {
      // 如果点击的是新岗位，选中并加载相似岗位
      setSelectedJob(job);
      loadSimilarJobs(job);
    }
  };

  // 刷新推荐
  const handleRefresh = () => {
    loadJobRecommendations(true);
  };

  // 再来一批相似岗位
  const handleRefreshSimilarJobs = () => {
    if (selectedJob) {
      loadSimilarJobs(selectedJob);
    }
  };

  if (!careerProfileData) {
    return (
      <div className="job-recommendation-section">
        <div className="recommendation-card">
          <div className="card-content">
            <div className="no-data-message">
              <p>Please complete your Career Profile Result first to see job recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="job-recommendation-section">
      {/* Based on Target Goal Section */}
      <div className="target-goal-section">
        <div className="section-header">
          <h3>Based on Target Goal</h3>
          <Image
            src="/refresh.png"
            alt="Refresh"
            width={20}
            height={20}
            className="refresh-icon"
            onClick={handleRefresh}
            title="Refresh recommendations"
            style={{
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Generating personalized job recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>❌ {error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {/* Job Directions */}
        {!isLoading && !error && jobDirections.length > 0 && (
          <div className="job-recommendations-container">
            {jobDirections.map((job, index) => (
              <JobRecommendationCard
                key={`${job.target_position}-${index}`}
                job={job}
                index={index}
                isSelected={selectedJob?.target_position === job.target_position}
                onClick={() => handleJobSelect(job)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Adjacent Fields Suggestions Section */}
      <div className="adjacent-fields-section">
        <div className="section-header">
          <h3> Adjacent Fields Suggestions</h3>
          {similarJobs.length > 0 && (
            <Image
              src="/refresh.png"
              alt="Refresh"
              width={20}
              height={20}
              className="refresh-icon"
              onClick={handleRefreshSimilarJobs}
              title="Get another batch"
              style={{
                cursor: isSimilarJobsLoading ? 'not-allowed' : 'pointer',
                opacity: isSimilarJobsLoading ? 0.5 : 1
              }}
            />
          )}
        </div>

        {/* Recommendation Context - 只在选中岗位时显示 */}
        {selectedJob && recommendationContext && (
          <div className="recommendation-context">
            <div className="context-header">
              <h4>💡 Why we also suggest this?</h4>
            </div>
            <div className="context-content">
              <p className="context-reasoning">
                Based on your target role: <span className="target-role-name">{recommendationContext.target_role || selectedJob.target_position}</span>.
              </p>
              <p className="context-description">
                Shares core competencies with Below Job in these areas:
              </p>
              <div className="competencies-list">
                {recommendationContext.shared_competencies && recommendationContext.shared_competencies.length > 0 ? (
                  recommendationContext.shared_competencies.map((competency: SharedCompetency, index: number) => (
                    <div key={index} className="competency-item">
                      <span className="competency-icon">{competency.icon}</span>
                      <span className="competency-name">{competency.competency}</span>
                    </div>
                  ))
                ) : (
                  // 默认显示的核心能力
                  <>
                    <div className="competency-item">
                      <span className="competency-icon">😕</span>
                      <span className="competency-name">Market Insight</span>
                    </div>
                    <div className="competency-item">
                      <span className="competency-icon">🎯</span>
                      <span className="competency-name">Creative Expression</span>
                    </div>
                    <div className="competency-item">
                      <span className="competency-icon">📄</span>
                      <span className="competency-name">Execution Coordination</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Default message when no job is selected */}
        {!selectedJob && (
          <div className="adjacent-placeholder">
            <p>Want to know what other positions you might be suited for?</p>
            <p>Get more inspiration by clicking the 💡 button</p>
            <p>on the left hand side of the suggested posts!</p>
          </div>
        )}

        {/* Loading state for similar jobs */}
        {isSimilarJobsLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding similar positions...</p>
          </div>
        )}

        {/* Similar Jobs */}
        {!isSimilarJobsLoading && similarJobs.length > 0 && (
          <div className="similar-jobs-container">
            {similarJobs.map((job, index) => (
              <SimilarJobCard
                key={`${job.job_title}-${index}`}
                job={job}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        recommendationContext={recommendationContext || undefined}
      />
    </div>
  );
};

export default JobRecommendationSection;
