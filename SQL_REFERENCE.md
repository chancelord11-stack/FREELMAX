# Référence SQL - Structure de la Base de Données Freenance

## Vue d'ensemble

Cette application est construite sur une architecture PostgreSQL complète avec 15+ tables interconnectées.

## Tables Principales

### 1. profiles (PARTIE_2)
**Rôle**: Stockage des profils utilisateurs (freelancers et clients)

**Champs clés**:
- `id` (UUID, PK) - Lié à auth.users
- `role` (user_role) - freelancer | client | admin
- `level` (freelancer_level) - new | level1 | level2 | top_rated
- `total_earnings`, `total_spent` - Statistiques financières
- `rating_avg` - Note moyenne (calculée via triggers)
- `skills[]` - Array de compétences
- `portfolio` (JSONB) - Portfolio du freelancer
- `notification_preferences` (JSONB) - Préférences de notifications

**Relations**:
- 1:N avec services (freelancer_id)
- 1:N avec projects (client_id)
- 1:N avec orders (buyer_id, seller_id)
- 1:1 avec wallets (user_id)

### 2. services (PARTIE_2)
**Rôle**: Services offerts par les freelancers (type "gig")

**Champs clés**:
- `id` (UUID, PK)
- `freelancer_id` (UUID, FK → profiles)
- `category_id`, `subcategory_id` (UUID, FK → categories)
- `status` (service_status) - draft | active | paused | rejected | deleted
- `price_basic`, `price_standard`, `price_premium` - Packages de prix
- `features_basic`, `features_standard`, `features_premium` (JSONB)
- `delivery_days` - Délai de livraison
- `revision_limit` - Nombre de révisions incluses
- `tags[]` - Tags pour la recherche
- `search_vector` (tsvector) - Full-text search
- `rating_avg`, `orders_count`, `revenue_total` - Statistiques

**Index**:
- GIN sur tags
- GIN sur search_vector (full-text)
- B-tree sur freelancer_id, category_id, status, rating_avg

### 3. projects (PARTIE_2)
**Rôle**: Projets publiés par les clients

**Champs clés**:
- `id` (UUID, PK)
- `client_id` (UUID, FK → profiles)
- `status` (project_status) - draft | published | bidding | assigned | in_progress | review | completed | cancelled | disputed
- `budget_type` - fixed | hourly | range
- `budget_min`, `budget_max`, `hourly_rate`
- `location_type` - remote | onsite | hybrid
- `skills_required[]` - Compétences requises
- `experience_level` - entry | intermediate | expert
- `visibility` - public | private | invite_only
- `search_vector` (tsvector)

**Relations**:
- 1:N avec proposals

### 4. proposals (PARTIE_2)
**Rôle**: Propositions des freelancers sur les projets

**Champs clés**:
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects)
- `freelancer_id` (UUID, FK → profiles)
- `cover_letter` - Lettre de motivation
- `proposed_budget`, `proposed_timeline`
- `status` - pending | shortlisted | accepted | rejected | withdrawn
- `attachments` (JSONB)

### 5. orders (PARTIE_2)
**Rôle**: Commandes/contrats entre clients et freelancers

**Champs clés**:
- `id` (UUID, PK)
- `service_id` (UUID, FK → services, nullable)
- `project_id` (UUID, FK → projects, nullable)
- `proposal_id` (UUID, FK → proposals, nullable)
- `buyer_id`, `seller_id` (UUID, FK → profiles)
- `status` (order_status) - pending | confirmed | in_progress | delivered | revision_requested | completed | cancelled | disputed | refunded
- `package_type` - basic | standard | premium | custom
- `price`, `commission_rate`, `commission_amount`, `freelancer_earnings`
- `delivery_days`, `revisions_limit`, `revisions_used`
- `deliverables` (JSONB)
- Timestamps: `accepted_at`, `started_at`, `delivered_at`, `completed_at`, `cancelled_at`

**Logique métier**:
- Commission par défaut: 10%
- `freelancer_earnings = price - commission_amount`

## Tables Secondaires

### 6. wallets (PARTIE_3)
**Rôle**: Portefeuilles des utilisateurs

**Champs clés**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles, UNIQUE)
- `available_balance` - Solde disponible pour retrait
- `pending_balance` - Solde en attente (escrow)
- `total_earnings`, `total_withdrawn`
- `withdrawal_method` (payment_method)
- `withdrawal_details` (JSONB)
- `min_withdrawal_amount` (default 5000 XOF)

**Contraintes**:
- `available_balance >= 0`
- `pending_balance >= 0`

### 7. transactions (PARTIE_3)
**Rôle**: Historique de toutes les transactions

**Champs clés**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `wallet_id` (UUID, FK → wallets)
- `order_id` (UUID, FK → orders)
- `type` (transaction_type) - deposit | escrow_hold | escrow_release | withdrawal | refund | commission | bonus | penalty
- `amount`, `currency`
- `status` - pending | processing | completed | failed | cancelled | refunded
- `payment_method`, `payment_reference`, `payment_gateway`
- `gateway_response` (JSONB)
- `balance_before`, `balance_after`

### 8. messages (PARTIE_3)
**Rôle**: Système de messagerie

