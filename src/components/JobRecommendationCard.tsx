import React from 'react';
import { JobDirection } from '@/types/job';

interface JobRecommendationCardProps {
  job: JobDirection;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const JobRecommendationCard: React.FC<JobRecommendationCardProps> = ({
  job,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index: _index,
  isSelected = false,
  onClick
}) => {
  // 根据匹配等级确定背景颜色
  const getBackgroundColor = (level: number, selected: boolean) => {
    if (selected) return '#e3f2fd'; // 选中状态的蓝色

    if (level >= 5) return '#e8f5e8'; // 绿色 - 5星
    if (level >= 4) return '#fff3cd'; // 黄色 - 4星
    if (level >= 3) return '#f8d7da'; // 粉色 - 3星
    if (level >= 2) return '#d1ecf1'; // 蓝色 - 2星
    return '#f3f4f6'; // 灰色 - 1星
  };

  // 根据匹配等级显示星级
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

  return (
    <div
      className={`job-recommendation-card ${isSelected ? 'selected' : ''}`}
      style={{ backgroundColor: getBackgroundColor(job.match_level, isSelected) }}
      onClick={onClick}
    >
      {/* 工作标题和匹配度 - 左右布局 */}
      <div className="job-header">
        {/* 左侧：图标 + Job Title */}
        <div className="job-title-section">
          <div className="job-icon">📌</div>
          <div className="job-title-content">
            <span className="job-title-label">Job Title:</span>
            <span className="job-title">{job.target_position}</span>
          </div>
        </div>

        {/* 右侧：搜索图标 */}
        <div className="job-search-icon">
          🔍
        </div>
      </div>

      {/* Match Level - 独立行 */}
      <div className="match-level-section">
        <span className="match-level-label">Match Level:</span>
        <div className="match-level-stars">
          {renderStars(job.match_level)}
        </div>
      </div>
    </div>
  );
};

export default JobRecommendationCard;
