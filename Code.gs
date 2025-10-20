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

// --- NEW: Form Structures (Definitive Solution) ---
const FORM_STRUCTURES = {
  KD03: {
    title: '車身組裝中施工規範自行查核表',
    groups: [
      { title: '一、車體組裝確認：', fields: [
        { label: '1. 車體組裝接縫處密合度是否密合平整。', name: 'KD03_Item1_1', type: 'radio', options: ['是', '否'] },
        { label: '2. 車體和接觸是否磨平，焊接後車架是否有重新上漆防鏽。', name: 'KD03_Item1_2', type: 'radio', options: ['是', '否'] },
        { label: '3. 檢查車身骨架與前方向轉把（龍頭）安裝是否穩固順暢。', name: 'KD03_Item1_3', type: 'radio', options: ['是', '否'] },
        { label: '4. 轉向柱與車架安裝是否穩固。', name: 'KD03_Item1_4', type: 'radio', options: ['是', '否'] },
        { label: '5. 車架號碼是否與車輛編碼說明書一致', name: 'KD03_Item1_5', type: 'radio', options: ['是', '否'] }
      ]},
      { title: '二、電路系統檢查：（控制器/馬達/電池等各部組裝部分）', fields: [
        { label: '1. 電線是否確實包覆。', name: 'KD03_Item2_1', type: 'radio', options: ['是', '否'] },
        { label: '2. 外接電線必須固定好，不得散落或有磨破絕緣皮的危險。', name: 'KD03_Item2_2', type: 'radio', options: ['是', '否'] },
        { label: '3. 檢查儀表及其他電子控制元件是否完整。', name: 'KD03_Item2_3', type: 'radio', options: ['是', '否'] },
        { label: '4. 電池系統減震是否良好。', name: 'KD03_Item2_4', type: 'radio', options: ['是', '否'] },
        { label: '5. 車體上電氣設備之連接是否良好，各項功能是否正常。', name: 'KD03_Item2_5', type: 'radio', options: ['是', '否'] },
        { label: '6. 電線束安裝是否用束條（夾）固定。', name: 'KD03_Item2_6', type: 'radio', options: ['是', '否'] }
      ]}
    ]
  },
  KD04: {
    title: '車身組裝後自行查核表',
    groups: [
      { title: '檢查項目', fields: [
        { label: '1. 車架是否損傷', name: 'KD04_Item1', type: 'radio', options: ['是', '否'] },
        { label: '2. 車身外殼是否損傷', name: 'KD04_Item2', type: 'radio', options: ['是', '否'] },
        { label: '3. 煞車拉桿功能', name: 'KD04_Item3', type: 'radio', options: ['正常', '異常'] },
        { label: '4. 煞車油量', name: 'KD04_Item4', type: 'radio', options: ['足夠', '不足'] },
        { label: '5. 輪胎壓力', name: 'KD04_Item5', type: 'radio', options: ['正常', '異常'] },
        { label: '6. 儀表功能', name: 'KD04_Item6', type: 'radio', options: ['正常', '異常'] },
        { label: '7. 大燈功能', name: 'KD04_Item7', type: 'radio', options: ['正常', '異常'] },
        { label: '8. 方向燈功能', name: 'KD04_Item8', type: 'radio', options: ['正常', '異常'] },
        { label: '9. 喇叭功能', name: 'KD04_Item9', type: 'radio', options: ['正常', '異常'] },
        { label: '10. 電子倒車功能', name: 'KD04_Item10', type: 'radio', options: ['正常', '異常'] },
        { label: '11. 電子駐車功能', name: 'KD04_Item11', type: 'radio', options: ['正常', '異常'] },
        { label: '12. 電子加力功能', name: 'KD04_Item12', type: 'radio', options: ['正常', '異常'] },
        { label: '13. 電池電壓', name: 'KD04_Item13', type: 'text' },
        { label: '14. 控制器功能', name: 'KD04_Item14', type: 'radio', options: ['正常', '異常'] },
        { label: '15. 馬達功能', name: 'KD04_Item15', type: 'radio', options: ['正常', '異常'] }
      ]}
    ]
  },
  KD06: {
    title: '完成品品質管制紀錄總表',
    groups: [
      { title: '車輛資訊', fields: [{ label: '型號/顏色', name: 'KD06_型號顏色', type: 'text' }] },
      { title: '檢驗項目', fields: [
        { label: '1. 外觀檢查', name: 'KD06_Result1', type: 'text' },
        { label: '2. 車架號碼', name: 'KD06_Result2', type: 'text' },
        { label: '3. 尺寸', name: 'KD06_Result3', type: 'text' },
        { label: '4. 重量', name: 'KD06_Result4', type: 'text' },
        { label: '5. 轉向系統', name: 'KD06_Result5', type: 'text' },
        { label: '6. 輪胎', name: 'KD06_Result6', type: 'text' },
        { label: '7. 煞車系統', name: 'KD06_Result7', type: 'text' },
        { label: '8. 燈光與信號裝置', name: 'KD06_Result8', type: 'text' },
        { label: '9. 喇叭', name: 'KD06_Result9', type: 'text' },
        { label: '10. 速率計', name: 'KD06_Result10', type: 'text' },
        { label: '11. 照後鏡', name: 'KD06_Result11', type: 'text' },
        { label: '12. 電能規格', name: 'KD06_Result12', type: 'text' },
        { label: '13. 控制器規格', name: 'KD06_Result13', type: 'text' },
        { label: '14. 馬達規格', name: 'KD06_Result14', type: 'text' },
        { label: '15. 充電裝置規格', name: 'KD06_Result15', type: 'text' },
        { label: '16. 最高速率', name: 'KD06_Result16', type: 'text' },
        { label: '17. 加速性能', name: 'KD06_Result17', type: 'text' },
        { label: '18. 爬坡性能', name: 'KD06_Result18', type: 'text' },
        { label: '19. 續航性能', name: 'KD06_Result19', type: 'text' },
        { label: '20. 防水性能', name: 'KD06_Result20', type: 'text' }
      ]}
    ]
  },
  KD12: {
    title: '出廠檢驗紀錄表',
    groups: [
      { title: '一、靜態檢查', fields: [
        { label: '1. 各部螺絲扭力是否合乎標準', name: 'KD12_Item1_1', type: 'radio', options: ['是', '否'] },
        { label: '2. 各部外觀是否良好', name: 'KD12_Item1_2', type: 'radio', options: ['是', '否'] },
        { label: '3. 附件是否齊全', name: 'KD12_Item1_3', type: 'radio', options: ['是', '否'] }
      ]},
      { title: '二、動態檢查', fields: [
        { label: '1. 加速器功能是否正常', name: 'KD12_Item2_1', type: 'radio', options: ['是', '否'] },
        { label: '2. 煞車功能是否正常', name: 'KD12_Item2_2', type: 'radio', options: ['是', '否'] },
        { label: '3. 操控系統功能是否正常', name: 'KD12_Item2_3', type: 'radio', options: ['是', '否'] },
        { label: '4. 燈光系統功能是否正常', name: 'KD12_Item2_4', type: 'radio', options: ['是', '否'] },
        { label: '5. 喇叭功能是否正常', name: 'KD12_Item2_5', type: 'radio', options: ['是', '否'] },
        { label: '6. 儀錶功能是否正常', name: 'KD12_Item2_6', type: 'radio', options: ['是', '否'] },
        { label: '7. 電子倒車功能是否正常', name: 'KD12_Item2_7', type: 'radio', options: ['是', '否'] },
        { label: '8. 電子駐車功能是否正常', name: 'KD12_Item2_8', type: 'radio', options: ['是', '否'] }
      ]},
      { title: '三、路試檢查', fields: [
        { label: '1. 加速性能', name: 'KD12_Item3_1', type: 'radio', options: ['正常', '異常'] },
        { label: '2. 煞車性能', name: 'KD12_Item3_2', type: 'radio', options: ['正常', '異常'] },
        { label: '3. 操控性能', name: 'KD12_Item3_3', type: 'radio', options: ['正常', '異常'] },
        { label: '4. 異音', name: 'KD12_Item3_4', type: 'radio', options: ['有', '無'] },
        { label: '5. 抖動', name: 'KD12_Item3_5', type: 'radio', options: ['有', '無'] },
        { label: '6. 電機溫度', name: 'KD12_Item3_6', type: 'radio', options: ['正常', '異常'] },
        { label: '7. 控制器溫度', name: 'KD12_Item3_7', type: 'radio', options: ['正常', '異常'] },
        { label: '8. 電池溫度', name: 'KD12_Item3_8', type: 'radio', options: ['正常', '異常'] },
        { label: '9. 綜合判定', name: 'KD12_Item3_9', type: 'radio', options: ['合格', '不合格'] }
      ]}
    ]
  },
  KD22: {
    title: '車輛點收清單',
    groups: [
      { title: '車輛列表 (最多15輛)', fields: Array.from({ length: 15 }, (_, i) => ([
        { label: `車架號碼 ${i+1}`, name: `車架號碼_${i+1}`, type: 'text' },
        { label: `合格標章編號 ${i+1}`, name: `合格標章編號_${i+1}`, type: 'text' }
      ])).flat() },
      { title: '確認項目', fields: [
        { label: '使用說明書', name: 'confirm_manual', type: 'checkbox' },
        { label: '照片與實車相符', name: 'confirm_photo_match', type: 'checkbox' },
        { label: '電池規格正確', name: 'confirm_battery_spec', type: 'checkbox' },
        { label: '車輛未經改裝', name: 'confirm_no_modification', type: 'checkbox' }
      ]},
      { title: '簽收資訊', fields: [
        { label: '客戶名稱', name: '客戶名稱', type: 'text' },
        { label: '簽收人', name: '簽收人', type: 'text' }
      ]}
    ]
  },
  KD25: {
    title: '控制器流向紀錄',
    groups: [
      { title: '紀錄', fields: [
        { label: '控制器廠牌型式', name: 'KD25_控制器廠牌型式', type: 'text' },
        { label: '標識編號', name: 'KD25_標識編號', type: 'text' },
        { label: '流向', name: 'KD25_流向', type: 'text' }
      ]}
    ]
  },
  KD26: {
    title: '控制器標識檢驗 (拍照)',
    groups: [
      { title: '檢驗項目', fields: [
        { label: '車型代碼', name: 'KD26_車型代碼', type: 'text' },
        { label: '控制器廠牌型式', name: 'KD26_控制器廠牌型式', type: 'text' },
        { label: '控制器編號', name: 'KD26_控制器編號', type: 'text' },
        { label: '規格是否一致', name: 'KD26_規格是否一致', type: 'radio', options: ['是', '否'] },
        { label: '標識是否正確', name: 'KD26_標識是否正確', type: 'radio', options: ['是', '否'] }
      ]},
      { title: '照片上傳', fields: [
        { label: '照片一', name: 'photoData1', type: 'file' },
        { label: '照片二', name: 'photoData2', type: 'file' },
        { label: '照片三', name: 'photoData3', type: 'file' }
      ]}
    ]
  }
};

