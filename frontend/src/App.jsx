import React from 'react';
import AppRoutes from './AppRoutes';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <>
      <div className="min-h-screen bg-linear-to-b from-sky-400 via-sky-300 to-blue-500 text-slate-900 relative overflow-hidden">
        <AppRoutes />
      </div>
      <VoiceAssistant />
    </>
  );
}

export default App;