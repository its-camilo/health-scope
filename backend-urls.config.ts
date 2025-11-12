type Environment = 'local' | 'codespaces' | 'strapi-cloud';

// ⬅️ CAMBIAR SEGÚN ENTORNO ('local', 'codespaces', 'strapi-cloud')
const ACTIVE_ENVIRONMENT: Environment = 'codespaces';

const BACKEND_URLS: Record<Environment, { url: string; description: string }> = {
  // 1. DESARROLLO LOCAL
  local: {
    url: 'http://localhost:1337',
    description: 'Servidor local de desarrollo'
  },

  // 2. GITHUB CODESPACES
  codespaces: {
    url: 'https://special-trout-6pwpqrv9gvq35rw9-1337.app.github.dev',
    description: 'GitHub Codespaces'
  },

  // 3. STRAPI CLOUD (Producción)
  'strapi-cloud': {
    url: 'https://your-project-name.strapiapp.com', // ⬅️ ACTUALIZAR
    description: 'Strapi Cloud (Producción)'
  }
};

export const BACKEND_URL = BACKEND_URLS[ACTIVE_ENVIRONMENT].url;
