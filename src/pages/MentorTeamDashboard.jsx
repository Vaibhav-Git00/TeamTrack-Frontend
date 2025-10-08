import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  FileText,
  Image,
  File,
  Eye,
  MessageSquare
} from 'lucide-react';
import api from '../utils/axios';
import TaskStatusBadge from '../components/TaskStatusBadge';
import MentorTaskCard from '../components/MentorTaskCard';
import DashboardResourceCard from '../components/DashboardResourceCard';
import ResourceModal from '../components/ResourceModal';
import CreateSuggestionModal from '../components/CreateSuggestionModal';

const MentorTeamDashboard = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [progress, setProgress] = useState({ totalTasks: 0, completedTasks: 0, progressPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  useEffect(() => {
    fetchTeamData();
    fetchTasks();
    fetchResources();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      setTeam(response.data.team);
    } catch (error) {
      setError('Failed to fetch team data');
      navigate('/mentor/dashboard');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/team/${teamId}`);
      setTasks(response.data.tasks);
      setProgress(response.data.progress);
    } catch (error) {
      setError('Failed to fetch tasks');
    }
  };

  const fetchResources = async () => {
    try {
      const response = await api.get(`/resources/team/${teamId}`);
      setResources(response.data.resources);
    } catch (error) {
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-600" />;
      case 'link':
        return <ExternalLink className="h-5 w-5 text-purple-600" />;
      case 'note':
        return <BookOpen className="h-5 w-5 text-yellow-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.type === 'link') {
      window.open(resource.content, '_blank');
    } else if (resource.type === 'note') {
      setSelectedResource(resource);
    } else {
      // For files, open in new tab
      window.open(`http://localhost:5001${resource.fileUrl}`, '_blank');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreateSuggestion = async (suggestionData) => {
    try {
      await api.post('/suggestions', suggestionData);
      setSuccess('Suggestion sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Team not found</h2>
          <button onClick={() => navigate('/mentor/dashboard')} className="btn btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <button
            onClick={() => navigate('/mentor/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentor Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">{team.name} 🎯</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full font-medium">
                  {team.group}
                </span>
                <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                  📚 {team.subject}
                </span>
                <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                  ID: {team.teamId}
                </span>
                <span className="text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full font-medium">
                  👁️ Monitoring
                </span>
              </div>
              {team.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">{team.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSuggestionModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send Suggestion
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Team Progress
            </h3>
          </div>
          <div className="card-content">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progress.completedTasks} of {progress.totalTasks} tasks completed
              </span>
              <span className="text-sm font-medium text-gray-900">
                {progress.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Pending: {progress.pendingTasks || 0}</span>
              <span>In Progress: {progress.inProgressTasks || 0}</span>
              <span>Completed: {progress.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resources ({resources.length})
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <OverviewTab team={team} tasks={tasks} resources={resources} progress={progress} />
        )}

        {activeTab === 'tasks' && (
          <TasksTab tasks={tasks} />
        )}

        {activeTab === 'resources' && (
          <ResourcesTab 
            resources={resources} 
            onResourceClick={handleResourceClick}
            getResourceIcon={getResourceIcon}
            formatFileSize={formatFileSize}
          />
        )}

        {/* Resource Modal */}
        {selectedResource && (
          <ResourceModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}

        {/* Create Suggestion Modal */}
        {showSuggestionModal && (
          <CreateSuggestionModal
            team={team}
            onClose={() => setShowSuggestionModal(false)}
            onSubmit={handleCreateSuggestion}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ team, tasks, resources, progress }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Team Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </h3>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {team.members.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                {team.leader._id === member.user._id && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Leader
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        {/* Task Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Task Summary</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{progress.pendingTasks || 0}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.inProgressTasks || 0}</div>
                <div className="text-xs text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.completedTasks}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Resources</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{resources.length}</div>
                <div className="text-xs text-gray-500">Total Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {resources.filter(r => ['pdf', 'doc', 'docx'].includes(r.type)).length}
                </div>
                <div className="text-xs text-gray-500">Documents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tasks Tab Component
const TasksTab = ({ tasks }) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <MentorTaskCard key={task._id} task={task} />
      ))}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tasks will appear here when the team leader creates them.
          </p>
        </div>
      )}
    </div>
  );
};

// Resources Tab Component
const ResourcesTab = ({ resources, onResourceClick, getResourceIcon, formatFileSize }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <DashboardResourceCard
          key={resource._id}
          resource={resource}
          onResourceClick={onResourceClick}
          getResourceIcon={getResourceIcon}
          formatFileSize={formatFileSize}
        />
      ))}
      {resources.length === 0 && (
        <div className="col-span-full text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resources yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Resources will appear here when team members upload them.
          </p>
        </div>
      )}
    </div>
  );
};

export default MentorTeamDashboard;
