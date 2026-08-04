/**
 * Formats an ISO date string into a readable format.
 * @param {string} dateString - The ISO date string to format.
 * @param {object} options - Optional Intl.DateTimeFormat options.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  try {
    const date = new Date(dateString);
    // Using 'en-IN' to display the date in Indian English format
    return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string on failure
  }
};

/**
 * Formats an ISO date string into a readable date and time format.
 * @param {string} dateString - The ISO date string to format.
 * @param {object} options - Optional Intl.DateTimeFormat options.
 * @returns {string} The formatted date and time string.
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  try {
    return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(new Date(dateString));
  } catch (error) {
    console.error("Error formatting date and time:", error);
    return dateString;
  }
};