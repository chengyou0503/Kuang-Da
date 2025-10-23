/* global Html5Qrcode */
const app = {
  // --- API Client for Google Apps Script ---
  gasApi: {
    run(action, params = {}) {
      // Replace with your actual Google Apps Script Web App URL
      const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwaCruHVMi3XW1uqM8BesmRO2Pgvb2wMiBmFEY594K6MNzNTar7K_LXCQaHcVvFyFzYdg/exec';
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
    vehicleProgressCache: {}, // Cache for vehicle progress data
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
        fetch(`forms/${formId}.html?t=${new Date().getTime()}`)
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
      // Use data attributes instead of inline onclick
      html += `<button class="btn-secondary" data-form-id="${formId}">${formName}</button>`;
    });
    html += '</div>';
    this.dom.outFactoryContent.innerHTML = html;

    // Add event listeners after rendering the HTML
    this.dom.outFactoryContent.querySelectorAll('.btn-secondary').forEach(button => {
      button.addEventListener('click', (e) => {
        const formId = e.currentTarget.dataset.formId;
        this.showDirectForm(formId);
      });
    });
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
  fetchAndShowProgressDashboard(frameNumber, forceRefresh = false) {
    if (!forceRefresh && this.state.vehicleProgressCache[frameNumber]) {
      this.renderProgressDashboard(this.state.vehicleProgressCache[frameNumber]);
      this.showScreen('workflow-container');
      return;
    }

    this.showLoader('正在查詢車輛進度...');
    this.gasApi.run('getVehicleProgress', { frameNumber })
      .then(response => {
        if (response.success) {
          this.state.vehicleProgressCache[frameNumber] = response.data; // Cache the new data
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

  // --- Navigates back to the home screen ---
  goHome() {
    this.showScreen('home-screen');
    this.setActiveTab('in-factory'); // Reset to default tab
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
          // For the new table-based forms, we replace placeholders in the HTML
          const formContainer = this.dom.workflowContainer.querySelector('.form-container');
          let html = formContainer.innerHTML;
      
          const updateTime = new Date().toLocaleString('sv-SE'); // YYYY-MM-DD HH:MM:SS
      
          html = html.replace(/{{車架號碼}}/g, frameNumber || '');
          html = html.replace(new RegExp(`{{${formId}_更新時間}}`, 'g'), updateTime);
          
          formContainer.innerHTML = html;
        },    
        async showFormBase(formId, isEdit, context) {
          try {
            this.showLoader(`正在載入表單...`);
      
            const formHtml = await this.fetchFormStructure(formId);
            if (!formHtml) throw new Error(`無法載入表單 ${formId} 的 HTML。`);
      
            // 1. Render the main structure.
            this.dom.workflowContainer.innerHTML = `
              <div class="content-card active">
                <div class="workflow-header">
                  <h2>${context.title}</h2>
                  <p>${context.subtitle} | 作業人員: <strong>${this.dom.userNameInput.value.trim()}</strong></p>
                </div>
                <div class="form-container">${formHtml}</div>
              </div>`;

            // 2. CRITICAL FIX: Populate dynamic fields BEFORE getting the form reference.
            // This is because populateDynamicFields re-renders the HTML, destroying old references.
            this.populateDynamicFields(null, formId, this.state.currentFrameNumber); // Pass null for form, it's not used there
            
            // 3. NOW, get the final, stable form reference.
            const form = this.dom.workflowContainer.querySelector('form');
            if (!form) throw new Error('在載入的 HTML 中找不到 <form> 元素。');
            
            form.id = formId;

            // Populate hidden or dynamic input fields now that we have a valid form reference
            const frameNumber = this.state.currentFrameNumber;
            if (frameNumber) {
                const frameNumberInput = form.querySelector('input[name="車架號碼"]');
                if (frameNumberInput) frameNumberInput.value = frameNumber;
            }
            const vehicleModel = "Your Vehicle Model"; // Placeholder for model
            const modelInput = form.querySelector('input[name="車輛型號"]');
            if (modelInput) modelInput.value = vehicleModel;

            // 4. Create action buttons and append them INSIDE the form.
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'workflow-actions';
            actionsDiv.innerHTML = `
              <button type="submit" class="btn-primary">提交表單</button>
              <button type="button" class="btn-secondary" id="back-button">${context.backButtonText}</button>
            `;
            form.appendChild(actionsDiv);
      
            // 5. Attach a standard 'submit' listener to the form. This is the most reliable way.
            form.addEventListener('submit', this.handleFormSubmit);
            form.querySelector('#back-button').addEventListener('click', context.backButtonAction);
            
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
    return new Promise((resolve, reject) => {
      this.gasApi.run('getFormResponseData', { formId, frameNumber })
        .then(response => {
          if (response.success && response.data && Object.keys(response.data).length > 0) {
            const formData = response.data;
            for (const key in formData) {
              const element = form.querySelector(`[name="${key}"]`);
              
              if (element) {
                switch (element.type) {
                  case 'radio': {
                    const radioToSelect = form.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                    if (radioToSelect) radioToSelect.checked = true;
                    break;
                  }
                  case 'checkbox':
                    element.checked = (formData[key] === true || formData[key] === 'true');
                    break;
                  case 'file': {
                    if (typeof formData[key] === 'string' && formData[key].startsWith('http')) {
                      const preview = document.getElementById(`${form.id}_${key}_preview`);
                      if(preview) {
                          preview.src = formData[key];
                          preview.style.display = 'block';
                      }
                    }
                    break;
                  }
                  default:
                    element.value = formData[key];
                    break;
                }
              }
            }
            resolve();
          } else if (response.success) {
            this.showNotification('查無先前的表單紀錄。', 'success');
            resolve(); // No data is not an error, just resolve.
          } else {
            this.showNotification(`無法載入資料: ${response.message}`, 'error');
            reject(new Error(response.message));
          }
        })
        .catch(err => {
          this.handleError(err);
          reject(err);
        });
    });
  },

  // --- Handles form submission ---
  async handleFormSubmit(event) {
    event.preventDefault(); // Prevent default browser submission
    const form = event.target; // Get the form from the event
    this.showLoader('正在提交資料...');

    // --- DEEPER DEBUGGING ---
    console.log("--- Debugging Form Elements ---");
    console.log("Form object:", form);
    for (const element of form.elements) {
      console.log(`Found element: Name='${element.name}', Type='${element.type}', Value='${element.value}', Checked='${element.checked}'`);
    }
    console.log("-----------------------------");
    // --- END DEBUGGING ---

    // --- FINAL, MORE ROBUST FIX ---
    // Manually iterate over form elements to build the data object.
    // This is more reliable than FormData if there are subtle HTML issues.
    const dataObject = {};
    for (const element of form.elements) {
      if (element.name) {
        switch (element.type) {
          case 'radio':
          case 'checkbox':
            if (element.checked) {
              dataObject[element.name] = element.value;
            }
            break;
          case 'file':
            // File handling is separate, below
            break;
          default:
            dataObject[element.name] = element.value;
            break;
        }
      }
    }

    // Now, override with the definitive data
    dataObject.formId = form.id;
    dataObject.車架號碼 = this.state.currentFrameNumber;
    dataObject.userName = this.dom.userNameInput.value.trim();
    // --- END FIX ---

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
    this.showLoader('正在儲存資料...');
    this.gasApi.run('processFormSubmit', { formData: JSON.stringify(dataObject) })
      .then(async (response) => {
        if (response.success) {
          this.showNotification('資料提交成功！', 'success');
          
          // Clear the cache for this vehicle to force a refresh
          delete this.state.vehicleProgressCache[this.state.currentFrameNumber];

          if (this.config.IN_FACTORY_FORMS.includes(dataObject.formId)) {
            const progressResponse = await this.gasApi.run('getVehicleProgress', { frameNumber: this.state.currentFrameNumber });
            if (progressResponse.success) {
              this.state.vehicleProgressCache[this.state.currentFrameNumber] = progressResponse.data; // Update cache
              const progress = progressResponse.data.progress || {};
              const completedForms = Object.keys(progress).filter(key => progress[key] === true).map(id => String(id).trim().toUpperCase());
              
              let nextForm = null;
              for (const formId of this.config.IN_FACTORY_FORMS) {
                if (!completedForms.includes(String(formId).trim().toUpperCase())) {
                  nextForm = formId;
                  break;
                }
              }

              if (nextForm) {
                this.showNotification(`自動載入下一個表單: ${this.maintenanceData[nextForm] || nextForm}`, 'success');
                this.showForm(nextForm, this.state.currentFrameNumber, false);
              } else {
                this.showNotification('所有廠內流程已完成！', 'success');
                this.fetchAndShowProgressDashboard(this.state.currentFrameNumber, true); // Force refresh
              }
            } else {
              this.fetchAndShowProgressDashboard(this.state.currentFrameNumber, true); // Force refresh
            }
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
        () => { /* Ignore partial scans */ }
      ).catch(() => {
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

document.addEventListener('DOMContentLoaded', () => app.init());
