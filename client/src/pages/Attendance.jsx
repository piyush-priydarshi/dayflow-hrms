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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError('');

    try {
      const endpoint = user.role === 'Admin' ? 'all' : 'my';

      const response = await fetch(`${API_URL}/attendance/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRecords(data.attendance || []);
      } else {
        setError(data.message || 'Failed to fetch attendance records');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStatus = async () => {
    if (!user || !token || user.role === 'Admin') return;

    try {
      const response = await fetch(`${API_URL}/attendance/today`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTodayRecord(data.todayRecord);
      }
    } catch (err) {
      console.error('Error fetching today status:', err);
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
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Checked in successfully!');
        showToast('Checked in successfully!', 'success');
        setTodayRecord(data.attendance);
        fetchAttendance();
      } else {
        const errorMsg = data.message || 'Check-in failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Check-in error:', err);
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
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Checked out successfully!');
        showToast('Checked out successfully!', 'success');
        setTodayRecord(data.attendance);
        fetchAttendance();
      } else {
        const errorMsg = data.message || 'Check-out failed';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return '--:--';
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return '--';
    if (!checkOut) return 'In Progress';

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diffMs = end.getTime() - start.getTime();

    if (Number.isNaN(diffMs) || diffMs < 0) {
      return '--';
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) {
      return '0m';
    }

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const handleExportCSV = () => {
    if (!records || records.length === 0) {
      showToast('No attendance records to export', 'error');
      return;
    }

    const headers = [
      {
        label: 'Date',
        key: (record) => formatDate(record.date),
      },

      ...(user.role === 'Admin'
        ? [
            {
              label: 'Employee ID',
              key: (record) => record.user?.employeeId || 'N/A',
            },
            {
              label: 'Employee Name',
              key: (record) => record.user?.name || 'N/A',
            },
          ]
        : []),

      {
        label: 'Clock In',
        key: (record) => formatTime(record.checkIn),
      },
      {
        label: 'Clock Out',
        key: (record) => formatTime(record.checkOut),
      },
      {
        label: 'Duration / Worked Hours',
        key: (record) =>
          calculateDuration(record.checkIn, record.checkOut),
      },
      {
        label: 'Status',
        key: (record) => record.status || 'Present',
      },
    ];

    const filename =
      user.role === 'Admin'
        ? 'all_attendance_logs.csv'
        : 'my_attendance_logs.csv';

    exportToCSV(records, filename, headers);

    showToast('Attendance CSV exported successfully!', 'success');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Attendance Register
          </h1>

          <p className="text-xs text-zinc-400 mt-1">
            Daily clock-in check registers and log audits
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Employee Clocking Section */}
      {user.role === 'Employee' && (
        <div className="df-glass-card rounded-3xl p-6 md:p-8 border border-zinc-800 relative overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Clocking Information */}
            <div className="space-y-3">

              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>

                <h2 className="font-heading text-lg font-bold text-white">
                  Daily Clocking Actions
                </h2>
              </div>

              <p className="text-xs text-zinc-500">
                Manage your daily work shifts and log hours
              </p>

              {todayRecord ? (
                <div className="text-xs text-zinc-300 space-y-2">

                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold">
                      Today's Status:
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {todayRecord.status}
                    </span>
                  </div>

                  <div className="text-zinc-400">
                    Checked In:{' '}
                    <strong className="font-mono text-white">
                      {formatTime(todayRecord.checkIn)}
                    </strong>

                    {todayRecord.checkOut && (
                      <span className="ml-4">
                        Checked Out:{' '}
                        <strong className="font-mono text-white">
                          {formatTime(todayRecord.checkOut)}
                        </strong>
                      </span>
                    )}

                    <span className="ml-4">
                      Duration:{' '}
                      <strong className="font-mono text-white">
                        {calculateDuration(
                          todayRecord.checkIn,
                          todayRecord.checkOut
                        )}
                      </strong>
                    </span>
                  </div>

                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  You have not clocked in yet today.
                </p>
              )}

            </div>

            {/* Live Clock + Actions */}
            <div className="flex flex-col items-start md:items-end gap-4">

              {/* Live Digital Clock */}
              <div className="flex items-center space-x-2.5 bg-zinc-900 text-zinc-100 px-4 py-2 rounded-xl border border-zinc-800 shadow-sm">

                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>

                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold leading-none">
                    Live Time
                  </span>

                  <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-emerald-400 mt-0.5">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>

              </div>

              {/* Clock Buttons */}
              <div className="flex space-x-3">

                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading || !!todayRecord}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shadow-emerald-600/20"
                >
                  {actionLoading ? 'Clocking...' : 'Clock In'}
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={
                    actionLoading ||
                    !todayRecord ||
                    !!todayRecord.checkOut
                  }
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md shadow-amber-600/20"
                >
                  {actionLoading ? 'Clocking...' : 'Clock Out'}
                </button>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Attendance Logs */}
      <div className="df-glass-card rounded-2xl p-6 border border-zinc-800">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

          <div>
            <h2 className="font-heading text-lg font-bold text-white">
              {user.role === 'Admin'
                ? 'All Organization Logs'
                : 'My Log History'}
            </h2>

            <span className="text-xs text-zinc-500">
              {records.length} records logged
            </span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
          >
            <span>📥</span>
            Export CSV
          </button>

        </div>

        {loading ? (
          <p className="text-zinc-500 text-xs py-4 text-center">
            Loading attendance logs...
          </p>
        ) : records.length === 0 ? (
          <p className="text-zinc-500 text-xs italic py-4 text-center">
            No attendance records found.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">

              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">

                  <th className="pb-3 px-3">
                    Date
                  </th>

                  {user.role === 'Admin' && (
                    <>
                      <th className="pb-3 px-3">
                        Emp ID
                      </th>

                      <th className="pb-3 px-3">
                        Employee Name
                      </th>
                    </>
                  )}

                  <th className="pb-3 px-3 font-mono">
                    Clock In
                  </th>

                  <th className="pb-3 px-3 font-mono">
                    Clock Out
                  </th>

                  <th className="pb-3 px-3">
                    Duration
                  </th>

                  <th className="pb-3 px-3 text-right">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">

                {records.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-zinc-800/30 transition-colors"
                  >

                    {/* Date */}
                    <td className="py-3 px-3 font-medium text-zinc-200">
                      {formatDate(record.date)}
                    </td>

                    {/* Admin Employee Information */}
                    {user.role === 'Admin' && (
                      <>
                        <td className="py-3 px-3 font-mono text-zinc-400">
                          {record.user?.employeeId || 'N/A'}
                        </td>

                        <td className="py-3 px-3 font-bold text-white">
                          {record.user?.name || 'N/A'}
                        </td>
                      </>
                    )}

                    {/* Clock In */}
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {formatTime(record.checkIn)}
                    </td>

                    {/* Clock Out */}
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {formatTime(record.checkOut)}
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      {calculateDuration(
                        record.checkIn,
                        record.checkOut
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-right">

                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          record.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : record.status === 'Absent'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {record.status || 'Present'}
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