'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, File } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [goalText, setGoalText] = useState('');

  const handleConfirm = () => {
    router.push('/experience');
  };

  return (
    <div className="goal-container">
      <div className="goal-content">
        {/* Page title */}
        <div className="goal-title">
          <h1>GOAL SETTING</h1>
        </div>

        {/* Main content card */}
        <div className="goal-card">
          {/* Icon and title */}
          <div className="goal-header">
            <div className="goal-icon">
              <Sparkles />
            </div>
            <div className="goal-text">
              <h2>Enter your career goals here!</h2>
              <p>Let's explore your career profile together!</p>
            </div>
          </div>

          {/* Input label */}
          <div className="goal-label">
            <span>Your target industry or field?</span>
          </div>

          {/* Input area */}
          <div className="goal-input-container">
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Enter Message..."
              className="goal-textarea"
            />

            {/* File icons at bottom of textarea */}
            <div className="file-icons">
              <div className="file-icon">
                <div className="file-icon-box file-icon-blue">
                  <File />
                </div>
                <span>File name...</span>
              </div>
              <div className="file-icon">
                <div className="file-icon-box file-icon-orange">
                  <File />
                </div>
                <span>File name...</span>
              </div>
              <div className="file-icon">
                <div className="file-icon-box file-icon-red">
                  <File />
                </div>
                <span>File name...</span>
              </div>
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
