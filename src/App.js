import { useMemo, useState } from "react";
import "./App.css";
import TaskItem from "./TaskItem";

function App() {
  const [task, setTask] = useState("");
  // Estructura de tarea: { id: string, text: string, createdAt: string }
  const [tasks, setTasks] = useState([]);

  const trimmed = task.trim();
  const isDuplicate = useMemo(
    () => tasks.some((t) => t.text.toLowerCase() === trimmed.toLowerCase()),
    [tasks, trimmed]
  );

  const addTask = () => {
    const t = trimmed;
    if (!t || isDuplicate) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTasks((prev) => [
      ...prev,
      { id, text: t, createdAt: new Date().toISOString() },
    ]);
    setTask("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const countLabel = tasks.length === 1 ? "1 tarea" : `${tasks.length} tareas`;

  return (
    <div className="app-container">
      <h1 className="app-title">
        Lista de Tareas
        <span className="task-counter" aria-label={`Hay ${countLabel}`}>
          {countLabel}
        </span>
      </h1>
      <div className="input-row">
        <input
          aria-label="Nueva tarea"
          placeholder="Escribe una tarea"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={onKeyDown}
          aria-invalid={Boolean(trimmed && isDuplicate)}
        />
        <button
          onClick={addTask}
          disabled={!trimmed || isDuplicate}
          title={
            !trimmed
              ? "Escribe una tarea"
              : isDuplicate
              ? "Ya existe una tarea con ese nombre"
              : "Agregar tarea"
          }
        >
          Agregar
        </button>
      </div>
      {trimmed && isDuplicate && (
        <div className="error" role="alert">
          Ya existe una tarea con ese nombre.
        </div>
      )}
      <ul className="task-list">
        {tasks.map((t) => (
          <TaskItem 
            key={t.id} 
            id={t.id}
            text={t.text} 
            createdAt={t.createdAt}
            onDelete={deleteTask}
          />
        ))}
      </ul>
      {tasks.length === 0 && <p className="empty">No hay tareas aún.</p>}
    </div>
  );
}

export default App;
