// --- 全域設定 ---
const CONFIG = {
  SHEET_ID: "124r-DeYM9qbZ2TN6jpghaeACuSiAYdmIapw8t5vDWMM",
  SHEET_NAME: "品管資料庫",
  MAINTENANCE_SHEET_NAME: "資料維護",
  IN_FACTORY_FORMS: ['KD03', 'KD04', 'KD06', 'KD12', 'KD26'],
  OUT_FACTORY_FORMS: ['KD22', 'KD25'],
  FORM_NAMES: {
    'KD03': '車身組裝中查核', 'KD04': '車身組裝後查核', 'KD06': '完成品品質管制',
    'KD12': '出廠檢驗', 'KD25': '控制器流向紀錄', 'KD26': '控制器標識檢驗 (拍照)',
    'KD22': '車輛點收清單'
  }
};

// --- 快取服務 ---
const SCRIPT_CACHE = CacheService.getScriptCache();

// --- API ROUTER ---
function doGet(e) {
  const callback = e.parameter.callback;
  if (!callback) { 
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Error: 'callback' parameter is missing."})).setMimeType(ContentService.MimeType.JSON);
  }
  
  let result;
  try {
    const action = e.parameter.action;
    
    // Log the received action and parameters for debugging
    Logger.log(JSON.stringify({
      message: "Received API Request",
      action: action,
      parameters: e.parameter
    }));

    switch (action) {
      case 'testDeployment':
        result = { success: true, message: "Deployment is working correctly!" };
        break;
      case 'getInitialPayload':
        result = getInitialPayload();
        break;
      case 'getVehicleProgress':
        result = getVehicleProgress(e.parameter.frameNumber);
        break;
      case 'getFormResponseData':
        result = getFormResponseData(e.parameter.formId, e.parameter.frameNumber);
        break;
      case 'processFormSubmit':
        // For POST-like data, it's better to pass it in a single parameter
        const formData = JSON.parse(e.parameter.formData);
        result = processFormSubmit(formData);
        break;
      case 'bulkExportPdfs':
        const options = JSON.parse(e.parameter.options);
        result = bulkExportPdfs(options);
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (err) {
    Logger.log(`Error in doGet: ${err.stack}`);
    result = { success: false, message: `Server error: ${err.message}` };
  }
  
  const jsonpResponse = `${callback}(${JSON.stringify(result)})`;
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// --- API Functions ---

function getFormStructure(formId) {
  const structure = FORM_STRUCTURES[formId];
  if (!structure) {
    throw new Error(`Form structure for '${formId}' not found.`);
  }
  return { success: true, data: structure };
}

function getInitialPayload() {
  // No need to fetch maintenance data if it's not used on the main page
  return { 
    success: true, 
    data: {
      config: { 
        IN_FACTORY_FORMS: CONFIG.IN_FACTORY_FORMS,
        OUT_FACTORY_FORMS: CONFIG.OUT_FACTORY_FORMS,
        // FORM_NAMES are now derived from FORM_STRUCTURES
        FORM_NAMES: Object.keys(FORM_STRUCTURES).reduce((acc, key) => {
          acc[key] = FORM_STRUCTURES[key].title;
          return acc;
        }, {})
      },
      maintenanceData: getMaintenanceData_() // Assuming this is still needed for something
    }
  };
}

function getVehicleProgress(frameNumber) {
  if (!frameNumber) {
    return { success: true, data: { progress: {}, isNew: true } };
  }
  const { headers, data } = getSheetData_();
  const frameNumberIndex = headers.indexOf('車架號碼');
  const vehicleRow = data.find(row => String(row[frameNumberIndex]).trim().toUpperCase() === String(frameNumber).trim().toUpperCase());
  
  if (!vehicleRow) {
    return { success: true, data: { progress: {}, isNew: true } };
  }

  const progress = {};
  const allForms = [...CONFIG.IN_FACTORY_FORMS, ...CONFIG.OUT_FACTORY_FORMS];
  allForms.forEach(formId => {
    const colName = `${formId}_完成`;
    const colIndex = headers.indexOf(colName);
    if (colIndex !== -1) {
      progress[formId] = !!vehicleRow[colIndex]; // True if there's any value (e.g., a date)
    }
  });

  return { success: true, data: { progress, isNew: false } };
}

function getFormResponseData(formId, frameNumber) {
  const { headers, data } = getSheetData_();
  const frameNumberIndex = headers.indexOf('車架號碼');
  const vehicleRow = data.find(row => String(row[frameNumberIndex]).trim().toUpperCase() === String(frameNumber).trim().toUpperCase());

  if (!vehicleRow) {
    return { success: false, message: `找不到車架號碼 ${frameNumber} 的資料` };
  }

  const response = {};
  headers.forEach((header, index) => {
    // Match headers that start with the formId prefix
    if (header.startsWith(`${formId}_`)) {
      response[header] = vehicleRow[index];
    }
  });

  return { success: true, data: response };
}

function processFormSubmit(formData) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const formId = formData.formId;
  const frameNumber = formData.frameNumber; // Assuming frameNumber is always a field in the form
  
  if (!frameNumber || !formId) {
    throw new Error("提交的資料中缺少 'frameNumber' 或 'formId'");
  }

  const PHOTO_UPLOAD_FOLDER_ID = "1-2Xb_doEh21p-x2d227FkOFL-3-QzAbp"; // Change to your target folder

  // Handle photo uploads
  for (const key in formData) {
    if (key.startsWith('photoData') && formData[key] && formData[key].startsWith('data:image')) {
      try {
        const [meta, base64Data] = formData[key].split(',');
        const mimeType = meta.match(/:(.*?);/)[1];
        const fileExtension = mimeType.split('/')[1] || 'jpg';
        const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, `${frameNumber}_${formId}_${key}.${fileExtension}`);
        
        const parentFolder = DriveApp.getFolderById(PHOTO_UPLOAD_FOLDER_ID);
        const imageFile = parentFolder.createFile(decodedBlob);
        formData[key] = imageFile.getUrl(); // Replace base64 with URL
      } catch (e) {
        Logger.log(`Error processing image ${key} for ${frameNumber}: ${e.toString()}`);
        formData[key] = `上傳失敗: ${e.message}`;
      }
    }
  }

  // Prepare the data for sheet update
  const updates = {};
  for (const key in formData) {
    if (key !== 'formId') {
      // The full key name (e.g., KD03_Item1_1) is now expected from the form
      updates[key] = formData[key];
    }
  }
  updates[`${formId}_完成`] = new Date();
  updates[`${formId}_作業人員`] = formData.userName; // Assuming userName is passed
  updates[`${formId}_日期`] = new Date();

  // Find row or create new one
  const data = sheet.getDataRange().getValues();
  data.shift(); // remove headers
  const frameNumberIndex = headers.indexOf('車架號碼');
  let rowIndex = data.findIndex(row => String(row[frameNumberIndex]).trim().toUpperCase() === String(frameNumber).trim().toUpperCase());

  if (rowIndex === -1) {
    const newRowValues = new Array(headers.length).fill('');
    newRowValues[frameNumberIndex] = frameNumber;
    for (const headerName in updates) {
      const colIndex = headers.indexOf(headerName);
      if (colIndex !== -1) { newRowValues[colIndex] = updates[headerName]; }
    }
    sheet.appendRow(newRowValues);
  } else {
    const rowNumber = rowIndex + 2; // +1 for 1-based index, +1 for header row
    updateSheetRow(sheet, rowNumber, headers, updates);
  }

  SCRIPT_CACHE.remove(`sheetData_${CONFIG.SHEET_ID}`); // Invalidate cache
  return { success: true, message: `${FORM_STRUCTURES[formId].title} (${frameNumber}) 資料已儲存` };
}

// --- Utility Functions ---

function getSheetData_() {
  const cacheKey = `sheetData_${CONFIG.SHEET_ID}`;
  const cached = SCRIPT_CACHE.get(cacheKey);
  if (cached != null) { return JSON.parse(cached); }
  
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift(); // Get headers
  
  const data = { headers: headers, data: values };
  SCRIPT_CACHE.put(cacheKey, JSON.stringify(data), 120); // Cache for 2 minutes
  return data;
}

function updateSheetRow(sheet, rowNumber, headers, updates) {
  const range = sheet.getRange(rowNumber, 1, 1, headers.length);
  const values = range.getValues()[0];
  for (const headerName in updates) {
    const colIndex = headers.indexOf(headerName);
    if (colIndex !== -1) {
      values[colIndex] = updates[headerName];
    }
  }
  range.setValues([values]);
}

function getMaintenanceData_() {
  // This function can be simplified or removed if not broadly needed
  return {}; // Placeholder
}

// Bulk export function remains the same, but needs to be tested with the new structure
function bulkExportPdfs(options) {
  // ... (Implementation from the original Code.gs can be pasted here)
  // IMPORTANT: This function needs to be adapted to the new data structures
  // For now, returning a placeholder message.
  return { success: false, message: "Bulk export is not fully implemented in this version yet." };
}