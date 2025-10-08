import React, { useState } from 'react';
import {
  FileText,
  Link as LinkIcon,
  StickyNote,
  File,
  Heart,
  MessageCircle,
  Calendar,
  User,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Eye,
  Image
} from 'lucide-react';

const ResourceCard = ({ 
  resource, 
  onLike, 
  onComment, 
  onEdit, 
  onDelete, 
  canEdit = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const getResourceIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'note':
        return <StickyNote className="h-5 w-5" />;
      case 'file':
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceTypeColor = (type) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'link':
        return 'bg-green-100 text-green-800';
      case 'note':
        return 'bg-yellow-100 text-yellow-800';
      case 'file':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(resource._id);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText.trim() && onComment) {
      onComment(resource._id, commentText.trim());
      setCommentText('');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${getResourceTypeColor(resource.type)}`}>
              {getResourceIcon(resource.type)}
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
          
          {canEdit && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit && onEdit(resource);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete && onDelete(resource._id);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-content">
        {/* Content Preview */}
        <div className="mb-4">
          {resource.type === 'link' ? (
            <a
              href={resource.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 underline break-all"
            >
              {resource.content}
            </a>
          ) : (
            <p className="text-gray-700 line-clamp-3">{resource.content}</p>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{resource.uploadedBy?.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(resource.createdAt)}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
            {resource.type}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm ${
                resource.isLikedBy ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${resource.isLikedBy ? 'fill-current' : ''}`} />
              <span>{resource.likeCount || 0}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{resource.commentCount || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 input text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn btn-primary text-sm disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {resource.comments?.map((comment, index) => (
                <div key={index} className="flex space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