**Champs clés**:
- `id` (UUID, PK)
- `conversation_id` (UUID) - Identifiant de conversation (non FK)
- `order_id` (UUID, FK → orders, nullable)
- `sender_id`, `receiver_id` (UUID, FK → profiles)
- `message` (TEXT)
- `attachments` (JSONB)
- `is_read`, `read_at`
- `is_deleted_by_sender`, `is_deleted_by_receiver`

**Index**:
- Composite sur (conversation_id, created_at)
- Filtre sur is_read = false

### 9. reviews (PARTIE_3)
**Rôle**: Avis et évaluations

**Champs clés**:
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders, UNIQUE)
- `reviewer_id`, `reviewed_id` (UUID, FK → profiles)
- `rating_overall` (1-5, required)
- `rating_communication`, `rating_quality`, `rating_deadlines` (1-5, optional)
- `title`, `comment`, `reply`
- `is_public`, `is_featured`
- `status` - pending | published | hidden | removed

**Contraintes**:
- Un seul avis par commande
- Ratings entre 1 et 5

### 10. notifications (PARTIE_3)
**Rôle**: Système de notifications

**Champs clés**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles)
- `type` - Type de notification
- `title`, `message`, `action_url`
- `data` (JSONB) - Données additionnelles
- `priority` - low | normal | high | urgent
- `is_read`, `read_at`
- `channels` (JSONB) - [in_app, email, push, sms]
- `email_sent`, `push_sent`, `sms_sent`

### 11. disputes (PARTIE_3)
**Rôle**: Gestion des litiges

**Champs clés**:
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders, UNIQUE)
- `opened_by`, `disputed_user_id` (UUID, FK → profiles)
- `type` - quality | deadline | communication | payment | other
- `status` - open | under_review | awaiting_response | resolved | cancelled
- `resolution_type` - full_refund | partial_refund | deliver_work | compensation | no_action
- `evidences` (JSONB)

## Tables Utilitaires

### 12. categories (PARTIE_2)
**Rôle**: Catégories et sous-catégories

**Champs clés**:
- `id` (UUID, PK)
- `parent_id` (UUID, FK → categories, nullable) - Pour sous-catégories
- `name`, `slug`, `description`
- `icon`, `color`
- `sort_order`
- `total_services`, `total_projects`, `average_price` - Statistiques

### 13. platform_settings (PARTIE_3)
**Rôle**: Configuration de la plateforme

**Champs clés**:
- `id` (UUID, PK)
- `category`, `key` (UNIQUE ensemble)
- `value` (JSONB)
- `data_type` - string | number | boolean | array | object
- `is_public`, `is_editable`

### 14. activity_logs (PARTIE_3)
**Rôle**: Logs d'activité

**Champs clés**:
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles, nullable)
- `action`, `entity_type`, `entity_id`
- `ip_address` (INET), `user_agent`
- `metadata` (JSONB)
- `severity` - info | warning | error | critical

## Triggers et Fonctions

### 1. update_updated_at_column()
**Rôle**: Mise à jour automatique de `updated_at`
**Tables**: Toutes les tables avec colonne `updated_at`

### 2. services_search_vector_update()
**Rôle**: Mise à jour du vecteur de recherche full-text
**Trigger**: BEFORE INSERT OR UPDATE sur services

### 3. projects_search_vector_update()
**Rôle**: Mise à jour du vecteur de recherche full-text
**Trigger**: BEFORE INSERT OR UPDATE sur projects

## Flux de Données

### Flux Commande Service:
1. Client cherche un service
2. Client passe commande → INSERT orders (status: 'pending')
3. Fonds bloqués → INSERT transactions (type: 'escrow_hold'), UPDATE wallets
4. Freelancer accepte → UPDATE orders (status: 'confirmed')
5. Freelancer livre → UPDATE orders (status: 'delivered', deliverables)
6. Client accepte ou demande révision
7. Validation finale → UPDATE orders (status: 'completed')
8. Fonds libérés → INSERT transactions (type: 'escrow_release'), UPDATE wallets
9. Évaluation → INSERT reviews

### Flux Projet:
1. Client publie projet → INSERT projects (status: 'published')
2. Freelancers soumettent propositions → INSERT proposals
3. Client accepte une proposition → UPDATE proposals (status: 'accepted')
4. Création automatique de commande → INSERT orders
5. Suite identique au flux service

## Indices Importants

- **Full-text search**: GIN sur search_vector (services, projects)
- **Arrays**: GIN sur skills, tags
- **Performance**: B-tree sur toutes les FK
- **Filtres fréquents**: Index sur status, created_at, rating_avg

## Row Level Security (RLS)

À configurer dans 004_policies.sql:
- Users peuvent voir leurs propres données
- Données publiques accessibles à tous
- Restrictions sur modifications selon rôle
- Séparation client/freelancer

## Considérations de Performance

1. **Pagination**: Utiliser LIMIT/OFFSET avec curseurs
2. **Search**: Utiliser to_tsquery avec pg_trgm pour fuzzy search
3. **Statistiques**: Utiliser materialized views pour calculs lourds
4. **Cache**: Redis pour sessions et données fréquentes
5. **CDN**: Pour images et fichiers statiques

---

**Note**: Cette structure est production-ready avec gestion complète:
- Finances (wallets, transactions)
- Communications (messages, notifications)
- Qualité (reviews, disputes)
- Audit (activity_logs)
- Configuration (platform_settings)
