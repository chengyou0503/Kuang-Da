import React from 'react';

function Notification({ message, type }) {
  if (!message) {
    return null;
  }

  return (
    <div id="notification" className={`${type} show`}>
      {message}
    </div>
  );
}

export default Notification;
