import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  
  // Skeletal contact form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans text-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Welcome to DayFlow HRMS
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mb-8">
          The central workflow platform for Employee directory management, attendance clocking, leave requests, and payroll tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 mb-16">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium cursor-pointer transition-colors"
          >
            Sign In to Portal
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-850 text-gray-800 rounded font-medium cursor-pointer transition-colors border border-gray-300"
          >
            Create Staff Account
          </button>
        </div>

        {/* Skeletal Inquiry Form */}
        <div className="bg-white p-8 rounded border border-gray-300 shadow-sm w-full max-w-lg text-left">
          <h2 className="text-xl font-bold text-gray-800 mb-4">HR & Sales Inquiry Form</h2>
          {submitted ? (
            <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200 text-sm">
              Thank you! Your skeletal inquiry was received. We will enhance this form logic later.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help your organization?"
                  className="w-full p-2 border border-gray-300 rounded h-24 focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium cursor-pointer transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © 2026 DayFlow HRMS Hackathon Scaffold. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
