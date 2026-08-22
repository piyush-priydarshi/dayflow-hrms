import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Attendance = () => {
  const { user, token } = useAuth();
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = user.role === 'Admin' ? 'all' : 'my';
      const response = await fetch(`${API_URL}/attendance/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRecords(data.attendance || []);
      } else {
        setError(data.message || 'Failed to fetch attendance records');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStatus = async () => {
    if (user.role === 'Admin') return; // Admin check-in is optional or skipped in view
    try {
      const response = await fetch(`${API_URL}/attendance/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTodayRecord(data.todayRecord);
      }
    } catch (err) {
      console.error('Error fetching today status', err);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchAttendance();
      fetchTodayStatus();
    }
  }, [user, token]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Checked in successfully!');
        setTodayRecord(data.attendance);
        fetchAttendance(); // refresh list
      } else {
        setError(data.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Checked out successfully!');
        setTodayRecord(data.attendance);
        fetchAttendance(); // refresh list
      } else {
        setError(data.message || 'Check-out failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Register</h1>
        <Link to="/dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Dashboard
        </Link>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 mb-6 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Check-In Check-Out Card for Employees */}
      {user.role === 'Employee' && (
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Today's Clocking Actions</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {todayRecord ? (
                <p className="text-sm text-gray-700">
                  Status:{' '}
                  <span className="font-semibold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    {todayRecord.status}
                  </span>
                  <span className="ml-4">Checked-In: <strong>{formatTime(todayRecord.checkIn)}</strong></span>
                  {todayRecord.checkOut && (
                    <span className="ml-4">Checked-Out: <strong>{formatTime(todayRecord.checkOut)}</strong></span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">You have not clocked in yet today.</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || !!todayRecord}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {actionLoading ? 'Loading...' : 'Clock In'}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={actionLoading || !todayRecord || !!todayRecord.checkOut}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {actionLoading ? 'Loading...' : 'Clock Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {user.role === 'Admin' ? 'All Organization Logs' : 'My Log History'}
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading attendance data...</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500 italic">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-sm font-bold text-gray-700">Date</th>
                  {user.role === 'Admin' && (
                    <>
                      <th className="p-3 text-sm font-bold text-gray-700">Emp ID</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Name</th>
                    </>
                  )}
                  <th className="p-3 text-sm font-bold text-gray-700">Clock In</th>
                  <th className="p-3 text-sm font-bold text-gray-700">Clock Out</th>
                  <th className="p-3 text-sm font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-800 font-medium">
                      {formatDate(record.date)}
                    </td>
                    {user.role === 'Admin' && (
                      <>
                        <td className="p-3 text-sm text-gray-800">{record.user?.employeeId || 'N/A'}</td>
                        <td className="p-3 text-sm text-gray-800">{record.user?.name || 'N/A'}</td>
                      </>
                    )}
                    <td className="p-3 text-sm text-gray-800 font-mono">{formatTime(record.checkIn)}</td>
                    <td className="p-3 text-sm text-gray-800 font-mono">{formatTime(record.checkOut)}</td>
                    <td className="p-3 text-sm">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${
                        record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-200' :
                        record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
