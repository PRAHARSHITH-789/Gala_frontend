import { format } from 'date-fns';
import { FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaTimes, FaTags, FaCheckCircle, FaQrcode } from 'react-icons/fa';
import { bookingsAPI } from '../../api/bookings';
import { useState } from 'react'; // ✅ ADD THIS
import Loading from '../common/Loading';
import BookingTicket from './BookingTicket'; // ✅ ADD THIS

const BookingList = ({ bookings, loading, onUpdate }) => {
  const [selectedBooking, setSelectedBooking] = useState(null); // ✅ ADD THIS

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingsAPI.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleMarkAttended = async (bookingId) => {
    try {
      await bookingsAPI.markAsAttended(bookingId);
      alert('Marked as attended!');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Booked: 'bg-blue-100 text-blue-800 border-blue-300',
      Attended: 'bg-green-100 text-green-800 border-green-300',
      Cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    if (status === 'Attended') return '✓';
    if (status === 'Cancelled') return '✗';
    return '📅';
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{booking.event?.title}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {booking.event?.category}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FaCalendar className="mr-3 text-purple-600" />
                    <span className="font-medium">
                      {booking.event?.date && format(new Date(booking.event.date), 'MMMM dd, yyyy')} 
                      {' at '}{booking.event?.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-3 text-purple-600" />
                    <span>{booking.event?.location}</span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-5 border border-purple-200">
                  <div className="flex items-center mb-3">
                    <FaTags className="text-purple-600 mr-2" />
                    <h4 className="font-bold text-gray-800">Booking Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                      <p className="text-xs text-gray-500 mb-1">Ticket Type</p>
                      <p className="font-bold text-purple-600 text-lg">{booking.ticketType}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Tickets</p>
                      <p className="font-bold text-gray-800 text-lg">
                        {booking.ticketsBooked}
                        <FaTicketAlt className="inline ml-2 text-gray-400" size={14} />
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Price/Ticket</p>
                      <p className="font-bold text-gray-800 text-lg">${booking.pricePerTicket}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                      <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                      <p className="font-bold text-green-600 text-xl">${booking.totalPrice}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-gray-500">
                      Booked on {format(new Date(booking.createdAt), 'MMM dd, yyyy \'at\' hh:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="lg:w-48 flex flex-col items-end justify-between">
                <div className="w-full">
                  <span className={`block text-center px-4 py-3 rounded-lg text-sm font-bold shadow-sm border ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusIcon(booking.bookingStatus)} {booking.bookingStatus}
                  </span>
                </div>

                {/* ✅ UPDATED ACTION BUTTONS */}
                <div className="w-full space-y-2 mt-4">
                  {/* ✅ ADD VIEW TICKET BUTTON */}
                  {booking.qrCode && booking.bookingStatus !== 'Cancelled' && (
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
                    >
                      <FaQrcode className="mr-2" />
                      View Ticket
                    </button>
                  )}

                  {booking.bookingStatus === 'Booked' && (
                    <>
                      <button
                        onClick={() => handleMarkAttended(booking._id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                      >
                        <FaCheckCircle className="mr-2" />
                        Mark Attended
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  <a
                    href={`/events/${booking.event?._id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition"
                  >
                    View Event
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ ADD TICKET MODAL */}
      {selectedBooking && (
        <BookingTicket 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </>
  );
};

export default BookingList;