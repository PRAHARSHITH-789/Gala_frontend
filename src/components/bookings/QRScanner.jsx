import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { bookingsAPI } from '../../api/bookings';
import { FaCheckCircle, FaTimesCircle, FaQrcode, FaSpinner } from 'react-icons/fa';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(onScanSuccessHandler, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner:", error);
      });
    };
  }, []);

  const onScanSuccessHandler = async (decodedText, decodedResult) => {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    
    // Extract token from URL
    let token = decodedText;
    if (decodedText.includes('/verify-ticket/')) {
      token = decodedText.split('/verify-ticket/')[1];
    }

    setLoading(true);
    setScanning(false);

    try {
      const response = await bookingsAPI.verifyQRCode(token);
      
      setResult({
        success: true,
        message: response.data.message,
        booking: response.data.booking
      });

      if (onScanSuccess) {
        onScanSuccess(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      const alreadyScanned = error.response?.data?.alreadyScanned;
      
      setResult({
        success: false,
        message: errorMessage,
        alreadyScanned,
        booking: error.response?.data?.booking
      });

      if (onScanError) {
        onScanError(error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently (this fires frequently)
    console.warn(`QR scan error: ${error}`);
  };

  const handleReset = () => {
    setResult(null);
    setScanning(true);
    
    // Restart scanner
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        const scanner = new Html5QrcodeScanner('qr-reader', {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        });
        scanner.render(onScanSuccessHandler, onScanFailure);
        scannerRef.current = scanner;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {loading && (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin text-6xl text-purple-600 mx-auto mb-4" />
          <p className="text-lg font-semibold">Verifying ticket...</p>
        </div>
      )}

      {!loading && !result && (
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center justify-center mb-4">
              <FaQrcode className="text-4xl text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold">Scan QR Code</h2>
            </div>
            <p className="text-center text-gray-600 mb-6">
              Position the QR code within the frame to verify the ticket
            </p>
            <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Instructions:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Allow camera access when prompted</li>
                <li>Hold the QR code steady within the frame</li>
                <li>Ensure good lighting for best results</li>
                <li>The ticket will be automatically verified</li>
              </ul>
            </p>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className={`rounded-xl shadow-2xl p-8 ${
          result.success ? 'bg-green-50 border-4 border-green-500' : 'bg-red-50 border-4 border-red-500'
        }`}>
          <div className="text-center">
            {result.success ? (
              <FaCheckCircle className="text-8xl text-green-600 mx-auto mb-4" />
            ) : (
              <FaTimesCircle className="text-8xl text-red-600 mx-auto mb-4" />
            )}
            
            <h2 className={`text-3xl font-bold mb-4 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✓ Valid Ticket' : '✗ Invalid Ticket'}
            </h2>
            
            <p className={`text-xl mb-6 ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.message}
            </p>

            {result.booking && (
              <div className="bg-white rounded-lg p-6 mb-6 text-left">
                <h3 className="font-bold text-lg mb-3 text-gray-800">Ticket Details:</h3>
                <div className="space-y-2 text-sm">
                  {result.booking.userName && (
                    <p><strong>Guest:</strong> {result.booking.userName}</p>
                  )}
                  {result.booking.eventTitle && (
                    <p><strong>Event:</strong> {result.booking.eventTitle}</p>
                  )}
                  {result.booking.ticketType && (
                    <p><strong>Type:</strong> {result.booking.ticketType}</p>
                  )}
                  {result.booking.ticketsBooked && (
                    <p><strong>Tickets:</strong> {result.booking.ticketsBooked}</p>
                  )}
                  {result.booking.scannedAt && result.alreadyScanned && (
                    <p className="text-red-600">
                      <strong>Previously Scanned:</strong> {new Date(result.booking.scannedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition"
            >
              Scan Another Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;