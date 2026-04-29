// src/components/customer_side/QRScanPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QRScanPage.css';

const QRScanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get orderType from navigation state (passed from OrderTypePage)
  const orderType = location.state?.orderType || 'dinein';
  const userId = location.state?.userId || localStorage.getItem('qronos_user_id');
  
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualTable, setManualTable] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedTable, setScannedTable] = useState(null);

  // Restaurant id comes from the QR-encoded URL (?r=N or ?restaurantId=N).
  // No fallback — without a real QR/url, the dine-in flow has no restaurant.
  const getRestaurantId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurantId') || params.get('r') || null;
  };

  // Simulate QR scan
  const startScan = () => {
    const rid = getRestaurantId();
    if (!rid) {
      setError(
        'No restaurant detected. Please scan a real table QR, or open the QR link from the restaurant.'
      );
      return;
    }
    setScanning(true);
    setError(null);

    setTimeout(() => {
      setScannedTable(Math.floor(Math.random() * 20) + 1);
      setShowConfirm(true);
      setScanning(false);
    }, 2000);
  };

  const handleManualSubmit = () => {
    if (!getRestaurantId()) {
      setError(
        'No restaurant detected. Please scan a real table QR, or open the QR link from the restaurant.'
      );
      return;
    }
    if (manualTable && manualTable > 0 && manualTable <= 50) {
      setScannedTable(parseInt(manualTable));
      setShowConfirm(true);
      setError(null);
    } else {
      setError('Please enter a valid table number (1-50)');
    }
  };

  const confirmTable = () => {
    const restaurantId = getRestaurantId();
    if (!restaurantId) {
      setError('Restaurant not identified. Please rescan the QR.');
      setShowConfirm(false);
      return;
    }
    localStorage.setItem('qronos_table', String(scannedTable));
    localStorage.setItem('qronos_order_type', 'dinein');
    localStorage.setItem('qronos_restaurant_id', String(restaurantId));

    navigate('/menu', {
      state: {
        orderType: 'dinein',
        tableNumber: scannedTable,
        restaurantId: restaurantId,
        userId: userId,
      },
    });
  };

  const cancelTable = () => {
    setShowConfirm(false);
    setScannedTable(null);
    setManualTable('');
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
            <p>Please confirm your table details</p>
          </div>
          
          <div className="table-card">
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
            <button className="cancel-btn" onClick={cancelTable}>✗ Cancel & Rescan</button>
          </div>
          
          <p className="help-text">💡 If this is not your table, please scan the correct QR code</p>
        </div>
      </div>
    );
  }

  // ========== MAIN SCREEN ==========
  return (
    <div className="qrscan-container">
      <div className="qrscan-card">
        {/* Back Button */}
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
                  <>
                    <span className="spinner"></span>
                    Scanning...
                  </>
                ) : (
                  <>
                    <span>🔍</span> Start Scanning
                  </>
                )}
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="manual-btn" onClick={() => setShowManualInput(true)}>
              <span>✏️</span> Enter Table Number Manually
            </button>
          </>
        ) : (
          <div className="manual-input-section">
            <button className="back-btn-manual" onClick={() => setShowManualInput(false)}>
              ← Back to Scanner
            </button>
            
            <div className="manual-form-container">
              <div className="manual-icon-wrapper">
                <div className="manual-icon">🍽️</div>
              </div>
              
              <h3 className="manual-title">Enter Table Number</h3>
              <p className="manual-subtitle">Ask your server for your table number</p>
              
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