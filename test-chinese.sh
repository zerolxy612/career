#!/bin/bash

echo "🧪 Testing API with Chinese input..."

# Test with Chinese input
curl -X POST http://localhost:3001/api/ai/analyze-goal \
  -F "userInput=我想在科技领域工作，特别是人工智能和机器学习方向。我有软件开发经验，希望转向产品管理岗位。" \
  -s | jq '.'

echo -e "\n🎉 Chinese test completed!"
