'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface ScatterDataPoint {
  x: number;
  y: number;
  name: string;
  color: string;
}

interface CareerAwarenessChartProps {
  data?: ScatterDataPoint[];
  className?: string;
}

// 默认散点数据 - 基于设计图的四象限分布
const defaultScatterData: ScatterDataPoint[] = [
  // External-Driven & Sensational/Analytical (右下象限)
  { x: 75, y: 25, name: 'Current Position', color: '#fbbf24' },
  { x: 80, y: 30, name: 'Analytical Skills', color: '#fbbf24' },
  
  // External-Driven & Expansive/Interpersonal (右上象限)  
  { x: 85, y: 75, name: 'Leadership', color: '#10b981' },
  { x: 90, y: 80, name: 'Communication', color: '#10b981' },
  
  // Internal-Driven & Sensational/Analytical (左下象限)
  { x: 25, y: 20, name: 'Technical Focus', color: '#6b7280' },
  
  // Internal-Driven & Expansive/Interpersonal (左上象限)
  { x: 20, y: 85, name: 'Innovation', color: '#8b5cf6' },
];

export const CareerAwarenessChart: React.FC<CareerAwarenessChartProps> = ({
  data = defaultScatterData,
  className = ''
}) => {
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
      
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          {/* 参考线 - 创建四象限 */}
          <ReferenceLine x={50} stroke="#9ca3af" strokeWidth={1} />
          <ReferenceLine y={50} stroke="#9ca3af" strokeWidth={1} />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{ 
              value: 'External-Driven ←→ Expansive/Interpersonal', 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' }
            }}
          />
          
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            label={{ 
              value: 'Sensational/Analytical ←→ Expansive/Interpersonal', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '10px', fill: '#6b7280' }
            }}
          />
          
          <Scatter dataKey="y" fill="#4285f4">
            {data.map((entry, index) => (
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
          Sensational/Analytical
        </div>
        <div style={{ position: 'absolute', top: '-40px', right: '10px' }}>
          Expansive/Interpersonal
        </div>
      </div>
    </div>
  );
};

export default CareerAwarenessChart;
