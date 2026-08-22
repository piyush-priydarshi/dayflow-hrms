import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../utils/exportToCSV';

const Attendance = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        showToast('Checked in successfully!', 'success');
        setTodayRecord(data.attendance);
        fetchAttendance(); // refresh list
      } else {
        const errorMsg = data.message || 'Check-in failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
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
        showToast('Checked out successfully!', 'success');
        setTodayRecord(data.attendance);
        fetchAttendance(); // refresh list
      } else {
        const errorMsg = data.message || 'Check-out failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
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

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return '--';
    if (!checkOut) return 'In Progress';

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) return '--';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) {
      return '0m';
    }
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const handleExportCSV = () => {
    if (!records || records.length === 0) return;

    const headers = [
      { label: 'Date', key: (r) => formatDate(r.date) },
      ...(user.role === 'Admin'
        ? [
            { label: 'Employee ID', key: (r) => r.user?.employeeId || 'N/A' },
            { label: 'Employee Name', key: (r) => r.user?.name || 'N/A' },
          ]
        : []),
      { label: 'Clock In', key: (r) => formatTime(r.checkIn) },
      { label: 'Clock Out', key: (r) => formatTime(r.checkOut) },
      { label: 'Duration / Worked Hours', key: (r) => calculateDuration(r.checkIn, r.checkOut) },
      { label: 'Status', key: (r) => r.status || 'Present' },
    ];

    const filename = user.role === 'Admin' ? 'all_attendance_logs.csv' : 'my_attendance_logs.csv';
    exportToCSV(records, filename, headers);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Today's Clocking Actions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage your daily work shifts and log hours</p>
            </div>
            {/* Live Digital Clock */}
            <div className="flex items-center space-x-2.5 bg-zinc-900 text-zinc-100 px-4 py-2 rounded-lg border border-zinc-800 shadow-sm self-start sm:self-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold leading-none">Live Time</span>
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-emerald-400 mt-0.5">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
            </div>
          </div>
          
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
                  <span className="ml-4">Duration: <strong className="font-mono text-gray-800">{calculateDuration(todayRecord.checkIn, todayRecord.checkOut)}</strong></span>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {user.role === 'Admin' ? 'All Organization Logs' : 'My Log History'}
          </h2>
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
          >
            <span>📥</span> Export CSV
          </button>
        </div>

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
                  <th className="p-3 text-sm font-bold text-gray-700">Duration / Worked Hours</th>
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
                      {record.checkIn && !record.checkOut ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5"></span>
                          In Progress
                        </span>
                      ) : (
                        <span className="font-mono text-gray-800 font-medium">
                          {calculateDuration(record.checkIn, record.checkOut)}
                        </span>
                      )}
                    </td>
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
