# 🧪 Career Profiling System - 工作流测试计划

## 📋 测试目标

验证修复后的三种工作流是否正常工作，确保数据流管理问题已解决。

## 🔧 修复内容总结

### 1. 统一数据管理 (CardDataManager)
- ✅ 实现了统一的CardDataManager类
- ✅ 完全清理旧数据，防止数据残留
- ✅ 支持卡片去重机制
- ✅ 工作流历史跟踪
- ✅ 统一的数据生命周期管理

### 2. 三种工作流修复
- ✅ **工作流1**: 首页文件上传 → AI生成卡片 → Experience页面显示 → Combination页面可用
- ✅ **工作流2**: Experience页面文件上传 → AI生成卡片 → 立即显示 → Combination页面可用  
- ✅ **工作流3**: Experience页面手动创建 → 卡片创建 → 立即显示 → Combination页面可用

### 3. 数据流问题修复
- ✅ 修复了"上传1个文件显示2张卡片"的问题
- ✅ 实现了完整的localStorage清理
- ✅ 统一了AI响应处理逻辑
- ✅ 简化了卡片类型识别逻辑

## 🧪 测试步骤

### 测试环境
- URL: http://localhost:3001
- 浏览器: 任意现代浏览器
- 测试文件: 准备PDF/DOC/TXT格式的简历文件

### 工作流1测试: 首页文件上传
1. **清理浏览器数据**
   - 打开开发者工具 → Application → Storage → Clear storage
   - 刷新页面确保干净开始

2. **首页操作**
   - 访问 http://localhost:3001
   - 输入职业目标 (例如: "I want to become a product manager")
   - 上传1个简历文件
   - 选择一个推荐的行业方向
   - 点击"Next"按钮

3. **验证Experience页面**
   - 检查是否正确显示从首页文件生成的卡片
   - 验证卡片数量是否正确 (应该与上传文件数量对应)
   - 检查卡片来源类型是否为"uploaded_resume"
   - 打开浏览器控制台，查看CardDataManager日志

4. **验证Combination页面**
   - 点击"Next"进入Combination页面
   - 检查左侧卡片池是否包含首页生成的卡片
   - 验证卡片数据完整性

### 工作流2测试: Experience页面文件上传
1. **继续上一个测试** (或重新开始)
   - 在Experience页面，点击右下角的上传按钮
   - 上传另一个简历文件
   - 等待AI处理完成

2. **验证新卡片生成**
   - 检查是否生成了新的卡片
   - 验证新卡片与原有卡片没有重复
   - 检查卡片来源类型是否为"uploaded_resume"
   - 验证总卡片数量是否正确增加

3. **验证Combination页面**
   - 进入Combination页面
   - 检查是否包含所有卡片 (首页 + Experience页面上传)
   - 验证卡片池数据完整性

### 工作流3测试: 手动创建卡片
1. **在Experience页面手动创建**
   - 点击"Create New Card"按钮
   - 填写完整的经验信息:
     - Experience Name: "Manual Test Experience"
     - Location & Time: "Beijing | Jan 2024 - Mar 2024"
     - 填写其他所有字段
   - 点击"Confirm"保存

2. **验证手动卡片**
   - 检查新创建的卡片是否立即显示
   - 验证卡片来源类型是否为"user_input"
   - 检查完整度进度条是否正确显示

3. **验证Combination页面**
   - 进入Combination页面
   - 检查是否包含手动创建的卡片
   - 验证所有三种来源的卡片都可用

## 🔍 关键验证点

### 数据一致性检查
- [ ] 首页上传1个文件，Experience页面显示对应数量的卡片
- [ ] Experience页面上传文件后，新卡片正确添加，无重复
- [ ] 手动创建的卡片立即可见，数据完整
- [ ] Combination页面显示所有来源的卡片

### 控制台日志检查
打开浏览器开发者工具，查看以下关键日志:
- `[CardDataManager] Starting new session`
- `[CardDataManager] Cards added successfully`
- `[HOMEPAGE] Processing files through unified workflow`
- `[EXPERIENCE_UPLOAD] File processed successfully`
- `[MANUAL_CARD] Manual card created`

### 数据流验证
- [ ] localStorage中只有统一的会话数据
- [ ] 没有遗留的legacy数据键
- [ ] 卡片去重机制正常工作
- [ ] 工作流历史正确记录

## 🚨 已知问题修复验证

### 问题1: 数据重复
- **修复前**: 首页上传1个文件，Combination页面显示2张卡片
- **修复后**: 应该显示正确数量的卡片，无重复

### 问题2: 数据残留
- **修复前**: 多次使用后localStorage积累大量遗留数据
- **修复后**: 每次新会话完全清理旧数据

### 问题3: 工作流断裂
- **修复前**: Experience页面上传和手动创建功能不工作
- **修复后**: 所有三种工作流都正常工作

## 📊 测试结果记录

### 工作流1 (首页文件上传)
- [ ] ✅ 通过 / ❌ 失败
- 问题描述: _______________

### 工作流2 (Experience页面文件上传)  
- [ ] ✅ 通过 / ❌ 失败
- 问题描述: _______________

### 工作流3 (手动创建卡片)
- [ ] ✅ 通过 / ❌ 失败  
- 问题描述: _______________

### 数据一致性
- [ ] ✅ 通过 / ❌ 失败
- 问题描述: _______________

## 🔧 如果测试失败

如果发现问题，请检查:
1. 浏览器控制台错误信息
2. CardDataManager相关日志
3. 网络请求是否成功
4. localStorage数据状态
5. 服务器端API响应

记录详细的错误信息和重现步骤，以便进一步修复。
