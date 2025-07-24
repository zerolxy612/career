const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test Gemini API connection
async function testGemini() {
  const apiKey = 'AIzaSyCdtgVnQShL2v9i2VuWenqDOH3f5IXR5cA';
  console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('Sending test prompt...');
    const result = await model.generateContent('Hello, please respond with "API working"');
    const response = result.response;
    const text = response.text();
    
    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testGemini();
