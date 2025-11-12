import React from 'react';

const RobotAnimation = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64">
        <defs>
            <filter id="glow-effect">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -5" result="glow" />
                <feComposite in="glow" in2="SourceGraphic" operator="over" />
            </filter>
        </defs>
        <style>
            {`
            .gear { transform-origin: center; }
            .gear-1 { animation: rotate 15s linear infinite; }
            .gear-2 { animation: rotate-reverse 20s linear infinite; }
            .spark { animation: spark-pulse 1.8s ease-in-out infinite; }
            .scan-line { 
                animation: scan 3.5s ease-in-out infinite;
                transform-origin: center;
             }

            @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes rotate-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            
            @keyframes spark-pulse {
                0%, 100% { opacity: 0.3; transform: scale(0.9); }
                50% { opacity: 1; transform: scale(1.1); }
            }
            @keyframes scan {
                0%, 100% { transform: translateY(-12px); opacity: 0; }
                20% { opacity: 1; }
                50% { transform: translateY(12px); opacity: 1; }
                80% { opacity: 0; }
            }
            `}
        </style>
        {/* Changed main color to a cooler, metallic slate gray */}
        <g transform="translate(100 100)" className="text-slate-400 dark:text-slate-500">
            {/* Head shape */}
            <path d="M -70 60 Q -80 0 -70 -60 L 70 -60 Q 80 0 70 60 Z" fill="none" stroke="currentColor" strokeWidth="5" />
            
            {/* Antenna */}
            <line x1="0" y1="-60" x2="0" y2="-80" stroke="currentColor" strokeWidth="4"/>
             {/* Changed antenna light to a vibrant cyan */}
            <circle cx="0" cy="-85" r="5" className="text-cyan-400" filter="url(#glow-effect)">
                <animate attributeName="r" values="5;8;5" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Glass panel with a darker, more techy feel */}
            <path d="M -60 40 Q -65 -5 -40 -45 L 40 -45 Q 65 -5 60 40 Z" className="text-slate-900 dark:text-black" fill="currentColor" fillOpacity="0.4" />

            {/* Internals */}
            <g opacity="0.8">
                {/* Gears will inherit the new slate color */}
                <path className="gear gear-1" transform="translate(25 5)" d="M0,0 L-5.87,1.8 C-7.82,2.4 -8.5,5.15 -7,6.66 L0,11.54 L7,6.66 C8.5,5.15 7.82,2.4 -5.87,1.8 Z M0,0 A5,5 0 1,1 0,-0.01 Z" fill="currentColor" />
                <path className="gear gear-2" transform="translate(-20 -20)" d="M0,0 A7,7 0 1,1 0,-0.01 Z M0,0 L-5.87,1.8 L-3.6,5.2 L3.6,5.2 L5.87,1.8 L0,0 Z" fill="currentColor" />
                
                {/* Sparks with a mix of purple and cyan for a futuristic look */}
                <circle cx="0" cy="10" r="4" className="spark text-cyan-400" style={{ animationDelay: '0s' }} filter="url(#glow-effect)" />
                <circle cx="-35" cy="5" r="3" className="spark text-purple-400" style={{ animationDelay: '0.6s' }} filter="url(#glow-effect)" />
                <circle cx="30" cy="-20" r="3" className="spark text-purple-400" style={{ animationDelay: '1.2s' }} filter="url(#glow-effect)" />
            </g>
            
            {/* Mouth */}
            <line x1="-20" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

            {/* Eye Scan */}
            <g transform="translate(0, -10)">
              <rect x="-40" y="-10" width="80" height="20" rx="5" fill="currentColor" className="text-slate-900 dark:text-black" />
              <line x1="-35" y1="0" x2="35" y2="0" strokeWidth="4" className="scan-line text-cyan-300" strokeLinecap="round" filter="url(#glow-effect)" />
            </g>
        </g>
    </svg>
);


const AnalysisLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
            <RobotAnimation />
            <h2 className="text-3xl font-bold text-white mt-4 animate-pulse">Analizando tus datos...</h2>
            <p className="text-lg text-gray-300 mt-2">El robot IA está procesando tu información de salud.</p>
        </div>
    );
};

export default AnalysisLoader;