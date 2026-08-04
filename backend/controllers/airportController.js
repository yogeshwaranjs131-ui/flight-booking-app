import Airport from "../models/Airport.js";

/**
 * @desc    Create Airport
 * @route   POST /api/airports
 * @access  Admin
 */
export const createAirport = async (req, res) => {
  try {
    const airport = await Airport.create(req.body);

    res.status(201).json({
      success: true,
      data: airport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get All Airports
 * @route   GET /api/airports
 * @access  Public
 */
export const getAirports = async (req, res) => {
  try {
    const airports = await Airport.find().sort({
      city: 1,
    });

    res.status(200).json({
      success: true,
      count: airports.length,
      data: airports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get Airport By Id
 * @route   GET /api/airports/:id
 * @access  Public
 */
export const getAirportById = async (
  req,
  res
) => {
  try {
    const airport = await Airport.findById(
      req.params.id
    );

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    res.status(200).json({
      success: true,
      data: airport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update Airport
 * @route   PUT /api/airports/:id
 * @access  Admin
 */
export const updateAirport = async (
  req,
  res
) => {
  try {
    const airport =
      await Airport.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    res.status(200).json({
      success: true,
      data: airport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete Airport
 * @route   DELETE /api/airports/:id
 * @access  Admin
 */
export const deleteAirport = async (
  req,
  res
) => {
  try {
    const airport = await Airport.findById(
      req.params.id
    );

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: "Airport not found",
      });
    }

    await airport.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Airport deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
