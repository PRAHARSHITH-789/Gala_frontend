import { useState } from 'react';
import { eventsAPI } from '../../api/events';
import TicketTypeManager from './TicketTypeManager';

const EventForm = ({ event, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    category: event?.category || 'Music',
    date: event?.date ? event.date.split('T')[0] : '',
    time: event?.time || '',
    ticketTypes: event?.ticketTypes || [{ name: 'Standard', price: 0, quantity: 0 }],
    image: event?.image || '',
  });
  const [imagePreview, setImagePreview] = useState(event?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Music', 'Sports', 'Food', 'Arts', 'Technology', 'Business', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll use base64 or a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate ticket types
    if (formData.ticketTypes.length === 0) {
      setError('Please add at least one ticket type');
      return;
    }

    const hasInvalidTicket = formData.ticketTypes.some(
      ticket => ticket.price <= 0 || ticket.quantity <= 0
    );
    
    if (hasInvalidTicket) {
      setError('All ticket types must have a price and quantity greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (event) {
        await eventsAPI.updateEvent(event._id, formData);
      } else {
        await eventsAPI.createEvent(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = formData.ticketTypes.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
  const minPrice = formData.ticketTypes.length > 0 ? Math.min(...formData.ticketTypes.map(t => t.price || 0)) : 0;
  const maxPrice = formData.ticketTypes.length > 0 ? Math.max(...formData.ticketTypes.map(t => t.price || 0)) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold mb-2">Event Image</label>
        <div className="flex items-center space-x-4">
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg border"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="input-field"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Recommended: 800x400px, max 2MB</p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          minLength="6"
          className="input-field"
          placeholder="e.g., Summer Music Festival 2024"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          minLength="6"
          rows="4"
          className="input-field"
          placeholder="Describe your event..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input-field"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            minLength="6"
            className="input-field"
            placeholder="e.g., Madison Square Garden, New York"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Time *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
      </div>

      {/* Ticket Types Manager */}
      <div className="border-t pt-6">
        <TicketTypeManager
          ticketTypes={formData.ticketTypes}
          onChange={(ticketTypes) => setFormData({ ...formData, ticketTypes })}
        />
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Event Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Total Ticket Types: <span className="font-semibold">{formData.ticketTypes.length}</span></p>
          <p>Total Tickets Available: <span className="font-semibold">{totalTickets}</span></p>
          <p>Price Range: <span className="font-semibold">
            ${minPrice} - ${maxPrice}
          </span></p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
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
    </form>
  );
};

export default EventForm;