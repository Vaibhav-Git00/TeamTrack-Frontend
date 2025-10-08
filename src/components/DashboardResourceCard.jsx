import React from 'react';
import { FileText, ExternalLink, File, Download, Eye, Calendar, User } from 'lucide-react';

const DashboardResourceCard = ({ resource, onResourceClick, getResourceIcon, formatFileSize }) => {
  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-600';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-600';
      case 'link':
        return 'bg-green-100 text-green-600';
      case 'note':
        return 'bg-yellow-100 text-yellow-600';
      case 'image':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleClick = () => {
    if (onResourceClick) {
      onResourceClick(resource);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="card-header">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
            {getResourceIcon ? getResourceIcon(resource.type) : <File className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="card-content">
        {/* Content Preview */}
        <div className="mb-4">
          {resource.type === 'link' ? (
            <div className="text-primary-600 text-sm truncate">
              🔗 {resource.content}
            </div>
          ) : resource.type === 'note' ? (
            <div className="text-gray-700 text-sm line-clamp-2">
              📝 {resource.content}
            </div>
          ) : (
            <div className="text-gray-700 text-sm">
              📄 {resource.fileName}
              {resource.fileSize && (
                <span className="text-gray-500 ml-2">
                  ({formatFileSize ? formatFileSize(resource.fileSize) : resource.fileSize})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{resource.uploadedBy?.name || 'Unknown'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(resource.createdAt)}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {resource.type === 'link' ? (
              <ExternalLink className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span>
              {resource.type === 'link' ? 'Open' : 'View'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary-50 opacity-0 hover:opacity-10 transition-opacity rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default DashboardResourceCard;
