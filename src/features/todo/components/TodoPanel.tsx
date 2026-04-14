import React, { useState, useEffect, useRef } from 'react';
import './TodoPanel.css';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'pomodoro_todolist';

const TodoPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('[TodoPanel] Failed to load todos', e);
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addTodo = () => {
    const trimmed = newTodoText.trim();
    if (!trimmed) return;

    const newItem: TodoItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos(prev => [newItem, ...prev]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo();
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <>
      {/* Toggle Tab (always visible on the left edge) */}
      <button
        className={`todo-toggle-tab ${isOpen ? 'tab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="To-Do List"
      >
        <span className="tab-icon">📝</span>
        {todos.length > 0 && (
          <span className="tab-badge">{todos.length - completedCount}</span>
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="todo-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-in Panel */}
      <div className={`todo-panel ${isOpen ? 'panel-open' : ''}`}>
        <div className="todo-panel-header">
          <h3 className="todo-panel-title">📝 To-Do List</h3>
          <button className="todo-close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* Add new todo */}
        <div className="todo-input-row">
          <input
            ref={inputRef}
            type="text"
            className="todo-input"
            placeholder="Add a task..."
            value={newTodoText}
            onChange={e => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={120}
          />
          <button
            className="todo-add-btn"
            onClick={addTodo}
            disabled={!newTodoText.trim()}
          >
            +
          </button>
        </div>

        {/* Progress */}
        {todos.length > 0 && (
          <div className="todo-progress">
            <div className="todo-progress-bar">
              <div
                className="todo-progress-fill"
                style={{ width: `${(completedCount / todos.length) * 100}%` }}
              />
            </div>
            <span className="todo-progress-text">
              {completedCount}/{todos.length} done
            </span>
          </div>
        )}

        {/* Todo Items */}
        <div className="todo-list">
          {todos.length === 0 && (
            <div className="todo-empty">
              <span className="empty-icon">🌱</span>
              <p>No tasks yet. Add one above!</p>
            </div>
          )}
          {todos.map(todo => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <button
                className="todo-check-btn"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed ? '✅' : '⬜'}
              </button>
              <span className="todo-text">{todo.text}</span>
              <button
                className="todo-delete-btn"
                onClick={() => deleteTodo(todo.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TodoPanel;
