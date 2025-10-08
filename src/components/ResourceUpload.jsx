import React, { useState } from 'react';
import { X, Upload, Link, FileText, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://teamtrack-backend-wwo6.onrender.com';

const ResourceUpload = ({ teamId, onUploadSuccess, onClose }) => {
  const [uploadType, setUploadType] = useState('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [fileData, setFileData] = useState({
    title: '',
    description: '',
    tags: '',
    file: null
  });

  // Link/Note state
  const [linkNoteData, setLinkNoteData] = useState({
    title: '',
    description: '',
    type: 'link',
    content: '',
    tags: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileData.file || !fileData.title) {
      setError('Please provide a title and select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('title', fileData.title);
      formData.append('description', fileData.description);
      formData.append('teamId', teamId);
      formData.append('tags', fileData.tags);

      const response = await fetch(`${API_BASE_URL}/api/resources/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.resource);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkNoteSubmit = async (e) => {
    e.preventDefault();
    if (!linkNoteData.title || !linkNoteData.content) {
      setError('Please provide a title and content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...linkNoteData,
          teamId,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Creation failed');
      }

      const data = await response.json();
      onUploadSuccess(data.resource);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Resource</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Type Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadType('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                uploadType === 'file'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <button
              onClick={() => setUploadType('link')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                uploadType === 'link'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Link className="h-4 w-4" />
              Add Link
            </button>
            <button
              onClick={() => setUploadType('note')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                uploadType === 'note'
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              Add Note
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* File Upload Form */}
        {uploadType === 'file' && (
          <form onSubmit={handleFileUpload} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported: PDF, DOC, DOCX, Images, TXT, XLS, XLSX (Max 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={fileData.title}
                  onChange={(e) => setFileData({...fileData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="input mt-1"
                  rows={3}
                  value={fileData.description}
                  onChange={(e) => setFileData({...fileData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g., research, documentation, presentation"
                  value={fileData.tags}
                  onChange={(e) => setFileData({...fileData, tags: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !fileData.file || !fileData.title}
              >
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        )}

        {/* Link/Note Form */}
        {(uploadType === 'link' || uploadType === 'note') && (
          <form onSubmit={handleLinkNoteSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  value={linkNoteData.title}
                  onChange={(e) => setLinkNoteData({...linkNoteData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {uploadType === 'link' ? 'URL *' : 'Content *'}
                </label>
                {uploadType === 'link' ? (
                  <input
                    type="url"
                    className="input mt-1"
                    placeholder="https://example.com"
                    value={linkNoteData.content}
                    onChange={(e) => setLinkNoteData({...linkNoteData, content: e.target.value, type: 'link'})}
                    required
                  />
                ) : (
                  <textarea
                    className="input mt-1"
                    rows={6}
                    placeholder="Enter your note content here..."
                    value={linkNoteData.content}
                    onChange={(e) => setLinkNoteData({...linkNoteData, content: e.target.value, type: 'note'})}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="input mt-1"
                  rows={3}
                  value={linkNoteData.description}
                  onChange={(e) => setLinkNoteData({...linkNoteData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="e.g., reference, tutorial, documentation"
                  value={linkNoteData.tags}
                  onChange={(e) => setLinkNoteData({...linkNoteData, tags: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !linkNoteData.title || !linkNoteData.content}
              >
                {loading ? 'Creating...' : `Add ${uploadType === 'link' ? 'Link' : 'Note'}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResourceUpload;
