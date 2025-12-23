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
