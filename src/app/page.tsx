'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { File, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface UploadedFile {
  name: string;
  type: string;
  file: File;
}

export default function Home() {
  const router = useRouter();
  const [goalText, setGoalText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    router.push('/experience');
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

      // Check if file already exists
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

    // Clear the input
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

    // Create a synthetic event to reuse handleFileUpload logic
    const syntheticEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileUpload(syntheticEvent);
  };

  return (
    <div className="goal-container">
      <div className="goal-content">
        {/* Page title */}
        <div className="goal-title">
          <h1>GOAL SETTING</h1>
        </div>

        {/* Header elements moved outside the card */}
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
              />

              {/* File upload button */}
              <button
                className="file-upload-button"
                onClick={() => fileInputRef.current?.click()}
                type="button"
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
            <button onClick={handleConfirm} className="goal-button">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
