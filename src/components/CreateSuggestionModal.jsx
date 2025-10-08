import React, { useState } from 'react';
import { X, Send, AlertTriangle, Lightbulb, MessageSquare, Star, AlertCircle } from 'lucide-react';

const CreateSuggestionModal = ({ team, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'suggestion',
    priority: 'medium',
    targetMembers: [],
    isUrgent: false,
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestionTypes = [
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-green-600' },
    { value: 'improvement', label: 'Improvement', icon: Star, color: 'text-purple-600' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-orange-600' },
    { value: 'praise', label: 'Praise', icon: Star, color: 'text-yellow-600' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        ...formData,
        teamId: team._id,
        targetMembers: formData.targetMembers.length > 0 ? formData.targetMembers : undefined
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => ({
      ...prev,
      targetMembers: prev.targetMembers.includes(memberId)
        ? prev.targetMembers.filter(id => id !== memberId)
        : [...prev.targetMembers, memberId]
    }));
  };

  const selectedType = suggestionTypes.find(type => type.value === formData.type);
  const selectedPriority = priorityLevels.find(priority => priority.value === formData.priority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Send Suggestion to {team.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter suggestion title"
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {suggestionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {priorityLevels.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Message *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your suggestion, feedback, or message..."
              />
            </div>

            {/* Target Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Members (leave empty for all members)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                {team.members?.map((member) => (
                  <label key={member.user._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetMembers.includes(member.user._id)}
                      onChange={() => handleMemberToggle(member.user._id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {member.user.name}
                      {team.leader._id === member.user._id && (
                        <span className="text-primary-600 font-medium"> (Leader)</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-700 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  Mark as urgent
                </span>
              </label>

              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send {selectedType?.label}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSuggestionModal;
