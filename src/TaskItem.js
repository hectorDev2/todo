import { useState } from "react";

// Componente para renderizar una tarea con fecha/hora, fecha de vencimiento y edición
function TaskItem({ id, text, createdAt, dueDate, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editDueDate, setEditDueDate] = useState(dueDate || "");

  const createdDate = createdAt ? new Date(createdAt) : null;
  const formattedCreated = createdDate
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(createdDate)
    : "";

  const dueDateObj = dueDate ? new Date(dueDate) : null;
  const formattedDueDate = dueDateObj
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
      }).format(dueDateObj)
    : "";

  // Verificar si la tarea está vencida
  const isOverdue = dueDateObj && dueDateObj < new Date();
  const isDueSoon = dueDateObj && !isOverdue && 
    (dueDateObj.getTime() - new Date().getTime()) < (24 * 60 * 60 * 1000); // Menos de 24 horas

  const handleDelete = () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la tarea "${text}"?`
      )
    ) {
      onDelete(id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(id, editText.trim(), editDueDate);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(text);
    setEditDueDate(dueDate || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <li className="task-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="edit-input"
            autoFocus
          />
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="edit-date-input"
          />
          <div className="edit-buttons">
            <button onClick={handleSave} className="save-button" title="Guardar cambios">
              ✓
            </button>
            <button onClick={handleCancel} className="cancel-button" title="Cancelar edición">
              ✕
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`task-item ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`}>
      <div className="task-content">
        <span className="task-text">{text}</span>
        <div className="task-dates">
          {formattedCreated && (
            <time className="task-time created" dateTime={createdAt}>
              Creada: {formattedCreated}
            </time>
          )}
          {formattedDueDate && (
            <time className={`task-time due-date ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`} dateTime={dueDate}>
              {isOverdue ? '⚠️ Vencida: ' : isDueSoon ? '⏰ Vence: ' : '📅 Vence: '}{formattedDueDate}
            </time>
          )}
        </div>
      </div>
      <div className="task-actions">
        <button
          className="edit-button"
          onClick={handleEdit}
          title={`Editar tarea: ${text}`}
          aria-label={`Editar tarea: ${text}`}
        >
          ✏️
        </button>
        <button
          className="delete-button"
          onClick={handleDelete}
          title={`Eliminar tarea: ${text}`}
          aria-label={`Eliminar tarea: ${text}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
