import React, { useState } from 'react';

function KD03({ onSubmit, initialData = {} }) {
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
      <p align="right">表單編號：KD-03</p>
      <h3 align="center">車身組裝中查核表</h3>
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
              <td colSpan="6">車架是否變形、損傷。</td>
              <td><input type="radio" name="KD03_Item1" value="是" required onChange={handleChange} checked={formData.KD03_Item1 === '是'} /></td>
              <td><input type="radio" name="KD03_Item1" value="否" onChange={handleChange} checked={formData.KD03_Item1 === '否'} /></td>
            </tr>
            <tr>
              <td>2</td>
              <td colSpan="6">車架是否生鏽。</td>
              <td><input type="radio" name="KD03_Item2" value="是" required onChange={handleChange} checked={formData.KD03_Item2 === '是'} /></td>
              <td><input type="radio" name="KD03_Item2" value="否" onChange={handleChange} checked={formData.KD03_Item2 === '否'} /></td>
            </tr>
            <tr>
              <td>3</td>
              <td colSpan="6">車架烤漆是否脫落。</td>
              <td><input type="radio" name="KD03_Item3" value="是" required onChange={handleChange} checked={formData.KD03_Item3 === '是'} /></td>
              <td><input type="radio" name="KD03_Item3" value="否" onChange={handleChange} checked={formData.KD03_Item3 === '否'} /></td>
            </tr>
            <tr>
              <td>4</td>
              <td colSpan="6">車架各部位焊接是否牢固。</td>
              <td><input type="radio" name="KD03_Item4" value="是" required onChange={handleChange} checked={formData.KD03_Item4 === '是'} /></td>
              <td><input type="radio" name="KD03_Item4" value="否" onChange={handleChange} checked={formData.KD03_Item4 === '否'} /></td>
            </tr>
            <tr>
              <td>5</td>
              <td colSpan="6">車架各部位是否有焊接渣。</td>
              <td><input type="radio" name="KD03_Item5" value="是" required onChange={handleChange} checked={formData.KD03_Item5 === '是'} /></td>
              <td><input type="radio" name="KD03_Item5" value="否" onChange={handleChange} checked={formData.KD03_Item5 === '否'} /></td>
            </tr>
            <tr>
              <td>6</td>
              <td colSpan="6">車架各部位是否有鑽孔。</td>
              <td><input type="radio" name="KD03_Item6" value="是" required onChange={handleChange} checked={formData.KD03_Item6 === '是'} /></td>
              <td><input type="radio" name="KD03_Item6" value="否" onChange={handleChange} checked={formData.KD03_Item6 === '否'} /></td>
            </tr>
            <tr>
              <td colSpan="9">
                <textarea name="KD03_Note" rows="3" placeholder="備註" style={{ width: '100%' }} onChange={handleChange} value={formData.KD03_Note || ''}></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD03;
