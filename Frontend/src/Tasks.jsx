
import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3000';

function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [connected, setConnected] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      onLogout();
      throw new Error('Please log in again.');
    }

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      onLogout();
      throw new Error('Your session expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  }, [onLogout]);

  const fetchTasks = useCallback(async () => {
    try {
      setError('');
      const data = await request('/tasks');
      setTasks(data);
      setConnected(true);
    } catch (err) {
      setError(err.message);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);

    try {
      const task = await request('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          priority: newPriority,
        }),
      });

      setTasks((previous) => [task, ...previous]);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !task.completed }),
      });

      setTasks((previous) =>
        previous.map((item) => item._id === updated._id ? updated : item)
      );
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority || 'medium');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditPriority('medium');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setError('Task title is required.');
      return;
    }

    try {
      const updated = await request(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          priority: editPriority,
        }),
      });

      setTasks((previous) =>
        previous.map((item) => item._id === updated._id ? updated : item)
      );
      setError('');
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await request(`/tasks/${id}`, { method: 'DELETE' });
      setTasks((previous) => previous.filter((task) => task._id !== id));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'active') return !task.completed;
    if (statusFilter === 'completed') return task.completed;
    return true;
  });

  const priorityColor = (priority) => {
    if (priority === 'high') return 'priority-high';
    if (priority === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="route-page">
      <section className="tasks-panel">
        <div className="section-heading">
          <h2>Task Manager</h2>
          <p className="tasks-subtitle">
            MongoDB CRUD with JWT authentication
          </p>
          <button
            type="button"
            className="task-btn-delete"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        <div className="mongo-status">
          <span className={`status-dot ${connected ? 'connected' : ''}`} />
          <span>
            {connected ? 'Connected to MongoDB API' : 'API disconnected'}
          </span>
        </div>

        <div className="tasks-stats">
          <div className="stat-card">
            <strong>{total}</strong>
            <span>Total Tasks</span>
          </div>
          <div className="stat-card">
            <strong>{doneCount}</strong>
            <span>Completed</span>
          </div>
          <div className="stat-card">
            <strong>{total - doneCount}</strong>
            <span>Pending</span>
          </div>
        </div>

        {error && <div className="tasks-error">{error}</div>}

        <form className="task-create-form" onSubmit={addTask}>
          <input
            className="task-input"
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <input
            className="task-input"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <select
            className="task-select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            className="task-btn-primary"
            type="submit"
            disabled={creating || !newTitle.trim()}
          >
            {creating ? 'Adding...' : '+ Add Task'}
          </button>
        </form>

        <div className="tasks-filters">
          {['all', 'active', 'completed'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
          <button
            type="button"
            className="filter-btn"
            onClick={fetchTasks}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="tasks-loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            {tasks.length === 0
              ? 'No tasks yet. Create your first task above!'
              : 'No tasks match this filter.'}
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
              >
                {editingId === task._id ? (
                  <div className="task-edit-form">
                    <input
                      className="task-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="task-input"
                      placeholder="Description"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <select
                      className="task-select"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="task-edit-actions">
                      <button
                        type="button"
                        className="task-btn-save"
                        onClick={() => saveEdit(task._id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="task-btn-cancel"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <button
                        type="button"
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => toggleComplete(task)}
                      >
                        {task.completed ? '✓' : ''}
                      </button>
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        {task.description && (
                          <span className="task-desc">{task.description}</span>
                        )}
                        <div className="task-meta">
                          <span className={`task-priority ${priorityColor(task.priority)}`}>
                            {task.priority || 'medium'}
                          </span>
                          <span className="task-date">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="task-btn-edit"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-btn-delete"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Tasks;
