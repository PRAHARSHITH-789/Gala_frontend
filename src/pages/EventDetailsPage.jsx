import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import EventDetails from '../components/events/EventDetails';
import Loading from '../components/common/Loading';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await eventsAPI.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      setError('Failed to load event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Event Not Found</h2>
        <p className="text-gray-600">The event you're looking for doesn't exist.</p>
      </div>
    );
  }

  return <EventDetails event={event} />;
};

export default EventDetailsPage;