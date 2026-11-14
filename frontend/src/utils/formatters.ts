export const formatCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    ready_for_pickup: 'bg-green-100 text-green-800',
    fulfilled: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    ready_for_pickup: 'Ready for Pickup',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
    active: 'Active',
    paused: 'Paused',
    expired: 'Expired',
  };
  return labels[status] || status;
};
