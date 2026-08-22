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
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-zinc-500 text-sm">Loading payroll configuration console...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">Manage Employee Payroll</h1>
          <p className="text-xs text-zinc-400 mt-1">Configure compensation rates, benefits, and deductions</p>
        </div>
        <Link
          to="/admin-dashboard"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Admin Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 text-xs">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Select Employee */}
        <div className="df-glass-card rounded-3xl p-6 border-zinc-800 h-fit space-y-3">
          <h2 className="font-heading text-lg font-bold text-white mb-2">Select Staff</h2>
          <label className="block text-xs font-semibold text-zinc-400">Employee Account</label>
          <select
            value={selectedUserId}
            onChange={handleEmployeeChange}
            className="w-full df-input cursor-pointer"
          >
            <option value="" className="bg-zinc-900 text-white">-- Choose Employee --</option>
            {employees.map((emp) => (
              <option key={emp.user?._id} value={emp.user?._id} className="bg-zinc-900 text-white">
                {emp.user?.name} ({emp.user?.employeeId})
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Setup Salary Fields */}
        <div className="df-glass-card rounded-3xl p-8 border-zinc-800 lg:col-span-2 space-y-6">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="font-heading text-lg font-bold text-white">
              Compensation Setup
            </h2>
            <p className="text-[11px] text-zinc-500">Define base monthly rate, allowance packages, and tax deductions</p>
          </div>

          {!selectedUserId ? (
            <p className="text-zinc-500 italic text-xs py-6 text-center">Select an employee from the dropdown list on the left to configure payroll.</p>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Base Salary ($)</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full df-input"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Allowances ($)</label>
                  <input
                    type="number"
                    value={allowances}
                    onChange={(e) => setAllowances(Number(e.target.value))}
                    className="w-full df-input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Deductions ($)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full df-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex justify-between items-center mt-6">
                <div>
                  <span className="font-bold text-zinc-200 text-xs block">Computed Net Monthly Salary:</span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Formula: Base Salary + Allowances - Deductions</p>
                </div>
                <span className="font-heading text-2xl font-black text-amber-400">
                  ${computedNetSalary.toLocaleString()}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-md disabled:opacity-40"
                >
                  {submitLoading ? 'Updating Ledger...' : 'Save Compensation Setup'}
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
