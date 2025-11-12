import { AnalysisResult, UserFile } from '../types.ts';
import { BACKEND_URL } from '../backend-urls.config.ts';

const API_BASE_URL = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) throw new Error('No estás autenticado');
  return { 'Authorization': `Bearer ${jwt}` };
};

const getUserId = (): number => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('Usuario no encontrado en el almacenamiento local');
    const user = JSON.parse(userStr);
    return user.id;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: { message: 'Respuesta no válida del servidor o cuerpo de respuesta vacío.' } 
    }));
    
    // Log the full error response for better debugging
    console.error('Error response from backend:', JSON.stringify(errorData, null, 2));

    if (response.status === 401) {
      throw new Error('Token inválido o expirado');
    }

    const strapiError = errorData.error;

    if (strapiError && strapiError.details && strapiError.details.errors) {
        const detailedError = strapiError.details.errors[0];
        throw new Error(`Error de validación: ${detailedError.message} (campo: ${detailedError.path.join('.')})`);
    }

    if (strapiError && strapiError.message) {
      throw new Error(strapiError.message);
    }

    throw new Error('Ocurrió un error en la solicitud al backend.');
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
};


export async function uploadFile(file: File, fileName: string, fileType: 'pdf' | 'photo'): Promise<any> {
  const formData = new FormData();
  
  const dataPayload = { 
    file_name: fileName, 
    file_type: fileType
    // The backend now automatically associates the user from the JWT token.
  };

  formData.append('data', JSON.stringify(dataPayload));
  formData.append('files.file_data', file);

  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    throw new Error('No estás autenticado');
  }

  // Explicitly create headers for FormData requests.
  // CRITICAL: DO NOT set 'Content-Type'. The browser will set it automatically
  // with the correct 'boundary' for multipart/form-data.
  const headers = {
    'Authorization': `Bearer ${jwt}`
  };

  const response = await fetch(`${API_BASE_URL}/user-files`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });
  return handleResponse(response);
}

export async function getUserFiles(): Promise<UserFile[]> {
  try {
    const userId = getUserId();
    const url = new URL(`${API_BASE_URL}/user-files`);
    
    url.searchParams.append('populate', 'file_data');
    url.searchParams.append('filters[user][id][$eq]', userId.toString());
    
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    // The API response for this endpoint returns a flat array of objects within the `data` key,
    // unlike a standard Strapi response which would nest properties in `attributes`.
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Error fetching user files:", error);
    throw error;
  }
}

export async function deleteFile(fileId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/user-files/${fileId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function runAnalysis(): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analysis/run`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await handleResponse(response);
  return data?.data?.attributes?.analysis_data || data?.data?.analysis_data || data;
}

export async function getAnalysisResults(): Promise<AnalysisResult | null> {
    try {
        const userId = getUserId();
        const url = new URL(`${API_BASE_URL}/analysis-results`);
        url.searchParams.append('filters[user][id][$eq]', userId.toString());
        // Get the most recent result to ensure consistency
        url.searchParams.append('sort', 'updatedAt:desc');
        url.searchParams.append('pagination[page]', '1');
        url.searchParams.append('pagination[pageSize]', '1');

        const response = await fetch(url.toString(), {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        if (data && data.data && data.data.length > 0) {
            const result = data.data[0];
            // Handle Strapi responses that may or may not have the `attributes` wrapper
            return result.attributes?.analysis_data || result.analysis_data;
        }
        return null;
    } catch (error) {
       console.warn("No se pudo obtener el análisis previo:", error);
       return null;
    }
}

export async function deleteAllAnalysisResults(): Promise<void> {
    try {
        const userId = getUserId();
        const url = new URL(`${API_BASE_URL}/analysis-results`);
        url.searchParams.append('filters[user][id][$eq]', userId.toString());
        // Fetch all results to ensure we delete them all, not just the first page.
        url.searchParams.append('pagination[pageSize]', '1000'); 

        const response = await fetch(url.toString(), {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);

        if (data && data.data && data.data.length > 0) {
            const analysisIds = data.data.map((result: { id: number }) => result.id);
            
            await Promise.all(
                analysisIds.map(id => 
                    fetch(`${API_BASE_URL}/analysis-results/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    }).then(handleResponse)
                )
            );
        }
    } catch (error) {
        console.error("Error al eliminar los resultados de análisis:", error);
        throw new Error("No se pudieron eliminar todos los análisis.");
    }
}