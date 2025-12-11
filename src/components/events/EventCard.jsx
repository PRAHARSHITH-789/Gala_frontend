import { format } from 'date-fns';
import { FaCalendar, FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const ticketsSold = event.totalTickets - event.remainingTickets;
  const percentageSold = (ticketsSold / event.totalTickets) * 100;

  // Get price range from ticket types
  const prices = event.ticketTypes?.map(t => t.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const priceDisplay = minPrice === maxPrice ? 
    `$${minPrice}` : 
    `$${minPrice} - $${maxPrice}`;

  return (
    <Link to={`/events/${event._id}`} className="block">
      <div className="card hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Image - NO TEXT OVERLAY */}
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{
            backgroundImage: event.image && event.image !== 'default.jpg' 
              ? `url(${event.image})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {/* Ticket Types Badge - Only this overlay */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {event.ticketTypes.length} Ticket Type{event.ticketTypes.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title moved here */}
          <h3 className="text-2xl font-bold mb-3 text-gray-800 line-clamp-2">
            {event.title}
          </h3>

          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
              {event.category}
            </span>
            <span className="text-xl font-bold text-purple-600">
              {priceDisplay}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Date & Location */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <FaCalendar className="mr-2 text-purple-600 flex-shrink-0" />
              {format(new Date(event.date), 'MMM dd, yyyy')}
              <FaClock className="ml-4 mr-2 text-purple-600 flex-shrink-0" />
              {event.time}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-2 text-purple-600 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
              <FaTicketAlt className="mr-2" />
              <span>{event.remainingTickets}/{event.totalTickets} left</span>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${percentageSold}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;