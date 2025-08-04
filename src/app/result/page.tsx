'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperienceCard } from '@/types/card';
import CareerRadarChart from '@/components/visualization/CareerRadarChart';
import CareerAwarenessChart from '@/components/visualization/CareerAwarenessChart';
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
      {/* Left Panel - Complete Career Profile */}
      <div className="profile-card main-profile-full">
        {/* Header with centered icon and title */}
        <div className="card-header centered-header">
          <div className="header-content">
            <div className="user-icon">👤</div>
            <h2>Your Career Self-Concept</h2>
          </div>
          <p className="subtitle">Who You Are?</p>
        </div>

        {/* Radar Chart Section */}
        <div className="chart-section">
          <CareerRadarChart />
        </div>

        {/* Career Awareness Chart Section */}
        <div className="chart-section">
          <CareerAwarenessChart />
        </div>

        {/* Competency Description Section */}
        <div className="description-section">
          <div className="section-header">
            <h3>Your Competency Dimension Chart</h3>
          </div>
          <div className="competency-text">
            <p>
              You already possess several objective skills that can be clearly
              demonstrated to others — such as content planning, project execution,
              and cross-functional coordination. These are backed by real projects and
              cards from your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Competence Structure */}
      <div className="profile-card right-panel">
        <div className="right-panel-header">
          <div className="panel-title">
            <div className="title-icon">👤</div>
            <h2>Your Competence Structure</h2>
          </div>
        </div>

        <div className="right-panel-content">
          {/* Objective Abilities Section */}
          <div className="competence-section objective-abilities">
            <div className="section-header">
              <div className="section-icon">📋</div>
              <h3>Objective Abilities</h3>
            </div>
            <p className="section-subtitle">(Backed by actual experience & cards)</p>

            <div className="abilities-list">
              <div className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon purple">🎯</div>
                  <span className="skill-name">Project Management & Execution</span>
                </div>
                <span className="skill-reference">Product Research Lead – Delivered milestones on time</span>
              </div>

              <div className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon gray">💬</div>
                  <span className="skill-name">Cross-team Communication & Sync</span>
                </div>
                <span className="skill-reference">Campus Film Festival – Coordinated design, logistics</span>
              </div>

              <div className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon pink">📝</div>
                  <span className="skill-name">Content Planning & Structured Output</span>
                </div>
                <span className="skill-reference">Social Media Strategy – Built 2-month content calendar</span>
              </div>
            </div>
          </div>

          {/* Subjective Abilities Section */}
          <div className="competence-section subjective-abilities">
            <div className="section-header">
              <div className="section-icon">▶️</div>
              <h3>Subjective Abilities</h3>
            </div>
            <p className="section-subtitle">(Self-perceived, formed through reflection)</p>

            <div className="abilities-list">
              <div className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon blue">🔍</div>
                  <span className="skill-name">Fast Learning & Adaptability</span>
                </div>
                <span className="skill-insight">You often pick up new tools quickly in unfamiliar situations</span>
              </div>

              <div className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon purple">🤔</div>
                  <span className="skill-name">Abstract Thinking & Reflection</span>
                </div>
                <span className="skill-insight">You regularly reflect on tasks and extract general principles</span>
              </div>
            </div>
          </div>

          {/* Skills Still in Development Section */}
          <div className="competence-section skills-development">
            <div className="section-header">
              <div className="section-icon">⚠️</div>
              <h3>2. Skills Still in Development</h3>
            </div>

            <div className="development-table">
              <div className="table-header">
                <div className="col-skill">Skill Area</div>
                <div className="col-level">Current Level</div>
                <div className="col-action">Suggested Action</div>
              </div>

              <div className="table-row">
                <div className="col-skill">
                  <div className="skill-info">
                    <div className="skill-icon blue">📊</div>
                    <span>Data Tool Proficiency</span>
                  </div>
                </div>
                <div className="col-level">Basic understanding, limited hands-on use</div>
                <div className="col-action">Practice with Excel, Python, or visualization tools</div>
              </div>

              <div className="table-row">
                <div className="col-skill">
                  <div className="skill-info">
                    <div className="skill-icon gray">💭</div>
                    <span>Technical Expression</span>
                  </div>
                </div>
                <div className="col-level">Clear ideas, but lack structure in output</div>
                <div className="col-action">Try mind maps, diagrams, or presentation building</div>
              </div>

              <div className="table-row">
                <div className="col-skill">
                  <div className="skill-info">
                    <div className="skill-icon purple">📈</div>
                    <span>Business Metric Sense</span>
                  </div>
                </div>
                <div className="col-level">Limited awareness of ROI, retention, CPA</div>
                <div className="col-action">Study real business/growth cases and analytics logic</div>
              </div>
            </div>
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
