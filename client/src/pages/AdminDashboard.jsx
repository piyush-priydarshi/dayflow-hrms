import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    attendancePercent: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch summary metrics
        const summaryRes = await fetch(`${API_URL}/admin/summary`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const summaryData = await summaryRes.json();
        
        // Fetch employee list (profiles)
        const profilesRes = await fetch(`${API_URL}/profiles`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const profilesData = await profilesRes.json();

        if (summaryRes.ok && profilesRes.ok) {
          setSummary(summaryData.summary || { totalEmployees: 0, pendingLeaves: 0, attendancePercent: 0 });
          setEmployees(profilesData.profiles || []);
        } else {
          setError(summaryData.message || profilesData.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError('Error connecting to server. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500 font-medium">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex space-x-3">
          <Link to="/employees" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
            Full Employee List
          </Link>
          <Link to="/payroll-admin" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-medium">
            Manage Payroll
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Employees</h3>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{summary.totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending Leaves</h3>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{summary.pendingLeaves}</p>
        </div>
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Today's Attendance %</h3>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{summary.attendancePercent}%</p>
        </div>
      </div>

      {/* Employee List Section */}
      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Employee Overview</h2>
        {employees.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No employees registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 font-bold text-gray-700">Emp ID</th>
                  <th className="p-3 font-bold text-gray-700">Name</th>
                  <th className="p-3 font-bold text-gray-700">Role</th>
                  <th className="p-3 font-bold text-gray-700">Department</th>
                  <th className="p-3 font-bold text-gray-700">Designation</th>
                  <th className="p-3 font-bold text-gray-700">Action Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-gray-800 font-semibold">{emp.user?.employeeId || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{emp.user?.name || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{emp.user?.role || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{emp.department}</td>
                    <td className="p-3 text-gray-800">{emp.designation}</td>
                    <td className="p-3">
                      <Link
                        to={`/profile/${emp.user?._id}`}
                        className="inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded"
                      >
                        Detail View
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
  );
};

export default AdminDashboard;
