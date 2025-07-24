'use client';

import { Copy } from 'lucide-react';
import { IndustryRecommendation } from '@/types/api';

interface IndustryCardProps {
  industry: IndustryRecommendation;
  isSelected: boolean;
  onSelect: () => void;
}

export default function IndustryCard({ industry, isSelected, onSelect }: IndustryCardProps) {
  const handleSelectClick = () => {
    onSelect();
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy card content to clipboard
    const cardText = `${industry.cardPreview.fieldName}\n${industry.cardPreview.fieldSummary}\nTags: ${industry.cardPreview.fieldTags.join(', ')}`;
    navigator.clipboard.writeText(cardText);
  };

  return (
    <div
      className={`yellow-industry-card ${isSelected ? 'selected' : ''}`}
      onClick={handleSelectClick}
    >
      {/* Card Header with Title */}
      <div className="yellow-card-header">
        <h3 className="yellow-card-title">
          {industry.cardPreview.fieldName}
        </h3>
        <button
          className="yellow-card-copy-btn"
          onClick={handleCopyClick}
          title="复制卡片内容"
        >
          <Copy size={16} />
        </button>
      </div>

      {/* Card Summary */}
      <p className="yellow-card-summary">
        {industry.cardPreview.fieldSummary}
      </p>

      {/* Card Tags */}
      <div className="yellow-card-tags">
        <span className="yellow-card-arrow">→</span>
        <span className="yellow-card-tags-text">
          {industry.cardPreview.fieldTags.map((tag, index) => (
            <span key={index}>
              "{tag}"{index < industry.cardPreview.fieldTags.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
