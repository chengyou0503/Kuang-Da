import React, { useState, useEffect } from 'react';

function KD26({ onSubmit, initialData = {}, frameNumber, maintenanceData }) {
  const [formData, setFormData] = useState(initialData);
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    const model = frameNumber ? frameNumber.substring(0, 4) : '';
    const modelData = maintenanceData[model];
    if (modelData) {
      setFormData(prev => ({
        ...prev,
        KD26_控制器廠牌型式: `${modelData.brand} / ${modelData.type}`
      }));
    }
  }, [frameNumber, maintenanceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [name]: reader.result }));
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Don't submit the preview data, only the base64 data in formData
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p align="right">表單編號：KD-26</p>
      <h3 align="center">控制器合格標識檢驗表</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <tbody>
            <tr>
              <td><b>車輛型式</b></td>
              <td>{frameNumber ? frameNumber.substring(0, 4) : ''}</td>
              <td><b>車型代碼</b></td>
              <td><input type="text" name="KD26_車型代碼" required onChange={handleChange} value={formData.KD26_車型代碼 || ''} /></td>
            </tr>
            <tr>
              <td><b>控制器編號</b></td>
              <td><input type="text" name="KD26_控制器編號" required onChange={handleChange} value={formData.KD26_控制器編號 || ''} /></td>
              <td><b>控制器廠牌/型式</b></td>
              <td><input type="text" name="KD26_控制器廠牌型式" required readOnly onChange={handleChange} value={formData.KD26_控制器廠牌型式 || ''} /></td>
            </tr>
          </tbody>
        </table>
        
        <div className="photo-section">
          <div className="photo-row">
            <div className="photo-item">
              <h4>控制器裝置於車輛照片</h4>
              <label className="photo-upload-box">
                <input type="file" name="photoData1" accept="image/*" capture="environment" onChange={handleFileChange} />
                {previews.photoData1 ? <img src={previews.photoData1} alt="Preview 1" className="photo-preview" /> : <span>點擊拍照/上傳</span>}
              </label>
            </div>
            <div className="photo-item">
              <h4>控制器黏貼合格標識照片</h4>
              <label className="photo-upload-box">
                <input type="file" name="photoData2" accept="image/*" capture="environment" onChange={handleFileChange} />
                {previews.photoData2 ? <img src={previews.photoData2} alt="Preview 2" className="photo-preview" /> : <span>點擊拍照/上傳</span>}
              </label>
            </div>
          </div>
          <div className="photo-item-full">
            <h4>車架號碼照片</h4>
            <label className="photo-upload-box">
              <input type="file" name="photoData3" accept="image/*" capture="environment" onChange={handleFileChange} />
              {previews.photoData3 ? <img src={previews.photoData3} alt="Preview 3" className="photo-preview" /> : <span>點擊拍照/上傳</span>}
            </label>
          </div>
        </div>

        <table className="form-table" style={{ marginTop: '1rem' }}>
          <tbody>
            <tr>
              <td><b>控制器是否為檢驗合格且規格與審查報告/測試報告宣告一致</b></td>
              <td><input type="text" name="KD26_規格是否一致" value="符合規格、報告" required readOnly /></td>
            </tr>
            <tr>
              <td><b>是否使用正確之控制器合格標識</b></td>
              <td><input type="text" name="KD26_標識是否正確" value="核對正確" required readOnly /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交並完成所有流程</button>
    </form>
  );
}

export default KD26;
