import { defineCustomElement } from 'vue';
import TodoApp from './TodoApp.vue';

const TodoWebComponent = defineCustomElement(TodoApp);

customElements.define('todo-app', TodoWebComponent);
