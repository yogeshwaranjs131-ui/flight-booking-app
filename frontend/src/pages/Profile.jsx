import React, { useState, useRef } from 'react'; // Add useState, useRef
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import userService from '../services/userService';
import Loader from '../components/Loader.jsx';
import { FaUserCircle, FaEnvelope, FaIdCard, FaUpload, FaSave, FaShieldAlt } from 'react-icons/fa';

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: user, loading, error, refetch } = useFetch(() => userService.getMyProfile()); // Get refetch from useFetch

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false); // To show loading state during upload

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set image preview
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleSaveProfileImage = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', selectedFile); // 'profileImage' is the field name your backend expects

      // Assuming userService has an uploadProfileImage method
      // This method would send the formData to your backend
      await userService.uploadProfileImage(formData);
      alert("Profile image updated successfully!");
      refetch(); // Refetch user data to update the displayed image
      setSelectedFile(null); // Clear selected file
      setImagePreview(null); // Clear image preview
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload image. Please try again.");
      console.error("Image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (window.confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      try {
        await userService.disable2FA();
        alert('2FA has been disabled.');
        refetch(); // Refetch user data to update the status
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to disable 2FA.');
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Fallback image if user.profileImage is not available
  const profileImageSrc = imagePreview || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&size=128`;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-4"> {/* Added mb-4 for spacing */}
              <img
                src={profileImageSrc} // Use profileImageSrc here
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*" // Accept only image files
              />
              <button
                onClick={handleImageUploadClick} // Trigger file input click
                title="Upload new profile image"
                className="absolute bottom-0 right-0 bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <FaUpload />
              </button>
            </div>
            {selectedFile && ( // Show save button only if a file is selected
              <button
                onClick={handleSaveProfileImage}
                disabled={uploading}
                className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 flex items-center mx-auto gap-2"
              >
                {uploading ? 'Saving...' : <><FaSave /> Save Image</>}
              </button>
            )}
            <h2 className="mt-4 text-3xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 capitalize">{user?.role} Account</p>
          </div>

          <div className="space-y-6 text-left">
            <div className="flex items-center">
              <FaIdCard className="text-2xl text-gray-400 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold text-gray-700">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="text-2xl text-gray-400 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-700">{user?.email}</p>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="flex items-center">
              <FaShieldAlt className="text-2xl text-gray-400 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Two-Factor Authentication</p>
                {user?.isTwoFactorEnabled ? (
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-green-600">Enabled</span>
                    <button onClick={handleDisable2FA} className="text-xs text-red-500 hover:underline">
                      Disable
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-500">Disabled</span>
                    <button onClick={() => navigate('/2fa-setup')} className="text-xs text-indigo-600 hover:underline">
                      Enable Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
          <button onClick={() => navigate('/my-bookings')} className="bg-indigo-100 text-indigo-800 px-6 py-2 rounded-md font-semibold hover:bg-indigo-200 transition-colors">
            My Bookings
          </button>
          <button onClick={handleLogout} className="bg-indigo-accent text-white px-6 py-2 rounded-md font-semibold hover:bg-pink-700 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;