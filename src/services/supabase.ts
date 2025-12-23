import { createClient } from '@supabase/supabase-js';

// ✅ Pour Vite, utiliser import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
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

// ✅ AJOUTÉ: Helpers Auth manquants
export const signIn = async ({ email, password }: any) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async ({ email, password, options }: any) => {
  return supabase.auth.signUp({ email, password, options });
};