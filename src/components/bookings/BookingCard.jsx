import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { bookingsAPI } from '../../api/bookings';

const BookingCard = ({ booking, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [ticketsBooked, setTicketsBooked] = useState(booking.ticketsBooked);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await bookingsAPI.updateBooking(booking._id, { ticketsBooked });
      setMessage('Booking updated successfully!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setLoading(true);
    try {
      await bookingsAPI.cancelBooking(booking._id);
      setMessage('Booking cancelled successfully!');
      onUpdate();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cancellation failed');
    } finally {
      setLoading(false);
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

  return (
    <div className="card p-6">
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{booking.event?.title}</h3>
          <span className={`${getStatusColor(booking.bookingStatus)} px-3 py-1 rounded-full text-sm font-semibold`}>
            {booking.bookingStatus}
          </span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">${booking.totalPrice}</p>
          <p className="text-gray-500 text-sm">Total Price</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700">
          <FaCalendarAlt className="mr-3 text-gray-500" />
          <span>{booking.event?.date ? format(new Date(booking.event.date), 'EEEE, MMMM dd, yyyy') : 'N/A'}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <FaMapMarkerAlt className="mr-3 text-gray-500" />
          <span>{booking.event?.location}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <FaTicketAlt className="mr-3 text-gray-500" />
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={ticketsBooked}
                onChange={(e) => setTicketsBooked(parseInt(e.target.value) || 1)}
                className="input-field w-20"
              />
              <span>tickets</span>
            </div>
          ) : (
            <span>{booking.ticketsBooked} tickets booked</span>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn-primary flex-1 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex-1"
              disabled={booking.bookingStatus === 'Cancelled'}
            >
              <FaEdit className="inline mr-2" />
              Edit
            </button>
            <button
              onClick={handleCancel}
              disabled={loading || booking.bookingStatus === 'Cancelled'}
              className="btn-secondary flex-1 text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Cancel Booking
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;