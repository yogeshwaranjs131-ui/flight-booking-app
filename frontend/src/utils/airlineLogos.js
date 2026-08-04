/**
 * A mapping of airline names to their respective logo image URLs.
 * This provides a centralized way to manage airline branding assets.
 */
const airlineLogos = {
  IndiGo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Indigo_logo.svg/200px-Indigo_logo.svg.png",
  "Air India": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/Air_India_logo.svg/200px-Air_India_logo.svg.png",
  Vistara: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Vistara_logo.svg/200px-Vistara_logo.svg.png",
  SpiceJet: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/SpiceJet_logo.svg/200px-SpiceJet_logo.svg.png",
  // Add other airlines as needed
};

/**
 * Returns the logo URL for a given airline.
 * @param {string} airlineName - The name of the airline.
 * @returns {string|null} The URL of the logo, or null if not found.
 */
export const getAirlineLogo = (airlineName) => {
  return airlineLogos[airlineName] || null;
};