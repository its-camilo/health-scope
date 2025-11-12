import React, { useState } from 'react';
import { BACKEND_URL } from '../backend-urls.config.ts';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = `${BACKEND_URL}/api`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const url = isLoginView ? `${API_URL}/auth/local` : `${API_URL}/auth/local/register`;
    const body = isLoginView
      ? { identifier: email, password }
      : { username, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Ocurrió un error. Inténtalo de nuevo.');
      }
      
      localStorage.setItem('jwt', data.jwt);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight dark:text-gray-100">Health Scope</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {isLoginView ? 'Inicia sesión para continuar' : 'Crea una cuenta para empezar'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {!isLoginView && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Nombre de Usuario
                </label>
                <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-500 dark:text-white"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="appearance-none block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-500 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Contraseña
              </label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-500 dark:text-white"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <div className="pt-2">
               <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : (isLoginView ? 'Iniciar Sesión' : 'Registrarse')}
              </button>
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
              <button type="button" onClick={toggleView} className="font-medium text-blue-600 hover:text-blue-500 ml-1 dark:text-blue-400 dark:hover:text-blue-300">
                 {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;