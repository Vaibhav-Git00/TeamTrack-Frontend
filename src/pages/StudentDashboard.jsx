import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Upload, Search, BookOpen, Eye, Edit, Trash2, Settings, FileText, ExternalLink, File } from 'lucide-react';
import api from '../utils/axios';
import EditTeamModal from '../components/EditTeamModal';
import DeleteTeamModal from '../components/DeleteTeamModal';
import DashboardResourceCard from '../components/DashboardResourceCard';
import ResourceModal from '../components/ResourceModal';
import NotificationDebug from '../components/NotificationDebug';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { joinTeam } = useSocket();
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [createTeamData, setCreateTeamData] = useState({
    name: '',
    size: 4,
    description: '',
    group: 'G1',
    subject: ''
  });
  const [joinTeamData, setJoinTeamData] = useState({
    teamId: ''
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams/my-teams');
      setTeams(response.data.teams);

      // Join teams for real-time notifications
      response.data.teams.forEach(team => {
        joinTeam(team._id);
      });

      // Fetch resources for all teams
      if (response.data.teams.length > 0) {
        await fetchAllResources(response.data.teams);
      }
    } catch (error) {
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllResources = async (userTeams) => {
    try {
      const resourcePromises = userTeams.map(team =>
        api.get(`/resources/team/${team._id}`)
      );

      const resourceResponses = await Promise.all(resourcePromises);
      const allResources = resourceResponses.flatMap((response, index) =>
        response.data.resources.map(resource => ({
          ...resource,
          teamName: userTeams[index].name,
          teamId: userTeams[index]._id
        }))
      );

      setResources(allResources);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/teams', createTeamData);
      setTeams([response.data.team, ...teams]);
      setCreateTeamData({ name: '', size: 4, description: '', group: 'G1', subject: '' });
      setShowCreateTeam(false);
      setSuccess('Team created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/teams/join', joinTeamData);
      setTeams([response.data.team, ...teams]);
      setJoinTeamData({ teamId: '' });
      setShowJoinTeam(false);
      setSuccess('Successfully joined the team!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join team');
    }
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowEditTeam(true);
  };

  const handleDeleteTeam = (team) => {
    setSelectedTeam(team);
    setShowDeleteTeam(true);
  };

  const handleUpdateTeam = async (teamId, updateData) => {
    try {
      const response = await api.put(`/teams/${teamId}`, updateData);
      setTeams(teams.map(team =>
        team._id === teamId ? response.data.team : team
      ));
      setSuccess('Team updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteOrLeaveTeam = async (teamId, isLeave = false) => {
    try {
      if (isLeave) {
        await api.delete(`/teams/${teamId}/leave`);
        setSuccess('Successfully left the team!');
      } else {
        await api.delete(`/teams/${teamId}`);
        setSuccess('Team deleted successfully!');
      }

      setTeams(teams.filter(team => team._id !== teamId));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleResourceClick = (resource) => {
    if (resource.type === 'link') {
      window.open(resource.content, '_blank');
    } else if (resource.type === 'note') {
      setSelectedResource(resource);
    } else {
      // For files, show in modal for preview
      setSelectedResource(resource);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5" />;
      case 'link':
        return <ExternalLink className="h-5 w-5" />;
      case 'note':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <File className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in-down">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Manage your teams and collaborate with your peers.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl animate-slide-in-down transition-colors duration-300">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl animate-slide-in-down transition-colors duration-300">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 animate-slide-in-up">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-dark-700">
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'teams'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              My Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'resources'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              All Resources ({resources.length})
            </button>
          </nav>
        </div>

        {/* Action Buttons */}
        {activeTab === 'teams' && (
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateTeam(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </button>
            <button
              onClick={() => setShowJoinTeam(true)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Join Team
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                currentUserId={user?.id}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
              />
            ))}

            {teams.length === 0 && (
              <div className="col-span-full text-center py-12 animate-fade-in">
                <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No teams yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a team or joining an existing one.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="relative">
                <DashboardResourceCard
                  resource={resource}
                  onResourceClick={handleResourceClick}
                  getResourceIcon={getResourceIcon}
                  formatFileSize={formatFileSize}
                />
                <div className="absolute top-2 right-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full transition-colors duration-300">
                  {resource.teamName}
                </div>
              </div>
            ))}

            {resources.length === 0 && (
              <div className="col-span-full text-center py-12 animate-fade-in">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No resources yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Resources from your teams will appear here once uploaded.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateTeam && (
          <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-dark-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-dark-700 animate-slide-in-up">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create New Team</h3>
              <form onSubmit={handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Name</label>
                    <input
                      type="text"
                      className="input mt-1 bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100"
                      value={createTeamData.name}
                      onChange={(e) => setCreateTeamData({...createTeamData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input
                      type="text"
                      className="input mt-1 bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100"
                      placeholder="e.g., AI, Web Development, IoT"
                      value={createTeamData.subject}
                      onChange={(e) => setCreateTeamData({...createTeamData, subject: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                    <select
                      className="input mt-1 bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600 text-gray-900 dark:text-gray-100"
                      value={createTeamData.group}
                      onChange={(e) => setCreateTeamData({...createTeamData, group: e.target.value})}
                    >
                      {['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Team Size</label>
                    <select
                      className="input mt-1"
                      value={createTeamData.size}
                      onChange={(e) => setCreateTeamData({...createTeamData, size: parseInt(e.target.value)})}
                    >
                      {[2,3,4,5,6,7,8,9,10].map(size => (
                        <option key={size} value={size}>{size} members</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      className="input mt-1"
                      rows={3}
                      value={createTeamData.description}
                      onChange={(e) => setCreateTeamData({...createTeamData, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Team Modal */}
        {showJoinTeam && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Join Team</h3>
              <form onSubmit={handleJoinTeam}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team ID</label>
                  <input
                    type="text"
                    className="input mt-1"
                    placeholder="Enter team ID (e.g., ABC123)"
                    value={joinTeamData.teamId}
                    onChange={(e) => setJoinTeamData({teamId: e.target.value.toUpperCase()})}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ask your team leader for the team ID
                  </p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinTeam(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Join Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditTeam && selectedTeam && (
          <EditTeamModal
            team={selectedTeam}
            onClose={() => {
              setShowEditTeam(false);
              setSelectedTeam(null);
            }}
            onUpdate={handleUpdateTeam}
          />
        )}

        {/* Delete/Leave Team Modal */}
        {showDeleteTeam && selectedTeam && (
          <DeleteTeamModal
            team={selectedTeam}
            isLeader={selectedTeam.leader?._id === user?.id}
            onClose={() => {
              setShowDeleteTeam(false);
              setSelectedTeam(null);
            }}
            onDelete={handleDeleteOrLeaveTeam}
          />
        )}

        {/* Resource Modal */}
        {selectedResource && (
          <ResourceModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}

        {/* Debug Component */}
        <NotificationDebug />
      </div>
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, currentUserId, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleViewTeam = () => {
    navigate(`/team/${team._id}`);
  };

  const isLeader = team.leader?._id === currentUserId;
  const isMember = team.members?.some(member => member.user._id === currentUserId);

  return (
    <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-xl dark:hover:shadow-dark-900/30 transition-all duration-300 animate-slide-in-up">
      <div className="card-header bg-gray-50 dark:bg-dark-700/50 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                {team.group}
              </span>
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded-full font-medium">
                {team.teamId}
              </span>
            </div>
            {(isLeader || isMember) && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(team)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
                  title="Edit team"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(team)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300"
                  title={isLeader ? "Delete team" : "Leave team"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        {team.subject && (
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">📚 {team.subject}</p>
        )}
        {team.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{team.description}</p>
        )}
      </div>
      <div className="card-content">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            <span className="font-medium">{team.members?.length || 0}/{team.size} members</span>
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-green-500" />
            <span className="font-medium">Resources</span>
          </span>
        </div>
        <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-100">Leader:</span> {team.leader?.name}
            {isLeader && <span className="text-primary-600 dark:text-primary-400 font-semibold"> (You)</span>}
          </p>
        </div>
      </div>
      <div className="card-footer">
        <button
          onClick={handleViewTeam}
          className="btn btn-primary text-sm w-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300"
        >
          <Eye className="h-4 w-4" />
          View Team
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
