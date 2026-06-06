export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getStatusColor(status) {
  const colors = {
    present: 'success',
    active: 'success',
    approved: 'success',
    absent: 'danger',
    inactive: 'danger',
    rejected: 'danger',
    'half-day': 'warning',
    pending: 'warning',
    leave: 'info',
    holiday: 'primary',
    completed: 'neutral'
  };
  return colors[status] || 'neutral';
}

export function getAvatarColor(name) {
  const colors = [
    '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#D97706',
    '#059669', '#0891B2', '#4F46E5', '#9333EA', '#E11D48'
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
