import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

import { useToast } from '../context/ToastContext';
import DatePicker from '../components/DatePicker';


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

    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

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
    const updatedDocs = [...documents, newDocumentUrl.trim()];
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
      <div className="container mx-auto px-6 py-12 text-center">
        <p className="text-zinc-500 text-sm">Loading personnel record...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-rose-500/10 text-rose-400 p-6 rounded-3xl border border-rose-500/20 text-xs">
          <p className="font-bold text-sm mb-1">Error</p>
          <p>{error}</p>
        </div>
        <Link to="/dashboard" className="text-amber-400 hover:underline mt-4 inline-block text-xs font-semibold">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === userId;
  const isAdmin = user?.role === 'Admin';
  const canEdit = isOwner || isAdmin;

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">Personnel Profile</h1>
          <p className="text-xs text-zinc-400 mt-1">Master employment and contact record</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Edit Fields
            </button>
          )}
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Summary Card */}
        <div className="df-glass-card rounded-3xl p-6 flex flex-col justify-between text-center border-zinc-800">
          <div>
            {/* Avatar Photo */}
            <div className="w-32 h-32 rounded-3xl mx-auto mb-4 bg-zinc-800 border border-zinc-700/80 overflow-hidden flex items-center justify-center shadow-lg relative group">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="font-heading text-4xl text-amber-400 font-bold">
                  {profile.user?.name ? profile.user.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>

            <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
              {profile.user?.name || 'N/A'}
            </h2>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mt-1">
              {profile.designation || 'Staff'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {profile.department || 'General'} Department
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {profile.user?.role || 'Employee'}
            </div>
          </div>

          <div className="mt-6 text-left border-t border-zinc-800 pt-4 space-y-3 text-xs text-zinc-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Employee ID</span>
              <span className="font-mono text-zinc-200 font-semibold">{profile.user?.employeeId || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Work Email</span>
              <span className="text-zinc-200 break-all">{profile.user?.email || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Joining Date</span>
              <span className="text-zinc-200">
                {profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form OR Detailed Cards */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="df-glass-card rounded-3xl p-6 md:p-8 border-zinc-800">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-800">
                <h3 className="font-heading text-lg font-bold text-white">Edit Profile Record</h3>
                <span className="text-xs text-zinc-500">
                  {isAdmin ? 'Admin Mode (All fields editable)' : 'Employee Mode (Contact & photo)'}
                </span>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5 text-xs">
                {isAdmin && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1.5">
                        Full Name (Admin Only)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full df-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1.5">
                        Department (Admin Only)
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full df-input"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1.5">
                        Designation (Admin Only)
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full df-input"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-semibold mb-1.5">
                        Joining Date (Admin Only)
                      </label>
                      <DatePicker
                        value={joiningDate}
                        onChange={(date) => setJoiningDate(date)}
                        placeholder="Select joining date"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full df-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1.5">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full df-input"
                      placeholder="Street, City, State"
                    />
                  </div>
                </div>

                {/* Profile Photo Upload Section */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <label className="block text-zinc-300 font-semibold">
                    Profile Photo Upload
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Choose Image File from Device:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Or Paste Image URL:</label>
                      <input
                        type="text"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        className="w-full df-input"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  {profilePicture && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xs text-zinc-400">Preview:</span>
                      <img
                        src={profilePicture}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setProfilePicture('')}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
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
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card 1: Contact Details */}
              <div className="df-glass-card rounded-3xl p-6 border-zinc-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <h3 className="font-heading text-base font-bold text-white">Contact & Location</h3>
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Edit →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Phone Number</span>
                    <span className="text-zinc-200 font-medium mt-1 block">{profile.phone || 'No phone recorded'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Residential Address</span>
                    <span className="text-zinc-200 font-medium mt-1 block">{profile.address || 'No address recorded'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Read-Only Salary Breakdown from Payroll Schema */}
              <div className="df-glass-card rounded-3xl p-6 border-zinc-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">Salary Structure</h3>
                    <p className="text-[11px] text-zinc-500">Live read-only pull from Payroll ledger</p>
                  </div>
                  <Link
                    to="/payroll"
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    Payslip Portal →
                  </Link>
                </div>

                {payroll ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Base Salary</span>
                      <span className="font-heading text-base font-bold text-white mt-1 block">
                        ${payroll.baseSalary?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950/70 border border-emerald-500/20">
                      <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider block">Allowances</span>
                      <span className="font-heading text-base font-bold text-emerald-400 mt-1 block">
                        +${payroll.allowances?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-950/70 border border-rose-500/20">
                      <span className="text-rose-400 text-[10px] font-bold uppercase tracking-wider block">Deductions</span>
                      <span className="font-heading text-base font-bold text-rose-400 mt-1 block">
                        -${payroll.deductions?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                      <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider block">Net Earnings</span>
                      <span className="font-heading text-base font-black text-amber-300 mt-1 block">
                        ${payroll.netSalary?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No payroll configuration mapped for this employee.</p>
                )}
              </div>

              {/* Card 3: Verification Documents */}
              <div className="df-glass-card rounded-3xl p-6 border-zinc-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
                  <h3 className="font-heading text-base font-bold text-white">Verification Documents</h3>
                  <span className="text-xs text-zinc-500">{documents.length} files attached</span>
                </div>

                <form onSubmit={handleAddDocument} className="flex gap-2 text-xs">
                  <input
                    type="url"
                    value={newDocumentUrl}
                    onChange={(e) => setNewDocumentUrl(e.target.value)}
                    placeholder="Attach document URL (e.g. Identity proof, Passport, Contract link)..."
                    className="flex-1 df-input"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl border border-zinc-700 cursor-pointer transition-colors"
                  >
                    Add Document
                  </button>
                </form>

                {documents.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">No documents attached.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {documents.map((doc, idx) => (
                      <li key={idx} className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-2 truncate max-w-md">
                          <span className="text-zinc-400">📄</span>
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline font-mono truncate"
                          >
                            {doc}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          className="text-rose-400 hover:text-rose-300 font-bold text-xs px-2 py-1 cursor-pointer"
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
