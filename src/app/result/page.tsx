'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCard } from '@/types/card';
import './result.css';

interface CombinationData {
  option: string;
  cards: ExperienceCard[];
}

export default function ResultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs'>('profile');
  const [combinationData, setCombinationData] = useState<CombinationData | null>(null);

  useEffect(() => {
    // Load combination data from localStorage
    const storedCombination = localStorage.getItem('selectedCombination');
    console.log('📋 [RESULT] Loading combination data:', storedCombination);

    if (storedCombination) {
      try {
        const parsedData = JSON.parse(storedCombination);
        console.log('✅ [RESULT] Parsed combination data:', {
          option: parsedData.option,
          cardsCount: parsedData.cards?.length || 0,
          cardNames: parsedData.cards?.map((c: ExperienceCard) => c.cardPreview?.experienceName) || []
        });
        setCombinationData(parsedData);
      } catch (error) {
        console.error('❌ [RESULT] Error parsing combination data:', error);
        // Redirect back if data is invalid
        router.push('/combination');
      }
    } else {
      console.log('⚠️ [RESULT] No combination data found, redirecting to combination page');
      // Redirect back if no data
      router.push('/combination');
    }
  }, [router]);

  const handleBack = () => {
    router.push('/combination');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting as PDF...');
    alert('PDF export functionality will be implemented in the next phase.');
  };

  return (
    <div className="result-page">
      <div className="result-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">FINAL RESULT</h1>
        </div>

        {/* Main Container */}
        <div className="main-container">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Career Profile Result
            </button>
            <button
              className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('jobs')}
            >
              Job Recommendation
            </button>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {activeTab === 'profile' ? (
              <CareerProfileResult combinationData={combinationData} />
            ) : (
              <JobRecommendation combinationData={combinationData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Career Profile Result Component
const CareerProfileResult = ({ combinationData }: { combinationData: CombinationData | null }) => {
  return (
    <div className="career-profile-section">
      <div className="profile-card">
        <div className="card-content">
          {/* Placeholder for radar chart */}
          <div className="chart-placeholder">
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="card-content">
          {/* Placeholder for scatter plot */}
          <div className="chart-placeholder">
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="card-content">
          {/* Placeholder for competency description */}
          <div className="text-placeholder">
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Recommendation Component
const JobRecommendation = ({ combinationData }: { combinationData: CombinationData | null }) => {
  return (
    <div className="job-recommendation-section">
      <div className="recommendation-card">
        <div className="card-content">
          <div className="competence-section">
            <div className="abilities-placeholder">
            </div>
          </div>

          <div className="competence-section">
            <div className="abilities-placeholder">
            </div>
          </div>

          <div className="competence-section">
            <div className="skills-table-placeholder">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
