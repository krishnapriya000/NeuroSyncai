import React, { useState } from "react";
import { FiCheck, FiCheckSquare, FiPlus } from "react-icons/fi";

const initialTasks = [
  { id: 1, text: "Complete DBMS Assignment", completed: true },
  { id: 2, text: "Revise Cloud Computing", completed: false },
  { id: 3, text: "Practice Java Coding", completed: false },
];

function TasksCard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskText, setNewTaskText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), completed: false }]);
    setNewTaskText("");
    setShowInput(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="ns-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <FiCheckSquare className="text-primary fs-5" />
          <h5 className="mb-0 text-white fw-bold fs-6">Today's Tasks</h5>
        </div>
        <span className="badge rounded-pill bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-2 py-1" style={{ fontSize: "0.78rem" }}>
          {progressPercent}% Done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress bg-dark mb-3" style={{ height: "6px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{ 
            width: `${progressPercent}%`, 
            background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
            transition: "width 0.4s ease"
          }}
          aria-valuenow={progressPercent} 
          aria-valuemin="0" 
          aria-valuemax="100"
        />
      </div>

      {/* Tasks Checklist */}
      <div className="mb-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`ns-task-item ${task.completed ? "completed" : ""}`}
            onClick={() => toggleTask(task.id)}
          >
            <label className="ns-task-label mb-0">
              <div className="ns-task-checkbox">
                {task.completed && <FiCheck size={14} />}
              </div>
              <span className="ns-task-text text-white">{task.text}</span>
            </label>
          </div>
        ))}
      </div>

      {/* Add Task Control */}
      {showInput ? (
        <form onSubmit={addTask} className="d-flex gap-2">
          <input 
            type="text" 
            className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-50"
            placeholder="Enter task title..." 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-sm btn-primary px-3">Add</button>
        </form>
      ) : (
        <button 
          className="btn btn-sm text-muted w-100 border border-secondary border-opacity-25 d-flex align-items-center justify-content-center gap-1 hover-text-white py-2"
          style={{ borderRadius: "10px", background: "rgba(255, 255, 255, 0.02)" }}
          onClick={() => setShowInput(true)}
        >
          <FiPlus /> Add Task
        </button>
      )}
    </div>
  );
}

export default TasksCard;
