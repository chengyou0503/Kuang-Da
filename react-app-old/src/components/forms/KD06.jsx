import React, { useState } from 'react';

function KD06({ onSubmit, initialData = {} }) {
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
      <p align="right">表單編號：KD-06</p>
      <h3 align="center">完成品品質管制</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <tbody>
            <tr>
              <td colSpan="7"><b>內　　　　容</b></td>
              <td><b>合格</b></td>
              <td><b>不合格</b></td>
            </tr>
            <tr>
              <td>1</td>
              <td colSpan="6">外觀烤漆、塑膠件是否有刮傷、掉漆、髒污。</td>
              <td><input type="radio" name="KD06_Item1" value="合格" required onChange={handleChange} checked={formData.KD06_Item1 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item1" value="不合格" onChange={handleChange} checked={formData.KD06_Item1 === '不合格'} /></td>
            </tr>
            <tr>
              <td>2</td>
              <td colSpan="6">各部位螺絲是否鎖緊。</td>
              <td><input type="radio" name="KD06_Item2" value="合格" required onChange={handleChange} checked={formData.KD06_Item2 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item2" value="不合格" onChange={handleChange} checked={formData.KD06_Item2 === '不合格'} /></td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan="6">各部位螺絲是否有生鏽、瑕疵。</td>
              <td><input type="radio" name="KD06_Item3" value="合格" required onChange={handleChange} checked={formData.KD06_Item3 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item3" value="不合格" onChange={handleChange} checked={formData.KD06_Item3 === '不合格'} /></td>
            </tr>
            <tr>
              <td>4</td>
              <td colSpan="6">各部位螺絲是否有缺少。</td>
              <td><input type="radio" name="KD06_Item4" value="合格" required onChange={handleChange} checked={formData.KD06_Item4 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item4" value="不合格" onChange={handleChange} checked={formData.KD06_Item4 === '不合格'} /></td>
            </tr>
            <tr>
              <td>5</td>
              <td colSpan="6">腳踏板是否破裂、髒污。</td>
              <td><input type="radio" name="KD06_Item5" value="合格" required onChange={handleChange} checked={formData.KD06_Item5 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item5" value="不合格" onChange={handleChange} checked={formData.KD06_Item5 === '不合格'} /></td>
            </tr>
            <tr>
              <td>6</td>
              <td colSpan="6">後視鏡、方向燈是否破裂。</td>
              <td><input type="radio" name="KD06_Item6" value="合格" required onChange={handleChange} checked={formData.KD06_Item6 === '合格'} /></td>
              <td><input type="radio" name="KD06_Item6" value="不合格" onChange={handleChange} checked={formData.KD06_Item6 === '不合格'} /></td>
            </tr>
            <tr>
              <td colSpan="9">
                <textarea name="KD06_Note" rows="3" placeholder="備註" style={{ width: '100%' }} onChange={handleChange} value={formData.KD06_Note || ''}></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD06;
