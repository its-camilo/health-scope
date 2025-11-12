import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import AnalysisLoader from './components/AnalysisLoader';
import { getAnalysisResults, getUserFiles, runAnalysis, uploadFile, deleteFile } from './services/apiService';
import type { AnalysisResult, UserFile } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // App data state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [analysisFileCounts, setAnalysisFileCounts] = useState<{ photos: number; pdfs: number } | null>(null);

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Theme management effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Auth & data fetching effect
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        setIsAuthenticated(true);
        await fetchData();
      }
      setIsLoading(false);
    };
    checkAuthAndFetchData();
  }, []);

  const fetchData = async () => {
      try {
        setAppError(null);
        const [results, files] = await Promise.all([
          getAnalysisResults(),
          getUserFiles()
        ]);
        
        // Only set file counts on the very first load of an analysis result.
        // They are only updated again when a new analysis is explicitly run.
        if (results && !analysisResult) {
            const photos = files.filter(f => f.file_type === 'photo').length;
            const pdfs = files.filter(f => f.file_type === 'pdf').length;
            setAnalysisFileCounts({ photos, pdfs });
        } else if (!results) {
            // If there's no analysis result (e.g., after a reset), ensure counts are cleared.
            setAnalysisFileCounts(null);
        }
        
        setAnalysisResult(results);
        setUserFiles(files);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
        setAppError(errorMessage);
        if (errorMessage.includes('Token inválido')) {
            handleLogout();
        }
      }
  };
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchData();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setAnalysisResult(null);
    setUserFiles([]);
    setAppError(null);
    setAnalysisFileCounts(null);
  };
  
  // File management handlers
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
        // Fix: Explicitly type `file` as `File` to resolve type inference issues.
        await Promise.all(Array.from(files).map((file: File) => {
            const fileType = file.type.startsWith('image/') ? 'photo' : 'pdf';
            if (fileType === 'pdf' && !file.type.includes('pdf')) {
                throw new Error(`El archivo ${file.name} no parece ser un PDF válido.`);
            }
            return uploadFile(file, file.name, fileType);
        }));
        await fetchData(); // Refresh file list and potentially analysis
    } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Error al subir archivos.');
    } finally {
        setIsUploading(false);
        if(photoInputRef.current) {
            photoInputRef.current.value = ''; // Reset file input
        }
        if(pdfInputRef.current) {
            pdfInputRef.current.value = ''; // Reset file input
        }
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
        setUploadError(null);
        await deleteFile(fileId);
        await fetchData(); // Refresh file list
    } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Error al eliminar el archivo.');
    }
  };


  // Analysis handlers
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAppError(null);
    try {
      const result = await runAnalysis();
      setAnalysisResult(result);
      const currentPhotos = userFiles.filter(f => f.file_type === 'photo').length;
      const currentPdfs = userFiles.filter(f => f.file_type === 'pdf').length;
      setAnalysisFileCounts({ photos: currentPhotos, pdfs: currentPdfs });
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Error al ejecutar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  let analysisButtonText = 'Ejecutar Análisis';
  if (isAnalyzing) {
    analysisButtonText = 'Analizando...';
  } else if (analysisResult) {
    analysisButtonText = 'Actualizar Análisis';
  }

  let analysisButtonTitle = '';
  if (userFiles.length === 0) {
    analysisButtonTitle = 'Sube al menos un archivo para poder ejecutar el análisis.';
  }


  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors`}>
      {isAnalyzing && <AnalysisLoader />}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Health Scope</h1>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">Tu panel de control de salud personal.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-5 rounded-full hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Tus Documentos</h2>
            <div className="mb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Photo Upload Button */}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={photoInputRef}
                        className="hidden"
                        id="photo-upload"
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="photo-upload"
                        className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 shadow-sm hover:shadow-xl ${isUploading ? 'bg-gray-200 border-gray-400 cursor-not-allowed' : 'border-gray-300 bg-gray-50/50 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700/20 dark:hover:border-blue-500 dark:hover:bg-gray-700/50 cursor-pointer'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{isUploading ? 'Subiendo...' : 'Añadir Foto(s)'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Arrastra o haz clic para subir</span>
                    </label>

                    {/* PDF Upload Button */}
                    <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileChange}
                        ref={pdfInputRef}
                        className="hidden"
                        id="pdf-upload"
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="pdf-upload"
                         className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 shadow-sm hover:shadow-xl ${isUploading ? 'bg-gray-200 border-gray-400 cursor-not-allowed' : 'border-gray-300 bg-gray-50/50 hover:border-purple-400 dark:border-gray-600 dark:bg-gray-700/20 dark:hover:border-purple-500 dark:hover:bg-gray-700/50 cursor-pointer'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{isUploading ? 'Subiendo...' : 'Añadir PDF(s)'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Arrastra o haz clic para subir</span>
                    </label>
                </div>
                {uploadError && <p className="text-sm text-red-600 dark:text-red-400 mt-3 text-center">{uploadError}</p>}
            </div>
            
            {userFiles.length > 0 ? (
                 <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {userFiles.map(file => (
                        <li key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`flex-shrink-0 ${file.file_type === 'photo' ? 'text-blue-500 dark:text-blue-400' : 'text-purple-500 dark:text-purple-400'}`}>
                                    {file.file_type === 'photo' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    )}
                                </span>
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate" title={file.file_name}>{file.file_name}</span>
                            </div>
                           <button onClick={() => handleDeleteFile(file.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No has subido ningún documento todavía.</p>
            )}
          </div>
            
            <div className="text-center">
              <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || userFiles.length === 0}
                  title={analysisButtonTitle}
                  className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
              >
                  {analysisButtonText}
              </button>
              {userFiles.length === 0 && <p className="text-sm text-gray-500 mt-2">Sube al menos un archivo para poder ejecutar el análisis.</p>}
            </div>

            {appError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-center dark:bg-red-900/30 dark:border-red-700 dark:text-red-300" role="alert">{appError}</div>}

            {analysisResult && analysisFileCounts ? (
                <Dashboard result={analysisResult} numPhotos={analysisFileCounts.photos} numPdfs={analysisFileCounts.pdfs} />
            ) : (
                !isAnalyzing && (
                  <div className="text-center py-12 px-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Aún no hay análisis</h2>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                          {userFiles.length > 0
                              ? 'Haz clic en "Ejecutar Análisis" para generar tu informe de salud.'
                              : 'Sube tus fotos y documentos PDF para empezar.'}
                      </p>
                  </div>
                )
            )}
        </main>
      </div>
    </div>
  );
}

export default App;