export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserFile {
  id: number;
  file_name: string;
  file_type: 'photo' | 'pdf';
  file_data: {
    url: string;
    mime: string;
    size: number;
  };
  // Strapi v4 response might not nest file_data
  url?: string;
  mime?: string;
  size?: number;
}

export interface AlopeciaRisk {
  oneYear: number;
  threeYears: number;
  fiveYears: number;
}

// Esto proviene del campo analysis_data del backend
export interface AnalysisResult {
  generalHealthMetricsSummary: string;
  healthScore: number;
  alopeciaRisk: AlopeciaRisk;
}