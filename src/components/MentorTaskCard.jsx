import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User,
  Flag
} from 'lucide-react';

const MentorTaskCard = ({ task }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`card ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="card-content">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(task.status)}
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                <Flag className="h-3 w-3 inline mr-1" />
                {task.priority}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{task.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Assigned to: {task.assignedTo.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Created by: {task.assignedBy.name}</span>
              </div>
              
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                  {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
            </div>

            {task.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Notes:</strong> {task.notes}
                </p>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex flex-col items-end gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            
            {task.status === 'completed' && task.completedAt && (
              <div className="text-xs text-gray-500">
                Completed: {formatDate(task.completedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorTaskCard;
