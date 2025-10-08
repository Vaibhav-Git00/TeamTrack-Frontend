import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, BookOpen, MessageSquare, TrendingUp, ExternalLink } from 'lucide-react';
import api from '../utils/axios';

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allTeams, setAllTeams] = useState([]);
  const [monitoringTeams, setMonitoringTeams] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allTeamsRes, myTeamsRes, groupsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/teams/my-teams'),
        api.get('/teams/groups')
      ]);

      setAllTeams(allTeamsRes.data.teams);
      setMonitoringTeams(myTeamsRes.data.teams);
      setGroups(groupsRes.data.groups);

      // Set default selected group to first group with teams
      const firstGroupWithTeams = groupsRes.data.groups.find(g => g.teamCount > 0);
      if (firstGroupWithTeams) {
        setSelectedGroup(firstGroupWithTeams.group);
        fetchTeamsByGroup(firstGroupWithTeams.group);
      }
    } catch (error) {
      setError('Failed to fetch teams data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsByGroup = async (groupName) => {
    try {
      const response = await api.get(`/teams/group/${groupName}`);
      setGroupTeams(response.data.teams);
    } catch (error) {
      setError('Failed to fetch teams for selected group');
    }
  };

  const handleGroupChange = (groupName) => {
    setSelectedGroup(groupName);
    fetchTeamsByGroup(groupName);
  };

  const handleStartMonitoring = async (teamId) => {
    try {
      await api.post(`/teams/${teamId}/add-mentor`);
      setSuccess('Successfully started monitoring this team!');
      setTimeout(() => setSuccess(''), 3000);
      fetchData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start monitoring');
    }
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
            Mentor Dashboard 🎓
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Monitor teams and provide guidance to students.
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in-up">
          <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-all duration-300">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monitoring Teams</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{monitoringTeams.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-all duration-300">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {monitoringTeams.reduce((acc, team) => acc + (team.members?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-lg transition-all duration-300">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Teams</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{allTeams.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 animate-slide-in-up">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-dark-700">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'monitoring'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <Eye className="inline-block w-4 h-4 mr-2" />
              Monitoring Teams ({monitoringTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'groups'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Teams by Group
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              All Teams ({allTeams.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitoringTeams.map((team) => (
              <MonitoringTeamCard key={team._id} team={team} />
            ))}

            {monitoringTeams.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Eye className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No teams being monitored</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start monitoring teams to provide guidance and support.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            {/* Group Selection */}
            <div className="mb-6 flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Group:</label>
              <select
                value={selectedGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="input w-auto"
              >
                <option value="">Choose a group...</option>
                {groups.map((group) => (
                  <option key={group.group} value={group.group}>
                    {group.group} ({group.teamCount} teams, {group.totalMembers} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Group Teams */}
            {selectedGroup && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Teams in Group {selectedGroup}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupTeams.map((team) => (
                    <GroupTeamCard
                      key={team._id}
                      team={team}
                      onStartMonitoring={handleStartMonitoring}
                      isMonitoring={monitoringTeams.some(mt => mt._id === team._id)}
                    />
                  ))}

                  {groupTeams.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No teams in this group</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No teams have been created in group {selectedGroup} yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTeams.map((team) => (
              <AvailableTeamCard 
                key={team._id} 
                team={team} 
                onStartMonitoring={handleStartMonitoring}
                isMonitoring={monitoringTeams.some(mt => mt._id === team._id)}
              />
            ))}
            
            {allTeams.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No teams available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Teams will appear here once students create them.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Monitoring Team Card Component
const MonitoringTeamCard = ({ team }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    console.log('Navigating to mentor team dashboard:', `/mentor/team/${team._id}`);
    navigate(`/mentor/team/${team._id}`);
  };

  return (
    <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-xl dark:hover:shadow-dark-900/30 transition-all duration-300 animate-slide-in-up">
      <div className="card-header bg-gray-50 dark:bg-dark-700/50 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.name}</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              {team.group}
            </span>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium">
              Monitoring
            </span>
          </div>
        </div>
        {team.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{team.description}</p>
        )}
      </div>
      <div className="card-content">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Team ID:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{team.teamId}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Subject:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">📚 {team.subject}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Members:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{team.members?.length || 0}/{team.size}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Leader:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{team.leader?.name}</span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button
          onClick={handleViewDetails}
          className="btn btn-primary text-sm w-full flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300"
        >
          <ExternalLink className="h-4 w-4" />
          View Details
        </button>
      </div>
    </div>
  );
};

// Group Team Card Component
const GroupTeamCard = ({ team, onStartMonitoring, isMonitoring }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/mentor/team/${team._id}`);
  };

  return (
    <div className="card bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-xl dark:hover:shadow-dark-900/30 transition-all duration-300 animate-slide-in-up">
      <div className="card-header bg-gray-50 dark:bg-dark-700/50 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{team.name}</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              {team.group}
            </span>
            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded-full font-medium">
              {team.teamId}
            </span>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Members:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{team.members?.length || 0}/{team.size}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Leader:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{team.leader?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {new Date(team.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="btn btn-outline text-sm flex-1 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            View Details
          </button>
          {isMonitoring ? (
            <button className="btn btn-secondary text-sm flex-1" disabled>
              <Eye className="h-4 w-4 mr-1" />
              Monitoring
            </button>
          ) : (
            <button
              onClick={() => onStartMonitoring(team._id)}
              className="btn btn-primary text-sm flex-1 hover:scale-[1.02] transition-transform duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Start Monitoring
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Available Team Card Component
const AvailableTeamCard = ({ team, onStartMonitoring, isMonitoring }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {team.group}
            </span>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
              {team.teamId}
            </span>
          </div>
        </div>
        {team.description && (
          <p className="text-sm text-gray-600 mt-1">{team.description}</p>
        )}
      </div>
      <div className="card-content">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subject:</span>
            <span className="font-medium text-blue-600">📚 {team.subject}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Members:</span>
            <span className="font-medium">{team.members?.length || 0}/{team.size}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Leader:</span>
            <span className="font-medium">{team.leader?.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Created:</span>
            <span className="font-medium">
              {new Date(team.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        {isMonitoring ? (
          <button className="btn btn-secondary text-sm w-full" disabled>
            Already Monitoring
          </button>
        ) : (
          <button 
            onClick={() => onStartMonitoring(team._id)}
            className="btn btn-primary text-sm w-full"
          >
            Start Monitoring
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
