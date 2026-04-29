import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';

const API_BASE = 'http://localhost:5000/api';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  takeaway_price: '',
  category_id: '',
  is_veg: true,
  is_popular: false,
  is_available: true,
  preparation_time: 15,
  image_url: ''
};

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const restaurantId = localStorage.getItem('restaurantId') || '1';

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      // `all=1` returns every item including unavailable ones, so the manager can see them all.
      const response = await fetch(
        `${API_BASE}/restaurants/${restaurantId}/menu?all=1`
      );
      const data = await response.json();
      const items = Array.isArray(data) ? data : data.menuItems || [];
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/restaurants/categories`);
      const data = await response.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const buildPayload = () => ({
    restaurant_id: parseInt(restaurantId, 10),
    name: formData.name,
    description: formData.description || null,
    price: parseFloat(formData.price),
    takeaway_price: formData.takeaway_price ? parseFloat(formData.takeaway_price) : null,
    category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
    is_veg: formData.is_veg ? 1 : 0,
    is_popular: formData.is_popular ? 1 : 0,
    is_available: formData.is_available ? 1 : 0,
    preparation_time: parseInt(formData.preparation_time, 10) || 15,
    image_url: formData.image_url || null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      const url = editingItem
        ? `${API_BASE}/menu/${editingItem.id}`
        : `${API_BASE}/menu`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      await loadMenuItems();
      closeModal();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(`Failed to save item: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      takeaway_price: item.takeaway_price ?? '',
      category_id: item.category_id ?? '',
      is_veg: !!item.is_veg,
      is_popular: !!item.is_popular,
      is_available: item.is_available !== 0,
      preparation_time: item.preparation_time ?? 15,
      image_url: typeof item.image_url === 'string' ? item.image_url : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Failed to delete item: ${error.message}`);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const payload = {
        restaurant_id: item.restaurant_id,
        name: item.name,
        description: item.description ?? null,
        price: item.price,
        takeaway_price: item.takeaway_price ?? null,
        category_id: item.category_id ?? null,
        is_veg: item.is_veg ? 1 : 0,
        is_popular: item.is_popular ? 1 : 0,
        is_available: item.is_available ? 0 : 1,
        preparation_time: item.preparation_time ?? 15,
        image_url: typeof item.image_url === 'string' ? item.image_url : null
      };
      const res = await fetch(`${API_BASE}/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
      await loadMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert(`Failed to update item: ${error.message}`);
    }
  };

  if (loading) return <div className="mgmt-loading">Loading menu...</div>;

  return (
    <div className="mgmt-container">
      <div className="mgmt-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <h1>Menu Management</h1>
        <button className="add-btn" onClick={() => { setEditingItem(null); setFormData(emptyForm); setShowModal(true); }}>+ Add New Item</button>
      </div>

      <div className="mgmt-stats">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p>{menuItems.length}</p>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <p>{menuItems.filter(i => i.is_available).length}</p>
        </div>
        <div className="stat-card">
          <h3>Out of Stock</h3>
          <p>{menuItems.filter(i => !i.is_available).length}</p>
        </div>
      </div>

      <div className="menu-table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Takeaway</th>
              <th>Veg/Non-Veg</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  No menu items yet. Click "+ Add New Item" to create one.
                </td>
              </tr>
            ) : (
              menuItems.map(item => (
                <tr key={item.id}>
                  <td><div className="item-emoji">{(typeof item.image_url === 'string' && item.image_url) || (item.is_veg ? '🥗' : '🍔')}</div></td>
                  <td><strong>{item.name}</strong><br/><small>{item.description?.substring(0, 30)}</small></td>
                  <td>{categories.find(c => c.id === item.category_id)?.name || 'Other'}</td>
                  <td>₹{item.price}</td>
                  <td>{item.takeaway_price ? `₹${item.takeaway_price}` : '-'}</td>
                  <td><span className={`veg-badge ${item.is_veg ? 'veg' : 'non-veg'}`}>{item.is_veg ? 'Veg' : 'Non-Veg'}</span></td>
                  <td>
                    <button className={`status-toggle ${item.is_available ? 'active' : ''}`} onClick={() => toggleAvailability(item)}>
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td>
                    <button className="edit-action" onClick={() => handleEdit(item)}>✏️</button>
                    <button className="delete-action" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="close-modal" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Takeaway Price (₹)</label>
                  <input type="number" name="takeaway_price" value={formData.takeaway_price} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Prep Time (min)</label>
                  <input type="number" name="preparation_time" value={formData.preparation_time} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" name="is_veg" checked={formData.is_veg} onChange={handleInputChange} />
                  Vegetarian
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleInputChange} />
                  Mark as Popular
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleInputChange} />
                  Available
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : (editingItem ? 'Update' : 'Add') + ' Item'}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
