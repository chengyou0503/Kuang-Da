import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function HomeScreen({ config, onStartProcess, onShowForm }) {
  const [activeTab, setActiveTab] = useState('in-factory');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [frameNumber, setFrameNumber] = useState('');

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  const handleStart = () => {
    if (!userName.trim()) {
      alert('請輸入作業人員');
      return;
    }
    if (!frameNumber.trim()) {
      alert('請輸入有效車架號碼');
      return;
    }
    onStartProcess(frameNumber.toUpperCase());
  };

  // QR Code Scanner Logic
  useEffect(() => {
    let scanner;
    const onScanSuccess = (decodedText, decodedResult) => {
      setFrameNumber(decodedText);
      if (scanner) {
        scanner.clear();
      }
      onStartProcess(decodedText.toUpperCase());
    };

    const startScanner = () => {
      const qrReaderDiv = document.getElementById('qr-reader');
      if (qrReaderDiv && !scanner) {
        scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
        scanner.render(onScanSuccess);
        qrReaderDiv.style.display = 'block';
      }
    };
    
    const stopScanner = () => {
        if (scanner) {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            scanner = null;
            const qrReaderDiv = document.getElementById('qr-reader');
            if(qrReaderDiv) qrReaderDiv.style.display = 'none';
        }
    };

    const scanBtn = document.getElementById('scan-btn');
    if (scanBtn) {
        scanBtn.addEventListener('click', startScanner);
    }

    return () => {
      stopScanner();
      if (scanBtn) {
        scanBtn.removeEventListener('click', startScanner);
      }
    };
  }, [onStartProcess]);


  return (
    <div className="content-card">
      <div className="input-group">
        <label htmlFor="user-name-input">作業人員:</label>
        <input
          type="text"
          id="user-name-input"
          placeholder="請輸入您的姓名或工號"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <div id="tabs-container">
        <button className={`tab ${activeTab === 'in-factory' ? 'active' : ''}`} onClick={() => setActiveTab('in-factory')}>
          廠內流程
        </button>
        <button className={`tab ${activeTab === 'out-factory' ? 'active' : ''}`} onClick={() => setActiveTab('out-factory')}>
          廠外流程
        </button>
      </div>

      {activeTab === 'in-factory' && (
        <div id="in-factory-content">
          <p className="instruction-text">請輸入或掃描車輛的車架號碼以查詢進度。</p>
          <div id="input-area" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              id="frame-number-input"
              placeholder="輸入或掃描車架號碼"
              value={frameNumber}
              onChange={(e) => setFrameNumber(e.target.value.toUpperCase())}
              onKeyUp={(e) => e.key === 'Enter' && handleStart()}
            />
            <button id="scan-btn" title="掃描 QR Code" className="btn-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>
              </svg>
            </button>
          </div>
          <button onClick={handleStart} className="btn-primary">查詢進度 / 開始作業</button>
          <div id="qr-reader-container" style={{ marginTop: '1rem' }}>
            <div id="qr-reader" style={{ display: 'none', width: '100%', maxWidth: '400px', margin: 'auto' }}></div>
          </div>
        </div>
      )}

      {activeTab === 'out-factory' && (
        <div id="out-factory-content">
          {config.OUT_FACTORY_FORMS.map(formId => (
            <div key={formId} className="out-factory-item">
              <div>
                <h4>{config.FORM_NAMES[formId] || formId}</h4>
                <p>直接填寫並提交表單。</p>
              </div>
              <button onClick={() => onShowForm(formId)} className="btn-primary">
                開啟 {formId}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
