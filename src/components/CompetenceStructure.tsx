import React from 'react';
import { CompetenceStructure } from '@/types/career-profile';

interface CompetenceStructureProps {
  data?: CompetenceStructure;
  isLoading?: boolean;
  className?: string;
}

// 默认数据已移除 - 只使用真实AI数据

export const CompetenceStructureComponent: React.FC<CompetenceStructureProps> = ({
  data,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`competence-structure-loading ${className}`} style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #4285f4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Analyzing your competence structure with real AI...</p>
      </div>
    );
  }

  // 只有真实数据才显示，不使用默认数据
  if (!data) {
    return (
      <div className={`competence-structure-no-data ${className}`} style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫</div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>No Real AI Data</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Only real AI analysis will be displayed</p>
      </div>
    );
  }

  return (
    <div className={`competence-structure ${className}`}>
      {/* Header */}
      <div className="right-panel-header">
        <div className="panel-title">
          <span className="title-icon">👤</span>
          <h2>Your Competence Structure</h2>
        </div>
      </div>

      <div className="right-panel-content">
        {/* Objective Abilities Section */}
        <div className="competence-section objective-abilities">
          <div className="section-header">
            <span className="section-icon">🎯</span>
            <h3>Objective Abilities</h3>
          </div>
          <p className="section-subtitle">Skills evidenced through your experiences and documents</p>
          
          <div className="abilities-list">
            {data.objectiveAbilities.abilities.map((ability, index) => (
              <div key={index} className="ability-item">
                <div className="skill-info">
                  <div className={`skill-icon ${ability.confidenceLevel === 'high' ? 'purple' : ability.confidenceLevel === 'medium' ? 'blue' : 'gray'}`}>
                    {ability.confidenceLevel === 'high' ? '●' : ability.confidenceLevel === 'medium' ? '◐' : '○'}
                  </div>
                  <span className="skill-name">{ability.name}</span>
                </div>
                <div className="skill-reference">{ability.evidence}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjective Abilities Section */}
        <div className="competence-section subjective-abilities">
          <div className="section-header">
            <span className="section-icon">💭</span>
            <h3>Subjective Abilities</h3>
          </div>
          <p className="section-subtitle">Self-perceived strengths and cognitive patterns</p>
          
          <div className="abilities-list">
            {data.subjectiveAbilities.selfStatements.map((statement, index) => (
              <div key={index} className="ability-item">
                <div className="skill-info">
                  <div className="skill-icon pink">💡</div>
                  <span className="skill-name">{statement.label}</span>
                </div>
                <div className="skill-reference">{statement.userInput}</div>
                {statement.insight && (
                  <div className="skill-insight">{statement.insight}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills Development Section */}
        <div className="competence-section skills-development">
          <div className="section-header">
            <span className="section-icon">📈</span>
            <h3>Skills Still in Development</h3>
          </div>
          <p className="section-subtitle">Recommended areas for growth and enhancement</p>
          
          <div className="development-table">
            <div className="table-header">
              <div className="col-skill">Skill Area</div>
              <div className="col-level">Current Level</div>
              <div className="col-action">Suggested Action</div>
            </div>
            
            {data.developmentPotential.skills.map((skill, index) => (
              <div key={index} className="table-row">
                <div className="col-skill">
                  <div className="skill-info">
                    <div className={`skill-icon ${skill.priority === 'high' ? 'purple' : skill.priority === 'medium' ? 'blue' : 'gray'}`}>
                      {skill.priority === 'high' ? '🔥' : skill.priority === 'medium' ? '⚡' : '💡'}
                    </div>
                    <span className="skill-name">{skill.name}</span>
                  </div>
                </div>
                <div className="col-level">{skill.currentStatus}</div>
                <div className="col-action">{skill.suggestion}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Structure Summary */}
        <div className="structure-summary">
          <h4 style={{ 
            color: '#1f2937', 
            fontSize: '1rem', 
            fontWeight: '600', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>📋</span>
            Overall Assessment
          </h4>
          <p style={{
            color: '#4b5563',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: 0,
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            {data.structureSummary.evaluationText}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CompetenceStructureComponent;
