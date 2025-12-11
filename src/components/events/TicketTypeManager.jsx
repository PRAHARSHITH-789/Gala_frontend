import { FaPlus, FaTrash } from 'react-icons/fa';

const TicketTypeManager = ({ ticketTypes, onChange }) => {
  const availableTypes = ['Standard', 'VIP', 'Premium', 'Early Bird', 'Student', 'General Admission'];

  const addTicketType = () => {
    onChange([
      ...ticketTypes,
      { name: 'Standard', price: 0, quantity: 0 }
    ]);
  };

  const removeTicketType = (index) => {
    onChange(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-semibold">
          Ticket Types * <span className="text-gray-500 font-normal">(Add at least one)</span>
        </label>
        <button
          type="button"
          onClick={addTicketType}
          className="flex items-center px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
        >
          <FaPlus className="mr-2" size={12} />
          Add Ticket Type
        </button>
      </div>

      {ticketTypes.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Please add at least one ticket type (e.g., Standard, VIP)
          </p>
        </div>
      )}

      <div className="space-y-4">
        {ticketTypes.map((ticket, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Ticket Type {index + 1}</h4>
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Ticket Type Name */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Type</label>
                <select
                  value={ticket.name}
                  onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                  required
                >
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Price ($)</label>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="50"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Quantity</label>
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="100"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTypeManager;