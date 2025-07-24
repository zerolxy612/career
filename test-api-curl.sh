#!/bin/bash

echo "🧪 Testing API with curl..."

# Test without file first
echo "📤 Testing without file upload..."
curl -X POST http://localhost:3001/api/ai/analyze-goal \
  -F "userInput=I want to work in technology, specifically in AI and machine learning. I have experience in software development and want to transition to product management." \
  -v

echo -e "\n\n📤 Testing with file upload..."

# Create a temporary test file
cat > temp_resume.txt << 'EOF'
张三 - 软件工程师

教育背景：
2018-2022 北京大学 计算机科学与技术 本科

工作经验：
2022.07-至今 腾讯科技 软件开发工程师
- 负责微信小程序后端开发
- 参与用户增长项目

技能专长：
编程语言：JavaScript, Python, Java
前端技术：React, Vue.js
后端技术：Node.js, Express

职业目标：
希望在人工智能和产品技术领域深入发展
EOF

# Test with file upload
curl -X POST http://localhost:3001/api/ai/analyze-goal \
  -F "userInput=I want to work in technology, specifically in AI and machine learning." \
  -F "files=@temp_resume.txt" \
  -v

# Clean up
rm temp_resume.txt

echo -e "\n🎉 Test completed!"
