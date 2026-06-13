// Configuration for the Frontend Application
// In DevOps environments, the API URL can be injected via build-time environment variables
// (e.g. VITE_API_URL=http://api.voyagequota.internal).
// Fallback is localhost:5000 for local development.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
