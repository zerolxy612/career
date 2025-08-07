import React from 'react';
import { JobDirection } from '@/types/job';
import { RecommendationContext } from '@/types/job';

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobDirection | null;
  recommendationContext?: RecommendationContext;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  job, 
  recommendationContext 
}) => {
  if (!isOpen || !job) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 弹窗标题 */}
        <div className="modal-header">
          <h2>💡 Why we also suggest this?</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* 弹窗内容 */}
        <div className="modal-body">
          {/* 推荐理由 */}
          <div className="recommendation-reason">
            <p>
              Based on your target role: <strong>{recommendationContext?.target_role || job.target_position}</strong>.
            </p>
            <p>Shares core competencies with Below Job in these areas:</p>
          </div>

          {/* 相似内核 */}
          <div className="shared-competencies">
            {recommendationContext?.shared_competencies ? (
              recommendationContext.shared_competencies.map((competency, index) => (
                <div key={index} className="competency-item">
                  <span className="competency-icon">{competency.icon}</span>
                  <span className="competency-name">{competency.competency}</span>
                </div>
              ))
            ) : (
              // 如果没有相似内核数据，显示默认内容
              <div className="default-competencies">
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
              </div>
            )}
          </div>

          {/* 工作详细信息 */}
          <div className="job-details">
            <div className="detail-section">
              <h3>Direction Summary</h3>
              <p>{job.direction_summary}</p>
            </div>

            <div className="detail-section">
              <h3>System Recommendation Reason</h3>
              <p>{job.recommendation_reason}</p>
            </div>

            <div className="detail-section">
              <h3>Explore this Direction</h3>
              <p>{job.explore_instruction}</p>
            </div>

            <div className="detail-section">
              <h3>Based on Experience Cards</h3>
              <ul>
                {job.based_on_experience_cards.map((card, index) => (
                  <li key={index}>{card}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h3>Job Requirements</h3>
              <ul>
                {job.job_requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>

            <div className="detail-section">
              <h3>Direction Tags</h3>
              <div className="tags-container">
                {job.direction_tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
