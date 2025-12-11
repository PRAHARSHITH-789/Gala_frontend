import { useEffect, useState } from 'react';
import { eventsAPI } from '../api/events';
import { usersAPI } from '../api/users';
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import Loading from '../components/common/Loading';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [userFormData, setUserFormData] = useState({ name: '', email: '', role: '' });
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });

  // ✅ FIX: Fetch both events and users on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ NEW: Fetch both events and users together
  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Fetching all data...');
      
      // Fetch both in parallel
      const [eventsResponse, usersResponse] = await Promise.all([
        eventsAPI.getAllEvents(),
        usersAPI.getAllUsers()
      ]);
      
      console.log('Events fetched:', eventsResponse.data.length);
      console.log('Users fetched:', usersResponse.data.length);
      
      setEvents(eventsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await eventsAPI.approveEvent(eventId);
      alert('Event approved successfully!');
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve event');
    }
  };

  const handleDeclineEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to decline this event?')) return;
    try {
      await eventsAPI.declineEvent(eventId);
      alert('Event declined successfully!');
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to decline event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.deleteEvent(eventId);
      alert('Event deleted successfully!');
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersAPI.deleteUser(userId);
      alert('User deleted successfully!');
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.updateUser(editingUser._id, userFormData);
      alert('User updated successfully!');
      setEditingUser(null);
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.createUser(adminFormData);
      alert('User created successfully!');
      setShowCreateAdminModal(false);
      setAdminFormData({ name: '', email: '', password: '', role: 'Admin' });
      fetchAllData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create user');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-800',
      Organizer: 'bg-blue-100 text-blue-800',
      User: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const pendingEvents = events.filter(e => e.status === 'Pending').length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users and events</p>
        </div>
        <button
          onClick={() => setShowCreateAdminModal(true)}
          className="btn-primary whitespace-nowrap"
        >
          <FaUserPlus className="inline mr-2" />
          Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <FaUsers className="text-3xl text-blue-600" />
            <span className="text-3xl font-bold">{users.length}</span>
          </div>
          <p className="text-gray-600">Total Users</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <FaCalendarAlt className="text-3xl text-purple-600" />
            <span className="text-3xl font-bold">{events.length}</span>
          </div>
          <p className="text-gray-600">Total Events</p>
        </div>

        <div className="card p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <FaTimesCircle className="text-3xl text-yellow-600" />
            <span className="text-3xl font-bold">{pendingEvents}</span>
          </div>
          <p className="text-gray-600">Pending Events</p>
        </div>

        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <FaCheckCircle className="text-3xl text-green-600" />
            <span className="text-3xl font-bold">{approvedEvents}</span>
          </div>
          <p className="text-gray-600">Approved Events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'events'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Events Management ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'users'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Users Management ({users.length})
          </button>
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Events</h2>
            {pendingEvents > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                {pendingEvents} Pending Approval
              </span>
            )}
          </div>
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No events found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {event.ticketTypes?.length || 0} ticket type(s) • {event.totalTickets - event.remainingTickets}/{event.totalTickets} sold
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(event.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${getStatusColor(event.status)} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {event.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveEvent(event._id)}
                                className="text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded hover:bg-green-50 text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeclineEvent(event._id)}
                                className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50 text-sm font-medium"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">All Users</h2>
          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{user.name}</td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`${getRoleColor(user.role)} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="User">User</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create User</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="User Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  className="input-field"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                  className="input-field"
                  placeholder="Strong password"
                  minLength="6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  value={adminFormData.role}
                  onChange={(e) => setAdminFormData({ ...adminFormData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="Admin">Admin</option>
                  <option value="Organizer">Organizer</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button type="submit" className="btn-primary flex-1">
                  <FaUserPlus className="inline mr-2" />
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAdminModal(false);
                    setAdminFormData({ name: '', email: '', password: '', role: 'Admin' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;