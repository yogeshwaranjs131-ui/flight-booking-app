
import {
  detectVoiceIntent,
  getVoiceResponse,
} from "../utils/voiceCommands";

// ============================================================
// TEXT TO SPEECH
// ============================================================

export const speakText = (
  text,
  {
    language = "en-IN",
    rate = 0.95,
    pitch = 1,
    volume = 1,
  } = {}
) => {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = language;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  window.speechSynthesis.speak(utterance);
};

// ============================================================
// STOP SPEECH
// ============================================================

export const stopSpeaking = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

// ============================================================
// PROCESS VOICE COMMAND
// ============================================================

export const processVoiceCommand = (text, language = "en-IN") => {
  const result = detectVoiceIntent(text);

  const response = getVoiceResponse(result.intent, language);

  return {
    ...result,
    response,
  };
};
