import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(24)
      .populate("user", "name profileImage");

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const text = typeof req.body?.text === "string"
      ? req.body.text.trim()
      : "";
    const rating = Number(req.body?.rating);

    if (text.length < 8 || text.length > 600) {
      return res.status(400).json({
        success: false,
        message: "A review must be between 8 and 600 characters.",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Choose a rating from 1 to 5 stars.",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      rating,
      text,
    });

    await review.populate("user", "name profileImage");

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};