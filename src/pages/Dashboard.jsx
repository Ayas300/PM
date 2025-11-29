import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ website: '', username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const encryptionKey = sessionStorage.getItem('encryptionKey');

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!encryptionKey) {
      alert('Session expired or key missing. Please login again.');
      handleLogout();
      return;
    }
    fetchEntries();
  }, [token, navigate, encryptionKey]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/entries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('encryptionKey');
    navigate('/login');
  };

  const handleChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(newEntry.password, encryptionKey).toString();
      
      await axios.post('/api/entries', {
        siteName: newEntry.website, // Backend expects siteName
        siteUrl: newEntry.website,
        login: newEntry.username,
        encryptedPassword: encryptedPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Password saved successfully!');
      setNewEntry({ website: '', username: '', password: '' });
      fetchEntries();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('Error saving password');
    }
  };

  const handleShowPasswordRequest = async (entryId) => {
    try {
      await axios.post('/api/auth/show-password/request', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEntryId(entryId);
      setShowOtpModal(true);
      setOtp('');
      setDecryptedPassword('');
      setMessage('OTP sent to your email.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error requesting OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/show-password/verify', {
        otp,
        entryId: selectedEntryId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const encryptedPassword = res.data.encryptedPassword;
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalPassword) {
        throw new Error('Decryption failed. Wrong key?');
      }

      setDecryptedPassword(originalPassword);
      setMessage('');
    } catch (error) {
      console.error(error);
      alert('Invalid OTP or Decryption Failed');
    }
  };

  const closeModal = () => {
    setShowOtpModal(false);
    setDecryptedPassword('');
    setSelectedEntryId(null);
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>My Vault</h2>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      <div className="dashboard-card">
        <h3>Add New Password</h3>
        {message && <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="website"
              placeholder="Website Name / URL"
              value={newEntry.website}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username / Email"
              value={newEntry.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={newEntry.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Password</button>
        </form>
      </div>

      <div className="dashboard-card">
        <h3>Saved Passwords</h3>
        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No passwords saved yet.</p>
        ) : (
          <ul className="password-list">
            {entries.map((entry) => (
              <li key={entry._id} className="password-item">
                <div className="password-details">
                  <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>{entry.siteName}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{entry.login}</div>
                </div>
                <button onClick={() => handleShowPasswordRequest(entry._id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Show
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Security Check</h3>
            {!decryptedPassword ? (
              <>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                  Enter the OTP sent to your email to reveal this password.
                </p>
                <form onSubmit={handleVerifyOtp}>
                  <div className="form-group">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      autoFocus
                      style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Verify</button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Password:</p>
                <div className="decrypted-password">{decryptedPassword}</div>
                <button onClick={closeModal} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
