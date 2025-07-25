import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = '.pdf,.doc,.docx,.txt',
  maxSize = 10,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      alert(`File type not supported. Please upload: ${acceptedTypes}`);
      return;
    }

    setIsUploading(true);
    onFileSelect(file);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        style={{
          backgroundColor: isUploading ? '#ccc' : '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          if (!isUploading) {
            e.currentTarget.style.backgroundColor = '#3367d6';
          }
        }}
        onMouseOut={(e) => {
          if (!isUploading) {
            e.currentTarget.style.backgroundColor = '#4285f4';
          }
        }}
      >
        {isUploading ? (
          <>
            <div style={{
              width: '1rem',
              height: '1rem',
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Uploading...
          </>
        ) : (
          <>
            📁 Upload File
          </>
        )}
      </button>

      {/* Drag and Drop Area (optional overlay) */}
      {isDragOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            border: '3px dashed #4285f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontSize: '1.5rem',
            color: '#4285f4',
            fontWeight: 'bold'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          Drop your file here
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Floating Upload Button Component
interface FloatingUploadButtonProps {
  onFileSelect: (file: File) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const FloatingUploadButton: React.FC<FloatingUploadButtonProps> = ({
  onFileSelect,
  position = 'bottom-left'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: '2rem', left: '2rem' };
      case 'bottom-right':
        return { bottom: '2rem', right: '2rem' };
      case 'top-left':
        return { top: '2rem', left: '2rem' };
      case 'top-right':
        return { top: '2rem', right: '2rem' };
      default:
        return { bottom: '2rem', left: '2rem' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      ...getPositionStyles(),
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'flex-start',
      zIndex: 100
    }}>
      <FileUpload onFileSelect={onFileSelect} />
      
      {/* Additional Add Button */}
      <button style={{
        width: '3rem',
        height: '3rem',
        backgroundColor: '#e5e7eb',
        border: '2px solid #d1d5db',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.5rem',
        color: '#666',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#d1d5db';
        e.currentTarget.style.borderColor = '#9ca3af';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#e5e7eb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onClick={() => {
        // TODO: Implement manual card creation
        console.log('Manual card creation clicked');
      }}
      >
        +
      </button>
    </div>
  );
};

export default FileUpload;
