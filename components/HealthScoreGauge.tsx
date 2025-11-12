import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface HealthScoreGaugeProps {
  score: number;
}

const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({ score }) => {
  const data = [{ name: 'Puntuación de Salud', value: score }];

  const getColor = (value: number) => {
    if (value >= 80) return '#22c55e'; // green
    if (value >= 60) return '#facc15'; // yellow
    if (value >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };
  
  const color = getColor(score);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="70%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
          barSize={20}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            angleAxisId={0}
            fill={color}
            cornerRadius={10}
          />
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-5xl font-bold"
            fill={color}
          >
            {score}
          </text>
          <text
            x="50%"
            y="80%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-medium text-gray-500 dark:text-gray-400"
          >
            / 100
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthScoreGauge;