'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('🧪 [DEBUG] Starting API test...');
      
      const formData = new FormData();
      formData.append('userInput', 'I want to work in technology');

      const response = await fetch('/api/ai/analyze-goal', {
        method: 'POST',
        body: formData,
      });

      console.log('🧪 [DEBUG] Response status:', response.status);
      console.log('🧪 [DEBUG] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🧪 [DEBUG] Error response:', errorText);
        setResult(`Error: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('🧪 [DEBUG] Success response:', data);
      
      setResult(`Success! Got ${data.RecommendedFields?.length || 0} recommendations`);
      
    } catch (error) {
      console.error('🧪 [DEBUG] Exception:', error);
      setResult(`Exception: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Debug Page</h1>
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          backgroundColor: loading ? '#ccc' : '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>

      {result && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: result.startsWith('Success') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.startsWith('Success') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <pre>{result}</pre>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Instructions:</h3>
        <p>1. Open browser developer tools (F12)</p>
        <p>2. Go to Console tab</p>
        <p>3. Click &quot;Test API&quot; button</p>
        <p>4. Check console logs for detailed information</p>
      </div>
    </div>
  );
}
