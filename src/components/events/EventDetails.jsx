import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api/events';
import { bookingsAPI } from '../../api/bookings';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FaCalendar, FaMapMarkerAlt, FaClock, FaTicketAlt, FaUser, FaShoppingCart, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import Loading from '../common/Loading';

const EventDetails = ({ event: propEvent }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isUser } = useAuth();
  const [event, setEvent] = useState(propEvent || null);
  const [loading, setLoading] = useState(!propEvent);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Cart system for multiple ticket types
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!propEvent && id) {
      fetchEvent();
    } else if (propEvent) {
      setEvent(propEvent);
    }
  }, [id, propEvent]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add ticket type to cart
  const addToCart = (ticketType) => {
    const existingItem = cart.find(item => item.ticketType === ticketType.name);
    
    if (existingItem) {
      // Increase quantity
      setCart(cart.map(item => 
        item.ticketType === ticketType.name 
          ? { ...item, quantity: Math.min(item.quantity + 1, ticketType.remaining) }
          : item
      ));
    } else {
      // Add new item
      setCart([...cart, {
        ticketType: ticketType.name,
        price: ticketType.price,
        quantity: 1,
        maxQuantity: ticketType.remaining
      }]);
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (ticketTypeName, change) => {
    setCart(cart.map(item => {
      if (item.ticketType === ticketTypeName) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
          return null; // Will be filtered out
        }
        return { ...item, quantity: Math.min(newQuantity, item.maxQuantity) };
      }
      return item;
    }).filter(Boolean));
  };

  // Remove from cart
  const removeFromCart = (ticketTypeName) => {
    setCart(cart.filter(item => item.ticketType !== ticketTypeName));
  };

  // Calculate totals
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle booking
  const handleBooking = async () => {
    if (!user) {
      alert('Please login to book tickets');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Please add tickets to cart');
      return;
    }

    setBookingLoading(true);
    
    try {
      // Create multiple bookings (one per ticket type)
      const bookingPromises = cart.map(item => 
        bookingsAPI.createBooking({
          event: event._id,
          ticketType: item.ticketType,
          ticketsBooked: item.quantity,
          pricePerTicket: item.price,
          totalPrice: item.price * item.quantity
        })
      );

      await Promise.all(bookingPromises);
      
      alert(`Successfully booked ${totalTickets} ticket${totalTickets > 1 ? 's' : ''}!`);
      
      // Clear cart
      setCart([]);
      
      // Refresh event data
      await fetchEvent();
      
      // Redirect to My Bookings
      navigate('/my-bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!event) return <div className="text-center py-20">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Event Image */}
      {event.image && event.image !== 'default.jpg' && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Event Header */}
          <div className="card p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                {event.category}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                event.status === 'approved' ? 'bg-green-100 text-green-800' :
                event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {event.status}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <FaCalendar className="mr-2 text-purple-600" />
                {format(new Date(event.date), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-purple-600" />
                {event.time}
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-purple-600" />
                {event.location}
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">About This Event</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>
          </div>

          {/* Available Tickets */}
          <div className="card p-8">
            <h3 className="text-2xl font-bold mb-6">Available Tickets</h3>
            <div className="space-y-4">
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                event.ticketTypes.map((ticket, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-500 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{ticket.name}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.remaining} of {ticket.quantity} tickets remaining
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-2xl font-bold text-purple-600">${ticket.price}</p>
                        <p className="text-xs text-gray-500">per ticket</p>
                      </div>
                      <button
                        onClick={() => addToCart(ticket)}
                        disabled={ticket.remaining === 0 || !isUser}
                        className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="mr-2" />
                        Add
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${((ticket.quantity - ticket.remaining) / ticket.quantity) * 100}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(((ticket.quantity - ticket.remaining) / ticket.quantity) * 100)}% sold
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No tickets available</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Sidebar with Cart */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <FaShoppingCart className="mr-2" />
              Your Cart
            </h3>

            {isUser ? (
              <>
                {/* Cart Items */}
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaShoppingCart className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No tickets added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.ticketType}</p>
                            <p className="text-xs text-gray-600">${item.price} each</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.ticketType)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.ticketType, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.ticketType, 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          <span className="font-bold text-purple-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cart Summary */}
                {cart.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Tickets:</span>
                      <span className="font-semibold">{totalTickets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ticket Types:</span>
                      <span className="font-semibold">{cart.length}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-purple-600">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || cart.length === 0}
                  className="btn-primary w-full disabled:bg-gray-400"
                >
                  {bookingLoading ? 'Processing...' : 
                   cart.length === 0 ? 'Add Tickets to Cart' : 
                   `Book ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}`}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Please login as a user to book tickets
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Login to Book
                </button>
              </div>
            )}

            {/* Event Stats */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-semibold">{event.totalTickets} tickets</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tickets Sold:</span>
                <span className="font-semibold">
                  {event.totalTickets - event.remainingTickets}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-semibold ${
                  event.remainingTickets > 50 ? 'text-green-600' :
                  event.remainingTickets > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {event.remainingTickets > 0 ? 
                    `${event.remainingTickets} left` : 
                    'Sold Out'}
                </span> 
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
} 
          export default EventDetails;