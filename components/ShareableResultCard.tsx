import React, { forwardRef } from 'react';
import type { AnalysisResult } from '../types.ts';
import HealthScoreGauge from './HealthScoreGauge.tsx';
import AlopeciaRiskChart from './AlopeciaRiskChart.tsx';

interface ShareableResultCardProps {
  result: AnalysisResult;
}

const ShareableResultCard = forwardRef<HTMLDivElement, ShareableResultCardProps>(({ result }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-gray-800 font-sans" style={{ width: 600 }}>
        <div className="text-center mb-6 border-b pb-4 border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900">Health Scope</h1>
            <p className="mt-1 text-lg text-gray-600">Tu Resumen de Salud Personal</p>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center mb-6">
            <div className="col-span-1 flex flex-col items-center justify-center">
                 <h3 className="text-xl font-semibold text-gray-700 mb-2">Puntuación</h3>
                 <div style={{width: 150, height: 150}}>
                    <HealthScoreGauge score={result.healthScore} />
                 </div>
            </div>
            <div className="col-span-2">
                 <h3 className="text-xl font-semibold text-gray-700 mb-3">Resumen General</h3>
                 <p className="text-gray-600 text-sm leading-relaxed">
                    {result.generalHealthMetricsSummary}
                 </p>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Predicción de Riesgo de Alopecia</h3>
            <AlopeciaRiskChart riskData={result.alopeciaRisk} isForSharing={true} />
        </div>
         <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Generado por Health Scope - Análisis de salud impulsado por IA.</p>
        </div>
    </div>
  );
});

export default ShareableResultCard;