import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import userService from '../../services/userService';
import { FaUserEdit } from 'react-icons/fa';
import Loader from '../../components/Loader';

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getUserById(id);
        if (res.data.success) {
          const { name, email, role } = res.data.data;
          setFormData({ name, email, role });
        }
      } catch (err) {
        setError('Failed to load user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updateUser(id, formData);
      setSuccess('User updated successfully!');
      setTimeout(() => navigate('/admin/dashboard/manage-users'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return <Loader />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaUserEdit /> Edit User
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => navigate('/admin/dashboard/manage-users')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;