import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'Admin') {
      const fetchProfiles = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/profiles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setProfiles(data.profiles || []);
          } else {
            setError(data.message || 'Failed to fetch profiles');
          }
        } catch (err) {
          setError('Error connecting to server');
        } finally {
          setLoading(false);
        }
      };
      fetchProfiles();
    }
  }, [user, token]);

  if (!user) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded border border-gray-300 mb-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Dayflow, {user.name}!</h1>
        <p className="text-gray-600 mt-2">
          Logged in as: <span className="font-semibold text-gray-800">{user.role}</span> | Employee ID:{' '}
          <span className="font-semibold text-gray-800">{user.employeeId}</span>
        </p>
      </div>

      {user.role === 'Admin' ? (
        // ADMIN DASHBOARD
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Attendance Card */}
              <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Attendance Records</h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    Monitor daily check-ins, check-outs, and logs for all employees.
                  </p>
                </div>
                <Link
                  to="/attendance"
                  className="inline-block text-center py-2 px-4 bg-gray-850 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                >
                  View Attendance
                </Link>
              </div>

              {/* Leave Approvals Card */}
              <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Leave Approvals</h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    Review incoming leave requests and approve or reject them.
                  </p>
                </div>
                <Link
                  to="/leave"
                  className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Approve Leaves
                </Link>
              </div>

              {/* Payroll Configuration Card */}
              <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Payroll Management</h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4">
                    Update base salary, allowances, and calculate net employee earnings.
                  </p>
                </div>
                <Link
                  to="/payroll"
                  className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Configure Payroll
                </Link>
              </div>
            </div>
          </div>

          {/* Employee Directory Section */}
          <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Directory</h2>
            {loading ? (
              <p className="text-gray-500">Loading directory...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : profiles.length === 0 ? (
              <p className="text-gray-500">No employees registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="p-3 text-sm font-bold text-gray-700">Emp ID</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Name</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Email</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Department</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Designation</th>
                      <th className="p-3 text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-800 font-medium">
                          {profile.user?.employeeId || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-gray-800">{profile.user?.name || 'N/A'}</td>
                        <td className="p-3 text-sm text-gray-800">{profile.user?.email || 'N/A'}</td>
                        <td className="p-3 text-sm text-gray-800">{profile.department}</td>
                        <td className="p-3 text-sm text-gray-800">{profile.designation}</td>
                        <td className="p-3 text-sm space-x-2">
                          <Link
                            to={`/profile/${profile.user?._id}`}
                            className="inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded"
                          >
                            Edit Profile
                          </Link>
                          <Link
                            to={`/payroll`}
                            className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded border border-gray-300"
                          >
                            Payroll
                          </Link>
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
        // EMPLOYEE DASHBOARD
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">My Employee Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* My Profile */}
            <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">My Profile</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  View and update your personal and contact details.
                </p>
              </div>
              <Link
                to={`/profile/${user._id}`}
                className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                Go to Profile
              </Link>
            </div>

            {/* Attendance */}
            <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">My Attendance</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  Check-in / check-out daily and view your working logs.
                </p>
              </div>
              <Link
                to="/attendance"
                className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                Log Attendance
              </Link>
            </div>

            {/* Leave */}
            <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Leave Requests</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  Submit a leave application and review your approval status.
                </p>
              </div>
              <Link
                to="/leave"
                className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                Request Leave
              </Link>
            </div>

            {/* Payroll */}
            <div className="bg-white p-6 rounded border border-gray-300 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">My Salary Slip</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  Read-only access to your structured monthly payroll allowances.
                </p>
              </div>
              <Link
                to="/payroll"
                className="inline-block text-center py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                View Payroll
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
