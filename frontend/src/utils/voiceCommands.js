
// ============================================================
// VOICE COMMAND UTILITIES
// ============================================================

export const normalizeVoiceText = (text = "") => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[!?.,।]/g, "");
};

// ============================================================
// DETECT BASIC INTENT
// ============================================================

export const detectVoiceIntent = (text = "") => {
  const command = normalizeVoiceText(text);

  if (!command) {
    return {
      intent: "unknown",
      text: command,
    };
  }

  if (
    command.includes("search flight") ||
    command.includes("find flight") ||
    command.includes("show flights") ||
    command.includes("book flight") ||
    command.includes("flight thedu") ||
    command.includes("flight thedunga") ||
    command.includes("flight book pannu") ||
    command.includes("விமானம் தேட") ||
    command.includes("விமானம் புக்")
  ) {
    return {
      intent: "SEARCH_FLIGHT",
      text: command,
    };
  }

  if (
    command.includes("register") ||
    command.includes("create account") ||
    command.includes("sign up") ||
    command.includes("பதிவு செய்") ||
    command.includes("கணக்கு உருவாக்கு")
  ) {
    return {
      intent: "REGISTER",
      text: command,
    };
  }

  if (
    command.includes("login") ||
    command.includes("log in") ||
    command.includes("sign in") ||
    command.includes("உள்நுழை")
  ) {
    return {
      intent: "LOGIN",
      text: command,
    };
  }

  if (
    command.includes("my bookings") ||
    command.includes("my booking") ||
    command.includes("show bookings") ||
    command.includes("booking history") ||
    command.includes("booking paaka") ||
    command.includes("booking paaru") ||
    command.includes("booking kaatu") ||
    command.includes("என் booking") ||
    command.includes("booking காட்டு")
  ) {
    return {
      intent: "MY_BOOKINGS",
      text: command,
    };
  }

  if (
    command.includes("profile") ||
    command.includes("my account") ||
    command.includes("சுயவிவரம்") ||
    command.includes("என் கணக்கு")
  ) {
    return {
      intent: "PROFILE",
      text: command,
    };
  }

  if (
    command.includes("select seat") ||
    command.includes("choose seat") ||
    command.includes("seat")
  ) {
    return {
      intent: "SELECT_SEAT",
      text: command,
    };
  }

  if (
    command.includes("passenger") ||
    command.includes("passenger details")
  ) {
    return {
      intent: "PASSENGER_DETAILS",
      text: command,
    };
  }

  if (
    command.includes("payment") ||
    command.includes("pay now") ||
    command.includes("proceed to payment")
  ) {
    return {
      intent: "PAYMENT",
      text: command,
    };
  }

  if (
    command.includes("ticket") ||
    command.includes("show my ticket") ||
    command.includes("download ticket")
  ) {
    return {
      intent: "TICKET",
      text: command,
    };
  }

  if (
    command.includes("go home") ||
    command.includes("home page") ||
    command.includes("வீட்டுக்கு போ") ||
    command.includes("முகப்பு")
  ) {
    return {
      intent: "HOME",
      text: command,
    };
  }

  if (
    command.includes("go back") ||
    command.includes("back")
  ) {
    return {
      intent: "BACK",
      text: command,
    };
  }

  if (
    command.includes("help") ||
    command.includes("what can you do")
  ) {
    return {
      intent: "HELP",
      text: command,
    };
  }

  return {
    intent: "UNKNOWN",
    text: command,
  };
};

// ============================================================
// EXTRACT SEAT NUMBER
// ============================================================

export const extractSeatNumber = (text = "") => {
  const match = text
    .toUpperCase()
    .match(/\b(\d{1,2}[A-F])\b/);

  return match ? match[1] : null;
};

// ============================================================
// VOICE RESPONSE
// ============================================================

export const getVoiceResponse = (intent, language = "en-IN") => {
  const responses = {
    SEARCH_FLIGHT:
      "Sure. I can help you search for flights.",

    REGISTER:
      "Sure. Let's create your account.",

    LOGIN:
      "Sure. Let's log you in.",

    MY_BOOKINGS:
      "Opening your bookings.",

    PROFILE:
      "Opening your profile.",

    SELECT_SEAT:
      "Sure. Tell me the seat number you want.",

    PASSENGER_DETAILS:
      "Let's enter the passenger details.",

    PAYMENT:
      "Opening the payment process.",

    TICKET:
      "I can help you with your ticket.",

    HOME:
      "Taking you to the home page.",

    BACK:
      "Going back.",

    HELP:
      "You can ask me to search flights, register, login, select seats, view bookings, make a payment, or show your ticket.",

    UNKNOWN:
      "Sorry, I didn't understand that command.",
  };

  if (language === "ta-IN") {
    const tamilResponses = {
      SEARCH_FLIGHT: "விமானங்களைத் தேடுகிறேன்.",
      REGISTER: "புதிய கணக்குப் பதிவு பக்கத்தைத் திறக்கிறேன்.",
      LOGIN: "உள்நுழைவு பக்கத்தைத் திறக்கிறேன்.",
      MY_BOOKINGS: "உங்கள் பயண முன்பதிவுகளைத் திறக்கிறேன்.",
      PROFILE: "உங்கள் சுயவிவரத்தைத் திறக்கிறேன்.",
      SELECT_SEAT: "எந்த இருக்கை எண் வேண்டும் என்று சொல்லுங்கள்.",
      PASSENGER_DETAILS: "பயணி விவரங்களைத் திறக்கிறேன்.",
      PAYMENT: "கட்டணப் பக்கத்தைத் திறக்கிறேன்.",
      TICKET: "உங்கள் பயணச்சீட்டுகளைத் திறக்கிறேன்.",
      HOME: "முகப்புப் பக்கத்திற்குச் செல்கிறேன்.",
      BACK: "முந்தைய பக்கத்திற்குச் செல்கிறேன்.",
      HELP: "விமானம் தேட, முன்பதிவுகளைப் பார்க்க, சுயவிவரத்தைத் திறக்க அல்லது கட்டணம் செலுத்தச் சொல்லலாம்.",
      UNKNOWN: "மன்னிக்கவும், உங்கள் கட்டளை புரியவில்லை. மீண்டும் சொல்லுங்கள்.",
    };

    return tamilResponses[intent] || tamilResponses.UNKNOWN;
  }

  return responses[intent] || responses.UNKNOWN;
};
