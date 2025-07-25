'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IndustryRecommendation } from '@/types/api';
import { CardDirection, CompletionLevel, ExperienceCard, CardCategory as CardCategoryType } from '@/types/card';
import { CardCategory } from '@/components/CardCategory';
import { FloatingUploadButton } from '@/components/FileUpload';
import { ExperienceCardDetail, ExperienceDetailData } from '@/components/ExperienceCardDetail';

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentCardData, setCurrentCardData] = useState<ExperienceDetailData | undefined>(undefined);
  const [savedCards, setSavedCards] = useState<Map<string, ExperienceDetailData>>(new Map());
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Suppress unused variable warnings for future use
  void savedCards;
  void uploadedFiles;

  // Calculate completion percentage for experience data
  const calculateCompletionPercentage = (data: ExperienceDetailData): number => {
    const fields = Object.values(data);
    const filledFields = fields.filter(field => field.trim().length > 0);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  useEffect(() => {
    // Load selected industry from localStorage
    const storedIndustry = localStorage.getItem('selectedIndustry');
    const storedGoal = localStorage.getItem('userGoal');
    const storedFiles = localStorage.getItem('uploadedFiles');

    if (storedIndustry) {
      setSelectedIndustry(JSON.parse(storedIndustry));
    }

    if (storedGoal) {
      setUserGoal(storedGoal);
    }

    // Load uploaded files if any
    if (storedFiles) {
      try {
        const filesData = JSON.parse(storedFiles);
        // Note: We can't restore File objects from localStorage,
        // but we can check if files were uploaded
        console.log('Files were uploaded in previous step:', filesData.length);
      } catch (error) {
        console.error('Error parsing stored files:', error);
      }
    }

    // If no selected industry, redirect back to goal setting
    if (!storedIndustry) {
      router.push('/');
      return;
    }

    // Generate AI cards when component loads
    if (storedIndustry && storedGoal) {
      generateAICards(storedGoal, JSON.parse(storedIndustry), storedFiles ? JSON.parse(storedFiles) : []);
    }
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Define types for AI response
  interface AICardResponse {
    卡片分组: string;
    小卡展示: {
      经历名称: string;
      时间与地点: string;
      一句话概述: string;
    };
    详情卡展示: {
      经历名称: string;
      时间与地点: string;
      背景与情境说明: string;
      我的角色与任务: string;
      任务细节描述: string;
      反思与结果总结: string;
      高光总结句: string;
      生成来源: {
        类型: string;
      };
    };
  }

  // Convert AI response to ExperienceCard format
  const convertAICardToExperienceCard = (aiCard: AICardResponse): ExperienceCard => {
    const cardId = `ai-card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Map AI card category to our category system
    const categoryMap: { [key: string]: CardCategoryType } = {
      'Focus Match': 'Focus Match',
      'Growth Potential': 'Growth Potential',
      'Foundation Skills': 'Foundation Skills'
    };

    const category = categoryMap[aiCard.卡片分组] || 'Focus Match';

    return {
      id: cardId,
      category: category,
      cardPreview: {
        experienceName: aiCard.小卡展示.经历名称,
        timeAndLocation: aiCard.小卡展示.时间与地点,
        oneSentenceSummary: aiCard.小卡展示.一句话概述
      },
      cardDetail: {
        experienceName: aiCard.详情卡展示.经历名称,
        timeAndLocation: aiCard.详情卡展示.时间与地点,
        backgroundContext: aiCard.详情卡展示.背景与情境说明,
        myRoleAndTasks: aiCard.详情卡展示.我的角色与任务,
        taskDetails: aiCard.详情卡展示.任务细节描述,
        reflectionAndResults: aiCard.详情卡展示.反思与结果总结,
        highlightSentence: aiCard.详情卡展示.高光总结句,
        editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence']
      },
      completionLevel: 'complete' as const,
      source: {
        type: aiCard.详情卡展示.生成来源.类型 === 'uploaded_resume' ? 'uploaded_resume' : 'ai_generated'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // Generate AI cards based on user goal and industry
  const generateAICards = async (goal: string, industry: IndustryRecommendation, files: File[] = []) => {
    console.log('🤖 Generating AI cards...', { goal, industry: industry.cardPreview.fieldName, filesCount: files.length });
    setIsGeneratingCards(true);

    try {
      const formData = new FormData();
      formData.append('userGoal', goal);
      formData.append('selectedIndustry', industry.cardPreview.fieldName);

      // Add files if available (though we can't restore File objects from localStorage)
      // This is a limitation - in a real app, files would be stored on server
      files.forEach((file, index) => {
        console.log(`File ${index + 1} info:`, file.name);
        // We can't recreate File objects, so we'll just generate AI suggestions
      });

      console.log('📤 Sending request to generate experience cards...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ AI cards generated successfully:', data);

      // Convert AI cards to our format and organize by category
      const aiCards = data.经验卡片推荐.map(convertAICardToExperienceCard);

      // Group cards by category
      const cardsByCategory: { [key: string]: ReturnType<typeof convertAICardToExperienceCard>[] } = {
        'Focus Match': [],
        'Growth Potential': [],
        'Foundation Skills': []
      };

      aiCards.forEach((card: ReturnType<typeof convertAICardToExperienceCard>) => {
        const category = card.category;
        if (cardsByCategory[category]) {
          cardsByCategory[category].push(card);
        }
      });

      // Update directions with AI generated cards
      const updatedDirections = [
        {
          id: 'direction-1',
          title: 'Focus Match',
          subtitle: 'Experiences highly aligned with your career goal',
          description: 'These experiences directly support your target industry and role',
          isExpanded: true,
          cards: cardsByCategory['Focus Match'],
          extractedCount: cardsByCategory['Focus Match'].filter(c => c.source.type === 'uploaded_resume').length,
          aiRecommendedCount: cardsByCategory['Focus Match'].filter(c => c.source.type === 'ai_generated').length
        },
        {
          id: 'direction-2',
          title: 'Growth Potential',
          subtitle: 'Experiences that show your development potential',
          description: 'These experiences demonstrate your ability to learn and grow',
          isExpanded: false,
          cards: cardsByCategory['Growth Potential'],
          extractedCount: cardsByCategory['Growth Potential'].filter(c => c.source.type === 'uploaded_resume').length,
          aiRecommendedCount: cardsByCategory['Growth Potential'].filter(c => c.source.type === 'ai_generated').length
        },
        {
          id: 'direction-3',
          title: 'Foundation Skills',
          subtitle: 'Core skills and foundational experiences',
          description: 'These experiences build the foundation for your career development',
          isExpanded: false,
          cards: cardsByCategory['Foundation Skills'],
          extractedCount: cardsByCategory['Foundation Skills'].filter(c => c.source.type === 'uploaded_resume').length,
          aiRecommendedCount: cardsByCategory['Foundation Skills'].filter(c => c.source.type === 'ai_generated').length
        }
      ];

      setDirections(updatedDirections);
      console.log('🎉 Directions updated with AI cards');

    } catch (error) {
      console.error('❌ Error generating AI cards:', error);
      // Keep the mock directions as fallback
    } finally {
      setIsGeneratingCards(false);
    }
  };

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

    // Find the card in all directions
    let foundCard = null;
    for (const direction of directions) {
      foundCard = direction.cards.find(card => card.id === cardId);
      if (foundCard) break;
    }

    if (foundCard) {
      // Convert card detail to ExperienceDetailData format
      const cardData: ExperienceDetailData = {
        experienceName: foundCard.cardDetail.experienceName,
        locationAndTime: foundCard.cardDetail.timeAndLocation,
        scenarioIntroduction: foundCard.cardDetail.backgroundContext,
        myRole: foundCard.cardDetail.myRoleAndTasks,
        eventProcess: foundCard.cardDetail.taskDetails,
        reflection: foundCard.cardDetail.reflectionAndResults,
        oneLineHighlight: foundCard.cardDetail.highlightSentence
      };
      setCurrentCardData(cardData);
    } else {
      setCurrentCardData(undefined); // Create new card
    }

    setIsDetailModalOpen(true);
  };

  const handleCreateNewCard = () => {
    console.log('Create new card clicked');
    setHasInteracted(true);
    setCurrentCardData(undefined); // Create new card
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
  };

  const handleDetailModalSave = (data: ExperienceDetailData) => {
    console.log('Saving experience data:', data);
    setHasInteracted(true);

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(data);

    // Check if we're editing an existing card
    let existingCardId = null;
    let existingCard = null;

    for (const direction of directions) {
      existingCard = direction.cards.find(card => {
        const cardData = {
          experienceName: card.cardDetail.experienceName,
          locationAndTime: card.cardDetail.timeAndLocation,
          scenarioIntroduction: card.cardDetail.backgroundContext,
          myRole: card.cardDetail.myRoleAndTasks,
          eventProcess: card.cardDetail.taskDetails,
          reflection: card.cardDetail.reflectionAndResults,
          oneLineHighlight: card.cardDetail.highlightSentence
        };
        return JSON.stringify(cardData) === JSON.stringify(currentCardData);
      });
      if (existingCard) {
        existingCardId = existingCard.id;
        break;
      }
    }

    if (existingCardId && existingCard) {
      // Update existing card
      console.log('Updating existing card:', existingCardId);

      const updatedCard = {
        ...existingCard,
        cardPreview: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          oneSentenceSummary: data.oneLineHighlight || 'No summary available'
        },
        cardDetail: {
          ...existingCard.cardDetail,
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          backgroundContext: data.scenarioIntroduction || '',
          myRoleAndTasks: data.myRole || '',
          taskDetails: data.eventProcess || '',
          reflectionAndResults: data.reflection || '',
          highlightSentence: data.oneLineHighlight || ''
        },
        completionLevel: (completionPercentage >= 70 ? 'complete' : completionPercentage >= 30 ? 'partial' : 'incomplete') as CompletionLevel,
        updatedAt: new Date()
      };

      // Update the card in directions
      setDirections(prev => prev.map(dir => ({
        ...dir,
        cards: dir.cards.map(card =>
          card.id === existingCardId ? updatedCard : card
        )
      })));

      // Update saved cards
      setSavedCards(prev => new Map(prev.set(existingCardId, data)));

      alert(`Experience card updated successfully! Completion: ${completionPercentage}%`);
    } else {
      // Create new card
      const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      const newCard = {
        id: cardId,
        category: 'Focus Match' as const,
        cardPreview: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          oneSentenceSummary: data.oneLineHighlight || 'No summary available'
        },
        cardDetail: {
          experienceName: data.experienceName || 'Untitled Experience',
          timeAndLocation: data.locationAndTime || '',
          backgroundContext: data.scenarioIntroduction || '',
          myRoleAndTasks: data.myRole || '',
          taskDetails: data.eventProcess || '',
          reflectionAndResults: data.reflection || '',
          highlightSentence: data.oneLineHighlight || '',
          editableFields: ['experienceName', 'timeAndLocation', 'backgroundContext', 'myRoleAndTasks', 'taskDetails', 'reflectionAndResults', 'highlightSentence']
        },
        completionLevel: (completionPercentage >= 70 ? 'complete' : completionPercentage >= 30 ? 'partial' : 'incomplete') as CompletionLevel,
        source: {
          type: 'user_input' as const
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add the card to the first direction (Focus Match)
      setDirections(prev => prev.map(dir =>
        dir.id === 'direction-1'
          ? { ...dir, cards: [...dir.cards, newCard] }
          : dir
      ));

      // Save the card data
      setSavedCards(prev => new Map(prev.set(cardId, data)));

      alert(`Experience card created successfully! Completion: ${completionPercentage}%`);
    }

    setIsDetailModalOpen(false);
    setCurrentCardData(undefined);
  };

  const handleDeleteCard = (cardId: string) => {
    // Remove from saved cards
    setSavedCards(prev => {
      const newMap = new Map(prev);
      newMap.delete(cardId);
      return newMap;
    });

    // Remove from directions
    setDirections(prev => prev.map(dir => ({
      ...dir,
      cards: dir.cards.filter(card => card.id !== cardId)
    })));
  };

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file.name);
    setHasInteracted(true);
    setUploadedFiles(prev => [...prev, file]);

    if (!selectedIndustry || !userGoal) {
      alert('Missing user goal or selected industry. Please go back and complete the setup.');
      return;
    }

    try {
      setIsGeneratingCards(true);

      // Process the uploaded file and generate new AI cards
      const formData = new FormData();
      formData.append('userGoal', userGoal);
      formData.append('selectedIndustry', selectedIndustry.cardPreview.fieldName);
      formData.append('files', file);

      console.log('📤 Processing uploaded file and generating new cards...');
      const response = await fetch('/api/ai/generate-experience-cards', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ New AI cards generated from uploaded file:', data);

      // Convert AI cards to our format
      const newAICards = data.经验卡片推荐.map(convertAICardToExperienceCard);

      // Add new cards to existing directions
      setDirections(prev => prev.map(dir => {
        const newCards = newAICards.filter((card: ExperienceCard) => {
          if (dir.id === 'direction-1' && card.category === 'Focus Match') return true;
          if (dir.id === 'direction-2' && card.category === 'Growth Potential') return true;
          if (dir.id === 'direction-3' && card.category === 'Foundation Skills') return true;
          return false;
        });

        if (newCards.length > 0) {
          return {
            ...dir,
            cards: [...dir.cards, ...newCards],
            extractedCount: dir.extractedCount + newCards.filter((c: ExperienceCard) => c.source.type === 'uploaded_resume').length,
            aiRecommendedCount: dir.aiRecommendedCount + newCards.filter((c: ExperienceCard) => c.source.type === 'ai_generated').length
          };
        }
        return dir;
      }));

      alert(`File "${file.name}" processed successfully! Generated ${newAICards.length} new experience cards.`);

    } catch (error) {
      console.error('❌ Error processing uploaded file:', error);
      alert(`Error processing file "${file.name}". Please try again.`);
    } finally {
      setIsGeneratingCards(false);
    }
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

        {/* Loading State */}
        {isGeneratingCards && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '2px solid #2196f3',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'inline-block',
              width: '2rem',
              height: '2rem',
              border: '3px solid #e3f2fd',
              borderTop: '3px solid #2196f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }} />
            <h3 style={{ color: '#1976d2', margin: '0 0 0.5rem 0' }}>
              🤖 Generating AI Experience Cards...
            </h3>
            <p style={{ color: '#666', margin: 0 }}>
              Analyzing your content and creating personalized experience cards
            </p>
          </div>
        )}

        {/* Card Directions */}
        <div style={{ marginBottom: '2rem' }}>
          {directions.map((direction, index) => (
            <CardCategory
              key={direction.id}
              direction={direction}
              onToggle={toggleDirection}
              onCardClick={handleCardClick}
              onCreateNewCard={handleCreateNewCard}
              onDeleteCard={handleDeleteCard}
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

        {/* Experience Card Detail Modal */}
        <ExperienceCardDetail
          isOpen={isDetailModalOpen}
          onClose={handleDetailModalClose}
          onSave={handleDetailModalSave}
          initialData={currentCardData}
        />
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
