const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testApiWithLogs() {
  console.log('🧪 Starting API test with file upload...');

  try {
    // Create form data
    const form = new FormData();

    // Add user input
    const userInput = "I want to work in technology, specifically in AI and machine learning. I have experience in software development and want to transition to product management.";
    form.append('userInput', userInput);

    // Add test file
    const testFilePath = path.join(__dirname, 'test-files', 'sample-resume.txt');
    if (fs.existsSync(testFilePath)) {
      const fileContent = fs.readFileSync(testFilePath);
      form.append('files', fileContent, {
        filename: 'sample-resume.txt',
        contentType: 'text/plain'
      });
      console.log('📁 Test file added to form data');
    } else {
      console.log('⚠️ Test file not found, proceeding without file');
    }

    // Make request
    console.log('📤 Sending request to API...');
    
    const response = await fetch('http://localhost:3001/api/ai/analyze-goal', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', {
      hasRecommendedFields: !!data.RecommendedFields,
      fieldsCount: data.RecommendedFields?.length || 0,
      firstFieldName: data.RecommendedFields?.[0]?.CardPreview?.FieldName || 'N/A'
    });
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testApiWithLogs();
