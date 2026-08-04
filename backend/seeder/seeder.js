import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Airport from '../models/Airport.js';
import Flight from '../models/Flight.js';

dotenv.config();

// MongoDB இணைப்பு
mongoose.connect(process.env.MONGO_URI);

const airportsData = [
  { airportCode: "DEL", city: "New Delhi", name: "Indira Gandhi International Airport", airportName: "Indira Gandhi International Airport", state: "Delhi", country: "India" },
  { airportCode: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport", airportName: "Chhatrapati Shivaji Maharaj International Airport", state: "Maharashtra", country: "India" },
  { airportCode: "BLR", city: "Bengaluru", name: "Kempegowda International Airport", airportName: "Kempegowda International Airport", state: "Karnataka", country: "India" },
  { airportCode: "MAA", city: "Chennai", name: "Chennai International Airport", airportName: "Chennai International Airport", state: "Tamil Nadu", country: "India" },
  { airportCode: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose International Airport", airportName: "Netaji Subhash Chandra Bose International Airport", state: "West Bengal", country: "India" },
  { airportCode: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport", airportName: "Rajiv Gandhi International Airport", state: "Telangana", country: "India" },
  { airportCode: "COK", city: "Kochi", name: "Cochin International Airport", airportName: "Cochin International Airport", state: "Kerala", country: "India" },
  { airportCode: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International Airport", airportName: "Sardar Vallabhbhai Patel International Airport", state: "Gujarat", country: "India" },
  { airportCode: "GOI", city: "Goa", name: "Goa International Airport (Dabolim)", airportName: "Goa International Airport (Dabolim)", state: "Goa", country: "India" },
  { airportCode: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International Airport", airportName: "Trivandrum International Airport", state: "Kerala", country: "India" },
  { airportCode: "CCJ", city: "Kozhikode", name: "Calicut International Airport", airportName: "Calicut International Airport", state: "Kerala", country: "India" },
  { airportCode: "TRZ", city: "Trichy", name: "Tiruchirappalli International Airport", airportName: "Tiruchirappalli International Airport", state: "Tamil Nadu", country: "India" },
  { airportCode: "CJB", city: "Coimbatore", name: "Coimbatore International Airport", airportName: "Coimbatore International Airport", state: "Tamil Nadu", country: "India" },
  { airportCode: "PNQ", city: "Pune", name: "Pune International Airport", airportName: "Pune International Airport", state: "Maharashtra", country: "India" },
  { airportCode: "GAU", city: "Guwahati", name: "Lokmanya Gopinath Bordoloi International Airport", airportName: "Lokmanya Gopinath Bordoloi International Airport", state: "Assam", country: "India" },
  { airportCode: "JAI", city: "Jaipur", name: "Jaipur International Airport", airportName: "Jaipur International Airport", state: "Rajasthan", country: "India" },
  { airportCode: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee International Airport", airportName: "Sri Guru Ram Dass Jee International Airport", state: "Punjab", country: "India" },
  { airportCode: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri International Airport", airportName: "Lal Bahadur Shastri International Airport", state: "Uttar Pradesh", country: "India" },
  { airportCode: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International Airport", airportName: "Biju Patnaik International Airport", state: "Odisha", country: "India" },
  { airportCode: "IXB", city: "Bagdogra", name: "Bagdogra International Airport", airportName: "Bagdogra International Airport", state: "West Bengal", country: "India" },
  { airportCode: "SXR", city: "Srinagar", name: "Sheikh Ul-Alam International Airport", airportName: "Sheikh Ul-Alam International Airport", state: "Jammu and Kashmir", country: "India" },
  { airportCode: "IMF", city: "Imphal", name: "Imphal International Airport", airportName: "Imphal International Airport", state: "Manipur", country: "India" },
  { airportCode: "IXZ", city: "Port Blair", name: "Veer Savarkar International Airport", airportName: "Veer Savarkar International Airport", state: "Andaman and Nicobar Islands", country: "India" },
  { airportCode: "IXC", city: "Chandigarh", name: "Chandigarh International Airport", airportName: "Chandigarh International Airport", state: "Chandigarh", country: "India" },
  { airportCode: "IXM", city: "Madurai", name: "Madurai International Airport", airportName: "Madurai International Airport", state: "Tamil Nadu", country: "India" },
  { airportCode: "IXE", city: "Mangalore", name: "Mangaluru International Airport", airportName: "Mangaluru International Airport", state: "Karnataka", country: "India" },
  { airportCode: "STV", city: "Surat", name: "Surat International Airport", airportName: "Surat International Airport", state: "Gujarat", country: "India" },
  { airportCode: "IDR", city: "Indore", name: "Indore International Airport", airportName: "Indore International Airport", state: "Madhya Pradesh", country: "India" },
  { airportCode: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar International Airport", airportName: "Dr. Babasaheb Ambedkar International Airport", state: "Maharashtra", country: "India" },
  { airportCode: "GAY", city: "Gaya", name: "Gaya Airport", airportName: "Gaya Airport", state: "Bihar", country: "India" }
];

const importData = async () => {
  try {
    // பழைய தரவுகளை அழிக்கிறோம்
    await Flight.deleteMany();
    await Airport.deleteMany();

    // புதிய ஏர்போர்ட்ஸை இன்சர்ட் செய்கிறோம்
    const createdAirports = await Airport.insertMany(airportsData);
    console.log("Airports Data Imported Successfully! 🚀");

    // இந்த வருடம் முழுமைக்கும் (365 நாட்களுக்கு) சாம்பிள் விமானங்களை உருவாக்குகிறோம்
    let sampleFlights = [];
    let flightCounter = 100;

    for (let i = 0; i < createdAirports.length; i++) {
      for (let j = 0; j < createdAirports.length; j++) {
        if (i !== j) {
          // 180 நாட்களுக்குமான விமானங்கள்
          for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
            const flightDate = new Date();
            flightDate.setDate(flightDate.getDate() + dayOffset);

            sampleFlights.push({
              airline: i % 2 === 0 ? 'IndiGo' : 'Air India',
              flightNumber: `6E-${flightCounter++}`,
              departureAirport: createdAirports[i]._id,
              arrivalAirport: createdAirports[j]._id,
              departureTime: new Date(flightDate.setHours(8, 0, 0, 0)).toISOString(),
              arrivalTime: new Date(flightDate.setHours(11, 30, 0, 0)).toISOString(),
              duration: '3h 30m',
              price: Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000,
              totalSeats: 180,
              availableSeats: 180,
            });
          }
        }
      }
    }

    await Flight.insertMany(sampleFlights);
    console.log("All Flights Data Imported Successfully for 180 Days! ✈️🚀");
    
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();