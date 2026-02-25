import { ref, onMounted } from 'vue';

/**
 * Composable for language switching logic with persistence
 * @param {string} initialLang - Initial language
 * @returns {Object} Language composable with toggle function
 */
export function useLanguage(initialLang = 'de') {
  const currentLang = ref(initialLang);

  /**
   * Saves language preference to localStorage
   * @param {string} lang - Language code to save
   */
  const saveLanguage = (lang) => {
    try {
      localStorage.setItem('todo-app-language', lang);
    } catch (error) {
      console.warn('Could not save language preference:', error);
    }
  };

  /**
   * Loads language preference from localStorage
   * @returns {string} Saved language or default
   */
  const loadLanguage = () => {
    try {
      const savedLang = localStorage.getItem('todo-app-language');
      return savedLang && ['de', 'en'].includes(savedLang) ? savedLang : initialLang;
    } catch (error) {
      console.warn('Could not load language preference:', error);
      return initialLang;
    }
  };

  /**
   * Toggles between available languages and persists the choice
   */
  const toggleLang = () => {
    const newLang = currentLang.value === 'de' ? 'en' : 'de';
    currentLang.value = newLang;
    saveLanguage(newLang);
  };

  /**
   * Sets the language explicitly and persists the choice
   * @param {string} lang - Language code ('de' or 'en')
   */
  const setLang = (lang) => {
    if (['de', 'en'].includes(lang)) {
      currentLang.value = lang;
      saveLanguage(lang);
    }
  };

  // Load saved language on mount
  onMounted(() => {
    currentLang.value = loadLanguage();
  });

  return {
    currentLang,
    toggleLang,
    setLang
  };
}
