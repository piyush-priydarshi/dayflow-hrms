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
      <div className="container mx-auto p-6">
        <p className="text-gray-500 font-medium">Loading payroll file...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Salary Slip</h1>
        <Link to="/dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          Monthly Earnings Summary
        </h2>

        {!payroll || payroll.baseSalary === 0 ? (
          <p className="text-gray-500 text-sm italic">Payroll files have not been configured by HR yet.</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Base Salary</span>
              <span className="font-semibold text-gray-800">${payroll.baseSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-green-600">+ Allowances</span>
              <span className="font-semibold text-green-700">${payroll.allowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium text-red-600">- Deductions</span>
              <span className="font-semibold text-red-700">${payroll.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-dashed border-gray-300 bg-gray-50 px-3 rounded mt-2">
              <span className="font-bold text-gray-800 text-base">Net Earnings</span>
              <span className="font-bold text-gray-900 text-base">${payroll.netSalary.toLocaleString()}</span>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={handleDownloadPayslip}
                disabled={downloading}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors cursor-pointer disabled:bg-gray-400"
              >
                {downloading ? 'Generating PDF...' : 'Download PDF Payslip'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;
