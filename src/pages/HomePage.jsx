import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { callApi } from '../api';
import { Html5QrcodeScanner } from 'html5-qrcode';

// --- Main Component ---
function HomePage() {
  // --- State Management ---
  const [userName, setUserName] = useState('');
  const [frameNumber, setFrameNumber] = useState('');
  const [activeTab, setActiveTab] = useState('in-factory');
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  
  // Progress Dashboard State
  const [progressData, setProgressData] = useState(null);
  const [isNewVehicle, setIsNewVehicle] = useState(false);

  const navigate = useNavigate();
  const scannerRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) setUserName(savedUserName);

    const initializeApp = async () => {
      try {
        const payload = await callApi('getInitialPayload');
        setConfig(payload.config);
      } catch (error) {
        showNotification(`初始化失敗: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isScannerVisible) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader", 
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false // verbose
        );
      }
      
      const onScanSuccess = (decodedText, decodedResult) => {
        setFrameNumber(decodedText);
        setIsScannerVisible(false);
        scannerRef.current.clear();
        showNotification(`掃描成功: ${decodedText}`, 'success');
        // Automatically start the process after a successful scan
        handleStartProcess(decodedText); 
      };

      const onScanFailure = (error) => { /* console.warn(`Code scan error = ${error}`); */ };
      
      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current && scannerRef.current.getState() === 2) { // 2 is SCANNING STATE
         scannerRef.current.clear();
      }
    }
    
    return () => {
      if (scannerRef.current && scannerRef.current.getState() === 2) {
        scannerRef.current.clear();
      }
    };
  }, [isScannerVisible]);


  // --- Helper Functions ---
  const showNotification = (message, type, duration = 3000) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification({ message: '', type: '', visible: false }), duration);
  };

  const handleUserNameChange = (e) => {
    const name = e.target.value;
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  // --- Core Logic ---
  const handleStartProcess = async (scannedFrameNumber = null) => {
    if (!userName.trim()) return showNotification('請輸入作業人員', 'error');
    
    const currentFrameNumber = scannedFrameNumber || frameNumber;
    const sanitizedFrameNumber = currentFrameNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!sanitizedFrameNumber) return showNotification('請輸入有效的車架號碼', 'error');
    
    setFrameNumber(sanitizedFrameNumber);
    setIsLoading(true);
    try {
      const result = await callApi('getVehicleProgress', { frameNumber: sanitizedFrameNumber });
      setProgressData(result.progress);
      setIsNewVehicle(result.isNew);
    } catch (error) {
      showNotification(`查詢進度失敗: ${error.message}`, 'error');
      setProgressData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOutFactoryButtons = () => {
    if (!config || !config.OUT_FACTORY_FORMS) return null;
    return config.OUT_FACTORY_FORMS.map(formId => (
      <button 
        key={formId} 
        className="btn-secondary" 
        style={{width: '100%', marginBottom: '0.5rem'}}
        onClick={() => navigate(`/form/${formId}`, { state: { userName, isEdit: false, frameNumber: 'N/A' } })}
      >
        {config.FORM_NAMES[formId] || formId}
      </button>
    ));
  };

  // --- Render ---
  return (
    <>
      <div className="main-container">
        <div className="content-card">
          
          <div className="input-group">
              <label htmlFor="user-name-input">作業人員:</label>
              <input 
                type="text" 
                id="user-name-input" 
                placeholder="請輸入您的姓名或工號"
                value={userName}
                onChange={handleUserNameChange}
              />
          </div>

          <div id="tabs-container">
              <button className={`tab ${activeTab === 'in-factory' ? 'active' : ''}`} onClick={() => setActiveTab('in-factory')}>廠內流程</button>
              <button className={`tab ${activeTab === 'out-factory' ? 'active' : ''}`} onClick={() => setActiveTab('out-factory')}>廠外流程</button>
          </div>

          {activeTab === 'in-factory' && (
            <div id="in-factory-content">
                <p className="instruction-text">請輸入或掃描車輛的車架號碼以查詢進度。</p>
                <div id="input-area" style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <input 
                    type="text" 
                    id="frame-number-input" 
                    placeholder="輸入或掃描車架號碼"
                    value={frameNumber}
                    onChange={(e) => setFrameNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartProcess()}
                  />
                  <button id="scan-btn" title="掃描 QR Code" className="btn-icon" onClick={() => setIsScannerVisible(!isScannerVisible)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
                  </button>
                </div>
                {isScannerVisible && <div id="qr-reader" style={{marginTop: '1rem'}}></div>}
                <button id="start-btn" className="btn-primary" onClick={() => handleStartProcess()} style={{marginTop: '1rem'}}>
                  查詢進度 / 開始作業
                </button>
            </div>
          )}
          
          {activeTab === 'out-factory' && (
            <div id="out-factory-content">
              <p className="instruction-text">請選擇要執行的廠外流程表單。</p>
              {renderOutFactoryButtons()}
            </div>
          )}

        </div>

        {progressData && (
          <ProgressDashboard 
            progress={progressData}
            isNew={isNewVehicle}
            formNames={config.FORM_NAMES}
            inFactoryForms={config.IN_FACTORY_FORMS}
            frameNumber={frameNumber}
            userName={userName}
          />
        )}

      </div>

      {isLoading && (
        <div id="loader"><div className="spinner"></div><p>處理中...</p></div>
      )}
      {notification.visible && (
        <div id="notification" className={`show ${notification.type}`}>{notification.message}</div>
      )}
    </>
  );
}

function ProgressDashboard({ progress, isNew, formNames, inFactoryForms, frameNumber, userName }) {
  const navigate = useNavigate();

  const handleActionClick = (formId, isCompleted) => {
    navigate(`/form/${formId}`, { state: { frameNumber, userName, isEdit: isCompleted } });
  };

  return (
    <div className="content-card" style={{marginTop: '1rem'}}>
      <div className="workflow-header">
        <h2>作業進度: {frameNumber}</h2>
        {isNew && <p style={{color: 'var(--accent-color)'}}>這是一筆新記錄，請開始作業。</p>}
      </div>
      <div className="progress-stepper">
        {inFactoryForms.map(formId => {
          const isCompleted = progress[formId];
          const stepClass = isCompleted ? 'step completed' : 'step';
          return (
            <div className={stepClass} key={formId}>
              <div className="step-content">
                <h3>
                  <span>{formNames[formId] || formId}</span>
                  {isCompleted && <span style={{color: 'var(--success-color)', fontSize: '0.9rem'}}>✔ 已完成</span>}
                </h3>
                <button 
                  className={isCompleted ? "btn-secondary" : "btn-primary"} 
                  style={{width: '100%'}}
                  onClick={() => handleActionClick(formId, isCompleted)}
                >
                  {isCompleted ? '查看 / 修改' : '開始作業'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HomePage;