// --- 全域設定 ---
var SHEET_NAMES = {
  DATABASE: "品管資料庫",
  MAINTENANCE: "資料維護"
};

// AUTO-GENERATED: Complete list of all form fields based on the new HTML forms
var FORMS = {
  KD03: { name: '車身組裝中施工規範自行查核表', fields: ['車輛型號', 'KD03_Item1_1', 'KD03_Item1_2', 'KD03_Item1_3', 'KD03_Item1_4', 'KD03_Item1_5', 'KD03_Item2_1', 'KD03_Item2_2', 'KD03_Item2_3', 'KD03_Item2_4', 'KD03_Item2_5', 'KD03_Item2_6'] },
  KD04: { name: '車身組裝後車身施工規範自行查核表', fields: ['車輛型號', 'KD04_Item1', 'KD04_Item2', 'KD04_Item3', 'KD04_Item4', 'KD04_Item5', 'KD04_Item6', 'KD04_Item7', 'KD04_Item8', 'KD04_Item9', 'KD04_Item10', 'KD04_Item11', 'KD04_Item12', 'KD04_Item13', 'KD04_Item14', 'KD04_Item15'] },
  KD06: { name: '車輛完成品品質管制檢查表', fields: ['KD06_型號顏色', 'KD06_Result1', 'KD06_Judgement1', 'KD06_Note1', 'KD06_Result2', 'KD06_Judgement2', 'KD06_Note2', 'KD06_Result3', 'KD06_Judgement3', 'KD06_Note3', 'KD06_Result4', 'KD06_Judgement4', 'KD06_Note4', 'KD06_Result5', 'KD06_Judgement5', 'KD06_Note5', 'KD06_Result6', 'KD06_Judgement6', 'KD06_Note6', 'KD06_Result7', 'KD06_Judgement7', 'KD06_Note7', 'KD06_Result8', 'KD06_Judgement8', 'KD06_Note8', 'KD06_Result9', 'KD06_Judgement9', 'KD06_Note9', 'KD06_Result10', 'KD06_Judgement10', 'KD06_Note10', 'KD06_Result11', 'KD06_Judgement11', 'KD06_Note11', 'KD06_Result12', 'KD06_Judgement12', 'KD06_Note12', 'KD06_Result13', 'KD06_Judgement13', 'KD06_Note13', 'KD06_Result14', 'KD06_Judgement14', 'KD06_Note14', 'KD06_Result15', 'KD06_Judgement15', 'KD06_Note15', 'KD06_Result16', 'KD06_Judgement16', 'KD06_Note16', 'KD06_Result17', 'KD06_Judgement17', 'KD06_Note17', 'KD06_Result18', 'KD06_Judgement18', 'KD06_Note18', 'KD06_Result19', 'KD06_Judgement19', 'KD06_Note19', 'KD06_Result20', 'KD06_Judgement20', 'KD06_Note20'] },
  KD12: { name: '車輛出廠檢驗查核表', fields: ['車輛型號', 'KD12_Item1_1', 'KD12_Item1_2', 'KD12_Item1_3', 'KD12_Item2_1', 'KD12_Item2_2', 'KD12_Item2_3', 'KD12_Item2_4', 'KD12_Item2_5', 'KD12_Item3_1', 'KD12_Item3_2', 'KD12_Item3_3', 'KD12_Item3_4', 'KD12_Item3_5', 'KD12_Note'] },
  KD22: { name: '車輛點收清單', fields: ['KD22_客戶名稱', 'KD22_車架號碼_1', 'KD22_合格標章編號_1', 'KD22_車架號碼_9', 'KD22_合格標章編號_9', 'KD22_車架號碼_2', 'KD22_合格標章編號_2', 'KD22_車架號碼_10', 'KD22_合格標章編號_10', 'KD22_車架號碼_3', 'KD22_合格標章編號_3', 'KD22_車架號碼_11', 'KD22_合格標章編號_11', 'KD22_車架號碼_4', 'KD22_合格標章編號_4', 'KD22_車架號碼_12', 'KD22_合格標章編號_12', 'KD22_車架號碼_5', 'KD22_合格標章編號_5', 'KD22_車架號碼_13', 'KD22_合格標章編號_13', 'KD22_車架號碼_6', 'KD22_合格標章編號_6', 'KD22_車架號碼_14', 'KD22_合格標章編號_14', 'KD22_車架號碼_7', 'KD22_合格標章編號_7', 'KD22_車架號碼_15', 'KD22_合格標章編號_15', 'KD22_車架號碼_8', 'KD22_合格標章編號_8', 'KD22_confirm_manual', 'KD22_confirm_photo_match', 'KD22_confirm_battery_spec', 'KD22_confirm_no_modification', 'KD22_簽收人'] },
  KD25: { name: '控制器合格標識流向紀錄表', fields: ['KD25_控制器廠牌型式', 'KD25_標識編號', 'KD25_車架號碼', 'KD25_流向'] },
  KD26: { name: '控制器合格標識檢驗表', fields: ['KD26_車型代碼', 'KD26_控制器廠牌型式', 'photoData1', 'photoData2', 'photoData3', 'KD26_規格是否一致', 'KD26_標識是否正確'] }
};

/**
 * ===============================================================
 *  主執行函式：點擊 "執行" 按鈕來自動設定您的 Google Sheet
 * ===============================================================
 */
function setupSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  setupMaintenanceSheet(spreadsheet);
  setupDatabaseSheet(spreadsheet);
  
  SpreadsheetApp.getUi().alert('所有工作表和欄位都已成功建立！');
}

/**
 * 建立並設定 "資料維護" 工作表
 */
function setupMaintenanceSheet(spreadsheet) {
  var sheetName = SHEET_NAMES.MAINTENANCE;
  var headers = ['核准字號', '車架型號', '車型代碼', '控制器廠牌', '控制器型式'];
  
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (sheet) {
    Logger.log(`工作表 "${sheetName}" 已存在，將會清空並重新寫入標頭和範例資料。`);
    sheet.clear();
  } else {
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`工作表 "${sheetName}" 已成功建立。`);
  }
    
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f0f0f0');
  
  sheet.setFrozenRows(1);
  
  sheet.getRange(2, 1, 1, 5).setValues([
    ['微電審(113)字第1072號', 'KDTA', '0015EB24A01-01', '2922', 'TA01']
  ]);
  
  headers.forEach(function(_, i) { sheet.autoResizeColumn(i + 1); });
}

/**
 * 建立並設定 "品管資料庫" 工作表
 */
function setupDatabaseSheet(spreadsheet) {
  var sheetName = SHEET_NAMES.DATABASE;
  
  var baseHeaders = ['車架號碼', '車輛型號'];
  var allHeaders = [].concat(baseHeaders);
  
  for (var formId in FORMS) {
    allHeaders.push(`${formId}_完成`);
    allHeaders.push(`${formId}_日期`);
    allHeaders.push(`${formId}_作業人員`);
    
    if (FORMS[formId].fields) {
      FORMS[formId].fields.forEach(function(field) {
        // No prefix needed as the field names in the new forms are already unique
        allHeaders.push(field);
      });
    }
  }

  var sheet = spreadsheet.getSheetByName(sheetName);
  if (sheet) {
    Logger.log(`工作表 "${sheetName}" 已存在，將會清空並重新寫入標頭。`);
    sheet.clear();
  } else {
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`工作表 "${sheetName}" 已成功建立。`);
  }
  
  var headerRange = sheet.getRange(1, 1, 1, allHeaders.length);
  headerRange.setValues([allHeaders]);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#e9f2ff');
  
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
}