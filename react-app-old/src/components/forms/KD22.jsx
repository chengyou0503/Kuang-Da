import React, { useState } from 'react';

function KD22({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p align="right">表單編號：KD-22</p>
      <h3 align="center">車輛點收清單</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>項次</th>
              <th style={{ width: '45%' }}>車架號碼</th>
              <th style={{ width: '45%' }}>合格標章編號</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(15)].map((_, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input type="text" name={`車架號碼_${i + 1}`} onChange={handleChange} value={formData[`車架號碼_${i + 1}`] || ''} /></td>
                <td><input type="text" name={`合格標章編號_${i + 1}`} onChange={handleChange} value={formData[`合格標章編號_${i + 1}`] || ''} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'left', border: '1px solid #ccc', padding: '15px' }}>
        <h4>以下資訊如客戶確認無誤,則客戶予以勾選。</h4>
        <label><input type="checkbox" name="confirm_manual" onChange={handleChange} checked={!!formData.confirm_manual} /> 逐車檢附車主使用說明手冊。</label><br />
        <label><input type="checkbox" name="confirm_photo_match" onChange={handleChange} checked={!!formData.confirm_photo_match} /> 車輛與合格證書及完成車照片一致。</label><br />
        <label><input type="checkbox" name="confirm_battery_spec" onChange={handleChange} checked={!!formData.confirm_battery_spec} /> 車輛所裝載之電池規格與合格證書內容一致。</label><br />
        <label><input type="checkbox" name="confirm_no_modification" onChange={handleChange} checked={!!formData.confirm_no_modification} /> 車輛不得任意加裝及擅改。</label><br />
      </div>

      <table className="form-table" style={{ marginTop: '20px' }}>
        <tbody>
          <tr>
            <td style={{ width: '15%' }}><b>客戶名稱</b></td>
            <td><input type="text" name="客戶名稱" required onChange={handleChange} value={formData.客戶名稱 || ''} /></td>
          </tr>
          <tr>
            <td><b>簽收人</b></td>
            <td><input type="text" name="簽收人" required onChange={handleChange} value={formData.簽收人 || ''} /></td>
          </tr>
        </tbody>
      </table>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD22;
