import { useState } from 'react';

function SearchForm({ onSearch }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !date) {
      alert('Please fill out all fields to search for flights.');
      return;
    }
    onSearch({ from, to, date });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div className="md:col-span-1">
        <label htmlFor="from" className="block text-sm font-medium text-gray-700">From</label>
        <input type="text" id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g., DEL" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue" />
      </div>
      <div className="md:col-span-1">
        <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
        <input type="text" id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g., BOM" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue" />
      </div>
      <div className="md:col-span-1">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-blue focus:border-indigo-blue" />
      </div>
      <div className="md:col-span-1">
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-accent hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Search Flights
        </button>
      </div>
    </form>
  );
}

export default SearchForm;