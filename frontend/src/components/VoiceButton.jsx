
import React from "react";
import { Mic, Square } from "lucide-react";

function VoiceButton({
  isListening,
  isSupported,
  onStart,
  onStop,
}) {
  const handleClick = () => {
    if (!isSupported) {
      return;
    }

    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isSupported}
      title={isSupported ? "Start voice recognition" : "Open this app in Google Chrome to use voice recognition"}
      aria-label={
        isListening
          ? "Stop voice assistant"
          : "Start voice assistant"
      }
      className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg ${
        !isSupported
          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
          : isListening
          ? "bg-red-600 text-white shadow-red-500/40 scale-105"
          : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-blue-500/30"
      }`}
    >
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-2xl animate-ping bg-red-500/30" />
          <span className="relative w-3 h-3 rounded-full bg-white animate-pulse" />
        </>
      )}

      <span className="relative">
        {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={19} />}
      </span>

      <span className="relative">
        {!isSupported
          ? "Open in Chrome"
          : isListening
          ? "Listening..."
          : "Talk to AI"}
      </span>
    </button>
  );
}

export default VoiceButton;
