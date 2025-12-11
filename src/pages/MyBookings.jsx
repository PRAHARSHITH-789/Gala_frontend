import { useEffect, useState } from 'react';
import { bookingsAPI } from '../api/bookings';
import BookingList from '../components/bookings/BookingList';
import { FaTicketAlt, FaSearch, FaFilter, FaCalendarAlt, FaDollarSign, FaTags } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('All');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique ticket types from bookings
  const ticketTypes = ['All', ...new Set(bookings.map(b => b.ticketType).filter(Boolean))];

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === 'All' || booking.bookingStatus === filter;
    const matchesSearch = 
      booking.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event?.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTicketType = ticketTypeFilter === 'All' || booking.ticketType === ticketTypeFilter;
    return matchesFilter && matchesSearch && matchesTicketType;
  });

  // Calculate statistics
  const stats = {
    total: bookings.length,
    booked: bookings.filter(b => b.bookingStatus === 'Booked').length,
    attended: bookings.filter(b => b.bookingStatus === 'Attended').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'Cancelled').length,
    totalSpent: bookings
      .filter(b => b.bookingStatus !== 'Cancelled')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    totalTickets: bookings
      .filter(b => b.bookingStatus !== 'Cancelled')
      .reduce((sum, b) => sum + (b.ticketsBooked || 0), 0),
  };

  // Ticket type breakdown
  const ticketTypeStats = bookings
    .filter(b => b.bookingStatus !== 'Cancelled' && b.ticketType)
    .reduce((acc, booking) => {
      const type = booking.ticketType;
      if (!acc[type]) {
        acc[type] = { count: 0, tickets: 0, spent: 0 };
      }
      acc[type].count += 1;
      acc[type].tickets += booking.ticketsBooked || 0;
      acc[type].spent += booking.totalPrice || 0;
      return acc;
    }, {});

  // Get upcoming bookings
  const upcomingBookings = bookings.filter(booking => {
    if (!booking.event?.date) return false;
    const eventDate = new Date(booking.event.date);
    const today = new Date();
    return eventDate >= today && booking.bookingStatus === 'Booked';
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center">
          <FaTicketAlt className="mr-3 text-blue-600" />
          My Bookings
        </h1>
        <p className="text-gray-600">Manage all your event bookings in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="card p-6 text-center hover-lift">
          <div className="text-4xl font-bold mb-2 text-blue-600">{stats.total}</div>
          <p className="text-gray-600 font-medium">Total Bookings</p>
        </div>

        <div className="card p-6 text-center border-l-4 border-purple-500 hover-lift">
          <div className="text-4xl font-bold mb-2 text-purple-600">{upcomingBookings}</div>
          <p className="text-gray-600 font-medium">Upcoming</p>
        </div>

        <div className="card p-6 text-center border-l-4 border-blue-500 hover-lift">
          <div className="text-4xl font-bold mb-2 text-blue-600">{stats.booked}</div>
          <p className="text-gray-600 font-medium">Booked</p>
        </div>

        <div className="card p-6 text-center border-l-4 border-green-500 hover-lift">
          <div className="text-4xl font-bold mb-2 text-green-600">{stats.attended}</div>
          <p className="text-gray-600 font-medium">Attended</p>
        </div>

        <div className="card p-6 text-center border-l-4 border-red-500 hover-lift">
          <div className="text-4xl font-bold mb-2 text-red-600">{stats.cancelled}</div>
          <p className="text-gray-600 font-medium">Cancelled</p>
        </div>

        <div className="card p-6 text-center border-l-4 border-indigo-500 hover-lift">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold mb-2 text-indigo-600 flex items-center">
              <FaDollarSign className="text-2xl" />
              {stats.totalSpent}
            </div>
            <p className="text-gray-600 font-medium">Total Spent</p>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Tickets Booked</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalTickets}</p>
            </div>
            <FaTicketAlt className="text-6xl text-blue-300" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Average per Booking</p>
              <p className="text-4xl font-bold text-purple-600">
                ${stats.total > 0 ? (stats.totalSpent / stats.total).toFixed(2) : '0.00'}
              </p>
            </div>
            <FaDollarSign className="text-6xl text-purple-300" />
          </div>
        </div>
      </div>

      {/* Ticket Type Breakdown */}
      {Object.keys(ticketTypeStats).length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <FaTags className="mr-2 text-purple-600" />
            Tickets by Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(ticketTypeStats).map(([type, data]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                <h4 className="font-bold text-lg mb-2">{type}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-semibold">{data.count}</span> bookings</p>
                  <p><span className="font-semibold">{data.tickets}</span> tickets</p>
                  <p className="text-purple-600 font-bold">${data.spent.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">
              <FaSearch className="inline mr-2" />
              Search Bookings
            </label>
            <input
              type="text"
              placeholder="Search by event name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Ticket Type Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <FaTags className="inline mr-2" />
              Ticket Type
            </label>
            <select
              value={ticketTypeFilter}
              onChange={(e) => setTicketTypeFilter(e.target.value)}
              className="input-field"
            >
              {ticketTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-2">
            <FaFilter className="inline mr-2" />
            Status Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {['All', 'Booked', 'Attended', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition ${
                  filter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
                {status !== 'All' && (
                  <span className="ml-2 bg-white text-black px-2 py-0.5 rounded-full text-xs">
                    {stats[status.toLowerCase()]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-black">{filteredBookings.length}</span> of{' '}
          <span className="font-semibold text-black">{bookings.length}</span> bookings
          {ticketTypeFilter !== 'All' && (
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm font-medium">
              {ticketTypeFilter} tickets
            </span>
          )}
        </p>
        {bookings.length === 0 && (
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        )}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && !loading ? (
        <div className="card p-12 text-center">
          <FaCalendarAlt className="text-8xl text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">No Bookings Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't booked any events yet. Start exploring amazing events and book your first ticket!
          </p>
          <Link to="/events" className="btn-primary inline-block">
            <FaSearch className="inline mr-2" />
            Explore Events
          </Link>
        </div>
      ) : (
        <>
          {/* Bookings List */}
          {filteredBookings.length === 0 && (searchTerm || ticketTypeFilter !== 'All' || filter !== 'All') ? (
            <div className="card p-12 text-center">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-6">
                No bookings match your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('All');
                  setTicketTypeFilter('All');
                }}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <BookingList bookings={filteredBookings} loading={loading} onUpdate={fetchBookings} />
          )}
        </>
      )}

      {/* Help Section */}
      {bookings.length > 0 && (
        <div className="mt-8 card p-6 bg-gray-50">
          <h3 className="font-bold text-lg mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">🎫 Ticket Types</p>
              <p className="text-gray-600">Each booking shows the specific ticket type (VIP, Standard, etc.)</p>
            </div>
            <div>
              <p className="font-semibold mb-1">✓ Mark Attended</p>
              <p className="text-gray-600">Mark your booking as attended after the event</p>
            </div>
            <div>
              <p className="font-semibold mb-1">📧 Contact Support</p>
              <p className="text-gray-600">Have questions? Reach out to support@eventhub.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;