import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadMenuItems = async () => {
    try {
      const restaurantId = localStorage.getItem('restaurantId') || 1;
      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/menu`);
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      // Demo data
      setMenuItems([
        { id: 1, name: 'Margherita Pizza', description: 'Classic cheese & tomato sauce', price: 299, takeaway_price: 269, category_id: 2, is_veg: true, is_popular: true, is_available: true, preparation_time: 12 },
        { id: 2, name: 'Pepperoni Pizza', description: 'Spicy pepperoni with extra cheese', price: 399, takeaway_price: 359, category_id: 2, is_veg: false, is_popular: true, is_available: true, preparation_time: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/restaurants/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      setCategories([
        { id: 1, name: 'Starter' },
        { id: 2, name: 'Main Course' },
        { id: 3, name: 'Desserts' },
        { id: 4, name: 'Beverages' },
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now(),
      price: parseFloat(formData.price),
      takeaway_price: parseFloat(formData.takeaway_price),
      preparation_time: parseInt(formData.preparation_time)
    };

    if (editingItem) {
      // Update existing item
      setMenuItems(menuItems.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      // Add new item
      setMenuItems([...menuItems, newItem]);
    }

    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '', description: '', price: '', takeaway_price: '', category_id: '',
      is_veg: true, is_popular: false, is_available: true, preparation_time: 15, image_url: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      takeaway_price: item.takeaway_price || '',
      category_id: item.category_id,
      is_veg: item.is_veg,
      is_popular: item.is_popular,
      is_available: item.is_available,
      preparation_time: item.preparation_time,
      image_url: item.image_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, is_available: !item.is_available } : item
    ));
  };

  if (loading) return <div className="mgmt-loading">Loading menu...</div>;

  return (
    <div className="mgmt-container">
      <div className="mgmt-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <h1>Menu Management</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add New Item</button>
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
            {menuItems.map(item => (
              <tr key={item.id}>
                <td><div className="item-emoji">{item.image_url || (item.is_veg ? '🥗' : '🍔')}</div></td>
                <td><strong>{item.name}</strong><br/><small>{item.description?.substring(0, 30)}</small></td>
                <td>{categories.find(c => c.id === item.category_id)?.name || 'Other'}</td>
                <td>₹{item.price}</td>
                <td>{item.takeaway_price ? `₹${item.takeaway_price}` : '-'}</td>
                <td><span className={`veg-badge ${item.is_veg ? 'veg' : 'non-veg'}`}>{item.is_veg ? 'Veg' : 'Non-Veg'}</span></td>
                <td>
                  <button className={`status-toggle ${item.is_available ? 'active' : ''}`} onClick={() => toggleAvailability(item.id)}>
                    {item.is_available ? 'Available' : 'Out of Stock'}
                  </button>
                </td>
                <td>
                  <button className="edit-action" onClick={() => handleEdit(item)}>✏️</button>
                  <button className="delete-action" onClick={() => handleDelete(item.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
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
                <button type="submit" className="save-btn">{editingItem ? 'Update' : 'Add'} Item</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;