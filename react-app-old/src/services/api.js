const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyw4em9OjJVAaXBciPOoeT5qFosmIza7NQ5idgibY4qI7dupH34NAyJTH3F5tbOGmhn/exec';

export const gasApi = {
  run(action, params = {}) {
    console.log(`%c[API Request] -> ${action}`, 'color: #0052cc; font-weight: bold;', params);

    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const script = document.createElement('script');
      let url = `${GAS_WEB_APP_URL}?action=${action}&callback=${callbackName}`;

      Object.keys(params).forEach(key => {
        let value = params[key];
        if (typeof value === 'object') value = JSON.stringify(value);
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
      
      script.src = url;

      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out for action: ${action}`));
        cleanup();
      }, 20000);

      window[callbackName] = (response) => {
        if (response.success) {
          console.log(`%c[API Response] <- ${action}`, 'color: #00875a; font-weight: bold;', response);
        } else {
          console.error(`%c[API Error] <- ${action}`, 'color: #de350b; font-weight: bold;', response);
        }
        resolve(response);
        cleanup();
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      script.onerror = () => {
        reject(new Error(`Script error for action: ${action}`));
        cleanup();
      };

      document.head.appendChild(script);
    });
  }
};
