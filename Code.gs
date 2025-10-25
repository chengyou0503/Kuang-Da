// Apps Script to initialize the Google Sheet for the Kuang-Da Quality Control System

/**
 * Main function to set up all necessary sheets and headers.
 * Run this function once from the Apps Script editor to initialize your spreadsheet.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // --- Configuration Object ---
  // This object defines all the sheets and their corresponding headers.
  const sheetsConfig = {
    "Vehicle_List": [
      "車架號碼",
      "車輛型號",
      "建立時間"
    ],
    "Vehicle_Progress": [
      "車架號碼",
      "KD03", "KD04", "KD06", "KD12", "KD22", "KD25", "KD26",
      "最後更新時間"
    ],
    "KD03": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD03_Item1_1", "KD03_Item1_2", "KD03_Item1_3", "KD03_Item1_4", "KD03_Item1_5",
      "KD03_Item2_1", "KD03_Item2_2", "KD03_Item2_3", "KD03_Item2_4",
      "KD03_Item3_1", "KD03_Item3_2", "KD03_Item3_3", "KD03_Item3_4",
      "KD03_Final"
    ],
    "KD04": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD04_Date", "KD04_Inspector", "KD04_Note",
      "KD04_Item1", "KD04_Item2", "KD04_Item3", "KD04_Item4", "KD04_Item5",
      "KD04_Item6", "KD04_Item7", "KD04_Item8", "KD04_Item9", "KD04_Item10",
      "KD04_Item11", "KD04_Item12", "KD04_Item13", "KD04_Item14", "KD04_Item15",
      "KD04_Final"
    ],
    "KD06": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD06_型號顏色",
      "KD06_Result1", "KD06_Judgement1", "KD06_Note1",
      "KD06_Result2", "KD06_Judgement2", "KD06_Note2",
      "KD06_Result3", "KD06_Judgement3", "KD06_Note3",
      "KD06_Result4", "KD06_Judgement4", "KD06_Note4",
      "KD06_Result5", "KD06_Judgement5", "KD06_Note5",
      "KD06_Result6", "KD06_Judgement6", "KD06_Note6",
      "KD06_Result7", "KD06_Judgement7", "KD06_Note7",
      "KD06_Result8", "KD06_Judgement8", "KD06_Note8",
      "KD06_Result9", "KD06_Judgement9", "KD06_Note9",
      "KD06_Result10", "KD06_Judgement10", "KD06_Note10",
      "KD06_Result11", "KD06_Judgement11", "KD06_Note11",
      "KD06_Result12", "KD06_Judgement12", "KD06_Note12",
      "KD06_Result13", "KD06_Judgement13", "KD06_Note13",
      "KD06_Result14", "KD06_Judgement14", "KD06_Note14",
      "KD06_Result15", "KD06_Judgement15", "KD06_Note15",
      "KD06_Result16", "KD06_Judgement16", "KD06_Note16",
      "KD06_Result17", "KD06_Judgement17", "KD06_Note17",
      "KD06_Result18", "KD06_Judgement18", "KD06_Note18",
      "KD06_Result19", "KD06_Judgement19", "KD06_Note19",
      "KD06_Result20", "KD06_Judgement20", "KD06_Note20"
    ],
    "KD12": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD12_Item1_1", "KD12_Item1_2", "KD12_Item1_3",
      "KD12_Item2_1", "KD12_Item2_2", "KD12_Item2_3",
      "KD12_Item3_1", "KD12_Item3_2", "KD12_Item3_3", "KD12_Item3_4",
      "KD12_Item3_5", "KD12_Item3_6", "KD12_Item3_7",
      "KD12_Final"
    ],
    "KD22": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD22_Date", "KD22_PartNumber", "KD22_ProductName", "KD22_Supplier",
      "KD22_Quantity", "KD22_IssueNumber",
      "KD22_Spec1", "KD22_Spec2", "KD22_Spec3", "KD22_Spec4", "KD22_Spec5",
      "KD22_Spec6", "KD22_Spec7", "KD22_Spec8",
      "KD22_Final"
    ],
    "KD25": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD25_Date", "KD25_Inspector", "KD25_Note",
      "KD25_Item1", "KD25_Item2", "KD25_Item3", "KD25_Item4", "KD25_Item5",
      "KD25_Final"
    ],
    "KD26": [
      "formId", "車架號碼", "車輛型號", "userName", "timestamp",
      "KD26_Date", "KD26_Inspector", "KD26_Note",
      "KD26_Item1", "KD26_Item2", "KD26_Item3", "KD26_Item4", "KD26_Item5",
      "KD26_Item6", "KD26_Item7", "KD26_Item8", "KD26_Item9", "KD26_Item10",
      "KD26_Item11", "KD26_Item12", "KD26_Item13", "KD26_Item14", "KD26_Item15",
      "KD26_Final"
    ]
  };

  // --- Loop through the configuration and create sheets ---
  for (const sheetName in sheetsConfig) {
    const headers = sheetsConfig[sheetName];
    createSheetWithHeaders(ss, sheetName, headers);
  }
  
  SpreadsheetApp.getUi().alert('所有工作表和欄位已成功建立！');
}

/**
 * Helper function to create a new sheet with specified headers.
 * If the sheet already exists, it will be cleared and headers will be rewritten.
 * @param {Spreadsheet} ss The active spreadsheet object.
 * @param {string} sheetName The name of the sheet to create.
 * @param {Array<string>} headers An array of strings for the header row.
 */
function createSheetWithHeaders(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    // If sheet exists, clear it to ensure a fresh start.
    sheet.clear();
    Logger.log(`工作表 "${sheetName}" 已存在，將會清空並重新寫入標頭。`);
  } else {
    // If sheet does not exist, create it.
    sheet = ss.insertSheet(sheetName);
    Logger.log(`工作表 "${sheetName}" 已成功建立。`);
  }
  
  // Set the headers in the first row.
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Freeze the header row for better usability.
  sheet.setFrozenRows(1);
  
  // Auto-resize columns to fit the header content.
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}
