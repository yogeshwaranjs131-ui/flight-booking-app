import User from '../models/User.js';
import Flight from '../models/flight.js';
import Booking from '../models/Booking.js';

/**
 * @desc    Get application statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const flightCount = await Flight.countDocuments();
    const bookingCount = await Booking.countDocuments();

    // Calculate total revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get data for the last 6 months for charts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: 'CONFIRMED',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const formattedMonthlyData = monthlyData.map(item => ({
      name: `${new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' })} '${String(item._id.year).slice(2)}`,
      revenue: item.totalRevenue,
      bookings: item.bookingCount,
    }));

    res.status(200).json({
      success: true,
      data: {
        userCount,
        flightCount,
        bookingCount,
        totalRevenue,
        monthlyData: formattedMonthlyData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};