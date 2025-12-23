# Guide d'Implémentation - Freenance Frontend

## État Actuel du Projet

### ✅ Complété

#### Structure de Base
- [x] Configuration Vite + React + TypeScript
- [x] Configuration Tailwind CSS
- [x] Structure de dossiers
- [x] Configuration Supabase

#### Types TypeScript
- [x] Tous les ENUMs du schéma SQL
- [x] Toutes les interfaces de tables
- [x] Types helper (ConversationInfo, ServiceWithFreelancer, etc.)

#### Services API
- [x] supabase.ts - Configuration et helpers auth
- [x] profileService.ts - Gestion des profils
- [x] serviceService.ts - CRUD services
- [x] orderService.ts - Gestion des commandes
- [x] walletService.ts - Portefeuille et transactions
- [x] projectService.ts - Projets et propositions
- [x] messageService.ts - Messagerie
- [x] reviewService.ts - Avis et évaluations

#### Utilitaires
- [x] format.ts - Formatage dates, devises, statuts
- [x] constants.ts - Constantes de l'application

#### Composants
- [x] Sidebar.tsx - Navigation latérale
- [x] Header.tsx - En-tête avec recherche et profil
- [x] AuthModal.tsx - Modal d'authentification (stub)

#### Vues
- [x] Dashboard.tsx - Tableau de bord complet
- [x] Services.tsx - Liste des services (stub)
- [x] ServiceDetail.tsx - Détail d'un service (stub)
- [x] Projects.tsx - Liste des projets (stub)
- [x] ProjectDetail.tsx - Détail d'un projet (stub)
- [x] Orders.tsx - Gestion des commandes (stub)
- [x] OrderDetail.tsx - Détail d'une commande (stub)
- [x] Messages.tsx - Messagerie (stub)
- [x] Wallet.tsx - Portefeuille (stub)
- [x] Profile.tsx - Profil utilisateur (stub)
- [x] Settings.tsx - Paramètres (stub)

#### Documentation
- [x] README.md - Documentation complète
- [x] SQL_REFERENCE.md - Référence SQL détaillée
- [x] IMPLEMENTATION_GUIDE.md - Ce guide

### 🚧 À Implémenter

#### 1. Compléter AuthModal.tsx
**Priorité**: HAUTE
**Fichier**: src/components/AuthModal.tsx
**Tâches**:
- Intégrer signIn() et signUp() de supabase.ts
- Gestion des erreurs avec messages appropriés
- Validation des formulaires
- Mode "mot de passe oublié"

#### 2. Compléter Services.tsx
**Priorité**: HAUTE
**Fichier**: src/views/Services.tsx
**Tâches**:
- Afficher la liste des services (getActiveServices)
- Filtres: catégorie, prix, rating, tags, delivery_days
- Recherche full-text (searchServices)
- Cards de service avec image, titre, prix, rating
- Pagination

#### 3. Compléter ServiceDetail.tsx
**Priorité**: HAUTE
**Fichier**: src/views/ServiceDetail.tsx
**Tâches**:
- Afficher service complet (getServiceById)
- Galerie d'images
- Packages (Basic, Standard, Premium)
- FAQ
- Avis clients (getUserReviews)
- Bouton "Commander"
- Profil du freelancer

#### 4. Compléter Projects.tsx
**Priorité**: HAUTE
**Fichier**: src/views/Projects.tsx
**Tâches**:
- Afficher projets publics (getPublicProjects)
- Filtres: catégorie, budget, compétences, localisation
- Cards de projet
- Pour freelancers: bouton "Soumettre proposition"

#### 5. Compléter ProjectDetail.tsx
**Priorité**: HAUTE
**Fichier**: src/views/ProjectDetail.tsx
**Tâches**:
- Détails du projet complet
- Liste des propositions (si client propriétaire)
- Formulaire de proposition (si freelancer)
- Profil du client

#### 6. Compléter Orders.tsx
**Priorité**: HAUTE
**Fichier**: src/views/Orders.tsx
**Tâches**:
- Liste des commandes (getUserOrders)
- Onglets: Actives, Terminées, Toutes
- Filtres par statut
- Cards avec statut, deadline, prix
- Différenciation buyer/seller

#### 7. Compléter OrderDetail.tsx
**Priorité**: HAUTE
**Fichier**: src/views/OrderDetail.tsx
**Tâches**:
- Détails complets de la commande
- Timeline du statut
- Zone de livraison (deliverables)
- Boutons d'action selon statut:
  - Accepter (freelancer, si pending)
  - Livrer (freelancer, si in_progress)
  - Accepter/Demander révision (client, si delivered)
  - Compléter (client, validation finale)
  - Ouvrir litige
- Chat intégré pour cette commande

#### 8. Compléter Messages.tsx
**Priorité**: MOYENNE
**Fichier**: src/views/Messages.tsx
**Tâches**:
- Liste des conversations (getUserConversations)
- Zone de chat avec messages
- Envoi de messages (sendMessage)
- Upload de fichiers (attachments)
- Temps réel (subscribeToMessages)
- Marquer comme lu (markConversationAsRead)

#### 9. Compléter Wallet.tsx
**Priorité**: HAUTE
**Fichier**: src/views/Wallet.tsx
**Tâches**:
- Afficher soldes (getWallet)
- Historique transactions (getTransactions)
- Bouton "Retirer" (createWithdrawal)
- Modal de retrait avec méthodes de paiement
- Graphique des revenus
- Stats (getWalletStats)

