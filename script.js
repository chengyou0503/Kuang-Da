// --- Main Application Logic ---
const app = {
  // --- JSONP API Client ---
  gasApi: { /* ... (no change) ... */ },

  state: { /* ... (no change) ... */ },
  dom: {},
  config: {},
  templates: {}, // Will be populated on-demand
  maintenanceData: {},

  cacheDomElements() { /* ... (no change) ... */ },

  init() {
    this.cacheDomElements();
    this.showLoader('正在初始化應用...');
    
    this.gasApi.run('getInitialPayload')
      .then(response => {
        if (response.success) {
            const payload = response.data;
            this.config = payload.config;
            // Templates are no longer loaded initially
            this.maintenanceData = payload.maintenanceData;
            this.setupEventListeners();
            this.renderTabs();
            this.loadPersistedData();
            this.hideLoader();
            this.dom.userNameInput.focus();
            this.setActiveTab('in-factory');
        } else {
            this.handleError(response.message);
        }
      })
      .catch(this.handleError.bind(this));
  },

  // MODIFIED: Removed length check for frame number
  startProcess() {
    const frameNumber = this.dom.frameNumberInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!this.dom.userNameInput.value.trim()) return this.showNotification('請輸入作業人員', 'error');
    // The check for frameNumber.length < 6 has been removed.
    if (!frameNumber) return this.showNotification('請輸入有效車架號碼', 'error');
    
    this.dom.frameNumberInput.value = frameNumber;
    this.state.currentFrameNumber = frameNumber;
    this.fetchAndShowProgressDashboard(frameNumber);
  },

  fetchAndShowProgressDashboard(frameNumber) { /* ... */ },

  // Fetches the form structure (JSON) from the backend
  fetchFormStructure(formId) {
    this.showLoader(`正在載入表單 ${formId} 結構...`);
    return this.gasApi.run('getFormStructure', { formId })
      .then(response => {
        this.hideLoader();
        if (response.success) {
          return response.data; // Returns the JSON structure
        } else {
          throw new Error(response.message);
        }
      });
  },

  // Builds an HTML form from a JSON structure object
  buildFormHtml(formStructure) {
    let html = `<form id="${formStructure.id || 'dynamic-form'}">`;
    formStructure.groups.forEach(group => {
      html += `<fieldset class="form-group">`;
      if (group.title) {
        html += `<legend>${group.title}</legend>`;
      }
      group.fields.forEach(field => {
        const fieldId = `${formStructure.id}_${field.name}`;
        html += `<div class="form-field type-${field.type}">`;
        html += `<label for="${fieldId}">${field.label}</label>`;
        switch (field.type) {
          case 'radio':
            field.options.forEach(option => {
              html += `<div class="radio-option">
                         <input type="radio" id="${fieldId}_${option}" name="${field.name}" value="${option}" required>
                         <label for="${fieldId}_${option}">${option}</label>
                       </div>`;
            });
            break;
          case 'checkbox':
            html += `<input type="checkbox" id="${fieldId}" name="${field.name}">`;
            break;
          case 'file':
            html += `<input type="file" id="${fieldId}" name="${field.name}" accept="image/*" onchange="previewImage(event, '${field.name}_preview')">
                     <img id="${field.name}_preview" class="image-preview" src="#" alt="預覽">`;
            break;
          default: // text, date, etc.
            html += `<input type="${field.type}" id="${fieldId}" name="${field.name}" required>`;
            break;
        }
        html += `</div>`;
      });
      html += `</fieldset>`;
    });
    html += `</form>`;
    return html;
  },

  // MODIFIED: showFormBase now implements lazy loading AND dynamic rendering
  async showFormBase(formId, isEdit, context) {
    try {
      // Always fetch the structure for now, caching can be added later if needed.
      const formStructure = await this.fetchFormStructure(formId);
      if (!formStructure) {
        return this.handleError(`無法載入表單 ${formId} 的結構。`);
      }
      
      // Add formId to the structure for easier reference in buildFormHtml
      formStructure.id = formId; 
      const formHtml = this.buildFormHtml(formStructure);

      const userName = this.dom.userNameInput.value.trim();
      this.dom.workflowContainer.innerHTML = `
        <div class="content-card active">
          <div class="workflow-header"> <h2>${context.title}</h2> <p>${context.subtitle} | 作業人員: <strong>${userName}</strong></p> </div>
          <div class="form-container">${formHtml}</div>
          <div class="workflow-actions">${context.backButton}</div>
        </div>`;
        
      const form = this.dom.workflowContainer.querySelector('form');
      document.body.classList.add('webapp-context');
      form.onsubmit = this.handleFormSubmit.bind(this);
      
      // Populate common fields and load existing data if in edit mode
      if (this.config.IN_FACTORY_FORMS.includes(formId) && this.state.currentFrameNumber) {
          this.populateDynamicFields(form, formId, this.state.currentFrameNumber);
          if (isEdit) {
              this.loadAndPopulateFormData(form, formId, this.state.currentFrameNumber);
          }
      } else if (this.config.OUT_FACTORY_FORMS.includes(formId) && isEdit) {
          // Note: Out-factory forms might need a different identifier than frameNumber to load data
          this.loadAndPopulateFormData(form, formId, this.state.currentFrameNumber);
      }

      this.showScreen('workflow-container');

    } catch (error) {
      this.handleError(error);
    }
  },

  // ... (The rest of the functions remain unchanged) ...
  gasApi: {
    run(action, params = {}) {
      const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyw4em9OjJVAaXBciPOoeT5qFosmIza7NQ5idgibY4qI7dupH34NAyJTH3F5tbOGmhn/exec';
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
  },
  state: { currentFrameNumber: null, qrScanner: null, isEditMode: false },
  dom: {},
  config: {},
  templates: {},
  maintenanceData: {},
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
  setupEventListeners() {
    this.dom.startBtn.addEventListener('click', this.startProcess.bind(this));
    this.dom.scanBtn.addEventListener('click', this.toggleScanner.bind(this));
    this.dom.frameNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.startProcess();
    });
    this.dom.tabsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab')) {
            this.setActiveTab(e.target.dataset.tab);
        }
    });
  },

  toggleScanner() {
    if (this.state.qrScanner) {
        this.state.qrScanner.stop().then(() => {
            console.log("QR Code scanning stopped.");
            this.state.qrScanner = null;
            document.getElementById('qr-reader').style.display = 'none';
        }).catch(err => console.error("Error stopping the scanner: ", err));
    } else {
        const qrReaderElement = document.getElementById('qr-reader');
        qrReaderElement.style.display = 'block';
        this.state.qrScanner = new Html5Qrcode("qr-reader");
        this.state.qrScanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                this.dom.frameNumberInput.value = decodedText;
                this.toggleScanner(); // Stop scanner after successful scan
                this.startProcess();
            },
            (errorMessage) => {
                // console.log("QR Code scan error: ", errorMessage);
            }
        ).catch(err => {
            console.error("Unable to start scanning.", err);
            this.showNotification('無法啟動相機，請檢查權限。', 'error');
            qrReaderElement.style.display = 'none';
        });
    }
  },

  setActiveTab(tabId) { /* ... */ },
  renderTabs() { /* ... */ },
  loadPersistedData() { /* ... */ },
  showScreen(screenId) {
    if (screenId === 'home-screen') {
      this.dom.homeScreen.style.display = 'block';
      this.dom.workflowContainer.style.display = 'none';
    } else {
      this.dom.homeScreen.style.display = 'none';
      this.dom.workflowContainer.style.display = 'block';
    }
  },

  fetchAndShowProgressDashboard(frameNumber) {
    this.showLoader('正在查詢車輛進度...');
    this.gasApi.run('getVehicleProgress', { frameNumber })
      .then(response => {
        this.hideLoader();
        if (response.success) {
          this.renderProgressDashboard(response.data);
          this.showScreen('workflow-container');
        } else {
          this.handleError(response.message);
        }
      })
      .catch(this.handleError.bind(this));
  },
  renderProgressDashboard(progress) { /* ... */ },
  showForm(formId, frameNumber, isEdit = false) { /* ... */ },
  showDirectForm(formId) { /* ... */ },
  populateDynamicFields(form, formId, frameNumber) { /* ... */ },

  loadAndPopulateFormData(form, formId, frameNumber) {
    this.showLoader('正在載入歷史資料...');
    this.gasApi.run('getFormResponseData', { formId, frameNumber })
      .then(response => {
        if (response.success && response.data) {
          const formData = response.data;
          for (const key in formData) {
            const value = formData[key];
            
            // FIX: Handle cases where backend keys might have a redundant prefix (e.g., KD04_KD04_Item1)
            const nameToFind = key.startsWith(formId + '_') ? key.substring(formId.length + 1) : key;
            
            const element = form.querySelector(`[name="${nameToFind}"]`);
            
            if (element) {
              switch (element.type) {
                case 'radio':
                  const radioToSelect = form.querySelector(`[name="${nameToFind}"][value="${value}"]`);
                  if (radioToSelect) radioToSelect.checked = true;
                  break;
                case 'checkbox':
                  element.checked = (value === true || value === 'true');
                  break;
                case 'file':
                  if (typeof value === 'string' && value.startsWith('http')) {
                    const link = document.createElement('a');
                    link.href = value;
                    link.textContent = '查看已上傳的圖片';
                    link.target = '_blank';
                    link.style.marginLeft = '10px';
                    element.parentNode.insertBefore(link, element.nextSibling);
                  }
                  break;
                default:
                  element.value = value;
                  break;
              }
            }
          }
        } else if (!response.success) {
          this.showNotification(`無法載入資料: ${response.message}`, 'error');
        }
        this.hideLoader();
      })
      .catch(this.handleError.bind(this));
  },

  async handleFormSubmit(event) {
    event.preventDefault();
    this.showLoader('正在提交資料...');
    const form = event.target;
    const formData = new FormData(form);
    const dataObject = Object.fromEntries(formData.entries());

    // --- NEW: Image Upload Handling ---
    const fileInputs = form.querySelectorAll('input[type="file"]');
    const imagePromises = [];

    fileInputs.forEach(input => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const promise = new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // The backend expects the key like 'photoData1', which is the input's name
            dataObject[input.name] = e.target.result;
            resolve();
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
        imagePromises.push(promise);
      }
    });

    try {
      await Promise.all(imagePromises); // Wait for all images to be read
      this.submitDataToServer(dataObject);
    } catch (error) {
      this.handleError('讀取圖片時發生錯誤: ' + error);
    }
  },

  submitDataToServer(dataObject) { /* ... */ },
  goHome() { /* ... */ },
  resizeImage(file, maxWidth, quality, callback) { /* ... */ }
};
document.addEventListener('DOMContentLoaded', () => app.init());
function previewImage(event, previewId) { /* ... */ }