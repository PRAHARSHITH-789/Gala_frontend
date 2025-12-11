import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../api/bookings';
import { format } from 'date-fns';
import { FaCheckCircle, FaTimesCircle, FaTicketAlt, FaCalendar, FaMapMarkerAlt, FaClock, FaSpinner } from 'react-icons/fa';

const VerifyTicket = () => {
  const { token } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [token]);

  const fetchBookingDetails = async () => {
    try {
      const response = await bookingsAPI.getBookingByToken(token);
      setBooking(response.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-xl font-semibold">Verifying ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border-4 border-red-500 rounded-xl p-8 text-center">
          <FaTimesCircle className="text-8xl text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-800 mb-4">Invalid Ticket</h1>
          <p className="text-red-700 mb-6">{error}</p>
          <Link to="/events" className="btn-primary inline-block">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <FaTicketAlt className="text-6xl text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Event Ticket</h1>
          <p className="text-gray-600">Valid ticket - ready for entry</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Status Banner */}
          <div className={`py-4 px-6 text-center ${
            booking.qrCodeUsed 
              ? 'bg-green-500' 
              : booking.status === 'Cancelled' 
                ? 'bg-red-500' 
                : 'bg-blue-500'
          }`}>
            <div className="flex items-center justify-center text-white">
              {booking.qrCodeUsed ? (
                <>
                  <FaCheckCircle className="text-2xl mr-2" />
                  <span className="text-xl font-bold">ENTRY GRANTED</span>
                </>
              ) : booking.status === 'Cancelled' ? (
                <>
                  <FaTimesCircle className="text-2xl mr-2" />
                  <span className="text-xl font-bold">CANCELLED</span>
                </>
              ) : (
                <>
                  <FaTicketAlt className="text-2xl mr-2" />
                  <span className="text-xl font-bold">VALID TICKET</span>
                </>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{booking.eventTitle}</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-700">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FaCalendar className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-lg">
                    {format(new Date(booking.eventDate), 'EEEE, MMMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FaClock className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-lg">{booking.eventTime}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FaMapMarkerAlt className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-lg">{booking.eventLocation}</p>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <FaTicketAlt className="mr-2 text-purple-600" />
                Booking Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="font-semibold text-gray-800">{booking.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket Type</p>
                  <p className="font-semibold text-gray-800">{booking.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-semibold text-gray-800">{booking.ticketsBooked} ticket(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold text-green-600 text-lg">${booking.totalPrice}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-xs text-gray-500">
                  <strong>Booking ID:</strong> {booking.id}
                </p>
              </div>
            </div>

            {/* Scan Status */}
            {booking.qrCodeUsed && booking.scannedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold mb-1">✓ Ticket Scanned</p>
                <p className="text-sm text-green-700">
                  Entry granted on {format(new Date(booking.scannedAt), 'MMM dd, yyyy \'at\' hh:mm a')}
                </p>
              </div>
            )}

            {booking.status === 'Cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-semibold mb-1">✗ Booking Cancelled</p>
                <p className="text-sm text-red-700">
                  This ticket is no longer valid for entry
                </p>
              </div>
            )}

            {!booking.qrCodeUsed && booking.status !== 'Cancelled' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold mb-1">📱 Ready for Scanning</p>
                <p className="text-sm text-blue-700">
                  Present this ticket at the venue entrance. Please arrive 15 minutes early.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <Link to="/my-bookings" className="flex-1 btn-primary text-center">
                View My Bookings
              </Link>
              <Link to="/events" className="flex-1 btn-secondary text-center">
                Browse Events
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Need help? Contact us at noorjjj2006@gmail.com</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyTicket;