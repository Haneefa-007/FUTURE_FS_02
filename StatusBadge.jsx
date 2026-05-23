import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (statusVal) => {
    switch (statusVal?.toLowerCase()) {
      case 'new':
        return 'status-new';
      case 'contacted':
        return 'status-contacted';
      case 'qualified':
        return 'status-qualified';
      case 'converted':
        return 'status-converted';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-new';
    }
  };

  return (
    <span className={`status-badge ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
