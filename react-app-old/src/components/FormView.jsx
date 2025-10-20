import React, { useState, useEffect, lazy, Suspense } from 'react';
import { gasApi } from '../services/api';
import Loader from './Loader';

// Lazy load all possible form components
const formComponents = {
  KD03: lazy(() => import('./forms/KD03')),
  KD04: lazy(() => import('./forms/KD04')),
  KD06: lazy(() => import('./forms/KD06')),
  KD12: lazy(() => import('./forms/KD12')),
  KD22: lazy(() => import('./forms/KD22')),
  KD25: lazy(() => import('./forms/KD25')),
  KD26: lazy(() => import('./forms/KD26')),
};

function FormView({ frameNumber, formId, isEdit, config, maintenanceData, onBackToDashboard, onGoHome, showNotification }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName] = useState(localStorage.getItem('userName') || '');

  useEffect(() => {
    if (isEdit && frameNumber) {
      setLoading(true);
      gasApi.run('getFormResponseData', { formId, frameNumber })
        .then(response => {
          if (response.success) {
            setFormData(response.data || {});
          } else {
            setError(response.message);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setFormData({});
    }
  }, [formId, frameNumber, isEdit]);

  const handleSubmit = (formDataObject) => {
    const payload = {
      ...formDataObject,
      formId,
      作業人員: userName,
      車架號碼: frameNumber,
      車輛型號: frameNumber ? frameNumber.substring(0, 4) : '',
    };
    
    // Handle multi-vehicle form KD22
    if (formId === 'KD22') {
        delete payload.車架號碼; // Remove single frame number
    }

    gasApi.run('processFormSubmit', { formData: payload })
      .then(response => {
        if (response.success) {
          showNotification(response.message, 'success');
          if (config.IN_FACTORY_FORMS.includes(formId)) {
            onBackToDashboard();
          } else {
            onGoHome();
          }
        } else {
          showNotification(response.message, 'error');
        }
      })
      .catch(err => showNotification(err.message, 'error'));
  };

  const FormComponent = formComponents[formId];
  
  const backButton = config.IN_FACTORY_FORMS.includes(formId)
    ? <button onClick={onBackToDashboard} className="btn-secondary">返回進度看板</button>
    : <button onClick={onGoHome} className="btn-secondary">返回首頁</button>;

  if (!FormComponent) {
    return <div>找不到表單 {formId}</div>;
  }

  return (
    <div className="content-card">
      <div className="workflow-header">
        <h2>{isEdit ? '編輯' : '處理'}：{config.FORM_NAMES[formId]}</h2>
        <p>
          {frameNumber && `車架號碼: <strong>${frameNumber}</strong> | `}
          作業人員: <strong>{userName}</strong>
        </p>
      </div>
      <div className="form-container">
        <Suspense fallback={<Loader message="正在載入表單..." />}>
          {loading ? (
            <Loader message="正在載入歷史紀錄..." />
          ) : (
            <FormComponent
              initialData={formData}
              onSubmit={handleSubmit}
              frameNumber={frameNumber}
              maintenanceData={maintenanceData}
            />
          )}
        </Suspense>
      </div>
      <div className="workflow-actions" style={{ marginTop: '2rem' }}>
        {backButton}
      </div>
    </div>
  );
}

export default FormView;
