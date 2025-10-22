// --- Admin App Logic ---
const app = {
  // --- JSONP API Client ---
  gasApi: {
    run(action, params = {}) {
      const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxMa4-FOJxRNReRUPDe5F2qTFAGUjP1pB-X5c6mVbFGBPg-sbRb0OTaxFQx8Y0z6OkNrQ/exec';
      
      console.log(`%c[API Request] -> ${action}`, 'color: #0052cc; font-weight: bold;', params);

      return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback_admin_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
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
        }, 30000);

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
  },

  dom: {},
  config: {},

  init() {
      this.dom = {
          loader: document.getElementById('loader'),
          notification: document.getElementById('notification'),
          formTypeSelect: document.getElementById('form-type'),
          exportBtn: document.getElementById('export-btn'),
          log: document.getElementById('export-log'),
      };
      this.showLoader('正在載入設定...');
      
      this.gasApi.run('getInitialPayload')
          .then(response => {
              if (response.success) {
                  this.config = response.data.config;
                  this.populateFormTypes();
                  this.setupEventListeners();
                  this.hideLoader();
              } else {
                  this.handleError(response.message);
              }
          })
          .catch(this.handleError.bind(this));
  },

  populateFormTypes() {
      const allForms = [...this.config.IN_FACTORY_FORMS, ...this.config.OUT_FACTORY_FORMS];
      allForms.forEach(formId => {
          const option = document.createElement('option');
          option.value = formId;
          option.textContent = `${this.config.FORM_NAMES[formId]} (${formId})`;
          this.dom.formTypeSelect.appendChild(option);
      });
  },

  setupEventListeners() {
      this.dom.exportBtn.addEventListener('click', this.startExport.bind(this));
  },

  startExport() {
      const options = {
          formId: document.getElementById('form-type').value,
          vehicleModel: document.getElementById('vehicle-model').value.trim().toUpperCase(),
          startDate: document.getElementById('start-date').value,
          endDate: document.getElementById('end-date').value,
      };
      if (!options.startDate || !options.endDate) {
          return this.showNotification('請選擇開始和結束日期', 'error');
      }
      this.showLoader('正在準備導出...');
      this.dom.exportBtn.disabled = true;
      this.dom.log.textContent = '導出任務已啟動，請稍候...\n';
      
      this.gasApi.run('bulkExportPdfs', { options })
          .then(response => {
              this.hideLoader();
              this.dom.exportBtn.disabled = false;
              if(response.success) {
                  this.showNotification(response.message, 'success');
                  this.dom.log.textContent += `✔ ${response.message}\n`;
                  if(response.folderUrl) this.dom.log.textContent += `✔ 報告已儲存至雲端資料夾: ${response.folderUrl}\n`;
              } else {
                  this.handleError(response.message);
              }
          })
          .catch(this.handleError.bind(this));
  },

  showLoader(message = '處理中...') {
      this.dom.loader.classList.remove('hidden');
      this.dom.loader.querySelector('p').textContent = message;
  },
  hideLoader() {
      this.dom.loader.classList.add('hidden');
  },
  showNotification(message, type = 'success') {
      const notification = this.dom.notification;
      notification.textContent = message;
      notification.className = `${type} show`;
      setTimeout(() => { notification.className = 'hidden'; }, 4000);
  },
  handleError(error) {
      this.hideLoader();
      this.dom.exportBtn.disabled = false;
      const errorMessage = typeof error === 'object' ? (error.message || JSON.stringify(error)) : String(error);
      this.showNotification(`操作失敗：${errorMessage}`, 'error');
      this.dom.log.textContent += `✖ 操作失敗: ${errorMessage}\n`;
      console.error('[Admin App Error]', error);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());