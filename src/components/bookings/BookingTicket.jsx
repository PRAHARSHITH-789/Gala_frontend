import { FaQrcode, FaDownload, FaPrint, FaCalendar, FaMapMarkerAlt, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const BookingTicket = ({ booking, onClose }) => {
  const handleDownloadQR = () => {
    if (!booking.qrCode) return;

    const link = document.createElement('a');
    link.href = booking.qrCode;
    link.download = `ticket-${booking._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Ticket - ${booking.event?.title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 600px; 
            margin: 0 auto; 
          }
          .ticket { 
            border: 3px solid #667eea; 
            border-radius: 15px; 
            padding: 30px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            color: #667eea;
          }
          .qr-code { 
            text-align: center; 
            margin: 20px 0; 
          }
          .qr-code img { 
            max-width: 250px; 
            border: 3px solid #667eea; 
            border-radius: 10px; 
            padding: 10px; 
            background: white;
          }
          .details { 
            margin: 20px 0; 
            line-height: 2;
          }
          .details strong { 
            color: #667eea; 
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>🎫 Event Ticket</h1>
            <h2>${booking.event?.title}</h2>
          </div>
          
          <div class="qr-code">
            <img src="${booking.qrCode}" alt="QR Code" />
            <p><strong>Scan at venue entrance</strong></p>
          </div>
          
          <div class="details">
            <p><strong>📅 Date:</strong> ${format(new Date(booking.event?.date), 'EEEE, MMMM dd, yyyy')}</p>
            <p><strong>🕐 Time:</strong> ${booking.event?.time}</p>
            <p><strong>📍 Location:</strong> ${booking.event?.location}</p>
            <p><strong>🎫 Ticket Type:</strong> ${booking.ticketType}</p>
            <p><strong>🔢 Quantity:</strong> ${booking.ticketsBooked} ticket(s)</p>
            <p><strong>💰 Total Paid:</strong> $${booking.totalPrice}</p>
            <p><strong>🆔 Booking ID:</strong> ${booking._id}</p>
          </div>
          
          <div class="footer">
            <p><strong>Important:</strong> This QR code can only be scanned once</p>
            <p>Please arrive 15 minutes before the event starts</p>
            <p>&copy; ${new Date().getFullYear()} EventHub - All rights reserved</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (!booking.qrCode) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <FaTimesCircle className="text-4xl text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-800 font-semibold">QR Code not available</p>
        <p className="text-sm text-yellow-600">Please contact support if this persists</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <FaTicketAlt className="mr-2 text-purple-600" />
              Your E-Ticket
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Status Badge */}
          <div className="text-center mb-4">
            {booking.qrCodeUsed ? (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <FaCheckCircle className="mr-2" />
                Already Scanned - Entry Granted
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                <FaQrcode className="mr-2" />
                Ready to Scan
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-3">{booking.event?.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <FaCalendar className="mr-2 text-purple-600" />
                <span>{format(new Date(booking.event?.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaClock className="mr-2 text-purple-600" />
                <span>{booking.event?.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-purple-600" />
                <span>{booking.event?.location}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg p-6 text-center shadow-lg mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {booking.qrCodeUsed ? 'This QR code has been used' : 'Show this at entrance'}
            </p>
            <div className={`inline-block p-3 bg-white rounded-lg border-4 ${
              booking.qrCodeUsed ? 'border-gray-300 opacity-50' : 'border-purple-500'
            }`}>
              <img 
                src={booking.qrCode} 
                alt="QR Code" 
                className="w-64 h-64 object-contain"
              />
            </div>
            
            {booking.qrCodeUsed && booking.qrCodeScannedAt && (
              <div className="mt-3 text-sm text-gray-500">
                <p>Scanned on: {format(new Date(booking.qrCodeScannedAt), 'MMM dd, yyyy \'at\' hh:mm a')}</p>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Ticket Type</p>
                <p className="font-semibold text-gray-800">{booking.ticketType}</p>
              </div>
              <div>
                <p className="text-gray-500">Quantity</p>
                <p className="font-semibold text-gray-800">{booking.ticketsBooked}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Paid</p>
                <p className="font-semibold text-green-600">${booking.totalPrice}</p>
              </div>
              <div>
                <p className="text-gray-500">Booking ID</p>
                <p className="font-semibold text-gray-800 text-xs">{booking._id.slice(-8)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!booking.qrCodeUsed && (
            <div className="flex gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
              >
                <FaDownload className="mr-2" />
                Download QR
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
              >
                <FaPrint className="mr-2" />
                Print Ticket
              </button>
                          </div>
          )}

          {/* Important Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Important:</strong> This QR code can only be scanned once. 
              Please arrive 15 minutes early. Keep this ticket safe and check your email for confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTicket;