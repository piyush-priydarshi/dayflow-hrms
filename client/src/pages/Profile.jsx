import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [newDocumentUrl, setNewDocumentUrl] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/profiles/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data.profile);
          // Pre-populate forms
          setName(data.profile.user?.name || '');
          setPhone(data.profile.phone || '');
          setAddress(data.profile.address || '');
          setDepartment(data.profile.department || '');
          setDesignation(data.profile.designation || '');
          setProfilePicture(data.profile.profilePicture || '');
          setDocuments(data.profile.documents || []);
          if (data.profile.joiningDate) {
            setJoiningDate(new Date(data.profile.joiningDate).toISOString().split('T')[0]);
          }
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchProfile();
    }
  }, [userId, token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const bodyData = user.role === 'Admin' 
      ? { name, phone, address, department, designation, joiningDate, profilePicture, documents }
      : { phone, address, documents };

    try {
      const response = await fetch(`${API_URL}/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setSuccessMsg('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocumentUrl.trim()) return;
    const updatedDocs = [...documents, newDocumentUrl];
    setDocuments(updatedDocs);
    setNewDocumentUrl('');
    
    // Save document addition immediately
    saveDocuments(updatedDocs);
  };

  const handleRemoveDocument = (indexToRemove) => {
    const updatedDocs = documents.filter((_, idx) => idx !== indexToRemove);
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);
  };

  const saveDocuments = async (updatedDocs) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_URL}/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ documents: updatedDocs }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setSuccessMsg('Documents updated successfully!');
      } else {
        setError(data.message || 'Failed to update documents');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6"><p className="text-gray-500">Loading profile...</p></div>;
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link to="/dashboard" className="text-blue-600 underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const isAdmin = user.role === 'Admin';
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
        <Link to="/dashboard" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium">
          Back to Dashboard
        </Link>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 mb-6 text-sm">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded border border-red-200 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 border border-gray-300 overflow-hidden flex items-center justify-center">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.user?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400 font-bold">
                {profile.user?.name ? profile.user.name.charAt(0).toUpperCase() : '?' }
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{profile.user?.name || 'N/A'}</h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{profile.designation || 'Staff'}</p>
          <p className="text-xs text-gray-400 mt-1">{profile.department || 'General'} Department</p>
          
          <div className="mt-6 text-left border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Employee ID:</strong> {profile.user?.employeeId || 'N/A'}</p>
            <p><strong>Email:</strong> {profile.user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {profile.user?.role || 'Employee'}</p>
            <p><strong>Joined:</strong> {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        {/* Edit Form / Details view */}
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-2">
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
            <h3 className="text-lg font-bold text-gray-800">Profile Details</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm cursor-pointer"
              >
                Edit Fields
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 text-sm">
              {isAdmin && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Full Name (Admin Only)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Department (Admin Only)</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Designation (Admin Only)</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Joining Date (Admin Only)</label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Profile Photo URL (Admin Only)</label>
                    <input
                      type="text"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </>
              )}

              {/* Both Admin and Employee can edit contact details */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-1">Home Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded h-20"
                  placeholder="Street, City, Country"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset fields to current profile settings
                    setName(profile.user?.name || '');
                    setPhone(profile.phone || '');
                    setAddress(profile.address || '');
                    setDepartment(profile.department || '');
                    setDesignation(profile.designation || '');
                    setProfilePicture(profile.profilePicture || '');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Phone Number</p>
                  <p className="mt-1 font-medium">{profile.phone || 'No phone recorded'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Home Address</p>
                  <p className="mt-1 font-medium">{profile.address || 'No address recorded'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Department</p>
                  <p className="mt-1 font-medium">{profile.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Job Designation</p>
                  <p className="mt-1 font-medium">{profile.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Joining Date</p>
                  <p className="mt-1 font-medium">
                    {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Profile Photo URL</p>
                  <p className="mt-1 font-mono text-xs overflow-x-auto whitespace-nowrap">
                    {profile.profilePicture || 'No URL specified'}
                  </p>
                </div>
              </div>

              {/* Documents Management Section */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-base font-bold text-gray-800 mb-2">Verification Documents</h4>
                
                <form onSubmit={handleAddDocument} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newDocumentUrl}
                    onChange={(e) => setNewDocumentUrl(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs"
                    placeholder="Add Document URL (e.g., Passport, Contract URL)"
                  />
                  <button type="submit" className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded cursor-pointer">
                    Add
                  </button>
                </form>

                {documents.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No files or documents attached.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex justify-between items-center text-xs bg-gray-50 border border-gray-200 p-2 rounded">
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium truncate max-w-md">
                          {doc}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="text-red-600 hover:text-red-800 font-bold px-1"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
