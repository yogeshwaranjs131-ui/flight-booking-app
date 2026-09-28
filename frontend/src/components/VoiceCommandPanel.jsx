
import React from "react";

function VoiceCommandPanel({
  transcript,
  interimTranscript,
  error,
  onClear,
}) {
  const hasText = transcript || interimTranscript;

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">

      {/* Voice status */}

      <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 shadow-xl">

        <div className="flex items-center justify-between mb-3">

          <div className="flex items-center gap-2">
            <span className="text-lg">
              🧠
            </span>

            <h3 className="text-sm font-bold text-white">
              AI Voice Assistant
            </h3>
          </div>

          {hasText && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Clear
            </button>
          )}

        </div>

        {/* Recognized text */}

        <div className="min-h-12 rounded-xl bg-slate-900 border border-white/5 p-3">

          {hasText ? (
            <p className="text-sm leading-6">

              <span className="text-white">
                {transcript}
              </span>

              {interimTranscript && (
                <span className="text-blue-400 italic">
                  {" "}
                  {interimTranscript}
                </span>
              )}

            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Press "Talk to AI" and start speaking...
            </p>
          )}

        </div>

        {/* Error */}

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/50 border border-red-500/20">
            <p className="text-xs text-red-300">
              ⚠️ {error}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default VoiceCommandPanel;
