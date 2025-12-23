/// <reference types="vite/client" />

// ✅ Ce fichier résout l'erreur: Property 'env' does not exist on type 'ImportMeta'
// Placez ce fichier dans le dossier src/ de votre projet

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Ajoutez d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
