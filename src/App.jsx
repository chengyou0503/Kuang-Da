import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage'; // Import the new form page
import './App.css'; // Main app styles

function App() {
  return (
    <div>
      <nav className="main-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">天王科技品管系統</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">主系統</Link>
            <Link to="/admin" className="nav-link">批量導出工具</Link>
          </div>
        </div>
      </nav>
      
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/form/:formId" element={<FormPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
