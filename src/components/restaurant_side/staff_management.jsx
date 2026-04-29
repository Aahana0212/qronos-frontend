import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffManagement.css';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([
    { id: 1, name: 'John Doe', email: 'admin@restaurant.com', phone: '9876543210', role: 'admin', joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'kitchen@restaurant.com', phone: '9876543211', role: 'kitchen', joined: '2024-02-20' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'kitchen' });
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setStaff(staff.map(s => s.id === editingId ? { ...s, ...formData, password: undefined } : s));
    } else {
      setStaff([...staff, { ...formData, id: Date.now(), joined: new Date().toISOString().split('T')[0], password: undefined }]);
    }
    setShowModal(false);
    setFormData({ name: '', email: '', phone: '', password: '', role: 'kitchen' });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({ name: member.name, email: member.email, phone: member.phone, password: '', role: member.role });
    setShowModal(true);
  };

  return (
    <div className="staff-container">
      <div className="staff-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <h1>Staff Management</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Staff</button>
      </div>

      <div className="staff-stats">
        <div className="stat-card"><h3>Total Staff</h3><p>{staff.length}</p></div>
        <div className="stat-card"><h3>Admins</h3><p>{staff.filter(s => s.role === 'admin').length}</p></div>
        <div className="stat-card"><h3>Kitchen Staff</h3><p>{staff.filter(s => s.role === 'kitchen').length}</p></div>
      </div>

      <div className="staff-table-container">
        <table className="staff-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td><span className={`role-badge ${member.role}`}>{member.role === 'admin' ? '👨‍💼 Admin' : '👨‍🍳 Kitchen'}</span></td>
                <td>{member.joined}</td>
                <td><button className="edit-action" onClick={() => handleEdit(member)}>✏️</button><button className="delete-action" onClick={() => handleDelete(member.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="staff-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingId ? 'Edit Staff' : 'Add Staff'}</h2><button onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required /></div>
              {!editingId && <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} required /></div>}
              <div className="form-group"><label>Role</label><select name="role" value={formData.role} onChange={handleInputChange}><option value="admin">Admin Staff</option><option value="kitchen">Kitchen Staff</option></select></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update' : 'Add'} Staff</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;