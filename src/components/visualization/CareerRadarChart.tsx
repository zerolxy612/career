'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarDataPoint {
  dimension: string;
  value: number;
  fullMark: number;
}

interface CareerRadarChartProps {
  data?: RadarDataPoint[];
  className?: string;
}

// 默认职业维度数据
const defaultRadarData: RadarDataPoint[] = [
  {
    dimension: 'Goal Orientation',
    value: 85,
    fullMark: 100,
  },
  {
    dimension: 'Interpersonal Readiness',
    value: 75,
    fullMark: 100,
  },
  {
    dimension: 'Cognitive Ability',
    value: 90,
    fullMark: 100,
  },
  {
    dimension: 'Versatility',
    value: 70,
    fullMark: 100,
  },
  {
    dimension: 'Resilience',
    value: 80,
    fullMark: 100,
  },
  {
    dimension: 'Innovation',
    value: 85,
    fullMark: 100,
  },
];

export const CareerRadarChart: React.FC<CareerRadarChartProps> = ({
  data = defaultRadarData,
  className = ''
}) => {
  return (
    <div className={`career-radar-chart ${className}`}>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid 
            stroke="#e5e7eb" 
            strokeWidth={1}
          />
          <PolarAngleAxis 
            dataKey="dimension" 
            tick={{ 
              fontSize: 11, 
              fill: '#6b7280',
              fontWeight: 500
            }}
            className="radar-axis-text"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ 
              fontSize: 10, 
              fill: '#9ca3af' 
            }}
            tickCount={6}
          />
          <Radar
            name="Career Dimensions"
            dataKey="value"
            stroke="#4285f4"
            fill="#4285f4"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ 
              fill: '#4285f4', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 4 
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CareerRadarChart;