function getFormStructure(formId) {
  const structure = FORM_STRUCTURES[formId];
  if (!structure) {
    throw new Error(`Form structure for ${formId} not found.`);
  }
  return { success: true, data: structure };
}


// --- API ROUTER ---
function doGet(e) {
  const callback = e.parameter.callback;
  if (!callback) { return ContentService.createTextOutput("Error: 'callback' parameter is missing."); }
  let result;
  try {
    const action = e.parameter.action;
    const params = e.parameter.params ? JSON.parse(e.parameter.params) : {};
    switch (action) {
      case 'getInitialPayload': result = getInitialPayload(); break;
      case 'getFormStructure': result = getFormStructure(params.formId); break; // <-- NEW API
      case 'getVehicleProgress': result = getVehicleProgress(params.frameNumber); break;
      case 'getFormResponseData': result = getFormResponseData(params.formId, params.frameNumber); break;
      case 'processFormSubmit': result = processFormSubmit(params.formData); break;
      case 'bulkExportPdfs': result = bulkExportPdfs(e.parameter.options); break;
      default: throw new Error(`Invalid action: ${action}`);
    }
  } catch (err) {
    result = { success: false, message: `Server error: ${err.message}` };
  }
  const jsonpResponse = `${callback}(${JSON.stringify(result)})`;
  return ContentService.createTextOutput(jsonpResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// --- CORE FUNCTIONS (Unchanged from previous correct versions) ---
function getSheetData_() {
  const cacheKey = `sheetData_${CONFIG.SHEET_ID}`;
  const cached = SCRIPT_CACHE.get(cacheKey);
  if (cached != null) { return JSON.parse(cached); }
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const data = { headers: headers, data: values };
  SCRIPT_CACHE.put(cacheKey, JSON.stringify(data), 120);
  return data;
}

function getFormResponseData(formId, frameNumber) {
  const { headers, data } = getSheetData_();
  const frameNumberIndex = headers.indexOf('車架號碼');
  const vehicleRow = data.find(row => row[frameNumberIndex] === frameNumber);
  if (!vehicleRow) { return { success: false, message: `找不到車架號碼 ${frameNumber} 的資料` }; }
  const response = {};
  headers.forEach((header, index) => {
    if (header.startsWith(`${formId}_`)) {
      response[header] = vehicleRow[index];
    }
  });
  return { success: true, data: response };
}

function processFormSubmit(formData) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHE-ET_ID).getSheetByName(CONFIG.SHEET_NAME);
  const { headers, data } = getSheetData_();
  const frameNumber = formData.車架號碼;
  const formId = formData.formId;
  if (!frameNumber || !formId) { throw new Error("提交的資料中缺少 '車架號碼' 或 'formId'"); }

  const PHOTO_UPLOAD_FOLDER_ID = "1-2Xb_doEh21p-x2d227FkOFL-3-QzAbp"; // Change to your target folder

  // Handle photo uploads
  for (let i = 1; i <= 3; i++) {
    const key = `photoData${i}`;
    if (formData[key] && formData[key].startsWith('data:image')) {
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

  const frameNumberIndex = headers.indexOf('車架號碼');
  let rowIndex = data.findIndex(row => row[frameNumberIndex] === frameNumber);
  const updates = {};
  for (const key in formData) {
    if (key !== 'formId') { updates[key] = formData[key]; }
  }
  updates[`${formId}_完成`] = new Date();
  if (rowIndex === -1) {
    const newRowValues = new Array(headers.length).fill('');
    newRowValues[frameNumberIndex] = frameNumber;
    for (const headerName in updates) {
      const colIndex = headers.indexOf(headerName);
      if (colIndex !== -1) { newRowValues[colIndex] = updates[headerName]; }
    }
    sheet.appendRow(newRowValues);
  } else {
    const rowNumber = rowIndex + 2;
    updateSheetRow(sheet, rowNumber, headers, updates);
  }
  SCRIPT_CACHE.remove(`sheetData_${CONFIG.SHEET_ID}`);
  return { success: true, message: `${CONFIG.FORM_NAMES[formId]} (${frameNumber}) 資料已儲存` };
}

function updateSheetRow(sheet, rowNumber, headers, updates) {
  const range = sheet.getRange(rowNumber, 1, 1, headers.length);
  const values = range.getValues()[0];
  for (const headerName in updates) {
    const colIndex = headers.indexOf(headerName);
    if (colIndex !== -1) { values[colIndex] = updates[headerName]; }
  }
  range.setValues([values]);
}

function getInitialPayload() {
  const maintenanceData = getMaintenanceData_();
  return { 
    success: true, 
    data: {
      config: { 
        IN_FACTORY_FORMS: CONFIG.IN_FACTORY_FORMS,
        OUT_FACTORY_FORMS: CONFIG.OUT_FACTORY_FORMS,
        FORM_NAMES: CONFIG.FORM_NAMES 
      },
      maintenanceData: maintenanceData
    }
  };
}

function getMaintenanceData_() {
  const cacheKey = `maintenanceData_${CONFIG.SHEET_ID}`;
  const cached = SCRIPT_CACHE.get(cacheKey);
  if (cached != null) { return JSON.parse(cached); }
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.MAINTENANCE_SHEET_NAME);
  if (!sheet) { return {}; }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const modelIndex = headers.indexOf('車輛型號');
  const brandIndex = headers.indexOf('控制器廠牌');
  const typeIndex = headers.indexOf('控制器型式');
  if (modelIndex === -1 || brandIndex === -1 || typeIndex === -1) { return {}; }
  const maintenanceMap = data.reduce((map, row) => {
    const model = row[modelIndex];
    if (model) { map[model] = { brand: row[brandIndex], type: row[typeIndex] }; }
    return map;
  }, {});
  SCRIPT_CACHE.put(cacheKey, JSON.stringify(maintenanceMap), 3600);
  return maintenanceMap;
}

function getVehicleProgress(frameNumber) {
  const { headers, data } = getSheetData_();
  const frameNumberIndex = headers.indexOf('車架號碼');
  const vehicleRow = data.find(row => row[frameNumberIndex] === frameNumber);
  if (!vehicleRow) { return { success: true, data: { progress: {}, isNew: true } }; }
  const progress = {};
  const allForms = [...CONFIG.IN_FACTORY_FORMS, ...CONFIG.OUT_FACTORY_FORMS];
  allForms.forEach(formId => {
    const colName = `${formId}_完成`;
    const colIndex = headers.indexOf(colName);
    if (colIndex !== -1) { progress[formId] = !!vehicleRow[colIndex]; }
  });
  return { success: true, data: { progress, isNew: false } };
}

function bulkExportPdfs(optionsStr) {
  try {
    const options = JSON.parse(optionsStr);
    const { formId, vehicleModel, startDate, endDate } = options;

    if (!formId || !startDate || !endDate) {
      throw new Error("缺少必要的參數：formId, startDate, 或 endDate。");
    }

    const { headers, data } = getSheetData_();
    const completionDateHeader = `${formId}_完成`;
    const frameNumberHeader = '車架號碼';
    const completionDateIndex = headers.indexOf(completionDateHeader);
    const modelIndex = headers.indexOf('車輛型號');
    const frameNumberIndex = headers.indexOf(frameNumberHeader);

    if (completionDateIndex === -1) throw new Error(`找不到表單 ${formId} 的完成日期欄位。`);
    if (frameNumberIndex === -1) throw new Error(`找不到 '車架號碼' 欄位。`);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredData = data.filter(row => {
      const completionDate = new Date(row[completionDateIndex]);
      const modelMatch = !vehicleModel || (modelIndex !== -1 && row[modelIndex] === vehicleModel);
      return completionDate >= start && completionDate <= end && modelMatch;
    });

    if (filteredData.length === 0) {
      return { success: true, message: "在指定條件下找不到任何可導出的報告。" };
    }
    
    if (filteredData.length > 150) { // Add a limit
      return { success: false, message: `找到的紀錄超過 150 筆 (${filteredData.length} 筆)，請縮小日期範圍。` };
    }

    const timestamp = Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd_HHmmss");
    const folderName = `品管報告_${formId}_${timestamp}`;
    const parentFolder = DriveApp.getFolderById("1-2Xb_doEh21p-x2d227FkOFL-3-QzAbp"); // Please change this ID to your target folder
    const newFolder = parentFolder.createFolder(folderName);

    filteredData.forEach((row, index) => {
      const frameNumber = row[frameNumberIndex] || `Row_${index + 2}`;
      const htmlContent = generatePdfHtml_(formId, row, headers);
      const pdfBlob = Utilities.newBlob(htmlContent, 'text/html', `${frameNumber}_${formId}.pdf`).getAs('application/pdf');
      newFolder.createFile(pdfBlob);
      Utilities.sleep(500); // Avoid hitting rate limits
    });

    return { 
      success: true, 
      message: `成功導出 ${filteredData.length} 份 PDF 報告。`,
      folderUrl: newFolder.getUrl() 
    };

  } catch (error) {
    Logger.log(`[bulkExportPdfs Error] ${error.stack}`);
    return { success: false, message: `導出失敗：${error.message}` };
  }
}

function generatePdfHtml_(formId, dataRow, headers) {
  const formStructure = FORM_STRUCTURES[formId];
  if (!formStructure) return `<h1>找不到 ${formId} 的表單結構</h1>`;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; }
        h1 { color: #333; }
        .group { margin-bottom: 1em; border: 1px solid #ccc; padding: 10px; }
        .group-title { font-weight: bold; background-color: #f2f2f2; padding: 5px; }
        .field { margin-bottom: 0.5em; }
        .field-label { font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>${formStructure.title}</h1>
      <p>車架號碼: ${dataRow[headers.indexOf('車架號碼')] || 'N/A'}</p>
      <p>作業人員: ${dataRow[headers.indexOf(`${formId}_作業人員`)] || 'N/A'}</p>
      <p>完成日期: ${new Date(dataRow[headers.indexOf(`${formId}_完成`)]).toLocaleString()}</p>
      <hr>`;

  formStructure.groups.forEach(group => {
    html += `<div class="group">`;
    html += `<div class="group-title">${group.title}</div>`;
    group.fields.forEach(field => {
      const headerName = `${formId}_${field.name}`;
      const colIndex = headers.indexOf(headerName);
      const value = (colIndex !== -1) ? dataRow[colIndex] : '未填寫';
      html += `<div class="field">
                <span class="field-label">${field.label}</span>
                <span>${value}</span>
              </div>`;
    });
    html += `</div>`;
  });

  html += `</body></html>`;
  return html;
}
