import EventCard from './EventCard';
import Loading from '../common/Loading';

const EventList = ({ events, loading }) => {
  if (loading) {
    return <Loading />;
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-gray-500">No events found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};

export default EventList;