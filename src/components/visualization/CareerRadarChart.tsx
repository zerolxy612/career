'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CareerRadarData, RADAR_DIMENSION_LABELS } from '@/types/career-profile';

interface RadarDataPoint {
  dimension: string;
  value: number;
  fullMark: number;
}

interface CareerRadarChartProps {
  data?: CareerRadarData;
  className?: string;
  isLoading?: boolean;
}

// 默认数据已移除 - 只使用真实AI数据

// 将CareerRadarData转换为图表数据格式
const convertToRadarDataPoints = (data: CareerRadarData): RadarDataPoint[] => {
  return [
    {
      dimension: RADAR_DIMENSION_LABELS.interestOrientation,
      value: data.interestOrientation,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.selfEfficacy,
      value: data.selfEfficacy,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.goalOrientation,
      value: data.goalOrientation,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.outcomeExpectation,
      value: data.outcomeExpectation,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.cognitiveAgility,
      value: data.cognitiveAgility,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.affectiveReadiness,
      value: data.affectiveReadiness,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.interpersonalReadiness,
      value: data.interpersonalReadiness,
      fullMark: 100,
    },
    {
      dimension: RADAR_DIMENSION_LABELS.professionalAwareness,
      value: data.professionalAwareness,
      fullMark: 100,
    },
  ];
};

export const CareerRadarChart: React.FC<CareerRadarChartProps> = ({
  data,
  className = '',
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className={`career-radar-chart ${className}`} style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        <div>Loading real AI career profile...</div>
      </div>
    );
  }

  // 只有真实数据才显示图表，不使用默认数据
  if (!data) {
    return (
      <div className={`career-radar-chart ${className}`} style={{
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div>🚫 No Real AI Data</div>
        <div style={{ fontSize: '0.8rem' }}>Only real AI analysis will be displayed</div>
      </div>
    );
  }

  // 转换数据格式
  const radarDataPoints = convertToRadarDataPoints(data);

  return (
    <div className={`career-radar-chart ${className}`}>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={radarDataPoints} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
