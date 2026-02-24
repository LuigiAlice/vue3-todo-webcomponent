import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TodoApp from '../src/TodoApp.vue';

describe('TodoApp.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Clear local storage before each test
    localStorage.clear();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    wrapper = mount(TodoApp, {
      props: {
        title: 'Test Tasks',
        storageKey: 'test-todos'
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component correctly', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="todo-app"]').exists()).toBe(true);
    });

    it('should display the title', () => {
      expect(wrapper.find('[data-testid="app-title"]').text()).toBe('Test Tasks');
    });

    it('should contain input field and buttons', () => {
      expect(wrapper.find('[data-testid="todo-input"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-add"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-import"]').exists()).toBe(true);
    });

    it('should display filter buttons (German)', () => {
      const filterButtons = wrapper.findAll('[data-testid^="filter-"]');
      expect(filterButtons).toHaveLength(3);
      expect(filterButtons[0].text()).toBe('Alle');
      expect(filterButtons[1].text()).toBe('Aktiv');
      expect(filterButtons[2].text()).toBe('Erledigt');
    });

    it('should display the language switch button', () => {
      expect(wrapper.find('[data-testid="btn-lang"]').exists()).toBe(true);
    });
  });

  describe('Todo Management', () => {
    it('should be able to add a todo', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('New Task');
      
      const addButton = wrapper.find('[data-testid="btn-add"]');
      await addButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('New Task');
    });

    it('should add a todo with Enter key', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Task via Enter');
      await input.trigger('keyup.enter');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
    });

    it('should not add an empty todo', async () => {
      const addButton = wrapper.find('[data-testid="btn-add"]');
      await addButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
    });

    it('should be able to remove a todo', async () => {
      // First add a todo
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Task to delete');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);

      // Then delete
      const deleteButton = wrapper.find('[data-testid^="btn-delete-"]');
      await deleteButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
    });

    it('should not delete a todo if confirmation is denied', async () => {
      // First add a todo
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Task to protect');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);

      // Set window.confirm to false
      window.confirm.mockReturnValue(false);

      // Try to delete
      const deleteButton = wrapper.find('[data-testid^="btn-delete-"]');
      await deleteButton.trigger('click');

      // Todo should still be there
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Task to protect');
    });

    it('should be able to check off a todo', async () => {
      // Add todo
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Task to complete');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      // Check off
      const checkbox = wrapper.find('[data-testid^="todo-checkbox-"]');
      await checkbox.setValue(true);

      const todoItem = wrapper.find('[data-testid^="todo-item-"]');
      expect(todoItem.classes()).toContain('completed');
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(async () => {
      // Add multiple todos
      const input = wrapper.find('[data-testid="todo-input"]');
      
      await input.setValue('Task 1');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      await input.setValue('Task 2');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      // Mark first as completed
      const checkboxes = wrapper.findAll('[data-testid^="todo-checkbox-"]');
      await checkboxes[0].setValue(true);
    });

    it('should show all todos in "All" filter', async () => {
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(2);
    });

    it('should show only active todos in "Active" filter', async () => {
      const filterButton = wrapper.find('[data-testid="filter-active"]');
      await filterButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Task 2');
    });

    it('should show only completed todos in "Completed" filter', async () => {
      const filterButton = wrapper.find('[data-testid="filter-completed"]');
      await filterButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Task 1');
    });
  });

  describe('Statistics', () => {
    it('should display the number of remaining tasks', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      
      await input.setValue('Task 1');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      await input.setValue('Task 2');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      let stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('2 Aufgaben übrig');

      // Check off one
      const checkbox = wrapper.find('[data-testid^="todo-checkbox-"]');
      await checkbox.setValue(true);

      stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('1 Aufgabe übrig');
    });

    it('should not display statistics if no todos are present', () => {
      expect(wrapper.find('[data-testid="todo-stats"]').exists()).toBe(false);
    });
  });

  describe('JSON Modal', () => {
    it('should be able to open the modal', async () => {
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(true);
    });

    it('should be able to close the modal', async () => {
      // Open modal
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);

      // Close modal
      const closeButton = wrapper.find('[data-testid="btn-close"]');
      await closeButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    });

    it('should convert JSON text to todos', async () => {
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      const textarea = wrapper.find('[data-testid="json-textarea"]');
      const testData = [
        { id: 1, text: 'Test Todo', completed: false }
      ];
      
      await textarea.setValue(JSON.stringify(testData));

      const applyButton = wrapper.find('[data-testid="btn-apply"]');
      await applyButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Test Todo');
    });

    it('should reject invalid JSON', async () => {
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      const textarea = wrapper.find('[data-testid="json-textarea"]');
      await textarea.setValue('invalid json');

      const applyButton = wrapper.find('[data-testid="btn-apply"]');
      await applyButton.trigger('click');

      // Modal should still be open with error message
      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('should accept props', () => {
      const newWrapper = mount(TodoApp, {
        props: {
          title: 'My Custom Tasks',
          storageKey: 'custom-todos'
        }
      });

      expect(newWrapper.find('[data-testid="app-title"]').text()).toBe('My Custom Tasks');
      newWrapper.unmount();
    });

    it('should use default values when no props are passed', () => {
      const newWrapper = mount(TodoApp);
      expect(newWrapper.find('[data-testid="app-title"]').text()).toBe('Meine Aufgaben');
      newWrapper.unmount();
    });

    it('should accept the lang prop and display English text', () => {
      const newWrapper = mount(TodoApp, {
        props: { lang: 'en' }
      });
      expect(newWrapper.find('[data-testid="app-title"]').text()).toBe('My Tasks');
      const filterButtons = newWrapper.findAll('[data-testid^="filter-"]');
      expect(filterButtons[0].text()).toBe('All');
      expect(filterButtons[1].text()).toBe('Active');
      expect(filterButtons[2].text()).toBe('Completed');
      newWrapper.unmount();
    });

    it('should use the todosData prop', async () => {
      const testData = JSON.stringify([
        { id: 1, text: 'Test Todo', completed: false }
      ]);
      const newWrapper = mount(TodoApp, {
        props: { 
          todosData: testData,
          title: 'Test Tasks',
          storageKey: 'test-todos'
        }
      });
      
      // Wait for asynchronous initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(newWrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(newWrapper.find('[data-testid^="todo-text-"]').text()).toBe('Test Todo');
      newWrapper.unmount();
    });

    it('should treat empty todosData prop as empty list', () => {
      const newWrapper = mount(TodoApp, {
        props: { todosData: '[]' }
      });
      expect(newWrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
      newWrapper.unmount();
    });
  });

  describe('i18n - Language Switcher', () => {
    it('should display German by default', () => {
      expect(wrapper.find('[data-testid="btn-add"]').text()).toBe('Hinzufügen');
      expect(wrapper.find('[data-testid="btn-import"]').text()).toBe('JSON bearbeiten');
    });

    it('should display English after clicking language switch', async () => {
      const langBtn = wrapper.find('[data-testid="btn-lang"]');
      await langBtn.trigger('click');

      expect(wrapper.find('[data-testid="btn-add"]').text()).toBe('Add');
      expect(wrapper.find('[data-testid="btn-import"]').text()).toBe('Edit JSON');
      const filterButtons = wrapper.findAll('[data-testid^="filter-"]');
      expect(filterButtons[0].text()).toBe('All');
    });

    it('should display German again after clicking twice', async () => {
      const langBtn = wrapper.find('[data-testid="btn-lang"]');
      await langBtn.trigger('click');
      await langBtn.trigger('click');

      expect(wrapper.find('[data-testid="btn-add"]').text()).toBe('Hinzufügen');
    });

    it('should display English statistics', async () => {
      const langBtn = wrapper.find('[data-testid="btn-lang"]');
      await langBtn.trigger('click');

      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Test task');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      const stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('1 task remaining');
    });

    it('should display English statistics in plural', async () => {
      const langBtn = wrapper.find('[data-testid="btn-lang"]');
      await langBtn.trigger('click');

      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Task 1');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      await input.setValue('Task 2');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      const stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('2 tasks remaining');
    });
  });

  describe('LocalStorage', () => {
    it('should save todos to LocalStorage', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Persistent Task');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      const stored = localStorage.getItem('test-todos');
      expect(stored).toBeTruthy();
      
      const parsedData = JSON.parse(stored);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].text).toBe('Persistent Task');
    });

    it('should load todos from LocalStorage', async () => {
      // Save data to LocalStorage in advance
      const testData = [
        { id: 1, text: 'Stored Task', completed: false }
      ];
      localStorage.setItem('test-todos', JSON.stringify(testData));

      // Mount new component
      const newWrapper = mount(TodoApp, {
        props: {
          title: 'Test Tasks',
          storageKey: 'test-todos',
          todosData: '[]' // Empty todosData so LocalStorage will be loaded
        }
      });

      // Wait for asynchronous initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(newWrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(newWrapper.find('[data-testid^="todo-text-"]').text()).toBe('Stored Task');
      newWrapper.unmount();
    });

    it('should ignore invalid LocalStorage data', async () => {
      // Save invalid data to LocalStorage
      localStorage.setItem('test-todos', 'invalid json');

      // Mount new component - should not crash
      const newWrapper = mount(TodoApp, {
        props: {
          title: 'Test Tasks',
          storageKey: 'test-todos'
        }
      });

      // Wait for asynchronous initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(newWrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
      newWrapper.unmount();
    });
  });
});
