
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Languages, Mic, Volume2, X } from "lucide-react";
import useVoiceAssistant from "../hooks/useVoiceAssistant";
import VoiceButton from "./VoiceButton";
import VoiceCommandPanel from "./VoiceCommandPanel";
import { processVoiceCommand, speakText, stopSpeaking } from "../services/voiceService";

const voiceRoutes = {
  REGISTER: "/register",
  LOGIN: "/login",
  MY_BOOKINGS: "/my-bookings",
  PROFILE: "/profile",
  PASSENGER_DETAILS: "/passenger-details",
  PAYMENT: "/payment",
  TICKET: "/my-bookings",
  HOME: "/",
};

function VoiceAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [lastCommand, setLastCommand] = useState("");
  const [response, setResponse] = useState("");
  const lastProcessedTranscript = useRef("");
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript,
    setLanguage: setRecognitionLanguage,
  } = useVoiceAssistant();

  useEffect(() => {
    setRecognitionLanguage(language);
  }, [language, setRecognitionLanguage]);

  useEffect(() => {
    if (!transcript || transcript === lastProcessedTranscript.current) return;
    lastProcessedTranscript.current = transcript;

    const result = processVoiceCommand(transcript, language);
    setLastCommand(result.intent);
    setResponse(result.response);
    speakText(result.response, { language });

    if (result.intent === "BACK") {
      navigate(-1);
    } else if (result.intent === "SEARCH_FLIGHT") {
      navigate("/#flight-search");
    } else if (voiceRoutes[result.intent]) {
      navigate(voiceRoutes[result.intent]);
    }
  }, [transcript, language, navigate, location.pathname]);

  useEffect(() => () => stopSpeaking(), []);

  const handleClear = () => {
    clearTranscript();
    lastProcessedTranscript.current = "";
    setLastCommand("");
    setResponse("");
    stopSpeaking();
  };

  const handleClose = () => {
    stopListening();
    stopSpeaking();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 text-white shadow-2xl backdrop-blur-xl" aria-label="Aero voice assistant">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Aero voice assistant</p>
              <p className="mt-1 text-[11px] text-slate-400">Chrome speech recognition · spoken replies</p>
            </div>
            <button type="button" onClick={handleClose} className="grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close voice assistant">
              <X size={17} />
            </button>
          </header>

          <div className="space-y-4 p-4">
            <div className="flex items-center gap-2" role="group" aria-label="Voice language">
              <Languages size={16} className="text-sky-300" />
              <button type="button" aria-pressed={language === "en-IN"} onClick={() => setLanguage("en-IN")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${language === "en-IN" ? "bg-sky-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                English
              </button>
              <button type="button" aria-pressed={language === "ta-IN"} onClick={() => setLanguage("ta-IN")} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${language === "ta-IN" ? "bg-sky-300 text-slate-950" : "bg-white/10 text-slate-200"}`}>
                தமிழ்
              </button>
            </div>

            <VoiceButton
              isListening={isListening}
              isSupported={isSupported}
              onStart={startListening}
              onStop={stopListening}
            />

            {!isSupported && (
              <p className="text-xs leading-5 text-amber-200">
                Voice recognition is unavailable in this browser. Open Aero in Google Chrome and allow microphone access.
              </p>
            )}

            <VoiceCommandPanel
              transcript={transcript}
              interimTranscript={interimTranscript}
              error={error}
              onClear={handleClear}
            />

            {response && (
              <div className="rounded-xl border border-sky-300/20 bg-sky-300/10 p-3" aria-live="polite">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase text-sky-200">
                  <Volume2 size={14} /> Aero says
                </p>
                <p className="mt-1 text-sm text-white">{response}</p>
                {lastCommand && <p className="mt-1 text-[10px] text-slate-400">{lastCommand}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 items-center gap-2 rounded-full border border-sky-100/40 bg-slate-950 px-4 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-sky-950"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide voice assistant" : "Show voice assistant"}
      >
        <Mic size={17} /> Voice AI
      </button>
    </div>
  );
}

export default VoiceAssistant;
