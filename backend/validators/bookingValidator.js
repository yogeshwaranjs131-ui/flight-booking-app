import { body, validationResult } from "express-validator";

export const createBookingValidator = [
  body("flightId")
    .notEmpty()
    .withMessage("Flight ID is required"),

  body("passengers")
    .isArray({ min: 1 })
    .withMessage(
      "At least one passenger is required"
    ),

  body("passengers.*.firstName")
    .notEmpty()
    .withMessage(
      "Passenger first name is required"
    ),

  body("passengers.*.lastName")
    .notEmpty()
    .withMessage(
      "Passenger last name is required"
    ),

  body("passengers.*.age")
    .isNumeric()
    .withMessage(
      "Passenger age must be a number"
    ),

  body("passengers.*.gender")
    .notEmpty()
    .withMessage(
      "Passenger gender is required"
    ),

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
