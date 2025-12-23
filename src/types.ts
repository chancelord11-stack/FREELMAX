// ============================================
// Types basés sur les schémas SQL Freenance
// VERSION CORRIGÉE V4 - Build Fix
// ============================================

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  Freelancer = 'freelancer',
  Client = 'client',
  Admin = 'admin'
}

export enum FreelancerLevel {
  New = 'new',
  Level1 = 'level1',
  Level2 = 'level2',
  TopRated = 'top_rated'
}

export enum ServiceStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Rejected = 'rejected',
  Deleted = 'deleted'
}

export enum ProjectStatus {
  Draft = 'draft',
  Published = 'published',
  Bidding = 'bidding',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Review = 'review',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Disputed = 'disputed'
}

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Delivered = 'delivered',
  RevisionRequested = 'revision_requested',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Disputed = 'disputed',
  Refunded = 'refunded'
}

export enum TransactionType {
  Deposit = 'deposit',
  EscrowHold = 'escrow_hold',
  EscrowRelease = 'escrow_release',
  Withdrawal = 'withdrawal',
  Refund = 'refund',
  Commission = 'commission',
  Bonus = 'bonus',
  Penalty = 'penalty',
  Earning = 'earning',
  Transfer = 'transfer'
}

export enum PaymentMethod {
  MtnMomo = 'mtn_momo',
  MoovMoney = 'moov_money',
  OrangeMoney = 'orange_money',
  Wave = 'wave',
  BankTransfer = 'bank_transfer',
  Paypal = 'paypal',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  MobileMoney = 'mobile_money'
}

export enum ProposalStatus {
  Pending = 'pending',
  Shortlisted = 'shortlisted',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Withdrawn = 'withdrawn'
}

export enum DisputeType {
  QualityIssue = 'quality_issue',
  LateDelivery = 'late_delivery',
  Communication = 'communication',
  Fraud = 'fraud',
  Other = 'other'
}

export enum DisputeStatus {
  Open = 'open',
  UnderReview = 'under_review',
  AwaitingResponse = 'awaiting_response',
  Resolved = 'resolved',
  Escalated = 'escalated',
  Closed = 'closed'
}

export enum NotificationType {
  NewOrder = 'new_order',
  OrderUpdate = 'order_update',
  NewMessage = 'new_message',
  NewProposal = 'new_proposal',
  ProposalAccepted = 'proposal_accepted',
  PaymentReceived = 'payment_received',
  WithdrawalProcessed = 'withdrawal_processed',
  NewReview = 'new_review',
  DisputeOpened = 'dispute_opened',
  DisputeResolved = 'dispute_resolved',
  LevelUp = 'level_up',
  System = 'system'
}

// ============================================
// INTERFACES
// ============================================

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  headline: string | null;
  
  // Location
  country: string;
  city: string | null;
  address: string | null;
  timezone: string;
  
  // Preferences
  language: string;
  currency: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    new_messages: boolean;
    new_orders: boolean;
    marketing: boolean;
  };
  
  // Freelancer specific
  level: FreelancerLevel;
  skills: string[];
  portfolio_urls: string[];
  portfolio: any[]; // ✅ Corrigé: Ajouté pour ProfileEdit
  hourly_rate: number | null;
  available: boolean;
  
  // Client specific
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  tax_id: string | null;
  
  // Statistics
  rating_avg: number;
  reviews_count: number;
  orders_completed: number;
  completed_projects: number; // ✅ Corrigé
  total_earnings: number;
  total_spent: number;
  response_time_avg: number | null;
  
  // Verification
  is_verified: boolean;
  is_identity_verified: boolean;
  verification_documents: any;
  
  // Status
  is_online: boolean;
  last_login_at: string | null;
  last_activity_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  services_count: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id: string;
  subcategory_id: string | null;
  
  title: string;
  slug: string;
  short_description: string | null;
  description: string;
  
  cover_image_url: string | null;
  gallery: string[];
  video_url: string | null;
  
  price_basic: number;
  price_standard: number | null;
  price_premium: number | null;
  
  // ✅ Corrigé: Champs features ajoutés
  features_basic?: string[];
  features_standard?: string[];
  features_premium?: string[];
  
  delivery_days: number;
  revision_limit: number;
  additional_revision_price: number | null;
  
  tags: string[];
  requirements: any;
  faq: any[];
  
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  
  views_count: number;
  clicks_count: number;
  favorites_count: number;
  orders_count: number;
  rating_avg: number;
  reviews_count: number;
  
  status: ServiceStatus;
  is_featured: boolean;
  is_urgent: boolean;
  
  created_at: string;
  updated_at: string;
  published_at: string | null;
  last_order_at: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  assigned_freelancer_id: string | null;
  
  title: string;
  description: string;
  requirements: any;
  attachments: string[];
  
  budget_type: 'fixed' | 'hourly' | 'range';
  budget_min: number | null;
  budget_max: number | null;
  hourly_rate?: number | null; // ✅ Corrigé
  
  deadline: string | null;
  estimated_duration: string | null;
  
  required_skills: string[];
  experience_level: 'entry' | 'intermediate' | 'expert' | 'any';
  
  location_type: 'remote' | 'onsite' | 'hybrid';
  city: string | null;
  country: string | null;
  
  status: ProjectStatus;
  visibility: 'public' | 'private' | 'invite_only';
  
  views_count: number;
  proposals_count: number;
  
  created_at: string;
  updated_at: string;
  published_at: string | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  deadline_at: string | null;
}

