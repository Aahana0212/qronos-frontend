// Safe localStorage functions
export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item && item !== 'undefined' && item !== 'null') {
      return JSON.parse(item);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    localStorage.removeItem(key);
    return defaultValue;
  }
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};