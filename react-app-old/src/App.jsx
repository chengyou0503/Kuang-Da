import React, { useState, useEffect } from 'react';
import { gasApi } from './services/api';
import HomeScreen from './components/HomeScreen';
import ProgressDashboard from './components/ProgressDashboard';
import FormView from './components/FormView';
import Loader from './components/Loader';
import Notification from './components/Notification';

function App() {
  const [view, setView] = useState('loading'); // loading, home, dashboard, form
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [currentFrameNumber, setCurrentFrameNumber] = useState('');
  const [currentForm, setCurrentForm] = useState({ formId: null, isEdit: false });

  useEffect(() => {
    gasApi.run('getInitialPayload')
      .then(response => {
        if (response.success) {
          setInitialData(response.data);
          setView('home');
        } else {
          setError(response.message);
          setView('error');
        }
      })
      .catch(err => {
        setError(err.message);
        setView('error');
      });
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleStartProcess = (frameNumber) => {
    setCurrentFrameNumber(frameNumber);
    setView('dashboard');
  };
  
  const handleShowForm = (formId, isEdit = false) => {
    setCurrentForm({ formId, isEdit });
    setView('form');
  };

  const handleGoHome = () => {
    setCurrentFrameNumber('');
    setCurrentForm({ formId: null, isEdit: false });
    setView('home');
  };

  const renderView = () => {
    switch (view) {
      case 'loading':
        return <Loader message="正在初始化應用..." />;
      case 'error':
        return <div className="content-card">{error}</div>;
      case 'home':
        return (
          <HomeScreen
            config={initialData.config}
            onStartProcess={handleStartProcess}
            onShowForm={handleShowForm}
          />
        );
      case 'dashboard':
        return (
          <ProgressDashboard
            frameNumber={currentFrameNumber}
            config={initialData.config}
            onShowForm={handleShowForm}
            onGoHome={handleGoHome}
            showNotification={showNotification}
          />
        );
      case 'form':
         return (
          <FormView
            frameNumber={currentFrameNumber}
            formId={currentForm.formId}
            isEdit={currentForm.isEdit}
            config={initialData.config}
            maintenanceData={initialData.maintenanceData}
            onBackToDashboard={() => setView('dashboard')}
            onGoHome={handleGoHome}
            showNotification={showNotification}
           />
         );
      default:
        return <div>未知視圖</div>;
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>車輛品管流程系統</h1>
      </header>
      <main className="main-container">
        {renderView()}
      </main>
      <Notification message={notification.message} type={notification.type} />
    </>
  );
}

export default App;
