import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCSV } from '../utils/exportToCSV';

const Leave = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
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
          'Authorization': `Bearer ${token}`,
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
      const msg = 'Please provide start and end dates';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      const msg = 'Start date cannot be after end date';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ leaveType, startDate, endDate, remarks }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Leave request submitted successfully!');
        showToast('Leave request submitted successfully!', 'success');
        // Reset form
        setStartDate('');
        setEndDate('');
        setRemarks('');
        fetchLeaves(); // Refresh list
      } else {
        const errorMsg = data.message || 'Failed to submit leave request';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok) {
        const msg = `Request has been ${status.toLowerCase()}!`;
        setSuccess(msg);
        showToast(msg, 'success');
        fetchLeaves(); // Refresh list
      } else {
        const errorMsg = data.message || 'Failed to update request';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleExportCSV = () => {
    if (!leaves || leaves.length === 0) return;

    const headers = [
      ...(user.role === 'Admin'
        ? [
            { label: 'Employee ID', key: (l) => l.user?.employeeId || 'N/A' },
            { label: 'Employee Name', key: (l) => l.user?.name || 'N/A' },
          ]
        : []),
      { label: 'Leave Type', key: (l) => l.leaveType || '' },
      { label: 'Start Date', key: (l) => formatDate(l.startDate) },
      { label: 'End Date', key: (l) => formatDate(l.endDate) },
      { label: 'Remarks', key: (l) => l.remarks || '' },
      { label: 'Status', key: (l) => l.status || 'Pending' },
    ];

    const filename = user.role === 'Admin' ? 'all_leave_requests.csv' : 'my_leave_history.csv';
    exportToCSV(leaves, filename, headers);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
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

      {user.role === 'Employee' ? (
        // EMPLOYEE VIEW (Form + Personal Leave Listing)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Apply form */}
          <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-1 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Apply for Leave</h2>
            
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500 bg-white"
                >
                  <option value="Paid">Paid Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks / Reason</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-500"
                  placeholder="Optional details..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors cursor-pointer"
              >
                {formLoading ? 'Submitting...' : 'Apply Request'}
              </button>
            </form>
          </div>

          {/* History list */}
          <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">My Leave History</h2>
              <button
                onClick={handleExportCSV}
                disabled={leaves.length === 0}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
              >
                <span>📥</span> Export CSV
              </button>
            </div>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading logs...</p>
            ) : leaves.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No leave applications found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="p-3 text-gray-700 font-bold">Leave Type</th>
                      <th className="p-3 text-gray-700 font-bold">Start Date</th>
                      <th className="p-3 text-gray-700 font-bold">End Date</th>
                      <th className="p-3 text-gray-700 font-bold">Remarks</th>
                      <th className="p-3 text-gray-700 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800 font-medium">{leave.leaveType}</td>
                        <td className="p-3 text-gray-800">{formatDate(leave.startDate)}</td>
                        <td className="p-3 text-gray-800">{formatDate(leave.endDate)}</td>
                        <td className="p-3 text-gray-800 max-w-xs truncate">{leave.remarks || '--'}</td>
                        <td className="p-3">
                          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${
                            leave.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
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
        // ADMIN VIEW (Approvals Listing)
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800">Pending and Past Approvals</h2>
            <button
              onClick={handleExportCSV}
              disabled={leaves.length === 0}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm self-start sm:self-auto"
            >
              <span>📥</span> Export CSV
            </button>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading leave requests...</p>
          ) : leaves.length === 0 ? (
            <p className="text-gray-500 italic">No leave requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="p-3 text-gray-700 font-bold">Emp ID</th>
                    <th className="p-3 text-gray-700 font-bold">Employee</th>
                    <th className="p-3 text-gray-700 font-bold">Type</th>
                    <th className="p-3 text-gray-700 font-bold">Duration</th>
                    <th className="p-3 text-gray-700 font-bold">Remarks</th>
                    <th className="p-3 text-gray-700 font-bold">Status</th>
                    <th className="p-3 text-gray-700 font-bold text-center">Action Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-gray-800">{leave.user?.employeeId || 'N/A'}</td>
                      <td className="p-3 text-gray-800 font-medium">{leave.user?.name || 'N/A'}</td>
                      <td className="p-3 text-gray-800">{leave.leaveType}</td>
                      <td className="p-3 text-gray-800">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </td>
                      <td className="p-3 text-gray-800 max-w-xs truncate">{leave.remarks || '--'}</td>
                      <td className="p-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${
                          leave.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-2">
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Reviewed</span>
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
