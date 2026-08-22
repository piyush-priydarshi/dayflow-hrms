import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Payroll = () => {
  const { user, token } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin Payroll Configuration States
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [baseSalary, setBaseSalary] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch logged in employee's own payroll
  const fetchMyPayroll = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/payroll/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPayroll(data.payroll);
      } else {
        setError(data.message || 'Failed to retrieve payroll information');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Admin fetches list of employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.profiles || []);
      }
    } catch (err) {
      console.error('Error fetching employees list', err);
    }
  };

  // Admin fetches selected employee's payroll
  const fetchEmployeePayroll = async (userId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/payroll/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPayroll(data.payroll);
        setBaseSalary(data.payroll.baseSalary || 0);
        setAllowances(data.payroll.allowances || 0);
        setDeductions(data.payroll.deductions || 0);
      } else {
        // If not found, reset form to empty defaults for creation
        setPayroll(null);
        setBaseSalary(0);
        setAllowances(0);
        setDeductions(0);
        setError('No payroll record found. Enter values to configure a new record.');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      if (user.role === 'Employee') {
        fetchMyPayroll();
      } else {
        fetchEmployees();
        setLoading(false);
      }
    }
  }, [user, token]);

  const handleEmployeeChange = (e) => {
    const val = e.target.value;
    setSelectedEmployeeId(val);
    if (val) {
      fetchEmployeePayroll(val);
    } else {
      setPayroll(null);
    }
  };

  const handleUpdatePayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    setError('');
    setSuccess('');
    setSubmitLoading(true);

    try {
      const response = await fetch(`${API_URL}/payroll/${selectedEmployeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ baseSalary, allowances, deductions }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Payroll settings updated successfully!');
        setPayroll(data.payroll);
      } else {
        setError(data.message || 'Failed to update payroll details');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setSubmitLoading(false);
    }
  };

  const netCalculatedSalary = Number(baseSalary) + Number(allowances) - Number(deductions);

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payroll Structure</h1>
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
        // EMPLOYEE PORTAL - READ-ONLY VIEW
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
            My Salary Slip Components
          </h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading payroll information...</p>
          ) : !payroll ? (
            <p className="text-gray-500 text-sm italic">Payroll information has not been configured yet.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-150">
                <span className="text-gray-600 font-medium">Base Salary</span>
                <span className="font-semibold text-gray-800">${payroll.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150">
                <span className="text-gray-600 font-medium font-medium text-green-600">+ Allowances</span>
                <span className="font-semibold text-green-700">${payroll.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150">
                <span className="text-gray-600 font-medium text-red-600">- Deductions</span>
                <span className="font-semibold text-red-700">${payroll.deductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-dashed border-gray-400 bg-gray-50 px-3 rounded mt-2">
                <span className="font-bold text-gray-800 text-base">Net Earnings</span>
                <span className="font-bold text-gray-900 text-base">${payroll.netSalary.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ADMIN PORTAL - CONFIGURATION FORM
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Selector Left Side */}
          <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Choose Staff</h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Select Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.user?._id} value={emp.user?._id}>
                    {emp.user?.name} ({emp.user?.employeeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Configuration Form Right Side */}
          <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-2">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
              Salary Configuration
            </h2>

            {!selectedEmployeeId ? (
              <p className="text-gray-500 italic text-sm">Please select an employee on the left to configure payroll.</p>
            ) : loading ? (
              <p className="text-gray-500 text-sm">Loading current configurations...</p>
            ) : (
              <form onSubmit={handleUpdatePayroll} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Base Salary ($)</label>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Allowances ($)</label>
                    <input
                      type="number"
                      value={allowances}
                      onChange={(e) => setAllowances(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Deductions ($)</label>
                    <input
                      type="number"
                      value={deductions}
                      onChange={(e) => setDeductions(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded"
                      min="0"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center mt-6">
                  <div>
                    <span className="font-bold text-gray-800">Calculated Net Earnings:</span>
                    <p className="text-xs text-gray-500 mt-0.5">Formula: Base Salary + Allowances - Deductions</p>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    ${netCalculatedSalary.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium cursor-pointer"
                  >
                    {submitLoading ? 'Saving Settings...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
