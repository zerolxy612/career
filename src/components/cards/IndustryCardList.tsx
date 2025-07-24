'use client';

import { useState } from 'react';
import IndustryCard from './IndustryCard';
import { IndustryRecommendation } from '../../types/api';

interface IndustryCardListProps {
  industries: IndustryRecommendation[];
  onSelectionChange: (selectedIndustry: IndustryRecommendation | null) => void;
}

export default function IndustryCardList({ industries, onSelectionChange }: IndustryCardListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    const newSelectedIndex = selectedIndex === index ? null : index;
    setSelectedIndex(newSelectedIndex);
    
    const selectedIndustry = newSelectedIndex !== null ? industries[newSelectedIndex] : null;
    onSelectionChange(selectedIndustry);
  };

  if (!industries || industries.length === 0) {
    return (
      <div className="industry-list-empty">
        <p>暂无推荐行业，请输入目标并点击确认</p>
      </div>
    );
  }

  return (
    <div className="industry-card-list">
      <div className="industry-cards-container">
        {industries.map((industry, index) => (
          <IndustryCard
            key={index}
            industry={industry}
            isSelected={selectedIndex === index}
            onSelect={() => handleSelect(index)}
          />
        ))}
      </div>
    </div>
  );
}
