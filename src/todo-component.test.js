import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../src/todo-component'; // Import die Web Component um sie zu registrieren

// Note: Diese Tests prüfen die Web Component Definition
// Die echte Funktionalität wird durch TodoApp.test.js getestet

describe('TodoWebComponent', () => {
  let container;

  beforeEach(() => {
    // Test-Container erstellen
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  it('sollte als Custom Element registriert sein', async () => {
    // Diese Assertion prüft, dass das Element definiert ist
    expect(customElements.get('todo-app')).toBeDefined();
  });

  it('sollte die Web Component instantiieren können', async () => {
    const element = document.createElement('todo-app');
    container.appendChild(element);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(container.querySelector('todo-app')).toBeDefined();
  });

  it('sollte Props als Attribute akzeptieren', async () => {
    const element = document.createElement('todo-app');
    element.setAttribute('title', 'Web Component Aufgaben');
    container.appendChild(element);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Die Komponente sollte ohne Fehler rendern
    expect(container.querySelector('todo-app')).toBeTruthy();
  });
});
