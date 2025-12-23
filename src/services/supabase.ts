import { createClient } from '@supabase/supabase-js';

// ✅ Pour Vite, utiliser import.meta.env au lieu de process.env
// Assurez-vous d'avoir un fichier .env à la racine avec:
// VITE_SUPABASE_URL=votre_url
// VITE_SUPABASE_ANON_KEY=votre_clé

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.error('Créez un fichier .env avec:');
  console.error('VITE_SUPABASE_URL=https://votre-projet.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=votre_clé_anon');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Helper pour vérifier la connexion
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};
