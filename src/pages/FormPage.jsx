import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { callApi } from '../api';

function FormPage() {
  const { formId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data passed from HomePage
  const { frameNumber, userName, isEdit } = location.state || {};

  const [formHtml, setFormHtml] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  // Ref to the container where HTML will be injected
  const formContainerRef = useRef(null);

  useEffect(() => {
    if (!frameNumber || !userName) {
      // If we don't have the required data, redirect back to home
      navigate('/');
      return;
    }

    const fetchFormData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch the form template
        const templateData = await callApi('getFormTemplate', { formId });
        setFormHtml(templateData.template);

        // 2. Fetch the form title from config
        const payload = await callApi('getInitialPayload');
        setFormTitle(payload.config.FORM_NAMES[formId] || formId);

        // 3. If it's in edit mode, fetch existing data
        if (isEdit) {
          const existingData = await callApi('getFormResponseData', { formId, frameNumber });
          // We will populate the form with this data in another effect
          // For now, just store it (or handle it directly if simple)
        }

      } catch (error) {
        showNotification(`載入表單失敗: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId, frameNumber, userName, isEdit, navigate]);

  // This effect runs after the component renders and `formHtml` is set
  useEffect(() => {
    const container = formContainerRef.current;
    if (container && formHtml) {
      const form = container.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleFormSubmit);
      }
    }
    
    // Cleanup function to remove the event listener
    return () => {
      if (container) {
        const form = container.querySelector('form');
        if (form) {
          form.removeEventListener('submit', handleFormSubmit);
        }
      }
    };
  }, [formHtml]);


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const dataObject = Object.fromEntries(formData.entries());

    // Add required metadata
    dataObject.formId = formId;
    dataObject.車架號碼 = frameNumber;
    dataObject.作業人員 = userName;
    dataObject.日期 = new Date().toISOString().split('T')[0]; // Add current date

    try {
      const result = await callApi('processFormSubmit', { formData: dataObject });
      showNotification(result.message || '表單提交成功！', 'success');
      // Redirect back to home page after a short delay
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      showNotification(`提交失敗: ${error.message}`, 'error');
      setIsLoading(false);
    }
  };

  const showNotification = (message, type, duration = 3000) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', visible: false });
    }, duration);
  };

  return (
    <>
      <div className="main-container">
        <div className="content-card">
          <div className="workflow-header">
            <h2>{formTitle}</h2>
            <p>車架號碼: <strong>{frameNumber}</strong> | 作業人員: <strong>{userName}</strong></p>
          </div>
          
          {/* This is where the external HTML is rendered */}
          <div 
            ref={formContainerRef} 
            className="form-container"
            dangerouslySetInnerHTML={{ __html: formHtml }} 
          />

          <div className="workflow-actions" style={{marginTop: '1rem'}}>
             <button className="btn-secondary" onClick={() => navigate('/')}>返回首頁</button>
          </div>
        </div>
      </div>

      {/* --- Loader and Notification --- */}
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

export default FormPage;
