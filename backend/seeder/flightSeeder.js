import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Airport from '../models/Airport.js';
import Flight from '../models/Flight.js';

dotenv.config();

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeder...');

    await Flight.deleteMany();

    // டேட்டாபேஸில் உள்ள அனைத்து ஏர்போர்ட்ஸையும் எடுக்கிறோம்
    const airports = await Airport.find({});

    if (airports.length === 0) {
      console.log('Please run airport seeder first!');
      process.exit(1);
    }

    let sampleFlights = [];
    let flightCounter = 100;

    // ஒவ்வொரு ஏர்போர்ட்டிலிருந்து மற்ற அனைத்து ஏர்போர்ட்ஸ்களுக்கும் சாம்பிள் பிளைட்ஸ் உருவாக்க
    for (let i = 0; i < airports.length; i++) {
      for (let j = 0; j < airports.length; j++) {
        if (i !== j) {
          sampleFlights.push({
            airline: i % 2 === 0 ? 'IndiGo' : 'Air India',
            flightNumber: `6E-${flightCounter++}`,
            departureAirport: airports[i]._id,
            arrivalAirport: airports[j]._id,
            departureTime: new Date(Date.now() + 86400000).toISOString(),
            arrivalTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
            duration: '2h 30m',
            price: Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000,
            totalSeats: 180,
            availableSeats: 180,
          });
        }
      }
    }

    await Flight.insertMany(sampleFlights);
    console.log('All Airports Flights Data Imported Successfully! ✈️🚀');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing flights: ${error}`);
    process.exit(1);
  }
};

runSeeder();