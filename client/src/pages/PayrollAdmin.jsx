import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const PayrollAdmin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [payroll, setPayroll] = useState(null);
  
  // Form states
  const [baseSalary, setBaseSalary] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
          setError(data.message || 'Failed to retrieve employee directory');
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

  const handleEmployeeChange = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setPayroll(null);
    setError('');
    setSuccess('');

    if (!userId) return;

    setLoading(true);
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
        // Reset inputs if no payroll is recorded yet
        setBaseSalary(0);
        setAllowances(0);
        setDeductions(0);
        setError('No payroll structure initialized for this employee. Enter values below to create one.');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setError('');
    setSuccess('');
    setSubmitLoading(true);

    try {
      const response = await fetch(`${API_URL}/payroll/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          baseSalary: Number(baseSalary),
          allowances: Number(allowances),
          deductions: Number(deductions),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Salary details updated successfully!');
        setPayroll(data.payroll);
      } else {
        setError(data.message || 'Failed to update salary details');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const computedNetSalary = Number(baseSalary) + Number(allowances) - Number(deductions);

  if (loading && employees.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500 font-medium">Loading directories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Payroll</h1>
        <Link to="/admin-dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Admin Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 mb-6 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Select Employee */}
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Choose Staff</h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select Employee</label>
            <select
              value={selectedUserId}
              onChange={handleEmployeeChange}
              className="w-full p-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:border-gray-500"
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

        {/* Right Side: Setup Salary Fields */}
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
            Salary Setup Form
          </h2>

          {!selectedUserId ? (
            <p className="text-gray-500 italic text-sm">Select an employee from the dropdown list to manage earnings.</p>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Base Salary ($)</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
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
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Deductions ($)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 flex justify-between items-center mt-6">
                <div>
                  <span className="font-bold text-gray-800">Net Salary (Live Preview):</span>
                  <p className="text-xs text-gray-400 mt-0.5">Note: Recomputed securely on the server upon saving.</p>
                </div>
                <span className="font-bold text-gray-900 text-lg">
                  ${computedNetSalary.toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium cursor-pointer transition-colors disabled:bg-gray-400"
                >
                  {submitLoading ? 'Updating Database...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollAdmin;
