'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { File, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import IndustryCardList from '@/components/cards/IndustryCardList';
import { IndustryRecommendation } from '@/types/api';
import { consoleLog } from '@/lib/logger';

interface UploadedFile {
  name: string;
  type: string;
  file: File;
}

interface RawFieldData {
  CardPreview?: {
    FieldName?: string;
    FieldSummary?: string;
    FieldTags?: string[];
  };
  cardPreview?: {
    fieldName?: string;
    fieldSummary?: string;
    fieldTags?: string[];
  };
  CardDetail?: {
    FieldOverview?: string;
    SuitableForYouIf?: string[];
    TypicalTasksAndChallenges?: string[];
    FieldTags?: string[];
  };
  cardDetail?: {
    fieldOverview?: string;
    suitableForYouIf?: string[];
    typicalTasksAndChallenges?: string[];
    fieldTags?: string[];
  };
}

export default function Home() {
  const router = useRouter();
  const [goalText, setGoalText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [industries, setIndustries] = useState<IndustryRecommendation[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryRecommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleConfirm = async () => {
    if (!goalText.trim()) {
      setUploadError('Please enter your target industry or field');
      return;
    }

    // Log user input to console
    consoleLog.userInput('首页确认', goalText, uploadedFiles.map(f => f.file));

    setIsLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('userInput', goalText);

      uploadedFiles.forEach((file) => {
        formData.append('files', file.file);
      });

      console.log('📤 [CONFIRM] Sending request to /api/ai/analyze-goal');
      console.log('📤 [CONFIRM] Goal text:', goalText);
      console.log('📤 [CONFIRM] Files count:', uploadedFiles.length);
      const startTime = Date.now();

      const response = await fetch('/api/ai/analyze-goal', {
        method: 'POST',
        body: formData,
      });

      const endTime = Date.now();
      console.log(`📥 [CONFIRM] API response received in ${endTime - startTime}ms`);
      console.log('📥 [CONFIRM] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [CONFIRM] API request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to analyze goal: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 [CONFIRM] Raw API Response data:', data);

      // 🔧 FIX: Better error handling for API response
      if (!data || typeof data !== 'object') {
        console.error('❌ [CONFIRM] Invalid API response format:', data);
        throw new Error('Invalid response format from API');
      }

      // Transform API response to match our TypeScript types
      const rawFields = data.RecommendedFields || data.recommendedFields || [];
      console.log('🔄 [CONFIRM] Raw fields from API:', rawFields);
      console.log('🔄 [CONFIRM] Number of raw fields:', rawFields.length);

      if (!Array.isArray(rawFields) || rawFields.length === 0) {
        console.error('❌ [CONFIRM] No valid fields in API response');
        throw new Error('No industry recommendations received from API');
      }

      const transformedFields = rawFields.map((field: RawFieldData, index: number) => {
        console.log(`🔄 [CONFIRM] Transforming field ${index + 1}:`, field);

        const transformed = {
          cardPreview: {
            fieldName: field.CardPreview?.FieldName || field.cardPreview?.fieldName || `Field ${index + 1}`,
            fieldSummary: field.CardPreview?.FieldSummary || field.cardPreview?.fieldSummary || 'No summary available',
            fieldTags: field.CardPreview?.FieldTags || field.cardPreview?.fieldTags || []
          },
          cardDetail: {
            fieldOverview: field.CardDetail?.FieldOverview || field.cardDetail?.fieldOverview || 'No overview available',
            suitableForYouIf: field.CardDetail?.SuitableForYouIf || field.cardDetail?.suitableForYouIf || [],
            typicalTasksAndChallenges: field.CardDetail?.TypicalTasksAndChallenges || field.cardDetail?.typicalTasksAndChallenges || [],
            fieldTags: field.CardDetail?.FieldTags || field.cardDetail?.fieldTags || []
          }
        };

        console.log(`✅ [CONFIRM] Transformed field ${index + 1}:`, transformed);
        return transformed;
      });

      console.log('✅ [CONFIRM] All fields transformed successfully');
      console.log('✅ [CONFIRM] Final transformed fields:', transformedFields);
      console.log('🎯 [CONFIRM] Setting industries state with', transformedFields.length, 'fields');

      setIndustries(transformedFields);

      // 🔧 FIX: Verify state was set correctly
      setTimeout(() => {
        console.log('🔍 [CONFIRM] Industries state after update:', transformedFields.length);
      }, 100);

    } catch (error) {
      console.error('❌ [CONFIRM] Error analyzing goal:', error);
      setUploadError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      console.log('🏁 [CONFIRM] Goal analysis process completed');
    }
  };

  const handleNext = async () => {
    if (selectedIndustry) {
      // Store selected industry and navigate to experience page
      localStorage.setItem('selectedIndustry', JSON.stringify(selectedIndustry));
      localStorage.setItem('userGoal', goalText);

      // Store uploaded files information (we can't store File objects, but we can store metadata)
      const filesMetadata = uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.file.size
      }));
      localStorage.setItem('uploadedFilesMetadata', JSON.stringify(filesMetadata));

      // 🔧 FIX: Process uploaded files immediately and store results
      if (uploadedFiles.length > 0) {
        console.log('📁 [NAVIGATION] Processing uploaded files before navigation...');

        try {
          // Process files and generate experience cards immediately
          const formData = new FormData();
          formData.append('userGoal', goalText);
          formData.append('selectedIndustry', selectedIndustry.cardPreview.fieldName);

          uploadedFiles.forEach((file) => {
            formData.append('files', file.file);
          });

          console.log('📤 [NAVIGATION] Sending files to generate experience cards...');
          const response = await fetch('/api/ai/generate-experience-cards', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ [NAVIGATION] Experience cards generated from homepage files:', data);

            // Store the generated cards for the experience page
            localStorage.setItem('homepageGeneratedCards', JSON.stringify(data));
            localStorage.setItem('hasHomepageFiles', 'true');
          } else {
            console.error('❌ [NAVIGATION] Failed to process homepage files');
            localStorage.setItem('hasHomepageFiles', 'false');
          }
        } catch (error) {
          console.error('❌ [NAVIGATION] Error processing homepage files:', error);
          localStorage.setItem('hasHomepageFiles', 'false');
        }
      } else {
        localStorage.setItem('hasHomepageFiles', 'false');
      }

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

    console.log('📁 [FILE UPLOAD] Starting file upload process');
    console.log('📁 [FILE UPLOAD] Number of files selected:', files.length);

    setUploadError('');

    Array.from(files).forEach((file, index) => {
      console.log(`📁 [FILE UPLOAD] Processing file ${index + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      });

      const fileIcon = getFileIcon(file.name);

      if (!fileIcon) {
        const errorMsg = `Unsupported file type: ${file.name}`;
        console.error('❌ [FILE UPLOAD] Unsupported file type:', file.name);
        setUploadError(errorMsg);
        return;
      }

      // Check if file already exists
      if (uploadedFiles.some(f => f.name === file.name)) {
        const errorMsg = `File already exists: ${file.name}`;
        console.warn('⚠️ [FILE UPLOAD] Duplicate file:', file.name);
        setUploadError(errorMsg);
        return;
      }

      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        file: file
      };

      console.log('✅ [FILE UPLOAD] File added to upload list:', {
        name: newFile.name,
        type: newFile.type,
        size: file.size
      });

      setUploadedFiles(prev => [...prev, newFile]);
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    console.log('📁 [FILE UPLOAD] File upload process completed');
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

    // Create a synthetic event to reuse handleFileUpload logic
    const syntheticEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileUpload(syntheticEvent);
  };

  return (
    <div className="goal-container">
      {/* Page title - always centered at top */}
      <div className="goal-title">
        <h1>GOAL SETTING</h1>
      </div>

      {/* Dynamic layout based on whether cards are shown */}
      {industries.length > 0 ? (
        // Two-column layout when cards are shown
        <div className="goal-page-content">
          {/* Left side - Input area */}
          <div className="goal-input-section">
            {/* Header elements */}
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

            {/* Main content card */}
            <div className="goal-card">
              {/* Input label */}
              <div className="goal-label">
                <span>Your target industry or field?</span>
              </div>

              {/* Input area */}
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

                  {/* File upload button */}
                  <button
                    className="file-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    disabled={isLoading}
                  >
                    <Upload size={16} />
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".docx,.doc,.jpg,.jpeg,.png,.txt,.pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Error message */}
                {uploadError && (
                  <div className="upload-error">
                    {uploadError}
                  </div>
                )}

                {/* File icons at bottom of textarea */}
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

              {/* Confirm button */}
              <div className="goal-button-container">
                <button
                  onClick={handleConfirm}
                  className="goal-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Analyzing...
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
            <IndustryCardList
              industries={industries}
              onSelectionChange={setSelectedIndustry}
            />

            {selectedIndustry && (
              <div className="goal-next-container">
                <button
                  onClick={handleNext}
                  className="goal-next-button active"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Centered layout when no cards are shown
        <div className="goal-content">
          {/* Header elements */}
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

          {/* Main content card */}
          <div className="goal-card">
            {/* Input label */}
            <div className="goal-label">
              <span>Your target industry or field?</span>
            </div>

            {/* Input area */}
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

                {/* File upload button */}
                <button
                  className="file-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  disabled={isLoading}
                >
                  <Upload size={16} />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".docx,.doc,.jpg,.jpeg,.png,.txt,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Error message */}
              {uploadError && (
                <div className="upload-error">
                  {uploadError}
                </div>
              )}

              {/* File icons at bottom of textarea */}
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

            {/* Confirm button */}
            <div className="goal-button-container">
              <button
                onClick={handleConfirm}
                className="goal-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Analyzing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
