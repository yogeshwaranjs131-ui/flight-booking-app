import React from 'react';
import AppRoutes from './AppRoutes';
import FlyingPlane from './components/FlyingPlane'; // Flying Flights

function App() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 via-sky-300 to-blue-500 text-slate-900 relative overflow-hidden">
      {/* சினிமாட்டிக் பறக்கும் விமானம் */}
      <FlyingPlane />
      
      {/* ரவுட்ஸ் */}
      <AppRoutes />
    </div>
  );
}

export default App;