import { defineCustomElement } from 'vue';
import TodoApp from './TodoApp.vue';

/**
 * Web Component for the Todo application
 * Creates a custom element 'todo-app' that renders the TodoApp component
 */
const TodoWebComponent = defineCustomElement(TodoApp);

// Register custom element
customElements.define('todo-app', TodoWebComponent);
