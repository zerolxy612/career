'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import IndustryCardList from '@/components/cards/IndustryCardList';
import { IndustryRecommendation } from '@/types/api';

interface UploadedFile {
  name: string;
  type: string;
  file: File;
}

export default function GoalPage() {
  const router = useRouter();
  const [goalText, setGoalText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [industries, setIndustries] = useState<IndustryRecommendation[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data from localStorage
  useEffect(() => {
    const initialGoalText = localStorage.getItem('initialGoalText');
    const initialFiles = localStorage.getItem('initialFiles');

    if (initialGoalText) {
      setGoalText(initialGoalText);
      localStorage.removeItem('initialGoalText');
    }

    if (initialFiles) {
      try {
        const parsedFiles = JSON.parse(initialFiles);
        setUploadedFiles(parsedFiles);
        localStorage.removeItem('initialFiles');
      } catch (error) {
        console.error('Failed to parse initial files:', error);
      }
    }
  }, []);

  const handleConfirm = async () => {
    if (!goalText.trim()) {
      setUploadError('请输入目标行业或领域');
      return;
    }

    setIsLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('userInput', goalText);

      uploadedFiles.forEach(file => {
        formData.append('files', file.file);
      });

      const response = await fetch('/api/ai/analyze-goal', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze goal');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Transform API response to match our TypeScript types
      const rawFields = data.RecommendedFields || data.recommendedFields || [];
      const transformedFields = rawFields.map((field: any) => ({
        cardPreview: {
          fieldName: field.CardPreview?.FieldName || field.cardPreview?.fieldName || '',
          fieldSummary: field.CardPreview?.FieldSummary || field.cardPreview?.fieldSummary || '',
          fieldTags: field.CardPreview?.FieldTags || field.cardPreview?.fieldTags || []
        },
        cardDetail: {
          fieldOverview: field.CardDetail?.FieldOverview || field.cardDetail?.fieldOverview || '',
          suitableForYouIf: field.CardDetail?.SuitableForYouIf || field.cardDetail?.suitableForYouIf || [],
          typicalTasksAndChallenges: field.CardDetail?.TypicalTasksAndChallenges || field.cardDetail?.typicalTasksAndChallenges || [],
          fieldTags: field.CardDetail?.FieldTags || field.cardDetail?.fieldTags || []
        }
      }));

      console.log('Transformed fields:', transformedFields); // Debug log
      setIndustries(transformedFields);
    } catch (error) {
      console.error('Error analyzing goal:', error);
      setUploadError('分析失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedIndustry) {
      // Store selected industry in localStorage or state management
      localStorage.setItem('selectedIndustry', JSON.stringify(selectedIndustry));
      localStorage.setItem('userGoal', goalText);
      router.push('/experience');
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'docx':
      case 'doc':
        return { color: 'file-icon-blue', name: fileName };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'txt':
        return { color: 'file-icon-orange', name: fileName };
      case 'pdf':
        return { color: 'file-icon-red', name: fileName };
      default:
        return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadError('');

    Array.from(files).forEach(file => {
      const fileIcon = getFileIcon(file.name);

      if (!fileIcon) {
        setUploadError(`不支持的文件类型: ${file.name}`);
        return;
      }

      if (uploadedFiles.some(f => f.name === file.name)) {
        setUploadError(`文件已存在: ${file.name}`);
        return;
      }

      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        file: file
      };

      setUploadedFiles(prev => [...prev, newFile]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    const syntheticEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileUpload(syntheticEvent);
  };

  return (
    <div className="goal-page-container">
      <div className="goal-page-content">
        {/* Left side - Input area */}
        <div className="goal-input-section">
          <div className="goal-title">
            <h1>GOAL SETTING</h1>
          </div>

          <div className="goal-header-external">
            <div className="goal-icon-external">
              <Image
                src="/ai_avatar.png"
                alt="AI Avatar"
                width={64}
                height={64}
              />
            </div>
            <div className="goal-text-external">
              <p>Enter your career goals here!</p>
              <p>Let&apos;s explore your career profile together!</p>
            </div>
          </div>

          <div className="goal-card">
            <div className="goal-label">
              <span>Your target industry or field?</span>
            </div>

            <div className="goal-input-container">
              <div
                className="goal-textarea-container"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Enter Message..."
                  className="goal-textarea"
                  disabled={isLoading}
                />

                <button
                  className="file-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  disabled={isLoading}
                >
                  <Upload size={16} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".docx,.doc,.jpg,.jpeg,.png,.txt,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {uploadError && (
                <div className="upload-error">
                  {uploadError}
                </div>
              )}

              <div className="file-icons">
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => {
                    const fileIcon = getFileIcon(file.name);
                    return (
                      <div key={index} className="file-icon">
                        <div className={`file-icon-box ${fileIcon?.color}`}>
                          <File />
                          <button
                            className="file-remove-button"
                            onClick={() => removeFile(file.name)}
                            type="button"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <span>{file.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="file-icon file-icon-placeholder">
                      <div className="file-icon-box file-icon-blue">
                        <File />
                      </div>
                      <span>File name...</span>
                    </div>
                    <div className="file-icon file-icon-placeholder">
                      <div className="file-icon-box file-icon-orange">
                        <File />
                      </div>
                      <span>File name...</span>
                    </div>
                    <div className="file-icon file-icon-placeholder">
                      <div className="file-icon-box file-icon-red">
                        <File />
                      </div>
                      <span>File name...</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="goal-button-container">
              <button
                onClick={handleConfirm}
                className="goal-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    分析中...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Industry recommendations */}
        <div className="goal-recommendations-section">
          {industries.length > 0 && (
            <>
              <IndustryCardList
                industries={industries}
                onSelectionChange={setSelectedIndustry}
              />

              <div className="goal-next-container">
                <button
                  onClick={handleNext}
                  className={`goal-next-button ${selectedIndustry ? 'active' : 'disabled'}`}
                  disabled={!selectedIndustry}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
