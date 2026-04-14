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

  // Dragging state
  const [fabPos, setFabPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; initialX: number; initialY: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTodos(JSON.parse(stored));
      }
      const savedPos = localStorage.getItem('todo_fab_pos');
      if (savedPos) {
        setFabPos(JSON.parse(savedPos));
      }
    } catch (e) {
      console.warn('[TodoPanel] Failed to load settings', e);
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
  const remainingCount = todos.length - completedCount;

  // Draggable FAB handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    // Threshold to distinguish drag from click
    if (!dragRef.current.isDragging && Math.sqrt(dx * dx + dy * dy) > 10) {
      dragRef.current.isDragging = true;
    }
    
    if (dragRef.current.isDragging) {
      const newX = dragRef.current.initialX + dx;
      const newY = dragRef.current.initialY + dy;
      
      const safeX = Math.max(0, Math.min(newX, window.innerWidth - e.currentTarget.offsetWidth));
      const safeY = Math.max(0, Math.min(newY, window.innerHeight - e.currentTarget.offsetHeight));
      
      setFabPos({ x: safeX, y: safeY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (dragRef.current.isDragging) {
      // It was a drag, persist new position
      if (fabPos) {
        localStorage.setItem('todo_fab_pos', JSON.stringify(fabPos));
      }
    } else {
      // It was a click
      setIsOpen(true);
    }
    dragRef.current.isDragging = false;
  };

  return (
    <>
      {/* Prominent FAB button (draggable) */}
      <button
        className={`todo-fab ${isOpen ? 'fab-hidden' : ''}`}
        style={fabPos ? { left: fabPos.x + 'px', top: fabPos.y + 'px', bottom: 'auto' } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span className="fab-icon">📋</span>
        <span className="fab-label">Tasks</span>
        {remainingCount > 0 && (
          <span className="fab-badge">{remainingCount}</span>
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
