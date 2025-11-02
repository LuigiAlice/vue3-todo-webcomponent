<template>
  <div class="todo-app">
    <h2>{{ title }}</h2>

    <div class="todo-input">
      <input
          v-model="newTodo"
          @keyup.enter="addTodo"
          type="text"
          placeholder="Was möchten Sie erledigen?"
          class="input-field"
      />
      <button @click="addTodo" class="btn btn-add">Hinzufügen</button>
    </div>

    <div class="todo-filters">
      <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="['btn-filter', { active: currentFilter === filter.value }]"
      >
        {{ filter.label }}
      </button>
    </div>

    <ul class="todo-list">
      <li
          v-for="todo in filteredTodos"
          :key="todo.id"
          :class="['todo-item', { completed: todo.completed }]"
      >
        <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
            class="todo-checkbox"
        />
        <span class="todo-text">{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)" class="btn btn-delete">
          ✕
        </button>
      </li>
    </ul>

    <div v-if="todos.length > 0" class="todo-stats">
      {{ remainingCount }} {{ remainingCount === 1 ? 'Aufgabe' : 'Aufgaben' }} übrig
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineEmits, defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Meine Aufgaben'
  },
  storageKey: {
    type: String,
    default: 'vue-todos'
  },
  todosData: {
    type: String,
    default: '[]'
  }
});

const emit = defineEmits(['update:todosData']);

const newTodo = ref('');
const todos = ref([]);
const currentFilter = ref('all');

const filters = [
  { label: 'Alle', value: 'all' },
  { label: 'Aktiv', value: 'active' },
  { label: 'Erledigt', value: 'completed' }
];

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
});

const remainingCount = computed(() => {
  return todos.value.filter(todo => !todo.completed).length;
});

const addTodo = () => {
  const text = newTodo.value.trim();
  if (text) {
    todos.value.push({
      id: Date.now(),
      text,
      completed: false
    });
    newTodo.value = '';
  }
};

const removeTodo = (id) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
};

const toggleTodo = (id) => {
  const todo = todos.value.find(todo => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
};

const saveTodos = () => {
  localStorage.setItem(props.storageKey, JSON.stringify(todos.value));
};

const loadTodos = () => {
  const stored = localStorage.getItem(props.storageKey);
  if (stored) {
    try {
      todos.value = JSON.parse(stored);
    } catch (e) {
      console.error('Fehler beim Laden der Todos:', e);
    }
  }
};

onMounted(() => {
  try {
    // Wenn todosData gesetzt ist und nicht leer, lade aus diesem JSON-String
    if (props.todosData && props.todosData !== '[]') {
      todos.value = JSON.parse(props.todosData);
    } else {
      loadTodos(); // ansonsten aus localStorage laden
    }
  } catch {
    todos.value = [];
  }
});

// Prop turtlesData nicht direkt überschreiben, sondern lokale todos bearbeiten
// und Änderungen per Event kommunizieren
watch(
    todos,
    () => {
      saveTodos();
      emit('update:todosData', JSON.stringify(todos.value));
    },
    { deep: true }
);
</script>

<style scoped>
.todo-app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  text-align: center;
}

.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-field {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #42b983;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-add {
  background: #42b983;
  color: white;
}

.btn-add:hover {
  background: #38a373;
}

.todo-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.btn-filter {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-filter:hover {
  border-color: #42b983;
}

.btn-filter.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.3s;
}

.todo-item:hover {
  background: #f8f8f8;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
  color: #2c3e50;
}

.btn-delete {
  padding: 6px 10px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background 0.3s;
}

.btn-delete:hover {
  background: #cc0000;
}

.todo-stats {
  text-align: center;
  color: #666;
  font-size: 14px;
}

@media (max-width: 640px) {
  .todo-app {
    padding: 15px;
  }

  .todo-input {
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
  }
}
</style>
