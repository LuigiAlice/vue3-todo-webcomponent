import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TodoApp from '../src/TodoApp.vue';

describe('TodoApp.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Lokalem Storage vor jedem Test leeren
    localStorage.clear();
    // window.confirm mocken
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    wrapper = mount(TodoApp, {
      props: {
        title: 'Test Aufgaben',
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
    it('sollte die Komponente korrekt rendern', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('[data-testid="todo-app"]').exists()).toBe(true);
    });

    it('sollte den Titel anzeigen', () => {
      expect(wrapper.find('[data-testid="app-title"]').text()).toBe('Test Aufgaben');
    });

    it('sollte Input-Feld und Buttons enthalten', () => {
      expect(wrapper.find('[data-testid="todo-input"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-add"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="btn-import"]').exists()).toBe(true);
    });

    it('sollte Filter-Buttons anzeigen', () => {
      const filterButtons = wrapper.findAll('[data-testid^="filter-"]');
      expect(filterButtons).toHaveLength(3);
      expect(filterButtons[0].text()).toBe('Alle');
      expect(filterButtons[1].text()).toBe('Aktiv');
      expect(filterButtons[2].text()).toBe('Erledigt');
    });
  });

  describe('Todo-Verwaltung', () => {
    it('sollte ein Todo hinzufügen können', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Neue Aufgabe');
      
      const addButton = wrapper.find('[data-testid="btn-add"]');
      await addButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Neue Aufgabe');
    });

    it('sollte ein Todo mit Enter-Taste hinzufügen', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Aufgabe via Enter');
      await input.trigger('keyup.enter');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
    });

    it('sollte kein leeres Todo hinzufügen', async () => {
      const addButton = wrapper.find('[data-testid="btn-add"]');
      await addButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
    });

    it('sollte ein Todo entfernen können', async () => {
      // Erst ein Todo hinzufügen
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Zu löschende Aufgabe');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);

      // Dann löschen
      const deleteButton = wrapper.find('[data-testid^="btn-delete-"]');
      await deleteButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(0);
    });

    it('sollte ein Todo nicht löschen, wenn Bestätigung abgelehnt wird', async () => {
      // Erst ein Todo hinzufügen
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Zu schützende Aufgabe');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);

      // window.confirm auf false setzen
      window.confirm.mockReturnValue(false);

      // Löschen versuchen
      const deleteButton = wrapper.find('[data-testid^="btn-delete-"]');
      await deleteButton.trigger('click');

      // Todo sollte noch da sein
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Zu schützende Aufgabe');
    });

    it('sollte ein Todo abhaken können', async () => {
      // Todo hinzufügen
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Zu erledigende Aufgabe');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      // Abhaken
      const checkbox = wrapper.find('[data-testid^="todo-checkbox-"]');
      await checkbox.setValue(true);

      const todoItem = wrapper.find('[data-testid^="todo-item-"]');
      expect(todoItem.classes()).toContain('completed');
    });
  });

  describe('Filterfunktionalität', () => {
    beforeEach(async () => {
      // Mehrere Todos hinzufügen
      const input = wrapper.find('[data-testid="todo-input"]');
      
      await input.setValue('Aufgabe 1');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      await input.setValue('Aufgabe 2');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      // Erste als erledigt markieren
      const checkboxes = wrapper.findAll('[data-testid^="todo-checkbox-"]');
      await checkboxes[0].setValue(true);
    });

    it('sollte alle Todos im "Alle"-Filter zeigen', async () => {
      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(2);
    });

    it('sollte nur aktive Todos im "Aktiv"-Filter zeigen', async () => {
      const filterButton = wrapper.find('[data-testid="filter-active"]');
      await filterButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Aufgabe 2');
    });

    it('sollte nur erledigte Todos im "Erledigt"-Filter zeigen', async () => {
      const filterButton = wrapper.find('[data-testid="filter-completed"]');
      await filterButton.trigger('click');

      expect(wrapper.findAll('[data-testid^="todo-item-"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid^="todo-text-"]').text()).toBe('Aufgabe 1');
    });
  });

  describe('Statistiken', () => {
    it('sollte die Anzahl der übrigen Aufgaben anzeigen', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      
      await input.setValue('Aufgabe 1');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');
      
      await input.setValue('Aufgabe 2');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      let stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('2 Aufgaben übrig');

      // Eine abhaken
      const checkbox = wrapper.find('[data-testid^="todo-checkbox-"]');
      await checkbox.setValue(true);

      stats = wrapper.find('[data-testid="todo-stats"]');
      expect(stats.text()).toContain('1 Aufgabe übrig');
    });

    it('sollte keine Statistiken anzeigen, wenn keine Todos vorhanden sind', () => {
      expect(wrapper.find('[data-testid="todo-stats"]').exists()).toBe(false);
    });
  });

  describe('JSON Modal', () => {
    it('sollte das Modal öffnen können', async () => {
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(true);
    });

    it('sollte das Modal schließen können', async () => {
      // Modal öffnen
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);

      // Modal schließen
      const closeButton = wrapper.find('[data-testid="btn-close"]');
      await closeButton.trigger('click');

      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(false);
    });

    it('sollte JSON-Text in Todos konvertieren', async () => {
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

    it('sollte ungültiges JSON ablehnen', async () => {
      const jsonButton = wrapper.find('[data-testid="btn-import"]');
      await jsonButton.trigger('click');

      const textarea = wrapper.find('[data-testid="json-textarea"]');
      await textarea.setValue('invalid json');

      const applyButton = wrapper.find('[data-testid="btn-apply"]');
      await applyButton.trigger('click');

      // Modal sollte noch offen sein mit Fehlermeldung
      expect(wrapper.find('[data-testid="modal"]').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('sollte Props akzeptieren', () => {
      const newWrapper = mount(TodoApp, {
        props: {
          title: 'Meine Custom Aufgaben',
          storageKey: 'custom-todos'
        }
      });

      expect(newWrapper.find('[data-testid="app-title"]').text()).toBe('Meine Custom Aufgaben');
      newWrapper.unmount();
    });

    it('sollte Standard-Werte verwenden, wenn keine Props übergeben', () => {
      const newWrapper = mount(TodoApp);
      expect(newWrapper.find('[data-testid="app-title"]').text()).toBe('Meine Aufgaben');
      newWrapper.unmount();
    });
  });

  describe('LocalStorage', () => {
    it('sollte Todos in LocalStorage speichern', async () => {
      const input = wrapper.find('[data-testid="todo-input"]');
      await input.setValue('Persistente Aufgabe');
      await wrapper.find('[data-testid="btn-add"]').trigger('click');

      const stored = localStorage.getItem('test-todos');
      expect(stored).toBeTruthy();
      
      const parsedData = JSON.parse(stored);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].text).toBe('Persistente Aufgabe');
    });
  });
});
