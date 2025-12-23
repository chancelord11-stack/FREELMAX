// ============================================
// Types basés sur les schémas SQL Freenance
// ============================================

// ============================================
// ENUMS (PARTIE_1_Extensions_et_Types.sql)
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
  Penalty = 'penalty'
}

export enum PaymentMethod {
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  MobileMoney = 'mobile_money',
  BankTransfer = 'bank_transfer',
  Paypal = 'paypal'
}

// ============================================
// INTERFACES - Tables Principales (PARTIE_2)
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
    new_projects: boolean;
    order_updates: boolean;
    marketing: boolean;
  };
  
  // Verification
  is_verified: boolean;
  is_identity_verified: boolean;
  verification_documents: any[];
  verification_requested_at: string | null;
  verified_at: string | null;
  
  // Statistics
  total_earnings: number;
  total_spent: number;
  completed_projects: number;
  rating_avg: number;
  response_time_avg: number;
  
  // Freelancer specific
  hourly_rate: number | null;
  level: FreelancerLevel;
  available: boolean;
  skills: string[];
  portfolio: any[];
  
  // Client specific
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  tax_id: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  last_activity_at: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  sort_order: number;
  is_active: boolean;
  
  // Statistics
  total_services: number;
  total_projects: number;
  average_price: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id: string;
  subcategory_id: string | null;
  
  // Basic Info
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  
  // Media
  cover_image_url: string | null;
  gallery: any[];
  video_url: string | null;
  
  // Configuration
  status: ServiceStatus;
  is_featured: boolean;
  is_urgent: boolean;
  delivery_days: number;
  revision_limit: number;
  additional_revision_price: number;
  
  // Pricing
  price_basic: number;
  price_standard: number | null;
  price_premium: number | null;
  features_basic: string[];
  features_standard: string[];
  features_premium: string[];
  
  // Requirements
  requirements: any[];
  faq: any[];
  
  // Tags & SEO
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  
  // Statistics
  views_count: number;
  clicks_count: number;
  favorites_count: number;
  orders_count: number;
  rating_avg: number;
  revenue_total: number;
  
  // Timestamps
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
  
  // Project Info
  title: string;
  description: string;
  requirements: string | null;
  attachments: any[];
  
  // Budget & Timeline
  budget_type: 'fixed' | 'hourly' | 'range';
  budget_min: number | null;
  budget_max: number | null;
  hourly_rate: number | null;
  deadline: string | null;
  estimated_duration: string | null;
  
  // Location
  location_type: 'remote' | 'onsite' | 'hybrid';
  city: string | null;
  country: string | null;
  address: string | null;
  
  // Status
  status: ProjectStatus;
  visibility: 'public' | 'private' | 'invite_only';
  
  // Requirements
  skills_required: string[];
  experience_level: 'entry' | 'intermediate' | 'expert' | null;
  
  // Statistics
  views_count: number;
  proposals_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deadline_at: string | null;
}

export interface Proposal {
  id: string;
  project_id: string;
  freelancer_id: string;
  
  // Offer details
  cover_letter: string;
  proposed_budget: number;
  proposed_timeline: number;
  attachments: any[];
  
  // Status
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  
  // Timestamps
  created_at: string;
  updated_at: string;
  responded_at: string | null;
}

export interface Order {
  id: string;
  service_id: string | null;
  project_id: string | null;
  proposal_id: string | null;
  
  // Parties
  buyer_id: string;
  seller_id: string;
  
  // Order details
  package_type: 'basic' | 'standard' | 'premium' | 'custom' | null;
  title: string;
  description: string | null;
  requirements: string | null;
  
  // Pricing
  price: number;
  commission_rate: number;
  commission_amount: number;
  freelancer_earnings: number;
  
  // Delivery
  delivery_days: number;
  revisions_limit: number;
  revisions_used: number;
  deliverables: any[];
  
