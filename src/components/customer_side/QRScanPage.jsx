// src/components/customer_side/QRScanPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/api';
import './QRScanPage.css';

const QRScanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // orderType passed from OrderTypePage
  const orderType = location.state?.orderType || 'dinein';
  const userId = location.state?.userId || localStorage.getItem('qronos_user_id');

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualTable, setManualTable] = useState('');
  const [manualRestaurantId, setManualRestaurantId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedTable, setScannedTable] = useState(null);
  const [confirmedRestaurantId, setConfirmedRestaurantId] = useState(null);
  const [confirmedRestaurantName, setConfirmedRestaurantName] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  // The physical table QR encodes a URL like
  // /scan-qr?r=<restaurantId>&table=<tableNumber>
  // so when the customer's phone opens it, both fields are auto-populated.
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      restaurantId: params.get('restaurantId') || params.get('r') || null,
      tableNumber: params.get('table') || params.get('t') || null,
    };
  };

  // Load registered restaurants on mount so the manual flow can pick one,
  // and so the QR-driven flow can resolve the restaurant name from its id.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRestaurants(true);
      const res = await apiGet('/restaurants');
      if (cancelled) return;
      const list = Array.isArray(res) ? res : res?.restaurants || [];
      setRestaurants(list);
      setLoadingRestaurants(false);

      // If both restaurant + table came in via the URL (real QR scan),
      // skip the scanner UI and jump straight to the confirm screen.
      const { restaurantId: urlRid, tableNumber: urlTable } = getUrlParams();
      if (urlRid && urlTable) {
        const r = list.find((x) => String(x.id) === String(urlRid));
        setConfirmedRestaurantId(urlRid);
        setConfirmedRestaurantName(r?.name || '');
        setScannedTable(parseInt(urlTable, 10) || urlTable);
        setShowConfirm(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // "Start Scanning" — short pretend-scan animation that uses URL params if
  // present, or surfaces a clear error otherwise (so users know to tap Manual).
  const startScan = () => {
    const { restaurantId: rid, tableNumber: urlTable } = getUrlParams();
    if (!rid) {
      setError(
        'No restaurant detected from QR. Tap "Enter Manually" below to pick a restaurant + table number.'
      );
      return;
    }
    setScanning(true);
    setError(null);

    setTimeout(() => {
      const r = restaurants.find((x) => String(x.id) === String(rid));
      setConfirmedRestaurantId(rid);
      setConfirmedRestaurantName(r?.name || '');
      setScannedTable(
        urlTable
          ? (parseInt(urlTable, 10) || urlTable)
          : Math.floor(Math.random() * 20) + 1
      );
      setShowConfirm(true);
      setScanning(false);
    }, 1500);
  };

  const handleManualSubmit = () => {
    const rid = getUrlParams().restaurantId || manualRestaurantId;
    if (!rid) {
      setError('Please select a restaurant.');
      return;
    }
    const tableNum = parseInt(manualTable, 10);
    if (!tableNum || tableNum < 1 || tableNum > 50) {
      setError('Please enter a valid table number (1-50).');
      return;
    }
    const r = restaurants.find((x) => String(x.id) === String(rid));
    setConfirmedRestaurantId(rid);
    setConfirmedRestaurantName(r?.name || '');
    setScannedTable(tableNum);
    setShowConfirm(true);
    setError(null);
  };

  const confirmTable = () => {
    if (!confirmedRestaurantId) {
      setError('Restaurant not identified. Please go back and pick one.');
      setShowConfirm(false);
      return;
    }
    localStorage.setItem('qronos_table', String(scannedTable));
    localStorage.setItem('qronos_order_type', 'dinein');
    localStorage.setItem('qronos_restaurant_id', String(confirmedRestaurantId));
    if (confirmedRestaurantName) {
      localStorage.setItem('qronos_restaurant_name', confirmedRestaurantName);
    }

    navigate('/menu', {
      state: {
        orderType: 'dinein',
        tableNumber: scannedTable,
        restaurantId: confirmedRestaurantId,
        restaurantName: confirmedRestaurantName,
        userId: userId,
      },
    });
  };

  const cancelTable = () => {
    setShowConfirm(false);
    setScannedTable(null);
    setManualTable('');
    setConfirmedRestaurantId(null);
    setConfirmedRestaurantName('');
  };

  // ========== CONFIRMATION SCREEN ==========
  if (showConfirm) {
    return (
      <div className="qrscan-container">
        <div className="qrscan-card">
          <button className="back-btn" onClick={cancelTable}>← Back</button>

          <div className="confirm-header">
            <div className="success-icon">✓</div>
            <h1>Table Verified!</h1>
            <p>Please confirm your details</p>
          </div>

          <div className="table-card">
            {confirmedRestaurantName && (
              <div className="confirm-restaurant">
                🍽️ <strong>{confirmedRestaurantName}</strong>
              </div>
            )}
            <div className="table-number-large">Table {scannedTable}</div>

            <div className="table-info-badges">
              <div className="info-badge">
                <span className="badge-icon">📍</span>
                <span className="badge-text">
                  Location: <span className="badge-value">
                    {scannedTable <= 5 ? 'Ground Floor' : scannedTable <= 10 ? 'First Floor' : 'Second Floor'}
                  </span>
                </span>
              </div>
              <div className="info-badge">
                <span className="badge-icon">👥</span>
                <span className="badge-text">
                  Capacity: <span className="badge-value">
                    {scannedTable <= 3 ? '2 People' : scannedTable <= 6 ? '4 People' : '6 People'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="confirm-actions">
            <button className="confirm-btn" onClick={confirmTable}>✓ Confirm & Continue</button>
            <button className="cancel-btn" onClick={cancelTable}>✗ Cancel</button>
          </div>

          <p className="help-text">💡 If this is not your table, please go back and re-enter the details.</p>
        </div>
      </div>
    );
  }

  // ========== MAIN SCREEN ==========
  const hasUrlRid = !!getUrlParams().restaurantId;

  return (
    <div className="qrscan-container">
      <div className="qrscan-card">
        <button className="back-to-home" onClick={() => navigate('/order-type')}>
          ← Back
        </button>

        <div className="qrscan-header">
          <div className="qrscan-icon">📱</div>
          <h1>Scan QR Code</h1>
          <p>Scan the QR code at your table to start ordering</p>
        </div>

        {!showManualInput ? (
          <>
            <div className="qr-scanner-demo">
              <div className="scanner-frame">
                <div className="scanner-corner top-left"></div>
                <div className="scanner-corner top-right"></div>
                <div className="scanner-corner bottom-left"></div>
                <div className="scanner-corner bottom-right"></div>
                {scanning && <div className="scanner-animation"></div>}
                <div className="qr-placeholder">
                  <span className="qr-icon">📷</span>
                  <p>{scanning ? 'Scanning...' : 'Position QR code inside the frame'}</p>
                </div>
              </div>

              <button className="scan-btn" onClick={startScan} disabled={scanning}>
                {scanning ? (
                  <><span className="spinner"></span>Scanning...</>
                ) : (
                  <><span>🔍</span> Start Scanning</>
                )}
              </button>

              {error && <div className="error-message-manual" style={{ marginTop: 14 }}>{error}</div>}
            </div>

            <div className="divider"><span>OR</span></div>

            <button className="manual-btn" onClick={() => { setShowManualInput(true); setError(null); }}>
              <span>✏️</span> Enter Manually
            </button>
          </>
        ) : (
          <div className="manual-input-section">
            <button className="back-btn-manual" onClick={() => { setShowManualInput(false); setError(null); }}>
              ← Back to Scanner
            </button>

            <div className="manual-form-container">
              <div className="manual-icon-wrapper">
                <div className="manual-icon">🍽️</div>
              </div>

              <h3 className="manual-title">Enter Restaurant & Table</h3>
              <p className="manual-subtitle">
                {hasUrlRid
                  ? 'Restaurant detected from QR. Just enter your table number.'
                  : 'Pick the restaurant you\'re at, then your table number.'}
              </p>

              {/* Restaurant picker (hidden if URL already supplied one) */}
              {!hasUrlRid && (
                <div className="input-wrapper">
                  <select
                    className="table-input-field"
                    value={manualRestaurantId}
                    onChange={(e) => setManualRestaurantId(e.target.value)}
                  >
                    <option value="">
                      {loadingRestaurants ? 'Loading restaurants...' : 'Select restaurant'}
                    </option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}{r.cuisine_type ? ` — ${r.cuisine_type}` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="input-hint">Choose your restaurant</span>
                </div>
              )}

              <div className="input-wrapper">
                <input
                  type="number"
                  className="table-input-field"
                  placeholder="Enter table number"
                  value={manualTable}
                  onChange={(e) => setManualTable(e.target.value)}
                  min="1"
                  max="50"
                  autoFocus
                />
                <span className="input-hint">Table number (1-50)</span>
              </div>

              {error && <div className="error-message-manual">{error}</div>}

              <button className="submit-btn-manual" onClick={handleManualSubmit}>
                Continue to Menu <span className="arrow-icon">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanPage;
