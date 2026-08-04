import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';

function RevenueChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: '400px' }}>
      <h3 className="text-xl font-bold text-gray-800 mb-6">Revenue Overview</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 30, // Increased left margin for currency values
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
          <Legend />
          <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;