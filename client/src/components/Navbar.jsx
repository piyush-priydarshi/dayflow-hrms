import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold tracking-wide">
          Dayflow HRMS
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to={`/profile/${user._id}`} className="text-gray-300 hover:text-white transition-colors">
            My Profile
          </Link>
          <Link to="/attendance" className="text-gray-300 hover:text-white transition-colors">
            Attendance
          </Link>
          <Link to="/leave" className="text-gray-300 hover:text-white transition-colors">
            Leaves
          </Link>
          <Link to="/payroll" className="text-gray-300 hover:text-white transition-colors">
            Payroll
          </Link>
          <Link to="/ai-assistant" className="text-gray-300 hover:text-white transition-colors">
            AI Assistant
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm bg-gray-700 px-3 py-1 rounded">
            {user.name} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
