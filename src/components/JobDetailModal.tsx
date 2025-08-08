import React, { useState, useEffect } from 'react';
import { JobDirection, CoverLetterSentence } from '@/types/job';
import { RecommendationContext } from '@/types/job';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDirection | null;
  recommendationContext?: RecommendationContext;
  userGoal: string;
  experienceCards: Array<{
    id: string;
    experienceName: string;
    cardDetail: {
      experienceName: string;
      timeAndLocation: string;
      backgroundContext: string;
      myRoleAndTasks: string;
      taskDetails: string;
      reflectionAndResults: string;
      highlightSentence: string;
    };
  }>;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  recommendationContext,
  userGoal,
  experienceCards
}) => {
  const [coverLetter, setCoverLetter] = useState<{
    sentences: CoverLetterSentence[];
    metadata: {
      target_position: string;
      generated_at: string;
      word_count: number;
    };
  } | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);

  // Generate cover letter
  const generateCoverLetter = async () => {
    if (!job) return;

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetPosition: job.target_position,
          userGoal,
          experienceCards
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCoverLetter(data.data.cover_letter);
      } else {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('❌ Failed to generate cover letter:', error);
      setCoverLetterError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Download cover letter as text file
  const downloadCoverLetter = () => {
    if (!coverLetter || !job) return;

    const content = coverLetter.sentences.map(s => s.sentence).join(' ');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${job.target_position.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render stars for match level
  const renderStars = (level: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < level) {
        stars.push(<span key={i} className="star filled">⭐</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  // Auto-generate cover letter when modal opens - moved after all other hooks
  useEffect(() => {
    if (isOpen && job && !coverLetter && !isGeneratingCoverLetter) {
      generateCoverLetter();
    }
  }, [isOpen, job, coverLetter, isGeneratingCoverLetter]);

  // Early return after all hooks
  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content two-column" onClick={(e) => e.stopPropagation()}>
        {/* 弹窗标题 */}
        <div className="modal-header">
          <h2>💡 Job Details & Cover Letter</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* 左右分栏内容 */}
        <div className="modal-body two-column-body">
          {/* 左侧：岗位推荐信息 */}
          <div className="left-panel job-details-panel">
            {/* Target Position */}
            <div className="position-header">
              <h3 className="position-title">Target Position: {job.target_position}</h3>
              <div className="match-level-section">
                <span className="match-level-label">Match Level:</span>
                <div className="match-level-stars">
                  {renderStars(job.match_level)}
                </div>
              </div>
            </div>

            {/* Direction Summary */}
            <div className="detail-section">
              <h4>Direction Summary:</h4>
              <p className="summary-text">{job.direction_summary}</p>
            </div>

            {/* System Recommendation Reason */}
            <div className="detail-section">
              <h4>System Recommendation Reason:</h4>
              <p className="reason-text">{job.recommendation_reason}</p>
            </div>

            {/* Explore this Direction */}
            <div className="detail-section">
              <h4>Explore this Direction:</h4>
              <p className="explore-text">{job.explore_instruction}</p>
              <button className="search-button">
                <span className="search-icon">🔍</span>
                Search Jobs
              </button>
            </div>

            {/* Based on Experience Cards */}
            <div className="detail-section">
              <h4>Based on Your Experience Cards:</h4>
              <ul className="experience-cards-list">
                {job.based_on_experience_cards.map((card, index) => (
                  <li key={index} className="experience-card-item">
                    <span className="card-icon">📋</span>
                    <span className="card-name">{card}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Requirements */}
            <div className="detail-section">
              <h4>Job Requirements:</h4>
              <ul className="requirements-list">
                {job.job_requirements.map((requirement, index) => (
                  <li key={index} className="requirement-item">
                    <span className="requirement-bullet">•</span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Direction Tags */}
            <div className="detail-section">
              <h4>Direction Tags:</h4>
              <div className="tags-container">
                {job.direction_tags.map((tag, index) => (
                  <span key={index} className="direction-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：Cover Letter生成 */}
          <div className="right-panel cover-letter-panel">
            <div className="cover-letter-header">
              <h3 className="cover-letter-title">
                <span className="title-icon">📝</span>
                Personalized Cover Letter Draft
              </h3>
              <div className="cover-letter-actions">
                <button
                  className="action-button refresh-button"
                  onClick={generateCoverLetter}
                  disabled={isGeneratingCoverLetter}
                  title="Regenerate Cover Letter"
                >
                  🔄
                </button>
                <button
                  className="action-button edit-button"
                  disabled={!coverLetter}
                  title="Edit Cover Letter"
                >
                  📝
                </button>
                <button
                  className="action-button download-button"
                  onClick={downloadCoverLetter}
                  disabled={!coverLetter}
                  title="Download Cover Letter"
                >
                  💾
                </button>
              </div>
            </div>

            <div className="cover-letter-content">
              {isGeneratingCoverLetter && (
                <div className="cover-letter-loading">
                  <div className="loading-spinner"></div>
                  <p>Generating personalized cover letter...</p>
                </div>
              )}

              {coverLetterError && (
                <div className="cover-letter-error">
                  <p className="error-message">{coverLetterError}</p>
                  <button className="retry-button" onClick={generateCoverLetter}>
                    Try Again
                  </button>
                </div>
              )}

              {coverLetter && !isGeneratingCoverLetter && (
                <div className="cover-letter-text">
                  {coverLetter.sentences.map((sentence, index) => (
                    <div key={index} className="cover-letter-sentence">
                      <p className="sentence-text">{sentence.sentence}</p>
                      <div className="sentence-sources">
                        {sentence.source.map((source, sourceIndex) => (
                          <span key={sourceIndex} className="source-tag">
                            {source === 'User Goal' ? '🎯' :
                             source === 'General' ? '📄' : '📋'} {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
