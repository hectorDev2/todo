// Sistema de memoria basado en localStorage para la aplicación de tareas
// Maneja la persistencia, validación y migración de datos

const STORAGE_KEYS = {
  TASKS: 'todo-tasks',
  APP_VERSION: 'todo-app-version',
  LAST_BACKUP: 'todo-last-backup',
  USER_SETTINGS: 'todo-user-settings'
};

const CURRENT_VERSION = '1.0.0';
const MAX_BACKUP_ITEMS = 5;

class TaskMemory {
  constructor() {
    this.initializeStorage();
  }

  // Inicializar el sistema de almacenamiento
  initializeStorage() {
    try {
      // Verificar si localStorage está disponible
      if (!this.isLocalStorageAvailable()) {
        console.warn('localStorage no está disponible, usando memoria temporal');
        this.fallbackStorage = new Map();
        return;
      }

      // Verificar versión y migrar si es necesario
      this.checkVersionAndMigrate();
      
      // Configurar backup automático
      this.setupAutoBackup();
      
    } catch (error) {
      console.error('Error inicializando almacenamiento:', error);
      this.fallbackStorage = new Map();
    }
  }

  // Verificar disponibilidad de localStorage
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Cargar tareas desde la memoria
  loadTasks() {
    try {
      if (this.fallbackStorage) {
        return this.fallbackStorage.get(STORAGE_KEYS.TASKS) || [];
      }

      const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!tasksJson) return [];

      const tasks = JSON.parse(tasksJson);
      
      // Validar estructura de datos
      if (!Array.isArray(tasks)) {
        console.warn('Datos de tareas inválidos, inicializando array vacío');
        return [];
      }

      // Validar y limpiar cada tarea
      const validTasks = tasks.filter(task => this.validateTask(task))
                              .map(task => this.sanitizeTask(task));

      return validTasks;

    } catch (error) {
      console.error('Error cargando tareas:', error);
      this.createBackup('error-recovery');
      return [];
    }
  }

  // Guardar tareas en la memoria
  saveTasks(tasks) {
    try {
      if (!Array.isArray(tasks)) {
        throw new Error('Las tareas deben ser un array');
      }

      // Validar todas las tareas antes de guardar
      const validTasks = tasks.filter(task => this.validateTask(task))
                              .map(task => this.sanitizeTask(task));

      const tasksJson = JSON.stringify(validTasks);

      if (this.fallbackStorage) {
        this.fallbackStorage.set(STORAGE_KEYS.TASKS, validTasks);
        return true;
      }

      // Verificar espacio disponible
      if (!this.checkStorageSpace(tasksJson)) {
        console.warn('Espacio de almacenamiento insuficiente, limpiando backups antiguos');
        this.cleanOldBackups();
      }

      localStorage.setItem(STORAGE_KEYS.TASKS, tasksJson);
      
      // Actualizar timestamp del último guardado
      localStorage.setItem('todo-last-saved', new Date().toISOString());
      
      return true;

    } catch (error) {
      console.error('Error guardando tareas:', error);
      return false;
    }
  }

  // Validar estructura de una tarea
  validateTask(task) {
    if (!task || typeof task !== 'object') return false;
    if (!task.id || typeof task.id !== 'string') return false;
    if (!task.text || typeof task.text !== 'string') return false;
    if (!task.createdAt || !this.isValidDate(task.createdAt)) return false;
    
    return true;
  }

  // Limpiar y sanitizar una tarea
  sanitizeTask(task) {
    return {
      id: String(task.id).trim(),
      text: String(task.text).trim(),
      createdAt: this.isValidDate(task.createdAt) ? task.createdAt : new Date().toISOString(),
      dueDate: task.dueDate && this.isValidDate(task.dueDate) ? task.dueDate : null
    };
  }

  // Validar formato de fecha
  isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Crear backup de las tareas actuales
  createBackup(reason = 'manual') {
    try {
      if (this.fallbackStorage) return false;

      const currentTasks = this.loadTasks();
      const backup = {
        tasks: currentTasks,
        timestamp: new Date().toISOString(),
        reason: reason,
        version: CURRENT_VERSION
      };

      const backupKey = `todo-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, backupKey);

      // Limpiar backups antiguos
      this.cleanOldBackups();
      
      return true;
    } catch (error) {
      console.error('Error creando backup:', error);
      return false;
    }
  }

  // Restaurar desde backup
  restoreFromBackup(backupKey) {
    try {
      if (this.fallbackStorage) return false;

      const backupJson = localStorage.getItem(backupKey);
      if (!backupJson) return false;

      const backup = JSON.parse(backupJson);
      if (!backup.tasks || !Array.isArray(backup.tasks)) return false;

      // Crear backup del estado actual antes de restaurar
      this.createBackup('pre-restore');

      return this.saveTasks(backup.tasks);
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return false;
    }
  }

  // Obtener lista de backups disponibles
  getAvailableBackups() {
    try {
      if (this.fallbackStorage) return [];

      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('todo-backup-')) {
          try {
            const backupData = JSON.parse(localStorage.getItem(key));
            backups.push({
              key,
              timestamp: backupData.timestamp,
              reason: backupData.reason,
              taskCount: backupData.tasks ? backupData.tasks.length : 0
            });
          } catch (e) {
            // Backup corrupto, ignorar
          }
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error obteniendo backups:', error);
      return [];
    }
  }

  // Limpiar backups antiguos
  cleanOldBackups() {
    try {
      if (this.fallbackStorage) return;

      const backups = this.getAvailableBackups();
      if (backups.length > MAX_BACKUP_ITEMS) {
        const toDelete = backups.slice(MAX_BACKUP_ITEMS);
        toDelete.forEach(backup => {
          localStorage.removeItem(backup.key);
        });
      }
    } catch (error) {
      console.error('Error limpiando backups:', error);
    }
  }

  // Verificar espacio disponible en localStorage
  checkStorageSpace(newData) {
    try {
      if (this.fallbackStorage) return true;

      const testKey = '__space_test__';
      localStorage.setItem(testKey, newData);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Verificar versión y migrar datos si es necesario
  checkVersionAndMigrate() {
    try {
      const savedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
      
      if (!savedVersion) {
        // Primera vez, establecer versión actual
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
        return;
      }

      if (savedVersion !== CURRENT_VERSION) {
        console.log(`Migrando de versión ${savedVersion} a ${CURRENT_VERSION}`);
        this.createBackup('version-migration');
        // Aquí podrías agregar lógica de migración específica
        localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Error en migración de versión:', error);
    }
  }

  // Configurar backup automático
  setupAutoBackup() {
    // Crear backup automático cada hora si hay cambios
    setInterval(() => {
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      const lastSaved = localStorage.getItem('todo-last-saved');
      
      if (lastSaved && (!lastBackup || new Date(lastSaved) > new Date(lastBackup))) {
        this.createBackup('auto');
      }
    }, 60 * 60 * 1000); // 1 hora
  }

  // Obtener estadísticas de memoria
  getMemoryStats() {
    try {
      if (this.fallbackStorage) {
        return {
          type: 'fallback',
          tasks: this.fallbackStorage.get(STORAGE_KEYS.TASKS)?.length || 0,
          backups: 0,
          space: 'N/A'
        };
      }

      const tasks = this.loadTasks();
      const backups = this.getAvailableBackups();
      
      // Calcular uso aproximado de localStorage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      return {
        type: 'localStorage',
        tasks: tasks.length,
        backups: backups.length,
        space: `${Math.round(totalSize / 1024)}KB`,
        lastSaved: localStorage.getItem('todo-last-saved'),
        version: localStorage.getItem(STORAGE_KEYS.APP_VERSION)
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { type: 'error', error: error.message };
    }
  }

  // Limpiar toda la memoria (usar con cuidado)
  clearAllData() {
    try {
      if (this.fallbackStorage) {
        this.fallbackStorage.clear();
        return true;
      }

      // Crear backup final antes de limpiar
      this.createBackup('clear-all');

      // Limpiar todas las claves relacionadas con la app
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });

      localStorage.removeItem('todo-last-saved');

      // Limpiar backups
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('todo-backup-')) {
          localStorage.removeItem(key);
        }
      }

      return true;
    } catch (error) {
      console.error('Error limpiando datos:', error);
      return false;
    }
  }
}

// Crear instancia única (singleton)
const taskMemory = new TaskMemory();

export default taskMemory;