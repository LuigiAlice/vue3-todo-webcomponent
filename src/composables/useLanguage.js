import { ref } from 'vue';

/**
 * Composable für Sprachwechsel-Logik
 * @param {string} initialLang - Initiale Sprache
 * @returns {Object} Sprach-Composable mit toggle-Funktion
 */
export function useLanguage(initialLang = 'de') {
  const currentLang = ref(initialLang);

  /**
   * Wechselt zwischen den verfügbaren Sprachen
   */
  const toggleLang = () => {
    currentLang.value = currentLang.value === 'de' ? 'en' : 'de';
  };

  /**
   * Setzt die Sprache explizit
   * @param {string} lang - Sprachcode ('de' oder 'en')
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
