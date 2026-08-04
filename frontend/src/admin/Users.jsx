import { useState, useMemo } from 'react';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { useFetch } from '../hooks/useFetch';
import userService from '../services/userService';

const ITEMS_PER_PAGE = 10;

function Users() {
  const { data: users, loading, error, refetch } = useFetch(userService.getAllUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        alert('User deleted successfully!');
        refetch(); // Refetch the user list
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user.');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-blue focus:border-indigo-blue"
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Name</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Email</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Role</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-200">
            {paginatedUsers && paginatedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="text-left py-3 px-4">{user.name}</td>
                <td className="text-left py-3 px-4">{user.email}</td>
                <td className="text-left py-3 px-4 capitalize">{user.role}</td>
                <td className="text-left py-3 px-4 whitespace-nowrap">
                  <button onClick={() => handleDeleteUser(user._id)} className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200">Delete</button>
                </td>
              </tr>
            ))}
            {(!paginatedUsers || paginatedUsers.length === 0) && (
              <tr>
                <td colSpan="4" className="text-center py-4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Users;