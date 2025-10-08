import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteTeamModal = ({ team, onClose, onDelete, isLeader }) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await onDelete(team._id);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    setError('');

    try {
      await onDelete(team._id, true); // Pass true to indicate leave action
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to leave team');
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === team.name.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {isLeader ? 'Delete Team' : 'Leave Team'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {isLeader ? 'Are you sure?' : 'Leave this team?'}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {isLeader 
                  ? 'This action cannot be undone. All team data, tasks, and resources will be permanently deleted.'
                  : 'You will no longer have access to team resources and tasks.'
                }
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">Team: {team.name}</div>
              <div className="text-gray-600">Subject: {team.subject}</div>
              <div className="text-gray-600">Members: {team.members?.length || 0}</div>
              {isLeader && (
                <div className="text-red-600 font-medium mt-2">
                  ⚠️ All {team.members?.length || 0} members will lose access
                </div>
              )}
            </div>
          </div>

          {isLeader && (
            <div className="mb-4">
              <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
                Type the team name "{team.name}" to confirm deletion:
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder={team.name}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={isLeader ? handleDelete : handleLeave}
              disabled={loading || (isLeader && !isConfirmValid)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isLeader ? 'Deleting...' : 'Leaving...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {isLeader ? 'Delete Team' : 'Leave Team'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamModal;
