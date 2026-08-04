/**
 * A mapping of airline names to their respective image URLs.
 * This provides a centralized way to manage airline branding assets.
 */
const airlineImages = {
  IndiGo:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500&auto=format&fit=crop&q=60",
  "Air India":
    "https://images.unsplash.com/photo-1618594509943-0f8435a78f75?w=500&auto=format&fit=crop&q=60",
  Vistara:
    "https://images.unsplash.com/photo-1544032134-5193c59935f3?w=500&auto=format&fit=crop&q=60",
  SpiceJet:
    "https://images.unsplash.com/photo-1524592714643-d24c23d5d6a0?w=500&auto=format&fit=crop&q=60",
  // Add other airlines as needed
};

const defaultAirlineImage =
  "https://images.unsplash.com/photo-1559029924-06b00a73a946?w=500&auto=format&fit=crop&q=60";

export const getAirlineImage = (airlineName) => {
  return airlineImages[airlineName] || defaultAirlineImage;
};