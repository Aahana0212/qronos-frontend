import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVeg, setFilterVeg] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [view, setView] = useState('grid'); // 'grid' | 'table'

  const restaurantId = localStorage.getItem('restaurantId');

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant-login');
      return;
    }
    loadMenuItems();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

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

  const renderItemImage = (item) => {
    const url = typeof item.image_url === 'string' ? item.image_url.trim() : '';
    if (url && /^https?:\/\//i.test(url)) {
      return <img src={url} alt={item.name} className="mgmt-item-img" />;
    }
    return <div className="mgmt-item-emoji">{item.is_veg ? '🥗' : '🍔'}</div>;
  };

  const filteredItems = menuItems.filter((item) => {
    if (filterCategory !== 'all' && String(item.category_id) !== String(filterCategory)) {
      return false;
    }
    if (filterVeg === 'veg' && !item.is_veg) return false;
    if (filterVeg === 'non-veg' && item.is_veg) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${item.name || ''} ${item.description || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (loading) return <div className="mgmt-loading">Loading menu...</div>;

  return (
    <div className="mgmt-container">
      <div className="mgmt-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <div className="mgmt-title">
          <h1>Menu Management</h1>
          <p>Add, edit, and manage your restaurant's menu items</p>
        </div>
        <button
          className="add-btn"
          onClick={() => { setEditingItem(null); setFormData(emptyForm); setShowModal(true); }}
        >
          + Add New Item
        </button>
      </div>

      <div className="mgmt-stats">
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <h3>Total Items</h3>
          <p>{menuItems.length}</p>
        </div>
        <div className="stat-card stat-available">
          <span className="stat-icon">✅</span>
          <h3>Available</h3>
          <p>{menuItems.filter(i => i.is_available).length}</p>
        </div>
        <div className="stat-card stat-unavailable">
          <span className="stat-icon">⚠️</span>
          <h3>Out of Stock</h3>
          <p>{menuItems.filter(i => !i.is_available).length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mgmt-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} title="Clear">✕</button>
          )}
        </div>

        <div className="filter-chips">
          <button
            className={`chip ${filterVeg === 'all' ? 'active' : ''}`}
            onClick={() => setFilterVeg('all')}
          >All</button>
          <button
            className={`chip chip-veg ${filterVeg === 'veg' ? 'active' : ''}`}
            onClick={() => setFilterVeg('veg')}
          ><span className="chip-dot veg" /> Veg</button>
          <button
            className={`chip chip-nonveg ${filterVeg === 'non-veg' ? 'active' : ''}`}
            onClick={() => setFilterVeg('non-veg')}
          ><span className="chip-dot non-veg" /> Non-Veg</button>

          {categories.length > 0 && (
            <select
              className="cat-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
            title="Grid view"
          >▦</button>
          <button
            className={view === 'table' ? 'active' : ''}
            onClick={() => setView('table')}
            title="Table view"
          >☰</button>
        </div>
      </div>

      {/* Empty / Filtered-empty state */}
      {menuItems.length === 0 ? (
        <div className="mgmt-empty-card">
          <div className="empty-illustration">🍽️</div>
          <h3>No menu items yet</h3>
          <p>Click "+ Add New Item" above to create your first menu item.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mgmt-empty-card">
          <div className="empty-illustration">🔍</div>
          <h3>No items match your filters</h3>
          <p>Try clearing the search or switching the category filter.</p>
        </div>
      ) : view === 'grid' ? (
        /* GRID VIEW */
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className={`menu-card ${item.is_available ? '' : 'is-unavailable'}`}>
              <div className="menu-card-thumb">
                {renderItemImage(item)}
                {item.is_popular && <span className="card-popular-tag">★ Popular</span>}
                <span className={`card-veg-dot ${item.is_veg ? 'veg' : 'non-veg'}`} title={item.is_veg ? 'Veg' : 'Non-Veg'} />
              </div>
              <div className="menu-card-body">
                <div className="menu-card-row">
                  <h4 className="menu-card-name">{item.name}</h4>
                  <span className="menu-card-price">₹{item.price}</span>
                </div>
                <span className="menu-card-cat">
                  {categories.find((c) => c.id === item.category_id)?.name || 'Other'}
                </span>
                {item.description && (
                  <p className="menu-card-desc">{item.description}</p>
                )}
                <div className="menu-card-meta">
                  {item.takeaway_price && (
                    <span className="meta-pill">📦 ₹{item.takeaway_price}</span>
                  )}
                  {item.preparation_time && (
                    <span className="meta-pill">⏱ {item.preparation_time} min</span>
                  )}
                </div>
              </div>
              <div className="menu-card-footer">
                <button
                  className={`status-toggle ${item.is_available ? 'active' : ''}`}
                  onClick={() => toggleAvailability(item)}
                >
                  {item.is_available ? 'Available' : 'Out of Stock'}
                </button>
                <div className="menu-card-actions">
                  <button className="edit-action" onClick={() => handleEdit(item)} title="Edit">✏️</button>
                  <button className="delete-action" onClick={() => handleDelete(item.id)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="menu-table-container">
          <table className="menu-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Takeaway</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{renderItemImage(item)}</td>
                  <td>
                    <strong className="mgmt-item-name">{item.name}</strong>
                    {item.is_popular ? <span className="popular-tag">★ Popular</span> : null}
                    {item.description ? <div className="mgmt-item-desc">{item.description}</div> : null}
                  </td>
                  <td>{categories.find((c) => c.id === item.category_id)?.name || 'Other'}</td>
                  <td className="mgmt-price">₹{item.price}</td>
                  <td>{item.takeaway_price ? `₹${item.takeaway_price}` : '—'}</td>
                  <td>
                    <span className={`veg-badge ${item.is_veg ? 'veg' : 'non-veg'}`}>
                      <span className="veg-dot" /> {item.is_veg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${item.is_available ? 'active' : ''}`}
                      onClick={() => toggleAvailability(item)}
                    >
                      {item.is_available ? 'Available' : 'Out of Stock'}
                    </button>
                  </td>
                  <td>
                    <button className="edit-action" onClick={() => handleEdit(item)} title="Edit">✏️</button>
                    <button className="delete-action" onClick={() => handleDelete(item.id)} title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                <p className="modal-subtitle">
                  {editingItem ? 'Update the details below' : 'Fill in the details to add this dish to your menu'}
                </p>
              </div>
              <button className="close-modal" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mgmt-form">
              {/* SECTION: Basic Info */}
              <div className="form-section">
                <h4 className="form-section-title">Basic Information</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Margherita Pizza"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Short description of the dish (ingredients, taste, etc.)"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              {/* SECTION: Pricing */}
              <div className="form-section">
                <h4 className="form-section-title">Pricing & Time</h4>
                <div className="form-row form-row-3">
                  <div className="form-group">
                    <label>Price (₹) <span className="req">*</span></label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Takeaway Price (₹)</label>
                    <input
                      type="number"
                      name="takeaway_price"
                      step="0.01"
                      min="0"
                      placeholder="Same as price"
                      value={formData.takeaway_price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prep Time (min)</label>
                    <input
                      type="number"
                      name="preparation_time"
                      min="1"
                      placeholder="15"
                      value={formData.preparation_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Type & Tags */}
              <div className="form-section">
                <h4 className="form-section-title">Type & Tags</h4>
                <div className="veg-selector">
                  <button
                    type="button"
                    className={`veg-option ${formData.is_veg ? 'active veg' : ''}`}
                    onClick={() => setFormData({ ...formData, is_veg: true })}
                  >
                    <span className="veg-dot" /> Vegetarian
                  </button>
                  <button
                    type="button"
                    className={`veg-option ${!formData.is_veg ? 'active non-veg' : ''}`}
                    onClick={() => setFormData({ ...formData, is_veg: false })}
                  >
                    <span className="veg-dot non-veg" /> Non-Vegetarian
                  </button>
                </div>

                <div className="toggle-row">
                  <label className="toggle-pill">
                    <input
                      type="checkbox"
                      name="is_popular"
                      checked={formData.is_popular}
                      onChange={handleInputChange}
                    />
                    <span>★ Mark as Popular</span>
                  </label>
                  <label className="toggle-pill">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                    />
                    <span>{formData.is_available ? '✓ Available' : '⚠ Out of Stock'}</span>
                  </label>
                </div>
              </div>

              {/* SECTION: Image */}
              <div className="form-section">
                <h4 className="form-section-title">Image</h4>
                <div className="image-row">
                  <div className="image-preview">
                    {formData.image_url && /^https?:\/\//i.test(formData.image_url) ? (
                      <img src={formData.image_url} alt="preview" />
                    ) : (
                      <div className="image-placeholder">{formData.is_veg ? '🥗' : '🍔'}</div>
                    )}
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      placeholder="https://example.com/dish.jpg"
                      value={formData.image_url}
                      onChange={handleInputChange}
                    />
                    <small>Paste a publicly accessible image URL. Leave blank for default emoji.</small>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Saving...' : (editingItem ? 'Update Item' : 'Add to Menu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
