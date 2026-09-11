import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function FlyingPlane() {
  const location = useLocation();
  
  // All Side Flying Animation Progress Based on Path
  const getPathProgress = () => {
    switch (location.pathname) {
      case '/': return '10%';
      case '/search-flights': return '25%';
      case '/flight-details': return '40%';
      case '/book': return '55%';
      case '/passenger-details': return '70%';
      case '/booking-review': return '80%';
      case '/payment': return '90%';
      case '/my-bookings': return '100%';
      default: return '15%';
    }
  };

  return (
    <div className="fixed bottom-6 left-0 w-full pointer-events-none z-50 overflow-hidden h-24">
      <motion.div
        layoutId="cinematic-airplane"
        initial={{ x: '-10vw' }}
        animate={{ x: getPathProgress() }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute bottom-2"
      >
        <img 
          src="/airplane.png" 
          alt="Flying Airplane" 
          className="w-32 md:w-48 drop-shadow-[0_10px_15px_rgba(56,189,248,0.5)]" 
        />
      </motion.div>
    </div>
  );
}

export default FlyingPlane;