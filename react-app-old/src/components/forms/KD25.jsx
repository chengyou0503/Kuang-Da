import React, { useState } from 'react';

function KD25({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <p align="right">表單編號：KD-25</p>
      <h3 align="center">控制器流向紀錄</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <tbody>
            <tr>
              <td><b>控制器型號</b></td>
              <td><input type="text" name="KD25_控制器型號" required onChange={handleChange} value={formData.KD25_控制器型號 || ''} /></td>
              <td><b>控制器編號</b></td>
              <td><input type="text" name="KD25_控制器編號" required onChange={handleChange} value={formData.KD25_控制器編號 || ''} /></td>
            </tr>
            <tr>
              <td><b>流向廠商</b></td>
              <td colSpan="3"><input type="text" name="KD25_流向廠商" required onChange={handleChange} value={formData.KD25_流向廠商 || ''} /></td>
            </tr>
            <tr>
              <td><b>流向日期</b></td>
              <td colSpan="3"><input type="date" name="KD25_流向日期" required onChange={handleChange} value={formData.KD25_流向日期 || ''} /></td>
            </tr>
            <tr>
              <td><b>備註</b></td>
              <td colSpan="3">
                <textarea name="KD25_Note" rows="3" placeholder="備註" style={{ width: '100%' }} onChange={handleChange} value={formData.KD25_Note || ''}></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD25;
