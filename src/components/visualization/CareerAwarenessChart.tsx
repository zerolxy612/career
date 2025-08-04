'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine, Tooltip } from 'recharts';
import { CareerQuadrantData, AbilityPoint } from '@/types/career-profile';

interface ScatterDataPoint {
  x: number;
  y: number;
  name: string;
  color: string;
  description?: string;
}

interface CareerAwarenessChartProps {
  quadrantData?: CareerQuadrantData;
  abilityPoints?: AbilityPoint[];
  className?: string;
  isLoading?: boolean;
}

// 默认象限数据
const defaultQuadrantData: CareerQuadrantData = {
  externalDriven: 75,
  internalDriven: 65,
  structuredAnalytical: 80,
  expressiveInterpersonal: 70
};

// 默认能力点数据
const defaultAbilityPoints: AbilityPoint[] = [
  {
    id: 'analytical-thinking',
    name: 'Analytical Thinking',
    x: -60,
    y: 40,
    description: 'Strong analytical capabilities through systematic problem-solving approaches.',
    evidence: 'Derived from project coordination experiences'
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration',
    x: 50,
    y: 30,
    description: 'Excellent interpersonal and collaborative skills in cross-functional teams.',
    evidence: 'Supported by workshop facilitation experiences'
  },
  {
    id: 'strategic-planning',
    name: 'Strategic Planning',
    x: -40,
    y: -20,
    description: 'Ability to develop and execute long-term strategic initiatives.',
    evidence: 'Evidenced through goal-setting and outcome tracking'
  },
  {
    id: 'creative-problem-solving',
    name: 'Creative Problem Solving',
    x: 30,
    y: -50,
    description: 'Innovative approach to complex challenges and solution development.',
    evidence: 'Demonstrated in various project contexts'
  }
];

// 将AbilityPoint转换为散点图数据格式
const convertToScatterData = (abilityPoints: AbilityPoint[]): ScatterDataPoint[] => {
  const colors = ['#4285f4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return abilityPoints.map((point, index) => ({
    x: point.x + 100, // 转换坐标系：-100~100 -> 0~200
    y: point.y + 100, // 转换坐标系：-100~100 -> 0~200
    name: point.name,
    color: colors[index % colors.length],
    description: point.description
  }));
};

// 自定义Tooltip组件
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ScatterDataPoint;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '200px',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
          {data.name}
        </p>
        <p style={{ margin: 0, color: '#6b7280', lineHeight: '1.4' }}>
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

export const CareerAwarenessChart: React.FC<CareerAwarenessChartProps> = ({
  quadrantData = defaultQuadrantData, // Reserved for future quadrant visualization features
  abilityPoints = defaultAbilityPoints,
  className = '',
  isLoading = false
}) => {
  // 转换能力点数据为散点图格式
  const scatterData = convertToScatterData(abilityPoints);

  // Note: quadrantData is currently reserved for future enhancements
  // where we might show quadrant-based background colors or statistics
  console.log('Quadrant data available:', quadrantData);

  if (isLoading) {
    return (
      <div className={`career-awareness-chart ${className}`} style={{
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        <div>Loading ability analysis...</div>
      </div>
    );
  }
  return (
    <div className={`career-awareness-chart ${className}`}>
      <div className="chart-title" style={{ 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#4285f4',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        Your Self-Career Awareness
      </div>
      
      <ResponsiveContainer width="100%" height={180}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          data={scatterData}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* 参考线 - 创建四象限 */}
          <ReferenceLine x={100} stroke="#9ca3af" strokeWidth={1} />
          <ReferenceLine y={100} stroke="#9ca3af" strokeWidth={1} />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 200]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{
              value: 'Structured/Analytical ←→ Expressive/Interpersonal',
              position: 'insideBottom',
              offset: -10,
              style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' }
            }}
          />

          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 200]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{
              value: 'Internal-Driven ←→ External-Driven',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Scatter dataKey="y" fill="#4285f4">
            {scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* 象限标签 */}
      <div className="quadrant-labels" style={{
        position: 'relative',
        height: '0px',
        fontSize: '9px',
        color: '#9ca3af',
        fontWeight: '500'
      }}>
        <div style={{ position: 'absolute', top: '-260px', left: '10px' }}>
          Internal-Driven
        </div>
        <div style={{ position: 'absolute', top: '-260px', right: '10px' }}>
          External-Driven
        </div>
        <div style={{ position: 'absolute', top: '-140px', left: '10px' }}>
          Structured/Analytical
        </div>
        <div style={{ position: 'absolute', top: '-40px', right: '10px' }}>
          Expressive/Interpersonal
        </div>
      </div>
    </div>
  );
};

export default CareerAwarenessChart;
