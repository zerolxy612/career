#!/bin/bash

echo "🧪 Testing API with English input..."

# Test with English input
curl -X POST http://localhost:3001/api/ai/analyze-goal \
  -F "userInput=I want to work in technology, specifically in artificial intelligence and machine learning. I have experience in software development and want to transition to product management roles." \
  -s | jq '.'

echo -e "\n🎉 English test completed!"
