## Todo App (React)

Aplicación simple de lista de tareas construida con React y Create React App.

Permite agregar tareas con validación, muestra un contador y la fecha/hora de creación por cada tarea, y cuenta con estilos básicos y accesibles.

## Características

- Ingreso de tareas mediante input y botón “Agregar”.
- Validación de entrada:
	- Evita tareas vacías (se deshabilita el botón si el texto está vacío/espacios).
	- Evita duplicados (comparación insensible a mayúsculas/minúsculas).
- Contador de tareas visible en el título (singular/plural).
- Fecha y hora de creación junto a cada tarea (formato local usando Intl.DateTimeFormat).
- Tecla Enter para agregar rápidamente.
- Mensaje de error accesible cuando hay duplicados.
- Componente reutilizable `TaskItem` para representar cada tarea.
- Estilos cuidando la usabilidad (clases en `src/App.css`).

## Estructura del proyecto

```
todo-app/
	package.json
	README.md
	public/
		index.html
		...
	src/
		App.js
		App.css
		App.test.js
		TaskItem.js
		index.js
		...
```

## Requisitos

- Node.js y npm instalados.

## Instalación y ejecución

1. Instalar dependencias.
2. Ejecutar en modo desarrollo.

Comandos (zsh/macOS):

```bash
npm install
npm start
```

La app se abrirá en http://localhost:3000.

## Pruebas

Se incluye una prueba básica para verificar que se puede agregar una tarea.

```bash
npm test
```

Para correr los tests una sola vez en CI:

```bash
npm test -- --watchAll=false
```

## Scripts disponibles

- `npm start`: inicia el servidor de desarrollo.
- `npm test`: ejecuta la suite de tests en modo interactivo.
- `npm run build`: compila la app para producción en `build/`.

## Decisiones técnicas y notas

- Cada tarea se modela como `{ id, text, createdAt }`.
- `createdAt` se guarda en formato ISO (toISOString) y se formatea al renderizar.
- Duplicados: se comparan textos normalizados en minúsculas (case-insensitive).
- Accesibilidad: se usan `aria-label` en el input, `role="alert"` para errores y títulos descriptivos.

## Posibles mejoras

- Eliminar/editar tareas.
- Persistencia en `localStorage`.
- Filtrado (todas/completadas/pendientes) y completado de tareas.
- Pruebas adicionales (validaciones, accesibilidad, formato de fecha).

