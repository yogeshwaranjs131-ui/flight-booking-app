import mongoose from "mongoose";
import dotenv from "dotenv";
import Flight from "./models/flight.js";
import Airport from "./models/Airport.js";

dotenv.config();

const importFlights = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Flight Seeding...");

    // டேட்டாபேஸில் உள்ள ஏர்போர்ட்களைத் தேடிப் பிடிக்கிறோம்
    const cok = await Airport.findOne({ airportCode: "COK" });
    const blr = await Airport.findOne({ airportCode: "BLR" });
    const maa = await Airport.findOne({ airportCode: "MAA" });
    const del = await Airport.findOne({ airportCode: "DEL" });

    if (!cok || !blr || !maa || !del) {
      console.log("Error: Airports not found in database! Please run seed.js first.");
      process.exit(1);
    }

    const flights = [
      {
        flightNumber: "6E-452",
        airline: "IndiGo",
        departureAirport: cok._id,
        arrivalAirport: blr._id,
        departureTime: "2026-07-31T06:00:00Z",
        arrivalTime: "2026-07-31T07:15:00Z",
        price: 3500,
        totalSeats: 120,
        availableSeats: 120,
        seats: Array.from({ length: 120 }, (_, i) => ({
          number: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
          isAvailable: true,
          _id: new mongoose.Types.ObjectId() // Generate unique ID for each seat
        }))
      },
      {
        flightNumber: "6E-789",
        airline: "IndiGo",
        departureAirport: cok._id,
        arrivalAirport: maa._id,
        departureTime: "2026-07-31T10:30:00Z",
        arrivalTime: "2026-07-31T11:45:00Z",
        price: 3200,
        totalSeats: 120,
        availableSeats: 120,
        seats: Array.from({ length: 120 }, (_, i) => ({
          number: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
          isAvailable: true,
          _id: new mongoose.Types.ObjectId()
        }))
      },
      {
        flightNumber: "6E-205",
        airline: "IndiGo",
        departureAirport: blr._id,
        arrivalAirport: del._id,
        departureTime: "2026-07-31T14:00:00Z",
        arrivalTime: "2026-07-31T16:50:00Z",
        price: 5500,
        totalSeats: 150,
        availableSeats: 150,
        seats: Array.from({ length: 150 }, (_, i) => ({
          number: `${Math.floor(i / 6) + 1}${String.fromCharCode(65 + (i % 6))}`,
          isAvailable: true,
          _id: new mongoose.Types.ObjectId()
        }))
      }
    ];

    await Flight.deleteMany();
    console.log("Old flights deleted!");

    await Flight.insertMany(flights);
    console.log("IndiGo Flights Imported Successfully with ObjectIds! ✈️");

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importFlights();