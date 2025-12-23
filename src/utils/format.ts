// Utilitaires de formatage pour Freenance

/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number, currency: string = 'XOF'): string => {
  if (currency === 'XOF' || currency === 'FCFA') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formate une date en français
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', options || {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formate une date relative (il y a X jours)
 */
export const formatRelativeDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (weeks < 4) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  if (months < 12) return `Il y a ${months} mois`;
  
  return formatDate(d);
};

/**
 * Formate un nombre avec séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formate un pourcentage
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Tronque un texte avec ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Génère les initiales à partir du prénom et nom
 */
export const getInitials = (firstName?: string | null, lastName?: string | null): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || 'U';
};

/**
 * Formate un numéro de téléphone
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('229')) {
    const number = cleaned.substring(3);
    return `+229 ${number.match(/.{1,2}/g)?.join(' ') || number}`;
  }
  return phone;
};

/**
 * Formate une durée en jours
 */
export const formatDeliveryTime = (days: number): string => {
  if (days === 1) return '1 jour';
  if (days < 7) return `${days} jours`;
  if (days === 7) return '1 semaine';
  if (days < 30) return `${Math.ceil(days / 7)} semaines`;
  if (days === 30) return '1 mois';
  return `${Math.ceil(days / 30)} mois`;
};

/**
 * Formate le niveau d'un freelancer
 */
export const formatLevel = (level: string): string => {
  const levels: Record<string, string> = {
    'new': 'Nouveau',
    'level1': 'Niveau 1',
    'level2': 'Niveau 2',
    'top_rated': 'Top Rated',
  };
  return levels[level] || level;
};

/**
 * Retourne la couleur CSS pour un statut
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    delivered: 'bg-purple-100 text-purple-800',
    revision_requested: 'bg-orange-100 text-orange-800',
    revision: 'bg-orange-100 text-orange-800',
    disputed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-gray-100 text-gray-800',
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    bidding: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    review: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Retourne le label français pour un statut
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    delivered: 'Livré',
    revision_requested: 'Révision demandée',
    revision: 'Révision',
    disputed: 'En litige',
    refunded: 'Remboursé',
    active: 'Actif',
    paused: 'En pause',
    draft: 'Brouillon',
    published: 'Publié',
    bidding: 'En cours d\'offres',
    assigned: 'Assigné',
    review: 'En révision',
  };
  return labels[status] || status;
};

/**
 * Formate le statut d'une commande
 */
export const formatOrderStatus = (status: string): { label: string; color: string } => {
  return { label: getStatusLabel(status), color: getStatusColor(status) };
};

/**
 * Formate le statut d'un projet
 */
export const formatProjectStatus = (status: string): { label: string; color: string } => {
  return { label: getStatusLabel(status), color: getStatusColor(status) };
};

/**
 * Génère un slug à partir d'un texte
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Valide un email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valide un numéro de téléphone béninois
 */
export const isValidBeninPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 8 || (cleaned.length === 11 && cleaned.startsWith('229'));
};

/**
 * Calcule le temps de lecture estimé
 */
export const getReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Formate la taille d'un fichier
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
