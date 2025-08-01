'use client';

import { useState, useEffect } from 'react';
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
  recommendedCards: any[];
  availableCards: any[];
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

  useEffect(() => {
    if (isOpen && recommendedCards.length > 0) {
      fetchCombinationDetails();
    }
  }, [isOpen, optionType, recommendedCards]);

  const fetchCombinationDetails = async () => {
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
  };

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
              {/* Option Name */}
              <div className="section">
                <h3 className="option-name">{detailsData.推荐路径选项.option名称}</h3>
                <p className="logic-summary">{detailsData.推荐路径选项.匹配逻辑摘要}</p>
              </div>

              {/* Why this combination */}
              <div className="section">
                <h4 className="section-title">Why this combination</h4>
                <div className="target-position">
                  <strong>Target Position:</strong> {detailsData.推荐路径选项['Why this combination'].目标岗位}
                </div>
                
                <div className="identified-abilities">
                  <strong>Identified Abilities:</strong>
                  <ul>
                    {detailsData.推荐路径选项['Why this combination'].识别能力.map((ability, index) => (
                      <li key={index}>{ability}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="combination-explanation">
                  <strong>Combination Explanation:</strong>
                  <p>{detailsData.推荐路径选项['Why this combination'].组合解释}</p>
                </div>
              </div>

              {/* Card Combination */}
              <div className="section">
                <h4 className="section-title">Card Combination</h4>
                <div className="cards-list">
                  {detailsData.推荐路径选项.卡片组合.map((card, index) => (
                    <div key={index} className="card-item">
                      <div className="card-name">{card.卡片名称}</div>
                      <div className="card-role">{card.角色定位}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplementary Suggestions */}
              <div className="section">
                <h4 className="section-title">Supplementary Suggestions</h4>
                <ul className="suggestions-list">
                  {detailsData.推荐路径选项.补充建议方向.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              {/* Risks and Recommendations */}
              <div className="section">
                <h4 className="section-title">Risks & Recommendations</h4>
                
                <div className="risks">
                  <strong>Potential Challenges:</strong>
                  <ul>
                    {detailsData.推荐路径选项.风险与建议.潜在挑战.map((challenge, index) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="recommendations">
                  <strong>Action Recommendations:</strong>
                  <ul>
                    {detailsData.推荐路径选项.风险与建议.行动建议.map((action, index) => (
                      <li key={index}>{action}</li>
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
