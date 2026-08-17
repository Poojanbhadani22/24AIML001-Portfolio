import { useState, useEffect, useCallback } from 'react';

function generateObjectId() {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += hex[Math.floor(Math.random() * 16)];
  }
  return id;
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem('mongo_tasks') || '[]');
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem('mongo_tasks', JSON.stringify(tasks));
}

function simulateDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Tasks() {
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

  const fetchTasks = useCallback(async () => {
    try {
      setError('');
      await simulateDelay(400);
      const data = loadTasks();
      setTasks(data);
      setConnected(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      setError('');
      await simulateDelay(250);
      const task = {
        _id: generateObjectId(),
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };
      const all = loadTasks();
      all.unshift(task);
      saveTasks(all);
      setTasks(all);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task) => {
    try {
      setError('');
      await simulateDelay(150);
      const all = loadTasks();
      const idx = all.findIndex((t) => t._id === task._id);
      if (idx === -1) throw new Error('Task not found');
      all[idx] = { ...all[idx], completed: !all[idx].completed, updatedAt: new Date().toISOString() };
      saveTasks(all);
      setTasks(all);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditPriority('medium');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      setError('');
      await simulateDelay(200);
      const all = loadTasks();
      const idx = all.findIndex((t) => t._id === id);
      if (idx === -1) throw new Error('Task not found');
      all[idx] = {
        ...all[idx],
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        updatedAt: new Date().toISOString(),
      };
      saveTasks(all);
      setTasks(all);
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      setError('');
      await simulateDelay(200);
      const all = loadTasks();
      const idx = all.findIndex((t) => t._id === id);
      if (idx === -1) throw new Error('Task not found');
      all.splice(idx, 1);
      saveTasks(all);
      setTasks(all);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'active') return !t.completed;
    if (statusFilter === 'completed') return t.completed;
    return true;
  });

  const priorityColor = (p) => {
    if (p === 'high') return 'priority-high';
    if (p === 'medium') return 'priority-medium';
    return 'priority-low';
  };

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="route-page">
      <section className="tasks-panel">
        <div className="section-heading">
          <h2>Task Manager</h2>
          <p className="tasks-subtitle">
            MongoDB Simulation &mdash; CRUD with localStorage persistence
          </p>
        </div>

        <div className="mongo-status">
          <span className={`status-dot ${connected ? 'connected' : ''}`} />
          <span>{connected ? 'Connected to mongodb://localhost:27017/task_db' : 'Connecting to MongoDB...'}</span>
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
            type="text"
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <input
            className="task-input"
            type="text"
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
          <button className="task-btn-primary" type="submit" disabled={creating || !newTitle.trim()}>
            {creating ? 'Adding...' : '+ Add Task'}
          </button>
        </form>

        <div className="tasks-filters">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="tasks-loading">Connecting to MongoDB...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty">
            {tasks.length === 0
              ? 'No tasks yet. Create your first task above!'
              : 'No tasks match this filter.'}
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                {editingId === task._id ? (
                  <div className="task-edit-form">
                    <input
                      className="task-input"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <input
                      className="task-input"
                      type="text"
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
                      <button className="task-btn-save" onClick={() => saveEdit(task._id)}>
                        Save
                      </button>
                      <button className="task-btn-cancel" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <button
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => toggleComplete(task)}
                      >
                        {task.completed ? '\u2713' : ''}
                      </button>
                      <div className="task-info">
                        <span className="task-title">{task.title}</span>
                        {task.description && (
                          <span className="task-desc">{task.description}</span>
                        )}
                        <div className="task-meta">
                          <span className={`task-priority ${priorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="task-date">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button className="task-btn-edit" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button className="task-btn-delete" onClick={() => deleteTask(task._id)}>
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
