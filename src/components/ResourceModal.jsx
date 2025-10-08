import React from 'react';
import { X, Download, ExternalLink, Calendar, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://teamtrack-backend-wwo6.onrender.com';

const ResourceModal = ({ resource, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (resource.fileUrl) {
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}${resource.fileUrl}`;
      link.download = resource.fileName || resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    switch (resource.type) {
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-4">PDF Document</p>
              <iframe
                src={`${API_BASE_URL}${resource.fileUrl}`}
                className="w-full h-96 border rounded"
                title={resource.title}
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => window.open(`${API_BASE_URL}${resource.fileUrl}`, '_blank')}
                className="btn btn-outline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        );

      case 'doc':
      case 'docx':
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Word Document</p>
              <p className="text-sm text-gray-500">
                File: {resource.fileName}
              </p>
              {resource.fileSize && (
                <p className="text-sm text-gray-500">
                  Size: {formatFileSize(resource.fileSize)}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Document
              </button>
              <button
                onClick={() => window.open(`${API_BASE_URL}${resource.fileUrl}`, '_blank')}
                className="btn btn-outline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={`${API_BASE_URL}${resource.fileUrl}`}
                alt={resource.title}
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Image
              </button>
              <button
                onClick={() => window.open(`${API_BASE_URL}${resource.fileUrl}`, '_blank')}
                className="btn btn-outline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <ExternalLink className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">External Link</p>
              <a
                href={resource.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline break-all"
              >
                {resource.content}
              </a>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => window.open(resource.content, '_blank')}
                className="btn btn-primary flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </button>
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-3">Note Content:</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{resource.content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <File className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">File</p>
              <p className="text-sm text-gray-500">
                File: {resource.fileName}
              </p>
              {resource.fileSize && (
                <p className="text-sm text-gray-500">
                  Size: {formatFileSize(resource.fileSize)}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download File
              </button>
              <button
                onClick={() => window.open(`${API_BASE_URL}${resource.fileUrl}`, '_blank')}
                className="btn btn-outline flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {renderContent()}
          
          {/* Meta Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Uploaded by: {resource.uploadedBy?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {formatDate(resource.createdAt)}</span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {resource.type.toUpperCase()}
              </span>
            </div>
            
            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">Tags: </span>
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
