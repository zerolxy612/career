'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CareerQuadrantData, AbilityPoint } from '@/types/career-profile';

interface CareerAwarenessChartProps {
  quadrantData?: CareerQuadrantData;
  abilityPoints?: AbilityPoint[];
  className?: string;
  isLoading?: boolean;
}

// 默认数据已移除 - 只使用真实AI数据

// 将AbilityPoint转换为ECharts散点图数据格式
const convertToEChartsData = (abilityPoints: AbilityPoint[]) => {
  const colors = ['#4285f4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return abilityPoints.map((point, index) => ({
    value: [point.x, point.y], // 直接使用-100到100的坐标系
    name: point.name,
    itemStyle: {
      color: colors[index % colors.length]
    },
    description: point.description,
    evidence: point.evidence
  }));
};

export const CareerAwarenessChart: React.FC<CareerAwarenessChartProps> = ({
  quadrantData: _quadrantData, // 暂时不使用，但保留接口
  abilityPoints,
  className = '',
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className={`career-awareness-chart ${className}`} style={{
        height: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        <div>Loading real AI ability analysis...</div>
      </div>
    );
  }

  // 只有真实数据才显示图表，不使用默认数据
  if (!abilityPoints || abilityPoints.length === 0) {
    return (
      <div className={`career-awareness-chart ${className}`} style={{
        height: 240,
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

  // 转换能力点数据为ECharts格式
  const scatterData = convertToEChartsData(abilityPoints);

  // ECharts配置选项
  const option = {
    title: {
      text: 'Your Self-Career Awareness',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#4285f4',
        fontSize: 16,
        fontWeight: '600'
      }
    },
    grid: {
      left: 100,
      right: 100,
      top: 80,
      bottom: 80,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: -100,
      max: 100,
      position: 'bottom',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#9ca3af',
          width: 2
        },
        onZero: true // 坐标轴在零点位置
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false // 隐藏数字标签
      },
      splitLine: {
        show: false // 隐藏网格线
      }
    },
    yAxis: {
      type: 'value',
      min: -100,
      max: 100,
      position: 'left',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#9ca3af',
          width: 2
        },
        onZero: true // 坐标轴在零点位置
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false // 隐藏数字标签
      },
      splitLine: {
        show: false // 隐藏网格线
      }
    },
    // 添加自定义图形来显示坐标轴标签
    graphic: [
      // 上方标签 - External-Driven
      {
        type: 'text',
        left: 'center',
        top: 50,
        style: {
          text: 'External-Driven',
          fontSize: 12,
          fontWeight: '500',
          fill: '#6b7280',
          textAlign: 'center'
        }
      },
      // 下方标签 - Internal-Driven
      {
        type: 'text',
        left: 'center',
        bottom: 50,
        style: {
          text: 'Internal-Driven',
          fontSize: 12,
          fontWeight: '500',
          fill: '#6b7280',
          textAlign: 'center'
        }
      },
      // 左侧标签 - Structured/Analytical
      {
        type: 'text',
        left: 15,
        top: '55%', // 稍微往下移动，避免与横向坐标轴重叠
        style: {
          text: 'Structured / Analytical',
          fontSize: 12,
          fontWeight: '500',
          fill: '#6b7280',
          textAlign: 'center',
          textBaseline: 'middle'
        },
        rotation: 0 // 明确设置为0，确保横向显示
      },
      // 右侧标签 - Expressive/Interpersonal
      {
        type: 'text',
        right: 15,
        top: '55%', // 稍微往下移动，避免与横向坐标轴重叠
        style: {
          text: 'Expressive / Interpersonal',
          fontSize: 12,
          fontWeight: '500',
          fill: '#6b7280',
          textAlign: 'center',
          textBaseline: 'middle'
        },
        rotation: 0 // 明确设置为0，确保横向显示
      }
    ],
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize: 14,
        emphasis: {
          scale: 1.3
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: function(params: { data: { name: string; description: string; evidence: string } }) {
        const data = params.data;
        return `
          <div style="padding: 10px; max-width: 250px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px; font-size: 14px;">${data.name}</div>
            <div style="color: #4b5563; font-size: 12px; margin-bottom: 6px; line-height: 1.4;">${data.description}</div>
            <div style="color: #6b7280; font-size: 11px; line-height: 1.3;">${data.evidence}</div>
          </div>
        `;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 6,
      textStyle: {
        color: '#1f2937'
      },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'
    }
  };

  return (
    <div className={`career-awareness-chart ${className}`}>
      <ReactECharts
        option={option}
        style={{ height: '320px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default CareerAwarenessChart;