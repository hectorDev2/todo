import { useMemo, useState, useEffect } from "react";
import "./App.css";
import TaskItem from "./TaskItem";
import taskMemory from "./memory";

function App() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  // Estructura de tarea: { id: string, text: string, createdAt: string, dueDate: string }
  const [tasks, setTasks] = useState([]);
  const [memoryStats, setMemoryStats] = useState(null);
  const [showMemoryInfo, setShowMemoryInfo] = useState(false);

  // Cargar tareas del sistema de memoria al iniciar
  useEffect(() => {
    try {
      const savedTasks = taskMemory.loadTasks();
      setTasks(savedTasks);
      console.log(`Cargadas ${savedTasks.length} tareas desde la memoria`);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  }, []);

  // Guardar tareas en el sistema de memoria cuando cambie el estado
  useEffect(() => {
    if (tasks.length > 0 || JSON.stringify(tasks) !== JSON.stringify([])) {
      const success = taskMemory.saveTasks(tasks);
      if (!success) {
        console.warn('No se pudieron guardar las tareas');
      }
    }
  }, [tasks]);

  // Actualizar estadísticas de memoria periódicamente
  useEffect(() => {
    const updateStats = () => {
      setMemoryStats(taskMemory.getMemoryStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

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
      { 
        id, 
        text: t, 
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null
      },
    ]);
    setTask("");
    setDueDate("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const editTask = (id, newText, newDueDate) => {
    setTasks((prev) => 
      prev.map((task) => 
        task.id === id 
          ? { ...task, text: newText, dueDate: newDueDate || null }
          : task
      )
    );
  };

  // Funciones de gestión de memoria
  const createBackup = () => {
    const success = taskMemory.createBackup('manual');
    if (success) {
      alert('Backup creado exitosamente');
      setMemoryStats(taskMemory.getMemoryStats());
    } else {
      alert('Error al crear backup');
    }
  };

  const showBackups = () => {
    const backups = taskMemory.getAvailableBackups();
    if (backups.length === 0) {
      alert('No hay backups disponibles');
      return;
    }

    const backupList = backups.map((backup, index) => 
      `${index + 1}. ${new Date(backup.timestamp).toLocaleString()} - ${backup.reason} (${backup.taskCount} tareas)`
    ).join('\n');

    const choice = prompt(`Backups disponibles:\n${backupList}\n\nIngresa el número del backup a restaurar (o cancela):`);
    
    if (choice && !isNaN(choice)) {
      const backupIndex = parseInt(choice) - 1;
      if (backups[backupIndex]) {
        const confirm = window.confirm(`¿Restaurar backup del ${new Date(backups[backupIndex].timestamp).toLocaleString()}?\nEsto reemplazará todas las tareas actuales.`);
        if (confirm) {
          const success = taskMemory.restoreFromBackup(backups[backupIndex].key);
          if (success) {
            const restoredTasks = taskMemory.loadTasks();
            setTasks(restoredTasks);
            alert('Backup restaurado exitosamente');
          } else {
            alert('Error al restaurar backup');
          }
        }
      }
    }
  };

  const clearAllData = () => {
    const confirm = window.confirm('¿Estás seguro de que quieres eliminar TODAS las tareas y backups?\nEsta acción no se puede deshacer.');
    if (confirm) {
      const doubleConfirm = window.confirm('Esta acción es IRREVERSIBLE. ¿Continuar?');
      if (doubleConfirm) {
        taskMemory.clearAllData();
        setTasks([]);
        setMemoryStats(taskMemory.getMemoryStats());
        alert('Todos los datos han sido eliminados');
      }
    }
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
        <button 
          className="memory-toggle"
          onClick={() => setShowMemoryInfo(!showMemoryInfo)}
          title="Información de memoria"
        >
          💾
        </button>
      </h1>
      
      {showMemoryInfo && memoryStats && (
        <div className="memory-panel">
          <h3>Información de Memoria</h3>
          <div className="memory-stats">
            <p><strong>Tipo:</strong> {memoryStats.type}</p>
            <p><strong>Tareas:</strong> {memoryStats.tasks}</p>
            <p><strong>Backups:</strong> {memoryStats.backups}</p>
            <p><strong>Espacio usado:</strong> {memoryStats.space}</p>
            {memoryStats.lastSaved && (
              <p><strong>Último guardado:</strong> {new Date(memoryStats.lastSaved).toLocaleString()}</p>
            )}
            {memoryStats.version && (
              <p><strong>Versión:</strong> {memoryStats.version}</p>
            )}
          </div>
          <div className="memory-actions">
            <button onClick={createBackup} className="backup-button">
              Crear Backup
            </button>
            <button onClick={showBackups} className="restore-button">
              Restaurar Backup
            </button>
            <button onClick={clearAllData} className="clear-button">
              Limpiar Todo
            </button>
          </div>
        </div>
      )}
      <div className="input-section">
        <div className="input-row">
          <input
            aria-label="Nueva tarea"
            placeholder="Escribe una tarea"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={onKeyDown}
            aria-invalid={Boolean(trimmed && isDuplicate)}
          />
          <input
            type="date"
            aria-label="Fecha de vencimiento (opcional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="date-input"
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
            dueDate={t.dueDate}
            onDelete={deleteTask}
            onEdit={editTask}
          />
        ))}
      </ul>
      {tasks.length === 0 && <p className="empty">No hay tareas aún.</p>}
    </div>
  );
}

export default App;
