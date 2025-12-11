import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import EventList from '../components/events/EventList';
import {
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaSearch,
  FaClock,
  FaTicketAlt
} from 'react-icons/fa';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const isOrganizer = user?.role === 'Organizer';
  const isAdmin = user?.role === 'Admin';

  const categories = [
    'All',
    'Music',
    'Sports',
    'Food',
    'Arts',
    'Technology',
    'Business'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getApprovedEvents();
      const allEvents = response.data;

      const now = new Date();
      const upcomingEvents = allEvents
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (upcomingEvents.length > 0) {
        setFeaturedEvent(upcomingEvents[0]);
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getTimeUntilEvent = eventDate => {
    const now = new Date();
    const event = parseISO(eventDate);
    const daysUntil = differenceInDays(event, now);

    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    if (daysUntil < 7) return `In ${daysUntil} days`;
    return format(event, 'MMM dd, yyyy');
  };

  const getPriceRange = event => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return 'Free';
    }
    const prices = event.ticketTypes.map(t => t.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === 0 && max === 0) return 'Free';
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  const getAttendees = event => {
    const ticketsSold = event.totalTickets - event.remainingTickets;
    return ticketsSold;
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: TEXT */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <div className="flex items-center mb-4">
                <FaCalendarAlt className="text-2xl mr-2" />
                <span className="text-lg">Discover Amazing Events</span>
              </div>

              <h1 className="text-6xl font-bold mb-6 leading-tight">
                Find & Book Your Next Experience
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                From electrifying concerts to inspiring talks, thrilling sports
                events to intimate gatherings. Discover events that matter to you.
              </p>

              {/* SEARCH BAR */}
              <div className="bg-white rounded-lg p-2 flex items-center shadow-2xl">
                <FaSearch className="text-gray-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search events by name, category, or location"
                  className="flex-1 px-4 py-3 text-black focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                  onClick={() =>
                    document
                      .getElementById('events-section')
                      .scrollIntoView({ behavior: 'smooth' })
                  }
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Search Events →
                </button>
              </div>
            </motion.div>

            {/* RIGHT: FEATURED EVENT */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
            >
              {featuredEvent ? (
                <div className="relative">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300">
                    <img
                      src={
                        featuredEvent.image &&
                        featuredEvent.image !== 'default.jpg'
                          ? featuredEvent.image
                          : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'
                      }
                      alt={featuredEvent.title}
                      className="w-full h-96 object-cover"
                      onClick={() => navigate(`/events/${featuredEvent._id}`)}
                    />

                    <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-lg shadow-lg">
                      <p className="text-green-600 font-semibold text-sm">
                        Next Event
                      </p>
                      <p className="text-black font-bold">
                        {getTimeUntilEvent(featuredEvent.date)}
                      </p>
                    </div>

                    <div className="absolute top-6 left-6 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
                      <p className="font-semibold text-sm">
                        {featuredEvent.category}
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                      <h3 className="text-white text-2xl font-bold mb-2">
                        {featuredEvent.title}
                      </h3>

                      <div className="flex items-center text-gray-200 mb-3 text-sm space-x-4">
                        <span className="flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {format(new Date(featuredEvent.date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <FaClock className="mr-2" />
                          {featuredEvent.time}
                        </span>
                      </div>

                      <p className="text-gray-200 flex items-center mb-4">
                        <FaMapMarkerAlt className="mr-2" />
                        {featuredEvent.location}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-white text-2xl font-bold">
                          {getPriceRange(featuredEvent)}
                        </span>

                        <button
                          onClick={() =>
                            navigate(`/events/${featuredEvent._id}`)
                          }
                          className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center"
                        >
                          <FaTicketAlt className="mr-2" />
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Going Count */}
                  <div className="absolute -bottom-8 -left-8 bg-white rounded-xl p-4 shadow-xl">
                    <div className="flex items-center space-x-2">
                      <FaUsers className="text-3xl text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-black">
                          {getAttendees(featuredEvent)} Going
                        </p>
                        <p className="text-gray-500 text-sm">
                          {featuredEvent.remainingTickets} tickets left
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center shadow-xl">
                  {loading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading events...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-xl">
                        No upcoming events yet
                      </p>
                      <Link
                        to="/events"
                        className="text-purple-600 hover:text-purple-700 font-semibold mt-2 inline-block"
                      >
                        Browse all events →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <FaCalendarAlt className="text-4xl" />
              </div>
              <div>
                <p className="text-3xl font-bold">{events.length}+</p>
                <p className="text-gray-300">Events</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <FaUsers className="text-4xl" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {events.reduce(
                    (sum, e) => sum + (e.totalTickets - e.remainingTickets),
                    0
                  )}
                  +
                </p>
                <p className="text-gray-300">Tickets Booked</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <FaMapMarkerAlt className="text-4xl" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {new Set(events.map(e => e.location)).size}+
                </p>
                <p className="text-gray-300">Locations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="max-w-7xl mx-auto px-4 py-16" id="events-section">
        <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
        <div className="flex flex-wrap gap-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* EVENT LIST */}
      <motion.section
  className="max-w-7xl mx-auto px-4 py-16"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <div className="flex justify-between items-center mb-8">
    <h2 className="text-3xl font-bold">
      {selectedCategory === 'All'
        ? 'Upcoming Events'
        : `${selectedCategory} Events`}
    </h2>
    <Link to="/events" className="text-black font-semibold hover:underline">
      View all →
    </Link>
  </div>

  <EventList events={filteredEvents} loading={loading} />
</motion.section>


      {/* CTA */}
      {!isOrganizer && !isAdmin && (
        <section className="bg-black text-white py-20 mt-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Create Your Own Event?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of organizers who trust EventHub to manage their
              events
            </p>
            <Link
              to="/register"
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 inline-block"
            >
              Become an Organizer
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
