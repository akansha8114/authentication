import React, { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const displayPopup = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const sendOTP = async () => {
    try {
      const res = await fetch('/api/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.message) {
        displayPopup('OTP sent successfully!');
      }
      setMessage(data.message || data.error || '');
    } catch (error) {
      setMessage('Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      setMessage(data.message || data.error || '');
    } catch (error) {
      setMessage('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center relative">
        {/* Popup */}
        {showPopup && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-lg text-sm animate-pulse">
            {popupMessage}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-purple-600 mb-3">
          Welcome to ComedyHub
        </h2>
        <p className="text-gray-600 mb-6">
          Authenticate with your email to continue
        </p>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-colors focus:border-purple-600 focus:outline-none"
          />
          
          <button
            onClick={sendOTP}
            className="w-full bg-purple-600 text-white py-3 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
          >
            Send OTP
          </button>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-mono tracking-widest transition-colors focus:border-purple-600 focus:outline-none"
          />
          
          <button
            onClick={verifyOTP}
            className="w-full bg-purple-600 text-white py-3 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
          >
            Verify OTP
          </button>
        </div>

        {message && (
          <div className="mt-4 font-semibold text-gray-700">
            {message}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          Need help?{' '}
          <a href="https://linkedin.com/in/neutrino-ashutosh" className="text-purple-600 hover:underline">
            Contact Support
          </a>
          <br />
          © 2024 ComedyHub.in
        </div>
      </div>
    </div>
  );
}