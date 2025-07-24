'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndustryRecommendation } from '@/types/api';

export default function ExperiencePage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);
  const [userGoal, setUserGoal] = useState<string>('');

  useEffect(() => {
    // Load selected industry from localStorage
    const storedIndustry = localStorage.getItem('selectedIndustry');
    const storedGoal = localStorage.getItem('userGoal');
    
    if (storedIndustry) {
      setSelectedIndustry(JSON.parse(storedIndustry));
    }
    
    if (storedGoal) {
      setUserGoal(storedGoal);
    }
    
    // If no selected industry, redirect back to goal setting
    if (!storedIndustry) {
      router.push('/');
    }
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#4285f4',
            marginBottom: '1rem'
          }}>
            EXPERIENCE CARDS
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666',
            marginBottom: '2rem'
          }}>
            Generate experience cards based on your selected career direction
          </p>
        </div>

        {/* Selected Industry Display */}
        {selectedIndustry && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #4285f4'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#4285f4',
              marginBottom: '1rem'
            }}>
              Selected Career Direction
            </h2>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600', 
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              {selectedIndustry.cardPreview.fieldName}
            </h3>
            <p style={{ 
              color: '#666', 
              marginBottom: '1rem'
            }}>
              {selectedIndustry.cardPreview.fieldSummary}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedIndustry.cardPreview.fieldTags.map((tag, index) => (
                <span 
                  key={index}
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User Goal Display */}
        {userGoal && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '1rem'
            }}>
              Your Career Goal
            </h2>
            <p style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              {userGoal}
            </p>
          </div>
        )}

        {/* Experience Cards Generation Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#333',
            marginBottom: '1rem'
          }}>
            Experience Cards Generation
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            This is the initial interface for experience card generation.
            <br />
            Here you will be able to upload and analyze your experience documents
            <br />
            to generate personalized experience cards.
          </p>
          
          {/* Placeholder for future functionality */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e0',
            borderRadius: '12px',
            padding: '3rem',
            marginBottom: '2rem'
          }}>
            <p style={{ 
              color: '#a0aec0', 
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              Experience Card Generation Interface
              <br />
              <span style={{ fontSize: '1rem' }}>
                (To be implemented in next phase)
              </span>
            </p>
          </div>

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            <button
              onClick={() => router.push('/')}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
            >
              Back to Goal Setting
            </button>
            
            <button
              style={{
                backgroundColor: '#e9ecef',
                color: '#6c757d',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'not-allowed'
              }}
              disabled
            >
              Continue (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
