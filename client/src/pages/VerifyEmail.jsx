import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided in URL.');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification token is invalid or has expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error: Unable to connect to server.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-10 px-4">
      <div className="bg-white p-8 rounded border border-gray-300 shadow-sm w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Email Verification</h2>

        {status === 'verifying' && (
          <div className="space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            <p className="text-gray-600 text-sm">Verifying your email address, please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-800 p-4 rounded border border-green-200 text-sm">
              <div className="text-green-600 text-3xl mb-2">✓</div>
              <p className="font-bold text-base mb-1">Email Verified!</p>
              <p>{message}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors cursor-pointer text-sm"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 text-sm">
              <div className="text-red-600 text-3xl mb-2">✕</div>
              <p className="font-bold text-base mb-1">Verification Failed</p>
              <p>{message}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-medium text-sm text-center"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium text-sm text-center"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
