/**
 * Formats a number into an Indian Rupee currency string.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string with the '₹' symbol.
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    // If not a number, return an empty string.
    return '';
  }

  try {
    // Format the currency in Indian Rupees using Intl.NumberFormat.
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    // On error, return a basic format.
    return `₹${amount}`;
  }
};