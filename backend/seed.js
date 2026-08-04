import mongoose from "mongoose";
import dotenv from "dotenv";
import Airport from "./models/Airport.js";

dotenv.config();

const airports = [
  { airportName: "Indira Gandhi International Airport", airportCode: "DEL", city: "New Delhi", state: "Delhi", country: "India" },
  { airportName: "Chhatrapati Shivaji Maharaj International Airport", airportCode: "BOM", city: "Mumbai", state: "Maharashtra", country: "India" },
  { airportName: "Kempegowda International Airport", airportCode: "BLR", city: "Bengaluru", state: "Karnataka", country: "India" },
  { airportName: "Chennai International Airport", airportCode: "MAA", city: "Chennai", state: "Tamil Nadu", country: "India" },
  { airportName: "Netaji Subhash Chandra Bose International Airport", airportCode: "CCU", city: "Kolkata", state: "West Bengal", country: "India" },
  { airportName: "Rajiv Gandhi International Airport", airportCode: "HYD", city: "Hyderabad", state: "Telangana", country: "India" },
  { airportName: "Cochin International Airport", airportCode: "COK", city: "Kochi", state: "Kerala", country: "India" },
  { airportName: "Sardar Vallabhbhai Patel International Airport", airportCode: "AMD", city: "Ahmedabad", state: "Gujarat", country: "India" },
  { airportName: "Goa International Airport", airportCode: "GOI", city: "Goa", state: "Goa", country: "India" },
  { airportName: "Thiruvananthapuram International Airport", airportCode: "TRV", city: "Thiruvananthapuram", state: "Kerala", country: "India" },
  { airportName: "Calicut International Airport", airportCode: "CCJ", city: "Kozhikode", state: "Kerala", country: "India" },
  { airportName: "Sri Guru Ram Dass Jee International Airport", airportCode: "ATQ", city: "Amritsar", state: "Punjab", country: "India" },
  { airportName: "Pune International Airport", airportCode: "PNQ", city: "Pune", state: "Maharashtra", country: "India" },
  { airportName: "Jaipur International Airport", airportCode: "JAI", city: "Jaipur", state: "Rajasthan", country: "India" },
  { airportName: "Chaudhary Charan Singh International Airport", airportCode: "LKO", city: "Lucknow", state: "Uttar Pradesh", country: "India" },
  { airportName: "Coimbatore International Airport", airportCode: "CJB", city: "Coimbatore", state: "Tamil Nadu", country: "India" },
  { airportName: "Tiruchirappalli International Airport", airportCode: "TRZ", city: "Tiruchirappalli", state: "Tamil Nadu", country: "India" },
  { airportName: "Madurai Airport", airportCode: "IXM", city: "Madurai", state: "Tamil Nadu", country: "India" }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    await Airport.deleteMany();
    console.log("Old airports deleted!");

    await Airport.insertMany(airports);
    console.log("All Indian International Airports Imported Successfully! 🚀");
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();