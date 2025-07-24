# 黄色行业推荐卡片组件

这是一个可复用的黄色卡片组件，用于显示AI生成的行业推荐内容。

## 组件特性

- **黄色主题设计**: 符合设计要求的黄色背景和边框
- **响应式交互**: 悬停效果和选中状态
- **复制功能**: 点击复制按钮可复制卡片内容
- **可复用**: 支持传入自定义数据

## 组件结构

### YellowIndustryCard
简化版本的黄色卡片组件，适用于快速原型和测试。

```tsx
interface YellowIndustryCardProps {
  title: string;
  summary: string;
  tags: string[];
  isSelected?: boolean;
  onSelect?: () => void;
}
```

### IndustryCard
完整版本的行业卡片组件，与现有API数据结构兼容。

```tsx
interface IndustryCardProps {
  industry: IndustryRecommendation;
  isSelected: boolean;
  onSelect: () => void;
}
```

## 使用方法

### 1. 基础使用

```tsx
import YellowIndustryCard from '@/components/cards/YellowIndustryCard';

<YellowIndustryCard
  title="Digital Product Management"
  summary="Lead cross-functional teams to design, build, and grow digital products."
  tags={["Cross-functional", "Product Thinking", "User Insight"]}
  isSelected={false}
  onSelect={() => console.log('Card selected')}
/>
```

### 2. 与现有数据结构使用

```tsx
import IndustryCard from '@/components/cards/IndustryCard';

<IndustryCard
  industry={industryRecommendation}
  isSelected={selectedIndex === index}
  onSelect={() => handleSelect(index)}
/>
```

### 3. 列表展示

```tsx
import IndustryCardList from '@/components/cards/IndustryCardList';

<IndustryCardList
  industries={industries}
  onSelectionChange={setSelectedIndustry}
/>
```

## 样式说明

卡片使用以下CSS类：

- `.yellow-industry-card`: 主容器样式
- `.yellow-card-header`: 标题区域
- `.yellow-card-title`: 标题文字（蓝色）
- `.yellow-card-copy-btn`: 复制按钮
- `.yellow-card-summary`: 概述文字（珊瑚色）
- `.yellow-card-tags`: 标签区域
- `.yellow-card-arrow`: 箭头符号
- `.yellow-card-tags-text`: 标签文字

## 卡片内容结构

每个卡片包含：

1. **行业名称** - 显示在标题位置，使用蓝色字体
2. **一句话行业概述** - 显示在中间位置，使用珊瑚色字体
3. **行业标签** - 显示在底部，格式为 `→ "标签1", "标签2", "标签3"`

## 测试页面

访问 `/test-cards` 页面可以查看卡片的完整效果和交互演示。

## 注意事项

- 卡片点击时会触发选择状态切换
- 复制按钮会阻止事件冒泡，避免触发卡片选择
- 选中状态会改变卡片的背景色和边框色
- 悬停时卡片会有轻微的上移和阴影效果
