'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCard } from '@/types/card';
import './result.css';



export default function ResultPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs'>('profile');
  // Removed combinationData state as it's not currently used

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
        // Data loaded successfully - no need to store in state currently
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

  // Removed unused handlers - functionality will be added later if needed

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
              <CareerProfileResult />
            ) : (
              <JobRecommendation />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Career Profile Result Component
const CareerProfileResult = () => {
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
const JobRecommendation = () => {
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
