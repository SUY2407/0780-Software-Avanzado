// Formatear moneda
export const formatCurrency = (amount, currency = 'GTQ') => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Formatear fecha
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Formatear fecha corta
export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

// Formatear peso
export const formatWeight = (weight) => {
  return `${weight.toFixed(2)} kg`;
};

// Status badge colors
export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Traducir status
export const translateStatus = (status) => {
  const translations = {
    ACTIVE: 'Activa',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };
  return translations[status] || status;
};

// Traducir tipo de servicio
export const translateServiceType = (serviceType) => {
  const translations = {
    STANDARD: 'Estándar',
    EXPRESS: 'Express',
    SAME_DAY: 'Mismo Día',
  };
  return translations[serviceType] || serviceType;
};

// Traducir zonas
export const translateZone = (zone) => {
  const translations = {
    METRO: 'Ciudad de Guatemala',
    INTERIOR: 'Interior',
    FRONTERA: 'Zona Fronteriza',
  };
  return translations[zone] || zone;
};
