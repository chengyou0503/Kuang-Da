import React, { useState, useEffect } from 'react';
import { gasApi } from '../services/api';
import Loader from './Loader';

function ProgressDashboard({ frameNumber, config, onShowForm, onGoHome, showNotification }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    gasApi.run('getVehicleProgress', { frameNumber })
      .then(response => {
        if (response.success) {
          setProgress(response.data.progress);
        } else {
          setError(response.message);
          showNotification(response.message, 'error');
        }
      })
      .catch(err => {
        setError(err.message);
        showNotification(err.message, 'error');
      })
      .finally(() => setLoading(false));
  }, [frameNumber, showNotification]);

  if (loading) {
    return <Loader message={`正在載入 ${frameNumber} 的進度...`} />;
  }

  if (error) {
    return (
      <div className="content-card">
        <p>載入進度失敗: {error}</p>
        <button onClick={onGoHome} className="btn-secondary">返回首頁</button>
      </div>
    );
  }

  if (!progress) {
    return null;
  }

  let nextStepFound = false;

  return (
    <div className="content-card">
      <div className="workflow-header">
        <h2>{progress.frameNumber} 的完整進度</h2>
        <p>點擊按鈕開始作業或編輯已完成的表單。</p>
      </div>
      <div className="progress-stepper">
        {config.IN_FACTORY_FORMS.map((formId) => {
          const station = progress.stations[formId] || { status: '未開始' };
          let stepClass = '';
          let actionButton;

          if (station.status === '完成') {
            stepClass = 'completed';
            actionButton = (
              <button className="btn-secondary" onClick={() => onShowForm(formId, true)}>
                查看/編輯
              </button>
            );
          } else if (!nextStepFound) {
            stepClass = 'current';
            actionButton = (
              <button className="btn-primary" onClick={() => onShowForm(formId, false)}>
                開始作業
              </button>
            );
            nextStepFound = true;
          } else {
            actionButton = <button disabled>待辦</button>;
          }

          return (
            <div key={formId} className={`step ${stepClass}`}>
              <div className="step-content">
                <h3>
                  {config.FORM_NAMES[formId]}
                  <span className="form-id">{formId}</span>
                </h3>
                <p>
                  {station.status === '完成'
                    ? `完成於: ${station.time} by ${station.user}`
                    : `狀態: ${station.status}`}
                </p>
                {actionButton}
              </div>
            </div>
          );
        })}
      </div>
      <div className="workflow-actions" style={{ marginTop: '2rem' }}>
        <button onClick={onGoHome} className="btn-secondary">返回首頁</button>
      </div>
    </div>
  );
}

export default ProgressDashboard;
