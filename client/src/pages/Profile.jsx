import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { userId } = useParams();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [payroll, setPayroll] = useState(null);
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
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data.profile);
          setPayroll(data.payroll);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image file type
    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Convert file to Base64 Data URL for immediate preview and persistent storage
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture(reader.result);
    };
    reader.onerror = () => {
      const msg = 'Failed to read image file';
      setError(msg);
      showToast(msg, 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const isAdmin = user?.role === 'Admin';
    const endpoint = isAdmin ? `${API_URL}/profiles/admin/${userId}` : `${API_URL}/profiles/${userId}`;
    const bodyData = isAdmin 
      ? { name, phone, address, department, designation, joiningDate, profilePicture, documents }
      : { phone, address, profilePicture, documents };

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        const msg = 'Profile updated successfully!';
        setSuccessMsg(msg);
        showToast(msg, 'success');
        setIsEditing(false);
      } else {
        const errorMsg = data.message || 'Failed to update profile';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
    }
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocumentUrl.trim()) return;
    const updatedDocs = [...documents, newDocumentUrl];
    setDocuments(updatedDocs);
    setNewDocumentUrl('');
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documents: updatedDocs }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        const msg = 'Documents updated successfully!';
        setSuccessMsg(msg);
        showToast(msg, 'success');
      } else {
        const errorMsg = data.message || 'Failed to update documents';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      setError('Error connecting to server');
      showToast('Error connecting to server', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link to="/dashboard" className="text-blue-600 underline mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === userId;
  const isAdmin = user?.role === 'Admin';
  const canEdit = isOwner || isAdmin;

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
                {profile.user?.name ? profile.user.name.charAt(0).toUpperCase() : '?'}
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
        <div className="bg-white p-6 rounded border border-gray-300 shadow-sm md:col-span-2 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
              <h3 className="text-lg font-bold text-gray-800">Profile Details</h3>
              {canEdit && !isEditing && (
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
                  </>
                )}

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

                {/* Profile Photo: Upload File or specify URL */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                  <label className="block text-gray-700 font-medium">Profile Photo</label>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Upload from Device:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-gray-700 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Or Image URL:</label>
                    <input
                      type="text"
                      value={profilePicture}
                      onChange={(e) => setProfilePicture(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-xs"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  {profilePicture && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-gray-500">Preview:</span>
                      <img
                        src={profilePicture}
                        alt="Preview"
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setProfilePicture('')}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
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
                    <p className="text-xs text-gray-500 font-medium uppercase">Profile Photo</p>
                    <p className="mt-1 text-xs">
                      {profile.profilePicture ? 'Custom photo attached' : 'No photo uploaded'}
                    </p>
                  </div>
                </div>

                {/* Read-Only Salary Structure */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-base font-bold text-gray-800 mb-2">Salary Structure (Read-Only)</h4>
                  {payroll ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                        <span className="text-gray-500 font-semibold block uppercase">Base</span>
                        <span className="font-bold text-gray-800 text-sm mt-0.5 block">${payroll.baseSalary?.toLocaleString() || 0}</span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                        <span className="text-green-600 font-semibold block uppercase">Allowances</span>
                        <span className="font-bold text-green-700 text-sm mt-0.5 block">+${payroll.allowances?.toLocaleString() || 0}</span>
                      </div>
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                        <span className="text-red-600 font-semibold block uppercase">Deductions</span>
                        <span className="font-bold text-red-700 text-sm mt-0.5 block">-${payroll.deductions?.toLocaleString() || 0}</span>
                      </div>
                      <div className="bg-gray-800 text-white p-2.5 rounded">
                        <span className="text-gray-300 font-semibold block uppercase">Net</span>
                        <span className="font-bold text-white text-sm mt-0.5 block">${payroll.netSalary?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No payroll record attached.</p>
                  )}
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
    </div>
  );
};

export default Profile;
