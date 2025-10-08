import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TaskStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Completed',
          className: 'bg-green-100 text-green-800'
        };
      case 'in-progress':
        return {
          icon: <Clock className="h-3 w-3" />,
          text: 'In Progress',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'pending':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Pending',
          className: 'bg-gray-100 text-gray-800'
        };
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default TaskStatusBadge;
