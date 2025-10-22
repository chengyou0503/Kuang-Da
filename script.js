const app = {
  // --- API Client for Google Apps Script ---
  gasApi: {
    run(action, params = {}) {
      // Replace with your actual Google Apps Script Web App URL
      const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwUUkmgPjcIz47rgRqTsjUcaw9xAtwoBU_ibpgeENhY_4M8G1bk7BIr7FlHvw-3nNXGYQ/exec';
      console.log(`%c[API Request] -> ${action}`, 'color: #0052cc; font-weight: bold;', params);
      
      return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const script = document.createElement('script');
        let url = `${GAS_WEB_APP_URL}?action=${action}&callback=${callbackName}`;
        
        Object.keys(params).forEach(key => {
          let value = params[key];
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        });
        
        script.src = url;
        
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request timed out for action: ${action}`));
          cleanup();
        }, 20000); // 20-second timeout

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
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };

        script.onerror = () => {
          reject(new Error(`Script error for action: ${action}`));
          cleanup();
        };
        
        document.head.appendChild(script);
      });
    }
  },

  // --- Application State ---
  state: {
    currentFrameNumber: null,
    qrScanner: null,
    isEditMode: false,
    formCache: {}, // Cache for preloaded form HTML
  },

  // --- DOM Element Cache ---
  dom: {},

  // --- Configuration from Backend ---
  config: {},
  
  // --- Maintenance Data from Backend ---
  maintenanceData: {},

  // --- Caches DOM elements for quick access ---
  cacheDomElements() {
    this.dom = {
      loader: document.getElementById('loader'),
      notification: document.getElementById('notification'),
      mainContent: document.getElementById('main-content'),
      homeScreen: document.getElementById('home-screen'),
      workflowContainer: document.getElementById('workflow-container'),
      userNameInput: document.getElementById('user-name-input'),
      frameNumberInput: document.getElementById('frame-number-input'),
      tabsContainer: document.getElementById('tabs-container'),
      inFactoryContent: document.getElementById('in-factory-content'),
      outFactoryContent: document.getElementById('out-factory-content'),
      startBtn: document.getElementById('start-btn'),
      scanBtn: document.getElementById('scan-btn'),
    };
  },

  // --- Initializes the application ---
  init() {
    this.cacheDomElements();
    this.bindEvents(); // Manually bind 'this' for all event handlers
    this.showLoader('正在初始化應用...');
    
    this.gasApi.run('getInitialPayload')
      .then(response => {
        if (response.success) {
          const payload = response.data;
          this.config = payload.config;
          this.maintenanceData = payload.maintenanceData;
          
          this.preloadForms(); 
          this.setupEventListeners();
          this.renderTabs();
          this.loadPersistedData();
          this.setActiveTab('in-factory');
        } else {
          this.handleError(response.message);
        }
      })
      .catch(this.handleError.bind(this))
      .finally(() => this.hideLoader());
  },

  // --- Manually binds 'this' for all event handlers ---
  bindEvents() {
    this.startProcess = this.startProcess.bind(this);
    this.toggleScanner = this.toggleScanner.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.goHome = this.goHome.bind(this);
    this.showForm = this.showForm.bind(this);
    this.showDirectForm = this.showDirectForm.bind(this);
  },
  
  // --- Preloads all form HTML for instant access ---
  async preloadForms() {
    const allForms = [...this.config.IN_FACTORY_FORMS, ...this.config.OUT_FACTORY_FORMS];
    for (const formId of allForms) {
      try {
        // Corrected path to fetch from the root forms directory
        const response = await fetch(`forms/${formId}.html`);
        if (!response.ok) throw new Error(`Form ${formId} not found at forms/${formId}.html`);
        this.state.formCache[formId] = await response.text();
      } catch (error) {
        console.error(`Failed to preload form ${formId}:`, error);
      }
    }
  },

  // --- Fetches form structure from the local cache ---
  fetchFormStructure(formId) {
    return new Promise((resolve, reject) => {
      if (this.state.formCache[formId]) {
        resolve(this.state.formCache[formId]);
      } else {
        // Fallback for forms that failed to preload
        console.warn(`Form ${formId} was not preloaded, fetching now.`);
        fetch(`forms/${formId}.html`)
          .then(response => {
            if (!response.ok) throw new Error(`Form ${formId} not found.`);
            return response.text();
          })
          .then(html => {
            this.state.formCache[formId] = html;
            resolve(html);
          })
          .catch(error => {
            this.handleError(`無法載入表單 ${formId}。`);
            reject(error);
          });
      }
    });
  },

  // --- Sets up all event listeners ---
  setupEventListeners() {
    this.dom.startBtn.addEventListener('click', this.startProcess);
    this.dom.scanBtn.addEventListener('click', this.toggleScanner);
    this.dom.frameNumberInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.startProcess();
    });
    this.dom.tabsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab')) {
        this.setActiveTab(e.target.dataset.tab);
      }
    });
  },

  // --- Renders the main tabs based on config ---
  renderTabs() {
    // This function can be expanded if tabs become dynamic.
    // For now, the HTML is static, so this function just ensures visibility.
    this.dom.inFactoryContent.style.display = 'block';
    this.dom.outFactoryContent.style.display = 'none';
  },

  // --- Handles tab switching ---
  setActiveTab(tabId) {
    const tabs = this.dom.tabsContainer.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    this.dom.tabsContainer.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    if (tabId === 'in-factory') {
      this.dom.inFactoryContent.style.display = 'block';
      this.dom.outFactoryContent.style.display = 'none';
    } else {
      this.dom.inFactoryContent.style.display = 'none';
      this.dom.outFactoryContent.style.display = 'block';
      this.renderOutFactoryForms();
    }
  },
  
  // --- Renders buttons for out-of-factory forms ---
  renderOutFactoryForms() {
    if (!this.config.OUT_FACTORY_FORMS || this.config.OUT_FACTORY_FORMS.length === 0) {
      this.dom.outFactoryContent.innerHTML = '<p>目前沒有廠外流程。</p>';
      return;
    }
    
    let html = '<div class="out-factory-grid">';
    this.config.OUT_FACTORY_FORMS.forEach(formId => {
      const formName = this.maintenanceData[formId] || formId;
      html += `<button class="btn-secondary" onclick="app.showDirectForm('${formId}')">${formName}</button>`;
    });
    html += '</div>';
    this.dom.outFactoryContent.innerHTML = html;
  },

  // --- Loads persisted data from localStorage ---
  loadPersistedData() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.dom.userNameInput.value = savedName;
    }
  },

  // --- Starts the vehicle process workflow ---
  startProcess() {
    const frameNumber = this.dom.frameNumberInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const userName = this.dom.userNameInput.value.trim();

    if (!userName) return this.showNotification('請輸入作業人員', 'error');
    if (!frameNumber) return this.showNotification('請輸入有效車架號碼', 'error');
    
    localStorage.setItem('userName', userName);
    this.dom.frameNumberInput.value = frameNumber;
    this.state.currentFrameNumber = frameNumber;
    this.fetchAndShowProgressDashboard(frameNumber);
  },

  // --- Fetches and displays the progress dashboard ---
  fetchAndShowProgressDashboard(frameNumber) {
    this.showLoader('正在查詢車輛進度...');
    this.gasApi.run('getVehicleProgress', { frameNumber })
      .then(response => {
        if (response.success) {
          this.renderProgressDashboard(response.data);
          this.showScreen('workflow-container');
        } else {
          this.handleError(response.message);
        }
      })
      .catch(this.handleError.bind(this))
      .finally(() => this.hideLoader());
  },

  // --- Renders the progress stepper dashboard ---
  renderProgressDashboard(data) {
    // Handle the data structure from the backend { progress: {...}, isNew: true/false }
    const progress = data.progress || {};
    const completedForms = Object.keys(progress).filter(key => progress[key] === true)
                                 .map(id => String(id).trim().toUpperCase());

    let nextForm = null;
    for (const formId of this.config.IN_FACTORY_FORMS) {
      const normalizedFormId = String(formId).trim().toUpperCase();
      if (!completedForms.includes(normalizedFormId)) {
        nextForm = normalizedFormId;
        break;
      }
    }

    let stepsHtml = '<div class="progress-stepper">';
    this.config.IN_FACTORY_FORMS.forEach(formId => {
      const formName = this.maintenanceData[formId] || formId;
      const normalizedFormId = String(formId).trim().toUpperCase();
      const isCompleted = completedForms.includes(normalizedFormId);
      const isCurrent = nextForm === normalizedFormId;
      
      let stepClass = 'step';
      if (isCompleted) stepClass += ' completed';
      if (isCurrent) stepClass += ' current';

      stepsHtml += `
        <div class="${stepClass}" id="step-${formId}">
          <div class="step-content">
            <h3>${formName} <span class="status-indicator">${isCompleted ? '✓ 已完成' : (isCurrent ? '» 進行中' : '待辦')}</span></h3>
            <p>狀態: ${isCompleted ? '已完成' : '未完成'}</p>
            <button class="btn-primary" data-form-id="${formId}" data-is-completed="${isCompleted}">
              ${isCompleted ? '查看/編輯' : '開始作業'}
            </button>
          </div>
        </div>`;
    });
    stepsHtml += '</div>';
    
    this.dom.workflowContainer.innerHTML = `
      <div class="content-card active">
        <div class="workflow-header">
          <h2>車輛進度儀表板</h2>
          <p>車架號碼: <strong>${this.state.currentFrameNumber}</strong> | 作業人員: <strong>${this.dom.userNameInput.value.trim()}</strong></p>
        </div>
        ${stepsHtml}
        <div class="workflow-actions">
          <button class="btn-secondary" id="back-to-home">返回主畫面</button>
        </div>
      </div>`;

    // Use Event Listeners with pre-bound 'this'
    this.dom.workflowContainer.querySelector('#back-to-home').addEventListener('click', this.goHome);
    this.dom.workflowContainer.querySelectorAll('.btn-primary').forEach(button => {
      button.addEventListener('click', (e) => {
        const formId = e.currentTarget.dataset.formId;
        const isCompleted = e.currentTarget.dataset.isCompleted === 'true';
        this.showForm(formId, this.state.currentFrameNumber, isCompleted);
      });
    });
  },

  // --- Shows a specific form ---
  showForm(formId, frameNumber, isEdit = false) {
    this.state.isEditMode = isEdit;
    const formName = this.maintenanceData[formId] || formId;
    const context = {
      title: formName,
      subtitle: `車架號碼: ${frameNumber}`,
      backButtonText: '返回進度儀表板',
      backButtonAction: () => this.fetchAndShowProgressDashboard(frameNumber)
    };
    this.showFormBase(formId, isEdit, context);
  },
  
  // --- Shows a form that is not tied to a frame number ---
  showDirectForm(formId) {
    this.state.isEditMode = false; // These forms are typically for new entries
    const formName = this.maintenanceData[formId] || formId;
    const context = {
        title: formName,
        subtitle: '請填寫以下欄位',
        backButtonText: '返回主畫面',
        backButtonAction: () => this.goHome()
    };
        this.showFormBase(formId, false, context);
      },
    
      // --- Populates form fields with dynamic data ---
      populateDynamicFields(form, formId, frameNumber) {
        const userNameField = form.querySelector('[name="userName"]');
        if (userNameField) userNameField.value = this.dom.userNameInput.value.trim();
        
        const frameNumberField = form.querySelector('[name="frameNumber"]');
        if (frameNumberField) frameNumberField.value = frameNumber;
        
        const dateField = form.querySelector('[name="date"]');
        if (dateField) dateField.valueAsDate = new Date();
      },
    
        // --- Base function to render a form from the backend ---
        async showFormBase(formId, isEdit, context) {
          try {
            this.showLoader(`正在載入表單...`);
      
            // 1. Fetch the form HTML first.
            const formHtml = await this.fetchFormStructure(formId);
            if (!formHtml) throw new Error(`無法載入表單 ${formId} 的 HTML。`);
      
            // 2. Render the main structure with the form HTML inside.
            this.dom.workflowContainer.innerHTML = `
              <div class="content-card active">
                <div class="workflow-header">
                  <h2>${context.title}</h2>
                  <p>${context.subtitle} | 作業人員: <strong>${this.dom.userNameInput.value.trim()}</strong></p>
                </div>
                <div class="form-container">${formHtml}</div>
                <div class="workflow-actions">
                  <button type="submit" form="${formId}" class="btn-primary">提交表單</button>
                  <button class="btn-secondary" id="back-button">${context.backButtonText}</button>
                </div>
              </div>`;
            
            // 3. Now that the form is in the DOM, get a reference to it.
            const form = this.dom.workflowContainer.querySelector('form');
            if (!form) throw new Error('在載入的 HTML 中找不到 <form> 元素。');
      
            // 4. Attach event listeners.
            form.addEventListener('submit', this.handleFormSubmit);
            this.dom.workflowContainer.querySelector('#back-button').addEventListener('click', context.backButtonAction);
            
            // 5. Populate dynamic fields (like username, framenumber).
            this.populateDynamicFields(form, form.id, this.state.currentFrameNumber);
            
            // 6. If in edit mode, NOW populate it with historical data.
            if (isEdit) {
              await this.loadAndPopulateFormData(form, form.id, this.state.currentFrameNumber);
            }
            
            this.showScreen('workflow-container');
          } catch (error) {
            this.handleError(error);
          } finally {
            this.hideLoader();
          }
        },
  // --- Loads and populates a form with existing data ---
  loadAndPopulateFormData(form, formId, frameNumber) {
    // Return a promise to allow async/await
    return new Promise((resolve, reject) => {
      this.gasApi.run('getFormResponseData', { formId, frameNumber })
        .then(response => {
          if (response.success && response.data) {
            const formData = response.data;
            for (const key in formData) {
              const nameToFind = key.startsWith(formId + '_') ? key.substring(formId.length + 1) : key;
              const element = form.querySelector(`[name="${nameToFind}"]`);
              
              if (element) {
                switch (element.type) {
                  case 'radio':
                    const radioToSelect = form.querySelector(`[name="${nameToFind}"][value="${formData[key]}"]`);
                    if (radioToSelect) radioToSelect.checked = true;
                    break;
                  case 'checkbox':
                    element.checked = (formData[key] === true || formData[key] === 'true');
                    break;
                  case 'file':
                    if (typeof formData[key] === 'string' && formData[key].startsWith('http')) {
                      const preview = document.getElementById(`${form.id}_${nameToFind}_preview`);
                      if(preview) {
                          preview.src = formData[key];
                          preview.style.display = 'block';
                      }
                    }
                    break;
                  default:
                    element.value = formData[key];
                    break;
                }
              }
            }
            resolve(); // Resolve the promise on success
          } else if (!response.success) {
            this.showNotification(`無法載入資料: ${response.message}`, 'error');
            reject(new Error(response.message)); // Reject on API error
          } else {
            resolve(); // Resolve even if there's no data
          }
        })
        .catch(err => {
          this.handleError(err);
          reject(err); // Reject on network or other errors
        });
    });
  },

  // --- Handles form submission ---
  async handleFormSubmit(event) {
    event.preventDefault();
    this.showLoader('正在提交資料...');
    const form = event.target;
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());
    dataObject.formId = form.id; // Add formId to the submission

    const fileInputs = form.querySelectorAll('input[type="file"]');
    const imagePromises = Array.from(fileInputs).map(input => {
      if (input.files && input.files[0]) {
        return this.resizeImage(input.files[0], 1024, 0.8)
          .then(resizedDataUrl => {
            dataObject[input.name] = resizedDataUrl;
          });
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(imagePromises);
      this.submitDataToServer(dataObject);
    } catch (error) {
      this.handleError('處理圖片時發生錯誤: ' + error.message);
      this.hideLoader();
    }
  },

  // --- Submits data to the server ---
  submitDataToServer(dataObject) {
    this.gasApi.run('processFormSubmit', { formData: dataObject }) // FIX: Changed action to 'processFormSubmit' and wrapped data
      .then(response => {
        if (response.success) {
          this.showNotification('資料提交成功！', 'success');
          if (this.config.IN_FACTORY_FORMS.includes(dataObject.formId)) {
            this.fetchAndShowProgressDashboard(this.state.currentFrameNumber);
          } else {
            this.goHome();
          }
        } else {
          this.handleError(response.message);
        }
      })
      .catch(this.handleError.bind(this))
      .finally(() => this.hideLoader());
  },

  // --- Toggles the QR code scanner ---
  toggleScanner() {
    if (this.state.qrScanner && this.state.qrScanner.isScanning) {
      this.state.qrScanner.stop()
        .then(() => console.log("QR Code scanning stopped."))
        .catch(err => console.error("Error stopping scanner:", err))
        .finally(() => {
          document.getElementById('qr-reader').style.display = 'none';
        });
    } else {
      const qrReaderElement = document.getElementById('qr-reader');
      qrReaderElement.style.display = 'block';
      this.state.qrScanner = new Html5Qrcode("qr-reader");
      this.state.qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          this.dom.frameNumberInput.value = decodedText;
          this.toggleScanner();
          this.startProcess();
        },
        (errorMessage) => { /* Ignore partial scans */ }
      ).catch(err => {
        this.handleError('無法啟動相機，請檢查權限。');
        qrReaderElement.style.display = 'none';
      });
    }
  },

  // --- Switches between screens ---
  showScreen(screenId) {
    this.dom.homeScreen.style.display = (screenId === 'home-screen') ? 'block' : 'none';
    this.dom.workflowContainer.style.display = (screenId === 'workflow-container') ? 'block' : 'none';
  },

  // --- Navigates back to the home screen ---
  goHome() {
    this.showScreen('home-screen');
    this.setActiveTab('in-factory'); // Reset to default tab
  },

  // --- Shows the loader overlay ---
  showLoader(message = '處理中...') {
    this.dom.loader.querySelector('p').textContent = message;
    this.dom.loader.classList.remove('hidden');
  },

  // --- Hides the loader overlay ---
  hideLoader() {
    this.dom.loader.classList.add('hidden');
  },

  // --- Shows a notification message ---
  showNotification(message, type = 'success') {
    this.dom.notification.textContent = message;
    this.dom.notification.className = type; // 'success' or 'error'
    this.dom.notification.classList.add('show');
    setTimeout(() => {
      this.dom.notification.classList.remove('show');
    }, 3000);
  },

  // --- Handles all errors ---
  handleError(error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    console.error("An error occurred:", errorMessage);
    this.showNotification(errorMessage, 'error');
    this.hideLoader();
  },

  // --- Resizes an image file ---
  resizeImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// --- Global function for image preview ---
function previewImage(event, previewId) {
  const preview = document.getElementById(previewId);
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

document.addEventListener('DOMContentLoaded', () => app.init());