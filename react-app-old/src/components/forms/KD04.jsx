import React, { useState } from 'react';

function KD04({ onSubmit, initialData = {} }) {
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
      <p align="right">表單編號：KD-04</p>
      <h3 align="center">車身組裝後查核表</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <tbody>
            <tr>
              <td colSpan="7"><b>內　　　　容</b></td>
              <td><b>是</b></td>
              <td><b>否</b></td>
            </tr>
            <tr>
              <td>1</td>
              <td colSpan="6">車架各部位螺絲是否鎖緊。</td>
              <td><input type="radio" name="KD04_Item1" value="是" required onChange={handleChange} checked={formData.KD04_Item1 === '是'} /></td>
              <td><input type="radio" name="KD04_Item1" value="否" onChange={handleChange} checked={formData.KD04_Item1 === '否'} /></td>
            </tr>
            <tr>
              <td>2</td>
              <td colSpan="6">車架各部位螺絲是否有瑕疵。</td>
              <td><input type="radio" name="KD04_Item2" value="是" required onChange={handleChange} checked={formData.KD04_Item2 === '是'} /></td>
              <td><input type="radio" name="KD04_Item2" value="否" onChange={handleChange} checked={formData.KD04_Item2 === '否'} /></td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan="6">車架各部位螺絲是否有生鏽。</td>
              <td><input type="radio" name="KD04_Item3" value="是" required onChange={handleChange} checked={formData.KD04_Item3 === '是'} /></td>
              <td><input type="radio" name="KD04_Item3" value="否" onChange={handleChange} checked={formData.KD04_Item3 === '否'} /></td>
            </tr>
            <tr>
              <td>4</td>
              <td colSpan="6">車架各部位螺絲是否有缺少。</td>
              <td><input type="radio" name="KD04_Item4" value="是" required onChange={handleChange} checked={formData.KD04_Item4 === '是'} /></td>
              <td><input type="radio" name="KD04_Item4" value="否" onChange={handleChange} checked={formData.KD04_Item4 === '否'} /></td>
            </tr>
            <tr>
              <td colSpan="9">
                <textarea name="KD04_Note" rows="3" placeholder="備註" style={{ width: '100%' }} onChange={handleChange} value={formData.KD04_Note || ''}></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD04;
