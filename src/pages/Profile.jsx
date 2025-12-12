import { useState, useEffect, useRef } from 'react';
import { usersAPI } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaCamera, FaTrash, FaSpinner } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://gala-backend-1.onrender.com/api/v1';

  // ✅ Get profile picture with default
  const getProfilePicture = () => {
    if (user?.profilePicture && user.profilePicture !== 'default.jpg') {
      return `${API_URL.replace('/api/v1', '')}/${user.profilePicture}`;
    }
    // Generate default avatar with user's initials
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9333ea&color=fff&size=256&bold=true`;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setPreviewUrl(getProfilePicture());
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 5MB' });
        return;
      }
      
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPicture = async () => {
    if (!profilePicture) {
      setMessage({ type: 'error', text: 'Please select an image first' });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      const response = await usersAPI.uploadProfilePicture(formData);
      updateUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setProfilePicture(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload picture' 
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await usersAPI.deleteProfilePicture();
      updateUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile picture deleted successfully!' });
      setPreviewUrl(getProfilePicture()); // ✅ Reset to default
      setProfilePicture(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error deleting picture:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete picture' 
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await usersAPI.updateProfile(updateData);
      updateUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Profile Picture</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Profile Picture Preview */}
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-200">
              <img
                src={previewUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // ✅ Fallback if image fails to load
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=9333ea&color=fff&size=256&bold=true`;
                }}
              />
            </div>
            
            {/* Camera Icon Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition shadow-lg"
              disabled={uploadingPicture}
            >
              <FaCamera />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Controls */}
          <div className="flex-1">
            <div className="space-y-3">
              {profilePicture && (
                <button
                  onClick={handleUploadPicture}
                  disabled={uploadingPicture}
                  className="w-full md:w-auto btn-primary flex items-center justify-center px-6"
                >
                  {uploadingPicture ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaCamera className="mr-2" />
                      Upload Picture
                    </>
                  )}
                </button>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPicture}
                  className="flex-1 btn-secondary"
                >
                  Choose Image
                </button>
                
                {/* ✅ Show remove button only if custom picture exists */}
                {user?.profilePicture && user.profilePicture !== 'default.jpg' && (
                  <button
                    onClick={handleDeletePicture}
                    disabled={uploadingPicture}
                    className="flex-1 btn-secondary text-red-600 hover:bg-red-50 flex items-center justify-center"
                  >
                    <FaTrash className="mr-2" />
                    Remove
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF or WEBP (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your form... */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="inline mr-2 text-purple-600" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-purple-600" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Role Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account Role</p>
                <p className="text-lg font-bold text-purple-600">{user?.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-sm font-semibold">
                  {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Updating...
              </span>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;