#### 10. Compléter Profile.tsx
**Priorité**: MOYENNE
**Fichier**: src/views/Profile.tsx
**Tâches**:
- Afficher profil complet (getProfile)
- Portfolio (si freelancer)
- Liste des services (si freelancer)
- Liste des projets (si client)
- Avis reçus (getUserReviews)
- Stats (rating, projets terminés, etc.)
- Mode édition (si profil personnel)

#### 11. Compléter Settings.tsx
**Priorité**: MOYENNE
**Fichier**: src/views/Settings.tsx
**Tâches**:
- Onglets: Général, Sécurité, Notifications, Paiement
- Formulaires de mise à jour
- Validation
- Upload d'avatar
- Gestion des compétences (si freelancer)
- Préférences de notifications
- Méthodes de retrait

### 🎨 Composants Additionnels à Créer

#### ServiceCard.tsx
Affichage d'un service dans une liste
- Image, titre, prix, rating, freelancer

#### ProjectCard.tsx
Affichage d'un projet dans une liste
- Titre, budget, compétences, deadline

#### OrderCard.tsx
Affichage d'une commande dans une liste
- Titre, statut, prix, deadline

#### ReviewCard.tsx
Affichage d'un avis
- Rating, commentaire, réponse

#### ChatMessage.tsx
Affichage d'un message dans le chat
- Avatar, contenu, timestamp, attachments

#### ProposalCard.tsx
Affichage d'une proposition
- Freelancer, budget proposé, timeline, cover letter

#### NotificationDropdown.tsx
Dropdown des notifications
- Liste des notifications non lues
- Action selon type

#### LoadingSpinner.tsx
Spinner de chargement réutilisable

#### EmptyState.tsx
État vide réutilisable
- Icône, message, action

#### ConfirmModal.tsx
Modal de confirmation
- Pour actions destructives (annulation, suppression)

## Ordre d'Implémentation Recommandé

### Phase 1 - Authentification (1-2 jours)
1. AuthModal complet avec Supabase
2. Gestion des sessions
3. Redirection selon rôle

### Phase 2 - Services (2-3 jours)
4. Services.tsx avec recherche et filtres
5. ServiceCard component
6. ServiceDetail.tsx complet
7. Commande de service

### Phase 3 - Commandes (2-3 jours)
8. Orders.tsx avec filtres
9. OrderCard component
10. OrderDetail.tsx avec actions
11. Livraison et validation

### Phase 4 - Projets (2-3 jours)
12. Projects.tsx avec recherche
13. ProjectCard et ProposalCard
14. ProjectDetail.tsx
15. Soumission de propositions

### Phase 5 - Messagerie (1-2 jours)
16. Messages.tsx avec temps réel
17. ChatMessage component
18. Upload de fichiers

### Phase 6 - Portefeuille (2 jours)
19. Wallet.tsx complet
20. Retrait de fonds
21. Graphiques et stats

### Phase 7 - Profil & Settings (2-3 jours)
22. Profile.tsx affichage
23. Settings.tsx formulaires
24. Upload d'images

### Phase 8 - Notifications & Améliorations (1-2 jours)
25. NotificationDropdown
26. Toast notifications
27. Loading states partout
28. Error handling

## Patterns de Code à Respecter

### 1. Gestion du Loading
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await service.getData();
    setData(result);
  } catch (err) {
    setError('Message d\'erreur');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### 2. Gestion des Formulaires
```typescript
const [formData, setFormData] = useState<FormType>({});
const [submitting, setSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  const newErrors = validateForm(formData);
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  try {
    setSubmitting(true);
    await service.create(formData);
    // Success
  } catch (err) {
    // Error handling
  } finally {
    setSubmitting(false);
  }
};
```

### 3. Composants avec Props Typés
```typescript
interface ComponentProps {
  data: Type;
  onAction: (id: string) => void;
  optional?: boolean;
}

const Component: React.FC<ComponentProps> = ({ 
  data, 
  onAction, 
  optional = false 
}) => {
  return <div>...</div>;
};
```

### 4. Utilisation des Services
```typescript
// Toujours avec try-catch
try {
  const result = await serviceService.getServiceById(id);
  if (result) {
    // Success
  } else {
    // Not found
  }
} catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

## Tests à Implémenter

### Tests Unitaires
- Tous les services API
- Fonctions utilitaires (format.ts)
- Logique métier complexe

### Tests d'Intégration
- Flux complet de commande
- Authentification
- Paiement et retrait

### Tests E2E
- Parcours utilisateur complet
- Scénarios critiques

## Performance

### Optimisations à Faire
1. Lazy loading des vues
2. Pagination côté serveur
3. Cache avec React Query
4. Optimistic updates
5. Debounce sur recherche
6. Image optimization
7. Code splitting

## Sécurité

### Checklist
- [ ] Validation côté client ET serveur
- [ ] RLS activé sur toutes les tables
- [ ] Sanitization des inputs
- [ ] HTTPS en production
- [ ] Rate limiting API
- [ ] Upload de fichiers sécurisé
- [ ] Protection CSRF
- [ ] Headers sécurité

## Déploiement

### Étapes
1. Build production: `npm run build`
2. Test du build: `npm run preview`
3. Variables d'environnement production
4. Deploy sur Vercel/Netlify
5. Configuration DNS
6. SSL automatique
7. Monitoring

## Maintenance

### Tâches Récurrentes
- Mise à jour des dépendances
- Backup de la base de données
- Monitoring des erreurs (Sentry)
- Analytics (Google Analytics)
- Logs et audit

---

**Note**: Ce guide est évolutif. Mettre à jour au fur et à mesure de l'implémentation.
