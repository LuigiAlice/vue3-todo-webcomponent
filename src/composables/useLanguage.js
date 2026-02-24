import { ref } from 'vue';

/**
 * Composable for language switching logic
 * @param {string} initialLang - Initial language
 * @returns {Object} Language composable with toggle function
 */
export function useLanguage(initialLang = 'de') {
  const currentLang = ref(initialLang);

  /**
   * Toggles between available languages
   */
  const toggleLang = () => {
    currentLang.value = currentLang.value === 'de' ? 'en' : 'de';
  };

  /**
   * Sets the language explicitly
   * @param {string} lang - Language code ('de' or 'en')
   */
  const setLang = (lang) => {
    if (['de', 'en'].includes(lang)) {
      currentLang.value = lang;
    }
  };

  return {
    currentLang,
    toggleLang,
    setLang
  };
}
