import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './QRScanPage.css';

const QRScanPage = () => {
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [scannedTable, setScannedTable] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (tableNumber && tableNumber > 0 && tableNumber <= 50) {
      setScannedTable(parseInt(tableNumber));
      setShowConfirm(true);
    } else {
      alert('Please enter a valid table number (1-50)');
    }
  };

  const confirmTable = () => {
    try {
      localStorage.setItem('qronos_table', String(scannedTable));
      localStorage.setItem('qronos_order_type', 'dinein');
      navigate('/menu');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      navigate('/menu');
    }
  };

  const cancelTable = () => {
    setShowConfirm(false);
    setScannedTable(null);
    setTableNumber('');
  };

  const startCamera = async () => {
    setScanning(true);
    try {
      // Check if camera is available
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      // Simulate QR scan for demo
      setTimeout(() => {
        // For demo, prompt user to enter table number after camera opens
        const demoTable = prompt('Camera opened! Enter table number (for demo):');
        if (demoTable && !isNaN(parseInt(demoTable))) {
          setScannedTable(parseInt(demoTable));
          setShowConfirm(true);
          setScanning(false);
        } else {
          alert('Please enter a valid table number');
          setScanning(false);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Camera error:', err);
      alert('Camera access denied. Please allow camera permission or use manual entry.');
      setScanning(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="qr-scan-page">
        <div className="qr-scan-container">
          <button className="back-btn" onClick={cancelTable}>← Back</button>
          <div className="confirm-header">
            <div className="success-icon">✓</div>
            <h1>Table Scanned!</h1>
          </div>
          <div className="table-card">
            <div className="table-number-large">Table {scannedTable}</div>
            <div className="table-details">
              <p>📍 Location: {scannedTable <= 5 ? 'Ground Floor' : scannedTable <= 10 ? 'First Floor' : 'Second Floor'}</p>
              <p>👥 Capacity: {scannedTable <= 3 ? 2 : scannedTable <= 6 ? 4 : 6}</p>
            </div>
          </div>
          <div className="confirm-actions">
            <button className="confirm-btn" onClick={confirmTable}>✓ Correct Table</button>
            <button className="cancel-btn" onClick={cancelTable}>✗ Wrong Table</button>
          </div>
          <p className="help-text">If wrong table, please scan the correct QR code</p>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="qr-scan-page">
        <div className="qr-scan-container">
          <button className="back-btn" onClick={() => setScanning(false)}>← Back</button>
          <div className="scan-header">
            <div className="scan-icon">📷</div>
            <h1>Scan QR Code</h1>
            <p>Position the QR code inside the frame</p>
            <div className="camera-preview">
              <div className="camera-placeholder">
                <div className="scanner-frame">
                  <div className="scanner-line"></div>
                </div>
                <p className="camera-note">Camera is opening... Please wait.</p>
                <p className="camera-tip">For QR code, you would see camera feed here.</p>
              </div>
            </div>
          </div>
          <button className="manual-switch-btn" onClick={() => setScanning(false)}>
            Enter table number manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-scan-page">
      <div className="qr-scan-container">
        <button className="back-btn" onClick={() => navigate('/order-type')}>← Back</button>
        
        <div className="scan-header">
          <div className="scan-icon">📱</div>
          <h1>Scan Table QR Code</h1>
          <p>Please scan the QR code placed on your table to start ordering</p>
        </div>

        <div className="qr-scanner-box">
          <div className="scanner-frame">
            <div className="scanner-line"></div>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
          
          <button className="scan-camera-btn" onClick={startCamera}>
            📷 Open Camera to Scan
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          <form onSubmit={handleManualSubmit} className="manual-input">
            <input 
              type="number" 
              placeholder="Enter table number manually"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              min="1"
              max="50"
              required
            />
            <button type="submit">Continue</button>
          </form>
        </div>

        <div className="scan-help">
          <p>💡 Tip: QR code is located on your table's stand</p>
          <p>📞 Need help? Contact the restaurant staff</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanPage;