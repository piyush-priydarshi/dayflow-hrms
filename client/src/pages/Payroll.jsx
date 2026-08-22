import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Payroll = () => {
  const { user, token } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
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
          setError(data.message || 'Failed to retrieve payroll details');
        }
      } catch (err) {
        setError('Error connecting to server. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchMyPayroll();
    }
  }, [user, token]);

  const handleDownloadPayslip = async () => {
    if (!payroll) return;
    setDownloading(true);
    try {
      const response = await fetch(`${API_URL}/payroll/${user._id}/payslip`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payslip_${payroll.employeeId || user.employeeId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        alert('Failed to download payslip. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching payslip file');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-zinc-500 text-sm">Loading payroll statement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">Salary Statement</h1>
          <p className="text-xs text-zinc-400 mt-1">Monthly breakdown and PDF payslip generation</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs">
          {error}
        </div>
      )}

      <div className="df-glass-card rounded-3xl p-8 border-zinc-800 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div>
            <h2 className="font-heading text-lg font-bold text-white">Monthly Earnings Summary</h2>
            <p className="text-[11px] text-zinc-500">Employee ID: {user.employeeId}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active Ledger
          </span>
        </div>

        {!payroll || payroll.baseSalary === 0 ? (
          <p className="text-zinc-500 text-xs italic py-4 text-center">Payroll files have not been configured by HR yet.</p>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-zinc-400 font-medium">Base Salary</span>
              <span className="font-mono text-base font-bold text-white">${payroll.baseSalary.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-emerald-400 font-medium">+ Allowances (Bonus / Housing)</span>
              <span className="font-mono text-base font-bold text-emerald-400">+${payroll.allowances.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2.5 border-b border-zinc-850">
              <span className="text-rose-400 font-medium">- Deductions (Taxes / Medical)</span>
              <span className="font-mono text-base font-bold text-rose-400">-${payroll.deductions.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-600/20 border border-amber-500/30 mt-4">
              <div>
                <span className="text-amber-300 font-bold text-sm block">Net Monthly Earnings</span>
                <span className="text-[11px] text-amber-200/70">Calculated after deductions</span>
              </div>
              <span className="font-heading text-2xl font-black text-amber-300">
                ${payroll.netSalary.toLocaleString()}
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={handleDownloadPayslip}
                disabled={downloading}
                className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
              >
                {downloading ? 'Compiling PDF File...' : '📥 Download Official PDF Payslip'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
