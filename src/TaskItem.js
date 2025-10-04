// Componente simple para renderizar una tarea con fecha/hora
function TaskItem({ id, text, createdAt, onDelete }) {
  const date = createdAt ? new Date(createdAt) : null;
  const formatted = date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "";

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${text}"?`)) {
      onDelete(id);
    }
  };

  return (
    <li className="task-item">
      <div className="task-content">
        <span className="task-text">{text}</span>
        {formatted && (
          <time className="task-time" dateTime={createdAt}>
            {formatted}
          </time>
        )}
      </div>
      <button 
        className="delete-button"
        onClick={handleDelete}
        title={`Eliminar tarea: ${text}`}
        aria-label={`Eliminar tarea: ${text}`}
      >
        ✕
      </button>
    </li>
  );
}

export default TaskItem;
