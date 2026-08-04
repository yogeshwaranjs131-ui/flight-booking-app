import React from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import dashboardService from '../services/dashboardService';
import bookingService from '../services/bookingService';
import userService from '../services/userService';
import Loader from '../components/Loader.jsx';
import StatsCard from './StatsCard';
import { FaUsers, FaPlane, FaBook, FaRupeeSign } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import RevenueChart from './RevenueChart';

function Dashboard() {
  const { data: stats, loading, error } = useFetch(dashboardService.getStats);
  const { data: bookings, loading: bookingsLoading } = useFetch(bookingService.getAllBookings);
  const { data: users, loading: usersLoading } = useFetch(userService.getAllUsers);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const recentBookings = bookings?.slice(0, 5) || [];
  const recentUsers = users?.slice(0, 5) || [];

  // Mock data for the chart. In a real app, this would come from an API.
  const chartData = [
    { name: 'Jan', revenue: 400000 },
    { name: 'Feb', revenue: 300000 },
    { name: 'Mar', revenue: 500000 },
    { name: 'Apr', revenue: 450000 },
    { name: 'May', revenue: 600000 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<FaUsers className="text-blue-500" />}
        />
        <StatsCard
          title="Total Flights"
          value={stats?.totalFlights || 0}
          icon={<FaPlane className="text-green-500" />}
        />
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={<FaBook className="text-yellow-500" />}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<FaRupeeSign className="text-red-500" />}
        />
      </div>

      {/* Chart Section */}
      <RevenueChart data={chartData} />

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Bookings</h3>
            <Link to="/admin/manage-bookings" className="text-sm text-indigo-blue hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {bookingsLoading ? <Loader /> : (
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="py-2">User</th>
                    <th className="py-2">Flight</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? recentBookings.map(b => (
                    <tr key={b._id} className="border-t">
                      <td className="py-2">{b.user?.name}</td>
                      <td className="py-2">{b.flight?.flightNumber}</td>
                      <td><span className={`px-2 py-1 text-xs rounded-full ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="text-center py-4">No recent bookings.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">New Users</h3>
            <Link to="/admin/manage-users" className="text-sm text-indigo-blue hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {usersLoading ? <Loader /> : (
              <ul className="space-y-3">
                {recentUsers.length > 0 ? recentUsers.map(u => (
                  <li key={u._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(u.createdAt, { month: 'short', day: 'numeric' })}</span>
                  </li>
                )) : (
                  <p className="text-center py-4">No new users.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;