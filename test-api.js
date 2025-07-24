// Test script for the analyze-goal API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const formData = new FormData();
    formData.append('userInput', 'I want to work in digital product management');

    const response = await fetch('http://localhost:3000/api/ai/analyze-goal', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
