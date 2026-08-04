import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaPlane, FaUsers, FaBook, FaRupeeSign, FaChartBar, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFetch } from '../hooks/useFetch';
import adminService from '../services/adminService';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/Loader';

function AdminDashboard() {
  const location = useLocation();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const DashboardHome = () => {
    const { data: response, loading, error } = useFetch(adminService.getStats);
    const stats = response?.data;

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500 text-center">Failed to load stats.</p>;

    const statCards = [
      { title: 'Total Users', value: stats?.userCount, icon: FaUsers, color: 'bg-blue-500' },
      { title: 'Total Flights', value: stats?.flightCount, icon: FaPlane, color: 'bg-green-500' },
      { title: 'Total Bookings', value: stats?.bookingCount, icon: FaBook, color: 'bg-yellow-500' },
      { title: 'Total Revenue', value: formatCurrency(stats?.totalRevenue), icon: FaRupeeSign, color: 'bg-red-500' },
    ];

    return (
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className={`${card.color} text-white p-4 rounded-full`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value ?? '0'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaChartBar /> Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Bookings Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaChartLine /> Monthly Bookings</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-col hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="grow p-4 space-y-2">
          <NavLink to="/admin/dashboard" end className={navLinkClasses}>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/manage-flights" className={navLinkClasses}>
            <FaPlane />
            <span>Manage Flights</span>
          </NavLink>
          <NavLink to="/admin/dashboard/manage-users" className={navLinkClasses}>
            <FaUsers />
            <span>Manage Users</span>
          </NavLink>
          <NavLink to="/admin/dashboard/manage-bookings" className={navLinkClasses}>
            <FaBook />
            <span>Manage Bookings</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {location.pathname === '/admin/dashboard' ? <DashboardHome /> : <Outlet />}
      </main>
    </div>
  );
}

export default AdminDashboard;