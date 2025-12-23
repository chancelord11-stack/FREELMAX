#!/bin/bash
set -e

# Types complets
cat > src/types/index.ts << 'EOF'
export type UserRole = 'freelancer' | 'client';
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  rating_avg: number;
  completed_projects: number;
  total_earnings: number;
  created_at: string;
}
export interface Service {
  id: string;
  title: string;
  description: string;
  price_basic: number;
  delivery_days: number;
  rating_avg: number;
}
export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
}
EOF

# Utils
cat > src/utils/format.ts << 'EOF'
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-BJ', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR');
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};
EOF

cat > src/utils/constants.ts << 'EOF'
export const MOBILE_MONEY_PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', code: '*155#', color: '#FFCB05' },
  { id: 'moov', name: 'Moov Money', code: '*855#', color: '#009FE3' },
  { id: 'orange', name: 'Orange Money', code: '*144#', color: '#FF6600' },
  { id: 'wave', name: 'Wave', code: 'App', color: '#00D632' },
];
EOF

# Supabase service
cat > src/services/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string, metadata: any) => {
  return await supabase.auth.signUp({ email, password, options: { data: metadata } });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};
EOF

# CSS Premium
cat > src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-gray-50 text-gray-900 font-sans antialiased; }
}

@layer components {
  .btn { @apply inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200; }
  .btn-primary { @apply bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl active:scale-95; }
  .btn-secondary { @apply bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-primary-300; }
  .input { @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none; }
  .card { @apply bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md; }
  .badge { @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium; }
  .badge-success { @apply bg-green-100 text-green-700; }
  .avatar { @apply inline-flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold rounded-full; }
}
EOF

# Main entry
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>,
)
EOF

echo "✅ Fichiers de base créés"
wc -l src/**/*.{ts,tsx,css} 2>/dev/null | tail -5
