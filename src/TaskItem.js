// Componente simple para renderizar una tarea con fecha/hora
function TaskItem({ text, createdAt }) {
  const date = createdAt ? new Date(createdAt) : null;
  const formatted = date
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "";

  return (
    <li className="task-item">
      <span className="task-text">{text}</span>
      {formatted && (
        <time className="task-time" dateTime={createdAt}>
          {formatted}
        </time>
      )}
    </li>
  );
}

export default TaskItem;
