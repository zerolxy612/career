'use client';

import { Copy } from 'lucide-react';

interface YellowIndustryCardProps {
  title: string;
  summary: string;
  tags: string[];
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function YellowIndustryCard({ 
  title, 
  summary, 
  tags, 
  isSelected = false, 
  onSelect 
}: YellowIndustryCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <div 
      className={`yellow-industry-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {/* Card Header with Title */}
      <div className="yellow-card-header">
        <h3 className="yellow-card-title">
          {title}
        </h3>
        <button className="yellow-card-copy-btn">
          <Copy size={16} />
        </button>
      </div>
      
      {/* Card Summary */}
      <p className="yellow-card-summary">
        {summary}
      </p>
      
      {/* Card Tags */}
      <div className="yellow-card-tags">
        <span className="yellow-card-arrow">→</span>
        <span className="yellow-card-tags-text">
          {tags.map((tag, index) => (
            <span key={index}>
              &quot;{tag}&quot;{index < tags.length - 1 ? ', ' : ''}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
