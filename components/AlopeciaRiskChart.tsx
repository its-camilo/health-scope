import React from 'react';
import type { AlopeciaRisk } from '../types.ts';

interface RiskCardProps {
  period: string;
  percentage: number;
  isForSharing?: boolean;
}

const getRiskProfile = (percentage: number) => {
  if (percentage < 30) {
    return {
      label: 'Bajo',
      bubbleClasses: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      percentageColor: 'text-green-500',
      labelColor: 'text-green-800',
    };
  }
  if (percentage < 60) {
    return {
      label: 'Medio',
      bubbleClasses: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      percentageColor: 'text-yellow-500',
      labelColor: 'text-yellow-800',
    };
  }
  return {
    label: 'Alto',
    bubbleClasses: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    percentageColor: 'text-red-500',
    labelColor: 'text-red-800',
  };
};

const RiskCard: React.FC<RiskCardProps> = ({ period, percentage, isForSharing = false }) => {
  const riskProfile = getRiskProfile(percentage);
  // Conditionally change margin to fix html2canvas rendering bug
  const marginTopClass = isForSharing ? 'mt-2' : 'mt-1';

  // Conditionally render with or without the bubble for the risk label
  const riskLabelClasses = isForSharing
    ? `text-xs font-semibold ${riskProfile.labelColor}`
    : `text-xs font-semibold px-2.5 py-1 rounded-full ${riskProfile.bubbleClasses} border`;


  return (
    <div className="flex-1 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center min-w-[150px]">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{period}</div>
      <div className={`text-4xl font-bold ${riskProfile.percentageColor}`}>
        {percentage}%
      </div>
      <div className={`${marginTopClass} ${riskLabelClasses}`}>
        Riesgo {riskProfile.label}
      </div>
    </div>
  );
};


interface AlopeciaRiskChartProps {
  riskData: AlopeciaRisk;
  isForSharing?: boolean;
}

const AlopeciaRiskChart: React.FC<AlopeciaRiskChartProps> = ({ riskData, isForSharing = false }) => {
  return (
    <>
     <p className="text-gray-600 dark:text-gray-400 mb-6 text-center lg:text-left">
        La predicción de riesgo se basa en un análisis de los datos proporcionados y muestra la probabilidad estimada de desarrollar alopecia en diferentes plazos.
     </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <RiskCard period="A 1 Año" percentage={riskData.oneYear} isForSharing={isForSharing} />
        <RiskCard period="A 3 Años" percentage={riskData.threeYears} isForSharing={isForSharing} />
        <RiskCard period="A 5 Años" percentage={riskData.fiveYears} isForSharing={isForSharing} />
      </div>
    </>
  );
};

export default AlopeciaRiskChart;