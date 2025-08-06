'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './CombinationDetailsModal.css';

interface CombinationDetailsData {
  推荐路径选项: {
    option名称: string;
    匹配逻辑摘要: string;
    'Why this combination': {
      目标岗位: string;
      识别能力: string[];
      组合解释: string;
    };
    卡片组合: Array<{
      卡片名称: string;
      角色定位: string;
    }>;
    补充建议方向: string[];
    风险与建议: {
      潜在挑战: string[];
      行动建议: string[];
    };
  };
}

interface CombinationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionType: string;
  userGoal: string;
  selectedIndustry: string;
  recommendedCards: Array<{
    卡片名称: string;
    在故事中的角色?: string;
    角色定位?: string;
    cardPreview?: {
      experienceName: string;
      timeAndLocation: string;
      oneSentenceSummary: string;
    };
  }>;
  availableCards: Array<{
    id: string;
    cardPreview: {
      experienceName: string;
      timeAndLocation: string;
      oneSentenceSummary: string;
    };
    category: string;
  }>;
}

export const CombinationDetailsModal = ({
  isOpen,
  onClose,
  optionType,
  userGoal,
  selectedIndustry,
  recommendedCards,
  availableCards
}: CombinationDetailsModalProps) => {
  const [detailsData, setDetailsData] = useState<CombinationDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCombinationDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [MODAL] Fetching combination details for:', {
        optionType,
        recommendedCardsCount: recommendedCards.length
      });

      const response = await fetch('/api/ai/analyze-combination-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGoal,
          selectedIndustry,
          optionType,
          recommendedCards,
          availableCards
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [MODAL] Received combination details:', data);
      setDetailsData(data);
    } catch (error) {
      console.error('❌ [MODAL] Failed to fetch combination details:', error);
      setError('Failed to load combination details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userGoal, selectedIndustry, optionType, recommendedCards, availableCards]);

  useEffect(() => {
    if (isOpen && recommendedCards.length > 0) {
      fetchCombinationDetails();
    }
  }, [isOpen, fetchCombinationDetails, recommendedCards]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Combination Details</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing combination details...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={fetchCombinationDetails}>
                Try Again
              </button>
            </div>
          )}

          {detailsData && (
            <div className="details-content">
              {/* Matching Summary & Logic */}
              <div className="matching-summary">
                <p className="summary-label">Matching Summary & Logic</p>
                <p className="logic-summary">{detailsData.推荐路径选项.匹配逻辑摘要}</p>
              </div>

              {/* Why this combination */}
              <div className="why-combination">
                <h4 className="section-title">Why this combination?</h4>

                <div className="target-role-section">
                  <p className="target-role">
                    <span className="label">Your target role:</span> {detailsData.推荐路径选项['Why this combination'].目标岗位}
                  </p>
                  <p className="skills-label">→ Key skills identified:</p>
                  <ul className="skills-list">
                    {detailsData.推荐路径选项['Why this combination'].识别能力.map((ability, index) => (
                      <li key={index} className="skill-item">
                        <span className="checkmark">✅</span> {ability}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="combination-explanation">
                  <p>{detailsData.推荐路径选项['Why this combination'].组合解释}</p>
                </div>
              </div>

              {/* Strategy Direction & Card Breakdown */}
              <div className="strategy-section">
                <h4 className="section-title">Strategy Direction & Card Breakdown</h4>
                <p className="card-insight-label">Card Insight</p>

                <div className="cards-table">
                  <div className="table-header">
                    <div className="header-card">Card</div>
                    <div className="header-role">Role in Strategy</div>
                  </div>
                  {detailsData.推荐路径选项.卡片组合.map((card, index) => (
                    <div key={index} className="table-row">
                      <div className="card-name">{String.fromCharCode(65 + index)} - {card.卡片名称}</div>
                      <div className="card-role">{card.角色定位}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplementary Suggestions */}
              <div className="supplement-section">
                <p className="supplement-intro">To strengthen your match further, consider supplementing with:</p>
                <ul className="supplement-list">
                  {detailsData.推荐路径选项.补充建议方向.map((suggestion, index) => (
                    <li key={index} className="supplement-item">
                      <span className="supplement-icon">🌱</span> {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks & Tips */}
              <div className="risks-section">
                <h4 className="section-title">Risks & Tips</h4>

                <div className="potential-gaps">
                  <p className="subsection-title">Potential Gaps</p>
                  <ul className="gaps-list">
                    {detailsData.推荐路径选项.风险与建议.潜在挑战.map((challenge, index) => (
                      <li key={index} className="gap-item">{challenge}</li>
                    ))}
                  </ul>
                </div>

                <div className="tips-for-action">
                  <p className="subsection-title">Tips for Action</p>
                  <ul className="tips-list">
                    {detailsData.推荐路径选项.风险与建议.行动建议.map((action, index) => (
                      <li key={index} className="tip-item">{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
