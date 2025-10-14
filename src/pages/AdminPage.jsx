import React, { useState, useEffect, useRef } from 'react';
import { callApi } from './api'; // Import the new API function

function App() {
  // State for form inputs and data
  const [formTypes, setFormTypes] = useState({});
  const [selectedFormType, setSelectedFormType] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // UI State
  const [log, setLog] = useState('日誌將顯示於此...');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const logRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    // Fetch initial data when the component mounts
    const initializeApp = async () => {
      setIsLoading(true);
      addToLog('正在初始化應用程式...');
      try {
        const payload = await callApi('getInitialPayload');
        setFormTypes(payload.config.FORM_NAMES || {});
        addToLog('應用程式初始化成功！');
      } catch (error) {
        addToLog(`初始化失敗: ${error.message}`);
        showNotification(`初始化失敗: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the log whenever it updates
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // --- Helper Functions ---
  const addToLog = (message) => {
    setLog(prevLog => prevLog === '日誌將顯示於此...' ? message : `${prevLog}\n${message}`);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, 4000);
  };

  // --- Event Handlers ---
  const handleExport = async () => {
    if (!selectedFormType || !startDate || !endDate) {
      showNotification('請填寫所有必填欄位 (表單類型、開始日期、結束日期)', 'error');
      return;
    }
    
    setIsLoading(true);
    addToLog('--------------------');
    addToLog('導出請求已送出...');
    const options = {
      formType: selectedFormType,
      vehicleModel: vehicleModel.trim(),
      startDate,
      endDate
    };
    addToLog(`條件: ${options.formType} | ${options.vehicleModel || '所有型號'} | ${options.startDate} - ${options.endDate}`);

    try {
      const result = await callApi('bulkExportPdfs', { options });
      addToLog(`後端回應: ${result.message}`);
      if (result.folderUrl) {
        addToLog(`報告已生成，請至資料夾查看: ${result.folderUrl}`);
      }
      showNotification('導出請求處理完成！', 'success');
    } catch (error) {
      const errorMessage = `導出失敗: ${error.message}`;
      addToLog(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <>
      <header className="app-header">
        <h1>品管報告批量導出工具</h1>
      </header>
      <main className="main-container">
        <div className="content-card admin-container">
          
          <div className="admin-section">
            <h2>選擇導出條件</h2>
            <div className="form-row">
              <label htmlFor="form-type">表單類型:</label>
              <select id="form-type" value={selectedFormType} onChange={(e) => setSelectedFormType(e.target.value)}>
                <option value="">請選擇...</option>
                {Object.entries(formTypes).map(([formId, formName]) => (
                  <option key={formId} value={formId}>{formName} ({formId})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label htmlFor="vehicle-model">車輛型號 (可選):</label>
              <input 
                type="text" 
                id="vehicle-model" 
                placeholder="例如: KDTA (留空導出所有型號)" 
                value={vehicleModel} 
                onChange={(e) => setVehicleModel(e.target.value.toUpperCase())}
              />
            </div>
            <div className="form-row">
              <label htmlFor="start-date">開始日期:</label>
              <input 
                type="date" 
                id="start-date" 
                required 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="end-date">結束日期:</label>
              <input 
                type="date" 
                id="end-date" 
                required 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-section">
              <h2>執行與結果</h2>
              <p className="instruction-text" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                點擊按鈕開始批量導出 PDF 報告。
              </p>
              <button id="export-btn" className="btn-primary" style={{ width: '100%' }} onClick={handleExport} disabled={isLoading}>
                {isLoading ? '處理中...' : '開始導出 PDF'}
              </button>
              {/* This link is a placeholder for now */}
              <a href="#">返回主系統 (功能待實現)</a>
          </div>

          <div className="admin-section full-width">
              <h2>導出日誌</h2>
              <div id="export-log" ref={logRef} style={{ whiteSpace: 'pre-wrap' }}>
                {log}
              </div>
          </div>

        </div>
      </main>

      {isLoading && (
        <div id="loader">
          <div className="spinner"></div>
          <p>處理中...</p>
        </div>
      )}

      {notification.visible && (
        <div id="notification" className={`show ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </>
  );
}

export default App;
