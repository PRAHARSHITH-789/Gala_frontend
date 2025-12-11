import { useState, useEffect } from 'react';
import { FiMail, FiRefreshCw } from 'react-icons/fi';

const OTPVerification = ({ email, onVerify, onResend, onBack, loading }) => {
  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOTP = pastedData.split('');
    setOTP([...newOTP, ...Array(6 - newOTP.length).fill('')]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      await onVerify(otpValue);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOTP(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await onResend();
      setTimer(600);
      setCanResend(false);
      setOTP(['', '', '', '', '', '']);
      setError('');
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail className="text-purple-600 text-3xl" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-black">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8">
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
              disabled={loading}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Time remaining: <span className="font-semibold">{formatTime(timer)}</span>
          </p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 font-semibold flex items-center justify-center mx-auto gap-2 transition"
            >
              <FiRefreshCw />
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend available in {formatTime(timer)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full btn-primary disabled:bg-gray-300 mb-3"
        >
          {loading ? 'Verifying...' : 'Verify & Register'}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2"
        >
          ← Back to Registration
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;