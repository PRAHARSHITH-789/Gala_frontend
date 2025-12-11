import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api/bookings';
import { FaTicketAlt, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

const BookingForm = ({ event, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ticketsBooked: 1,
    specialRequirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = event.price * formData.ticketsBooked;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'ticketsBooked' ? parseInt(value) || 1 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.ticketsBooked > event.remainingTickets) {
      setError('Not enough tickets available');
      setLoading(false);
      return;
    }

    if (formData.ticketsBooked < 1) {
      setError('Please select at least 1 ticket');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        event: event._id,
        ticketsBooked: formData.ticketsBooked,
        totalPrice: totalPrice,
        specialRequirements: formData.specialRequirements || '',
      };

      await bookingsAPI.createBooking(bookingData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        alert('Booking created successfully!');
        navigate('/my-bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Event Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
        <div className="flex items-center text-gray-600 mb-1">
          <FaCalendarAlt className="mr-2" />
          <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaTicketAlt className="mr-2" />
          <span>{event.remainingTickets} tickets remaining</span>
        </div>
      </div>

      {/* Number of Tickets */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Number of Tickets *
        </label>
        <div className="relative">
          <FaTicketAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="number"
            name="ticketsBooked"
            min="1"
            max={event.remainingTickets}
            value={formData.ticketsBooked}
            onChange={handleChange}
            required
            className="input-field pl-10"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Maximum: {event.remainingTickets} tickets
        </p>
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Special Requirements (Optional)
        </label>
        <textarea
          name="specialRequirements"
          value={formData.specialRequirements}
          onChange={handleChange}
          rows="3"
          className="input-field"
          placeholder="Any special requests or requirements..."
        />
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="font-semibold">${event.price}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Number of tickets:</span>
          <span className="font-semibold">{formData.ticketsBooked}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total Price:</span>
            <span className="text-2xl font-bold flex items-center">
              <FaDollarSign className="text-green-600" />
              {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading || event.remainingTickets === 0}
          className="btn-primary flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Book ${formData.ticketsBooked} Ticket${formData.ticketsBooked > 1 ? 's' : ''}`}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        By booking, you agree to our terms and conditions. Tickets are non-refundable.
      </p>
    </form>
  );
};

export default BookingForm;