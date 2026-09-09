import Booking from '../models/Booking.js';

export const generatePNR = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (true) {
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    //  PNR 
    const existing = await Booking.findOne({ pnr }).select('_id');
    if (!existing) {
      return pnr; //  PNR 
    }
  }
};