import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import type { AnalysisResult } from '../types.ts';
import HealthScoreGauge from './HealthScoreGauge.tsx';
import AlopeciaRiskChart from './AlopeciaRiskChart.tsx';
import ShareableResultCard from './ShareableResultCard.tsx';

interface DashboardProps {
  result: AnalysisResult;
  numPhotos: number;
  numPdfs: number;
}

const Dashboard: React.FC<DashboardProps> = ({ result, numPhotos, numPdfs }) => {
  const shareableCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShareClick = async () => {
      if (!shareableCardRef.current) {
          console.error("Shareable card component is not available.");
          return;
      }
      setIsSharing(true);
      try {
          const canvas = await html2canvas(shareableCardRef.current, {
              useCORS: true,
              scale: 2, // Increase resolution for better quality
              backgroundColor: '#ffffff',
              onclone: (clonedDoc) => {
                  // Ensure the generated image is always in light mode
                  clonedDoc.documentElement.classList.remove('dark');
              }
          });
          const image = canvas.toDataURL('image/png', 0.95);
          const link = document.createElement('a');
          link.href = image;
          link.download = 'mi-analisis-health-scope.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (error) {
          console.error("Error generating shareable image:", error);
      } finally {
          setIsSharing(false);
      }
  };

  return (
    <>
      {/* Off-screen component for generating the image */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
          <ShareableResultCard ref={shareableCardRef} result={result} />
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-fade-in dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Tu Análisis de Salud</h2>
           <div className="flex items-center gap-4">
             <button
              onClick={handleShareClick}
              disabled={isSharing}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-5 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>{isSharing ? 'Generando...' : 'Compartir'}</span>
            </button>
          </div>
        </div>

        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
          Análisis basado en <strong>{numPhotos} foto(s)</strong> y <strong>{numPdfs} PDF(s)</strong>. Añade más documentos arriba y haz clic en "Actualizar Análisis" para refinar tus resultados.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 p-6 bg-gray-50 rounded-xl dark:bg-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b border-gray-200 pb-2 dark:text-gray-200 dark:border-gray-600">Resumen General de Salud</h3>
            <p className="text-gray-600 leading-relaxed dark:text-gray-400">
              {result.generalHealthMetricsSummary}
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl flex flex-col items-center justify-center dark:bg-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-700 mb-2 dark:text-gray-200">Puntuación de Salud General</h3>
            <HealthScoreGauge score={result.healthScore} />
          </div>

          <div className="lg:col-span-3 p-6 bg-gray-50 rounded-xl dark:bg-gray-700/50">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 dark:text-gray-200">Predicción de Riesgo de Alopecia</h3>
            <AlopeciaRiskChart riskData={result.alopeciaRisk} />
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;