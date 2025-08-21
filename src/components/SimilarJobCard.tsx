import React from 'react';
import { SimilarJobDirection } from '@/types/job';

interface SimilarJobCardProps {
  job: SimilarJobDirection;
  index: number;
  onClick?: () => void;
}

const SimilarJobCard: React.FC<SimilarJobCardProps> = ({ job, onClick }) => {
  // 处理匹配等级，支持数字和字符串格式
  const getMatchLevel = (level: number | string): number => {
    if (typeof level === 'string') {
      // 如果是星级格式，计算星星数量
      const starCount = (level.match(/★/g) || []).length;
      return starCount > 0 ? starCount : 3; // 默认3星
    }
    return level;
  };

  const matchLevel = getMatchLevel(job.match_level);

  // 根据匹配等级确定背景颜色
  const getBackgroundColor = (level: number) => {
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
      className="similar-job-card"
      style={{ backgroundColor: getBackgroundColor(matchLevel) }}
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
          {renderStars(matchLevel)}
        </div>
      </div>


    </div>
  );
};

export default SimilarJobCard;
