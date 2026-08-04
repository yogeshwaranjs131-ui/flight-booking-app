import { body, validationResult } from "express-validator";

export const createFlightValidator = [
  body("flightNumber")
    .notEmpty()
    .withMessage("Flight Number is required"),

  body("airline")
    .notEmpty()
    .withMessage("Airline name is required"),

  body("departureAirport")
    .notEmpty()
    .withMessage("Departure Airport is required"),

  body("arrivalAirport")
    .notEmpty()
    .withMessage("Arrival Airport is required"),

  body("departureTime")
    .notEmpty()
    .withMessage("Departure Time is required"),

  body("arrivalTime")
    .notEmpty()
    .withMessage("Arrival Time is required"),

  body("price")
    .isNumeric()
    .withMessage("Price must be a number"),

  body("availableSeats")
    .isNumeric()
    .withMessage("Available Seats must be a number"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    next();
  },
];