export interface Proposal {
  id: string;
  project_id: string;
  freelancer_id: string;
  
  cover_letter: string;
  proposed_budget: number;
  proposed_timeline: number;
  
  milestones: {
    title: string;
    description: string;
    amount: number;
    duration_days: number;
  }[];
  
  attachments: string[];
  status: ProposalStatus;
  client_notes: string | null;
  
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface Order {
  id: string;
  service_id: string | null;
  project_id: string | null;
  proposal_id: string | null;
  buyer_id: string;
  seller_id: string;
  
  title: string;
  description: string | null;
  requirements: string | null;
  package_type: 'basic' | 'standard' | 'premium' | 'custom';
  
  price: number;
  commission_rate: number;
  commission_amount: number;
  freelancer_earnings: number;
  
  delivery_days: number;
  due_date: string | null;
  
  revisions_limit: number;
  revisions_used: number;
  deliverables: any[];
  status: OrderStatus;
  
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  total_withdrawn: number;
  withdrawal_method: PaymentMethod | null;
  withdrawal_details: any;
  min_withdrawal_amount: number;
  successful_withdrawals: number;
  failed_withdrawals: number;
  last_withdrawal_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  order_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  payment_gateway: string | null;
  gateway_response: any | null;
  description: string | null;
  metadata: any;
  balance_before: number | null;
  balance_after: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  fee: number;
  net_amount: number;
  method: PaymentMethod;
  details: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processed_by: string | null;
  processed_at: string | null;
  reference: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  order_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count_1: number;
  unread_count_2: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  
  // ✅ Corrigé: message au lieu de content, et ajout de order_id
  message: string; 
  order_id: string | null;
  attachments: string[];
  
  is_read: boolean;
  read_at: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  is_deleted_by_sender?: boolean;
  is_deleted_by_receiver?: boolean;
  
  created_at: string;
  updated_at: string;
}

// ✅ Ajouté: Type manquant utilisé dans messageService
export interface ConversationInfo {
  id: string;
  participant: Profile;
  last_message: Message;
  unread_count: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  data: any;
  is_read: boolean;
  read_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  expires_at: string | null;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_id: string;
  service_id: string | null;
  
  rating: number;
  rating_overall: number; // ✅ Ajouté
  communication_rating: number | null;
  quality_rating: number | null;
  delivery_rating: number | null;
  
  title: string | null;
  comment: string;
  
  response: string | null;
  response_at: string | null;
  reply?: string | null; // ✅ Ajouté
  replied_at?: string | null;
  
  status: 'pending' | 'published' | 'hidden' | 'flagged';
  is_public: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by: string;
  disputed_user_id: string;
  type: DisputeType;
  reason: string;
  description: string;
  evidences: string[];
  status: DisputeStatus;
  assigned_to: string | null;
  resolution: string | null;
  resolution_notes: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

// ============================================
// Types avec Relations (Aliases)
// ============================================

export interface ServiceWithDetails extends Service {
  freelancer?: Profile;
  category?: Category;
  subcategory?: Category;
  reviews?: Review[];
}
// ✅ Alias manquant
export type ServiceWithFreelancer = ServiceWithDetails;

export interface ProjectWithDetails extends Project {
  client?: Profile;
  category?: Category;
  subcategory?: Category;
  proposals?: Proposal[];
  assigned_freelancer?: Profile;
}
// ✅ Alias manquant
export type ProjectWithClient = ProjectWithDetails;

export interface OrderWithDetails extends Order {
  buyer?: Profile;
  seller?: Profile;
  service?: Service;
  project?: Project;
  reviews?: Review[];
}

export interface ProposalWithDetails extends Proposal {
  freelancer?: Profile;
  project?: Project;
}
// ✅ Alias manquant
export type ProposalWithFreelancer = ProposalWithDetails;

export interface ConversationWithDetails extends Conversation {
  participant_1?: Profile;
  participant_2?: Profile;
  messages?: Message[];
  order?: Order;
}

// ============================================
// Props des composants
// ============================================

export interface OrdersProps {
  userId: string;
  onOrderClick?: (id: string) => void;
}

export interface ProfileProps {
  userId: string;
  onEdit?: () => void;
}