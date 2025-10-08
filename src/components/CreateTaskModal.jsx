import React from 'react';
import { X } from 'lucide-react';

const CreateTaskModal = ({ team, taskForm, setTaskForm, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                className="input mt-1"
                value={taskForm.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                className="input mt-1"
                rows={3}
                value={taskForm.description}
                onChange={handleChange}
                required
                placeholder="Describe the task in detail"
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To *
              </label>
              <select
                name="assignedTo"
                className="input mt-1"
                value={taskForm.assignedTo}
                onChange={handleChange}
                required
              >
                <option value="">Select team member</option>
                {team.members.map((member) => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name} {team.leader._id === member.user._id ? '(Leader)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  className="input mt-1"
                  value={taskForm.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="input mt-1"
                  value={taskForm.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                className="input mt-1"
                rows={2}
                value={taskForm.notes}
                onChange={handleChange}
                placeholder="Any additional information or requirements"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!taskForm.title || !taskForm.description || !taskForm.assignedTo}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
