import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { FaPlus, FaEdit, FaTrash, FaChartBar, FaCalendarAlt, FaTicketAlt, FaEye, FaQrcode } from 'react-icons/fa';
import { format } from 'date-fns';
import EventForm from '../components/events/EventForm';
import Loading from '../components/common/Loading';
import QRScanner from '../components/bookings/QRScanner';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        eventsAPI.getUserEvents(),
        eventsAPI.getEventAnalytics(),
      ]);

      console.log('Events Response:', eventsRes); // Debug
      console.log('Analytics Response:', analyticsRes); // Debug

      // Handle different response structures safely
      const eventsData = eventsRes.data?.events || eventsRes.data || [];
      const analyticsData = analyticsRes.data?.analytics?.eventBreakdown || 
                           analyticsRes.data?.analysis || 
                           analyticsRes.data?.eventBreakdown || 
                           [];

      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setAnalytics(Array.isArray(analyticsData) ? analyticsData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error
      setEvents([]);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.deleteEvent(eventId);
      alert('Event deleted successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to delete event');
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

  // Safe filtering with array check
  const filteredEvents = Array.isArray(events) ? events.filter((event) => {
    if (filter === 'All') return true;
    return event.status === filter;
  }) : [];

  // Calculate statistics safely
  const totalEvents = events.length || 0;
  const approvedEvents = events.filter(e => e?.status === 'approved').length || 0;
  const pendingEvents = events.filter(e => e?.status === 'Pending').length || 0;
  
  const totalTicketsSold = events.reduce((sum, e) => {
    const tickets = (e?.totalTickets || 0) - (e?.remainingTickets || 0);
    return sum + tickets;
  }, 0);
  
  const totalRevenue = events.reduce((sum, event) => {
    if (event?.ticketTypes && Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0) {
      const eventRevenue = event.ticketTypes.reduce((typeSum, ticketType) => {
        const sold = (ticketType?.quantity || 0) - (ticketType?.remaining || 0);
        return typeSum + (sold * (ticketType?.price || 0));
      }, 0);
      return sum + eventRevenue;
    }
    return sum;
  }, 0);

  const getPriceRange = (event) => {
    if (!event?.ticketTypes || !Array.isArray(event.ticketTypes) || event.ticketTypes.length === 0) {
      return '$0';
    }
    const prices = event.ticketTypes.map(t => t?.price || 0).filter(p => p > 0);
    if (prices.length === 0) return '$0';
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `$${min}` : `$${min} - $${max}`;
  };

  const calculateEventRevenue = (event) => {
    if (!event?.ticketTypes || !Array.isArray(event.ticketTypes)) return 0;
    
    return event.ticketTypes.reduce((sum, ticketType) => {
      const sold = (ticketType?.quantity || 0) - (ticketType?.remaining || 0);
      return sum + (sold * (ticketType?.price || 0));
    }, 0);
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-gray-600">Manage your events and track performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold whitespace-nowrap"
        >
          <FaPlus className="inline mr-2" />
          Create New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FaCalendarAlt className="text-3xl text-blue-600" />
            <span className="text-3xl font-bold">{totalEvents}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Events</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FaTicketAlt className="text-3xl text-green-600" />
            <span className="text-3xl font-bold">{approvedEvents}</span>
          </div>
          <p className="text-gray-600 font-medium">Approved</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <FaChartBar className="text-3xl text-yellow-600" />
            <span className="text-3xl font-bold">{pendingEvents}</span>
          </div>
          <p className="text-gray-600 font-medium">Pending</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🎫</span>
            <span className="text-3xl font-bold">{totalTicketsSold}</span>
          </div>
          <p className="text-gray-600 font-medium">Tickets Sold</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-3xl font-bold">${totalRevenue.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 font-medium">Total Revenue</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'events'
              ? 'border-b-4 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaCalendarAlt className="inline mr-2" />
          My Events
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'scanner'
              ? 'border-b-4 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaQrcode className="inline mr-2" />
          QR Scanner
        </button>
      </div>

      {/* Events Tab Content */}
      {activeTab === 'events' && (
        <>
          {/* Revenue Breakdown by Event */}
          {events.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-2xl mr-3">💵</span>
                Revenue Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Types</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets Sold</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.map((event) => {
                      const eventRevenue = calculateEventRevenue(event);
                      const ticketsSold = (event?.totalTickets || 0) - (event?.remainingTickets || 0);

                      return (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{event?.title || 'Untitled Event'}</p>
                            <p className="text-xs text-gray-500">{event?.category || 'Uncategorized'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {event?.ticketTypes && Array.isArray(event.ticketTypes) && event.ticketTypes.map((ticket, idx) => {
                                const sold = (ticket?.quantity || 0) - (ticket?.remaining || 0);
                                const price = ticket?.price || 0;
                                return (
                                  <div key={idx} className="text-sm">
                                    <span className="font-medium">{ticket?.name || 'Standard'}:</span>{' '}
                                    <span className="text-gray-600">
                                      {sold} × ${price} = ${(sold * price).toFixed(2)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-purple-600">{ticketsSold}</span>
                            <span className="text-gray-500"> / {event?.totalTickets || 0}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-green-600 text-lg">
                              ${eventRevenue.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right">Total Revenue:</td>
                      <td className="px-4 py-3">
                        <span className="text-xl text-green-600">${totalRevenue.toFixed(2)}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {analytics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaChartBar className="mr-3 text-purple-600" />
                Event Performance
              </h2>
              <div className="space-y-4">
                {analytics.map((item) => {
                  const event = events.find(e => e._id === item.eventId);
                  const ticketsSold = item.ticketsSold || (event ? (event.totalTickets - event.remainingTickets) : 0);
                  const totalTickets = event?.totalTickets || 0;
                  const percentage = totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;
                  
                  return (
                    <div key={item.eventId} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.eventTitle || event?.title || 'Event'}</h3>
                          <p className="text-sm text-gray-600">
                            {ticketsSold} / {totalTickets} tickets sold • ${(item.revenue || 0).toFixed(2)} revenue
                          </p>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 10 && (
                            <span className="text-xs text-white font-bold">
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['All', 'approved', 'Pending', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  filter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">My Events</h2>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {filter === 'All' 
                    ? "You haven't created any events yet" 
                    : `No ${filter.toLowerCase()} events found`}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tickets
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => {
                      const ticketsSold = (event?.totalTickets || 0) - (event?.remainingTickets || 0);
                      const soldPercentage = event?.totalTickets > 0 
                        ? Math.round((ticketsSold / event.totalTickets) * 100) 
                        : 0;
                      const eventRevenue = calculateEventRevenue(event);
                      
                      return (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{event?.title || 'Untitled'}</p>
                              <p className="text-sm text-gray-500">{event?.location || 'Location TBA'}</p>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1 inline-block">
                                {event?.category || 'Uncategorized'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-medium">
                                {event?.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'Date TBA'}
                              </p>
                              <p className="text-gray-500">{event?.time || 'Time TBA'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-semibold">
                                <span className="text-green-600">{ticketsSold}</span>
                                <span className="text-gray-500"> / {event?.totalTickets || 0}</span>
                              </p>
                              <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{ width: `${soldPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {getPriceRange(event)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="font-bold text-green-600">
                              ${eventRevenue.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${getStatusColor(event?.status || 'Pending')} px-3 py-1 rounded-full text-xs font-semibold`}>
                              {event?.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Link
                                to={`/events/${event._id}`}
                                className="text-blue-600 hover:text-blue-800"
                                title="View"
                              >
                                <FaEye className="text-lg" />
                              </Link>
                              <button
                                onClick={() => setEditingEvent(event)}
                                                               className="text-green-600 hover:text-green-800"
                                title="Edit"
                              >
                                <FaEdit className="text-lg" />
                              </button>
                              <button
                                onClick={() => handleDelete(event._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FaTrash className="text-lg" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* QR Scanner Tab Content */}
      {activeTab === 'scanner' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Ticket Verification</h2>
            <p className="text-gray-600">
              Scan attendee QR codes to verify tickets and grant entry to your events
            </p>
          </div>
          
          <QRScanner 
            onScanSuccess={(data) => {
              console.log('✅ Ticket verified:', data);
              fetchData(); // Refresh data after successful scan
            }}
            onScanError={(error) => {
              console.error('❌ Verification failed:', error);
            }}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEvent) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <EventForm
              event={editingEvent}
              onSuccess={() => {
                setShowCreateModal(false);
                setEditingEvent(null);
                fetchData();
                alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
              }}
              onCancel={() => {
                setShowCreateModal(false);
                setEditingEvent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;