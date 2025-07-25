'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndustryRecommendation } from '@/types/api';
import { CardDirection } from '@/types/card';
import { CardCategory } from '@/components/CardCategory';
import { FloatingUploadButton } from '@/components/FileUpload';

// Mock data for demonstration
const mockDirections: CardDirection[] = [
  {
    id: 'direction-1',
    title: 'AI DIRECTION 1',
    subtitle: 'Strongly aligned with your current goal, Let\'s fill the Cards together',
    description: 'Strongly aligned with your current goal',
    isExpanded: true,
    cards: [],
    extractedCount: 0,
    aiRecommendedCount: 0
  },
  {
    id: 'direction-2',
    title: 'AI DIRECTION 2',
    subtitle: 'Potential to support your development path, Let\'s fill the Cards together',
    description: 'Potential to support your development path',
    isExpanded: false,
    cards: [],
    extractedCount: 3,
    aiRecommendedCount: 2
  },
  {
    id: 'direction-3',
    title: 'AI DIRECTION 3',
    subtitle: 'Potential to support your development path, Let\'s fill the Cards together',
    description: 'Potential to support your development path',
    isExpanded: false,
    cards: [],
    extractedCount: 3,
    aiRecommendedCount: 2
  }
];

export default function ExperiencePage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);
  const [userGoal, setUserGoal] = useState<string>('');
  const [directions, setDirections] = useState(mockDirections);
  const [hasInteracted, setHasInteracted] = useState(false);

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

  const toggleDirection = (directionId: string) => {
    setDirections(prev => prev.map(dir =>
      dir.id === directionId
        ? { ...dir, isExpanded: !dir.isExpanded }
        : dir
    ));
  };

  const handleCardClick = (cardId: string) => {
    console.log('Card clicked:', cardId);
    setHasInteracted(true);
    // TODO: Implement card detail view
  };

  const handleCreateNewCard = () => {
    console.log('Create new card clicked');
    setHasInteracted(true);
    // TODO: Implement create new card functionality
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    setHasInteracted(true);
    // TODO: Implement file processing logic
    // This would typically involve:
    // 1. Upload file to server
    // 2. Process file content (extract text, analyze)
    // 3. Generate experience cards from content
    // 4. Update directions state with new cards

    // For now, just show a success message
    alert(`File "${file.name}" uploaded successfully! Processing will be implemented in the next phase.`);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleNext = () => {
    // Check if user has at least one card or has interacted with the interface
    const hasCards = directions.some(dir => dir.cards.length > 0);

    if (!hasCards && !hasInteracted) {
      alert('Please add at least one experience card or upload a file before proceeding.');
      return;
    }

    // Save current state to localStorage for next page
    localStorage.setItem('experienceDirections', JSON.stringify(directions));
    localStorage.setItem('hasInteracted', JSON.stringify(hasInteracted));

    // TODO: Navigate to next step (card combination/analysis page)
    console.log('Proceeding to next step...');
    alert('Next step will be implemented in the next phase. Your progress has been saved.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            backgroundColor: '#333',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            i
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#4285f4',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            RELEVANT CARDS
          </h1>

          <div style={{
            width: '2rem',
            height: '2rem',
            border: '2px solid #4285f4',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '1rem',
              height: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
              <div style={{ width: '100%', height: '2px', backgroundColor: '#4285f4' }}></div>
            </div>
          </div>
        </div>

        {/* Card Directions */}
        <div style={{ marginBottom: '2rem' }}>
          {directions.map((direction, index) => (
            <CardCategory
              key={direction.id}
              direction={direction}
              onToggle={toggleDirection}
              onCardClick={handleCardClick}
              onCreateNewCard={handleCreateNewCard}
              isFirstDirection={index === 0}
            />
          ))}
        </div>

        {/* Floating Upload Button */}
        <FloatingUploadButton onFileSelect={handleFileUpload} />

        {/* Navigation Buttons */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          gap: '1rem',
          zIndex: 100
        }}>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            style={{
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3367d6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4285f4'}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
