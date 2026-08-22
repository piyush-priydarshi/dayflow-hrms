import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import DatePicker from '../components/DatePicker';

const Leave = () => {
  const { user, token } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [leaveType, setLeaveType] = useState('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = user.role === 'Admin' ? 'all' : 'my';
      const response = await fetch(`${API_URL}/leaves/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setLeaves(data.leaves || []);
      } else {
        setError(data.message || 'Failed to fetch leave records');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchLeaves();
    }
  }, [user, token]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('Please provide start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveType, startDate, endDate, remarks }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Leave request submitted successfully!');
        setStartDate('');
        setEndDate('');
        setRemarks('');
        fetchLeaves();
      } else {
        setError(data.message || 'Failed to submit leave request');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(`Request has been ${status.toLowerCase()}!`);
        fetchLeaves();
      } else {
        setError(data.message || 'Failed to update request');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">Leave Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Application requests, balance metrics, and approval queue</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {user.role === 'Employee' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Apply Form Card */}
          <div className="df-glass-card rounded-3xl p-6 border-zinc-800 h-fit">
            <h2 className="font-heading text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800">
              Request Time Off
            </h2>
            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full df-input cursor-pointer"
                >
                  <option value="Paid" className="bg-zinc-900 text-white">Paid Leave</option>
                  <option value="Sick" className="bg-zinc-900 text-white">Sick Leave</option>
                  <option value="Unpaid" className="bg-zinc-900 text-white">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Start Date</label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    if (endDate && date > endDate) {
                      setEndDate('');
                    }
                  }}
                  placeholder="Select start date"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">End Date</label>
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholder="Select end date"
                  minDate={startDate}
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Reason / Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full df-input h-20"
                  placeholder="State reason for absence..."
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                {formLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* History list */}
          <div className="df-glass-card rounded-3xl p-6 border-zinc-800 md:col-span-2">
            <h2 className="font-heading text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800">
              My Leave Applications
            </h2>
            {loading ? (
              <p className="text-zinc-500 text-xs py-4 text-center">Loading applications...</p>
            ) : leaves.length === 0 ? (
              <p className="text-zinc-500 text-xs italic py-4 text-center">No leave applications recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">Type</th>
                      <th className="pb-3 px-3">Start Date</th>
                      <th className="pb-3 px-3">End Date</th>
                      <th className="pb-3 px-3">Remarks</th>
                      <th className="pb-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {leaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{leave.leaveType}</td>
                        <td className="py-3 px-3 text-zinc-300">{formatDate(leave.startDate)}</td>
                        <td className="py-3 px-3 text-zinc-300">{formatDate(leave.endDate)}</td>
                        <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{leave.remarks || '--'}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {leave.status}
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
      ) : (
        /* ADMIN VIEW */
        <div className="df-glass-card rounded-3xl p-6 border-zinc-800">
          <h2 className="font-heading text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-800">
            Pending & Reviewed Requests
          </h2>
          {loading ? (
            <p className="text-zinc-500 text-xs py-4 text-center">Loading requests...</p>
          ) : leaves.length === 0 ? (
            <p className="text-zinc-500 text-xs italic py-4 text-center">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Emp ID</th>
                    <th className="pb-3 px-3">Employee Name</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Duration</th>
                    <th className="pb-3 px-3">Remarks</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-zinc-400">{leave.user?.employeeId || 'N/A'}</td>
                      <td className="py-3 px-3 font-bold text-white">{leave.user?.name || 'N/A'}</td>
                      <td className="py-3 px-3 text-zinc-300">{leave.leaveType}</td>
                      <td className="py-3 px-3 text-zinc-300">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </td>
                      <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{leave.remarks || '--'}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          leave.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          leave.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leave;
