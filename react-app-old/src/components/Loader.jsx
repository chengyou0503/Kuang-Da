import React from 'react';

function Loader({ message = '處理中...' }) {
  return (
    <div id="loader">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loader;
