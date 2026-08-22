import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const EmployeeList = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }

    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/profiles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setEmployees(data.profiles || []);
        } else {
          setError(data.message || 'Failed to retrieve employee list');
        }
      } catch (err) {
        setError('Error connecting to server. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500 font-medium">Loading Employee Directory...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 font-heading">Employee Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Review all active personnel and administrative files.</p>
        </div>
        <Link to="/admin-dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Admin Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        {employees.length === 0 ? (
          <p className="text-gray-550 italic text-sm">No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-150 border-b border-gray-300">
                  <th className="p-3 font-bold text-gray-700">Employee ID</th>
                  <th className="p-3 font-bold text-gray-700">Full Name</th>
                  <th className="p-3 font-bold text-gray-700">Email Address</th>
                  <th className="p-3 font-bold text-gray-700">Role</th>
                  <th className="p-3 font-bold text-gray-700">Department</th>
                  <th className="p-3 font-bold text-gray-700">Designation</th>
                  <th className="p-3 font-bold text-gray-700">Details</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-250 hover:bg-gray-55">
                    <td className="p-3 text-gray-800 font-semibold">{emp.user?.employeeId || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{emp.user?.name || 'N/A'}</td>
                    <td className="p-3 text-gray-800">{emp.user?.email || 'N/A'}</td>
                    <td className="p-3 text-gray-800">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                        emp.user?.role === 'Admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {emp.user?.role || 'Employee'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-800">{emp.department}</td>
                    <td className="p-3 text-gray-800">{emp.designation}</td>
                    <td className="p-3">
                      <Link
                        to={`/profile/${emp.user?._id}`}
                        className="inline-block px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-850 text-xs font-bold rounded"
                      >
                        Open File
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

export default EmployeeList;