  // Status tracking
  status: OrderStatus;
  accepted_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  
  // Cancellation
  cancellation_reason: string | null;
  cancelled_by: string | null;
  refund_amount: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

// ============================================
// INTERFACES - Tables Secondaires (PARTIE_3)
// ============================================

export interface Wallet {
  id: string;
  user_id: string;
  
  // Balances
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  total_withdrawn: number;
  
  // Withdrawal settings
  withdrawal_method: PaymentMethod | null;
  withdrawal_details: any;
  min_withdrawal_amount: number;
  
  // Statistics
  successful_withdrawals: number;
  failed_withdrawals: number;
  last_withdrawal_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  order_id: string | null;
  
  // Transaction details
  type: TransactionType;
  amount: number;
  currency: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  
  // Payment details
  payment_method: PaymentMethod | null;
  payment_reference: string | null;
  payment_gateway: string | null;
  gateway_response: any | null;
  
  // Description
  description: string | null;
  metadata: any;
  
  // Balances after transaction
  balance_before: number | null;
  balance_after: number | null;
  
  // Error handling
  error_message: string | null;
  retry_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  order_id: string | null;
  
  // Parties
  sender_id: string;
  receiver_id: string;
  
  // Content
  message: string;
  attachments: any[];
  
  // Status
  is_read: boolean;
  read_at: string | null;
  is_deleted_by_sender: boolean;
  is_deleted_by_receiver: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  
  // Parties
  reviewer_id: string;
  reviewed_id: string;
  
  // Ratings
  rating_overall: number;
  rating_communication: number | null;
  rating_quality: number | null;
  rating_deadlines: number | null;
  
  // Content
  title: string | null;
  comment: string | null;
  reply: string | null;
  replied_at: string | null;
  
  // Metadata
  is_public: boolean;
  is_featured: boolean;
  helpful_count: number;
  report_count: number;
  
  // Moderation
  status: 'pending' | 'published' | 'hidden' | 'removed';
  moderated_by: string | null;
  moderated_at: string | null;
  moderation_notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  
  // Content
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  
  // Metadata
  data: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Status
  is_read: boolean;
  read_at: string | null;
  
  // Delivery
  channels: string[];
  email_sent: boolean;
  push_sent: boolean;
  sms_sent: boolean;
  
  // Expiration
  expires_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  
  // Parties
  opened_by: string;
  disputed_user_id: string;
  
  // Details
  type: 'quality' | 'deadline' | 'communication' | 'payment' | 'other';
  reason: string;
  description: string | null;
  desired_resolution: string | null;
  
  // Status
  status: 'open' | 'under_review' | 'awaiting_response' | 'resolved' | 'cancelled';
  
  // Resolution
  resolution_type: 'full_refund' | 'partial_refund' | 'deliver_work' | 'compensation' | 'no_action' | null;
  resolution_details: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  
  // Evidence
  evidences: any[];
  
  // Communication
  messages_count: number;
  last_message_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface PlatformSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string | null;
  is_public: boolean;
  is_editable: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  
  // Activity
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  
  // Details
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  location: any | null;
  
  // Metadata
  metadata: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  
  // Timestamps
  created_at: string;
}

// ============================================
// ADDITIONAL TYPES (code.sql et code.j.sql)
// ============================================

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  details: any;
  status: 'pending' | 'processed' | 'rejected';
  processed_at: string | null;
  created_at: string;
}

// ============================================
// UI HELPER TYPES
// ============================================

export interface ConversationInfo {
  id: string;
  participant: Profile;
  last_message: Message;
  unread_count: number;
}

export interface ServiceWithFreelancer extends Service {
  freelancer: Profile;
}

export interface OrderWithDetails extends Order {
  buyer: Profile;
  seller: Profile;
  service?: Service;
  project?: Project;
}

export interface ProjectWithClient extends Project {
  client: Profile;
}

export interface ProposalWithFreelancer extends Proposal {
  freelancer: Profile;
}
