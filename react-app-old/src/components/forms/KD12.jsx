import React, { useState } from 'react';

function KD12({ onSubmit, initialData = {}, frameNumber }) {
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
      <p align="right">表單編號：KD-12</p>
      <h3 align="center">車輛出廠檢驗查核表</h3>
      <div className="form-table-wrapper">
        <table className="form-table">
          <tbody>
            <tr>
              <td colSpan="2" style={{ width: '20%' }}><b>品　　牌</b></td>
              <td colSpan="2" style={{ width: '25%' }}>KD-鑛達</td>
              <td style={{ width: '20%' }}><b>車輛型號</b></td>
              <td colSpan="4" style={{ width: '35%' }}>{frameNumber ? frameNumber.substring(0, 4) : ''}</td>
            </tr>
            <tr>
              <td colSpan="7"><b>內　　　　容</b></td>
              <td><b>是</b></td>
              <td><b>否</b></td>
            </tr>
            {/* Items */}
            <tr><td colSpan="9" style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}><b>一、整車檢查（功能部份）：</b></td></tr>
            <tr><td>1</td><td colSpan="6">測試功能是否正常。</td><td><input type="radio" name="KD12_Item1_1" value="是" required onChange={handleChange} checked={formData.KD12_Item1_1 === '是'} /></td><td><input type="radio" name="KD12_Item1_1" value="否" onChange={handleChange} checked={formData.KD12_Item1_1 === '否'} /></td></tr>
            <tr><td>2</td><td colSpan="6">催動馬達是否正常運作。</td><td><input type="radio" name="KD12_Item1_2" value="是" required onChange={handleChange} checked={formData.KD12_Item1_2 === '是'} /></td><td><input type="radio" name="KD12_Item1_2" value="否" onChange={handleChange} checked={formData.KD12_Item1_2 === '否'} /></td></tr>
            <tr><td>3</td><td colSpan="6">煞車功能是否順暢。</td><td><input type="radio" name="KD12_Item1_3" value="是" required onChange={handleChange} checked={formData.KD12_Item1_3 === '是'} /></td><td><input type="radio" name="KD12_Item1_3" value="否" onChange={handleChange} checked={formData.KD12_Item1_3 === '否'} /></td></tr>
            
            <tr><td colSpan="9" style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}><b>二、整車檢查（內件部分）：</b></td></tr>
            <tr><td>1</td><td colSpan="6">煞車線設置是否順暢。</td><td><input type="radio" name="KD12_Item2_1" value="是" required onChange={handleChange} checked={formData.KD12_Item2_1 === '是'} /></td><td><input type="radio" name="KD12_Item2_1" value="否" onChange={handleChange} checked={formData.KD12_Item2_1 === '否'} /></td></tr>
            <tr><td>2</td><td colSpan="6">避震器功能是否良好。</td><td><input type="radio" name="KD12_Item2_2" value="是" required onChange={handleChange} checked={formData.KD12_Item2_2 === '是'} /></td><td><input type="radio" name="KD12_Item2_2" value="否" onChange={handleChange} checked={formData.KD12_Item2_2 === '否'} /></td></tr>
            <tr><td>3</td><td colSpan="6">輪胎胎壓是否足夠。</td><td><input type="radio" name="KD12_Item2_3" value="是" required onChange={handleChange} checked={formData.KD12_Item2_3 === '是'} /></td><td><input type="radio" name="KD12_Item2_3" value="否" onChange={handleChange} checked={formData.KD12_Item2_3 === '否'} /></td></tr>

            <tr><td colSpan="9" style={{ textAlign: 'left', backgroundColor: '#f2f2f2' }}><b>三、整車檢查（外觀部份）：</b></td></tr>
            <tr><td>1</td><td colSpan="6">車架號碼是否清晰。</td><td><input type="radio" name="KD12_Item3_1" value="是" required onChange={handleChange} checked={formData.KD12_Item3_1 === '是'} /></td><td><input type="radio" name="KD12_Item3_1" value="否" onChange={handleChange} checked={formData.KD12_Item3_1 === '否'} /></td></tr>
            <tr><td>2</td><td colSpan="6">控制器標章是否清晰。</td><td><input type="radio" name="KD12_Item3_2" value="是" required onChange={handleChange} checked={formData.KD12_Item3_2 === '是'} /></td><td><input type="radio" name="KD12_Item3_2" value="否" onChange={handleChange} checked={formData.KD12_Item3_2 === '否'} /></td></tr>
            <tr><td>3</td><td colSpan="6">合格標章是否清晰。</td><td><input type="radio" name="KD12_Item3_3" value="是" required onChange={handleChange} checked={formData.KD12_Item3_3 === '是'} /></td><td><input type="radio" name="KD12_Item3_3" value="否" onChange={handleChange} checked={formData.KD12_Item3_3 === '否'} /></td></tr>
            <tr><td>4</td><td colSpan="6">控制器標章黏貼 是否正確</td><td><input type="radio" name="KD12_Item3_4" value="是" required onChange={handleChange} checked={formData.KD12_Item3_4 === '是'} /></td><td><input type="radio" name="KD12_Item3_4" value="否" onChange={handleChange} checked={formData.KD12_Item3_4 === '否'} /></td></tr>
            <tr><td>5</td><td colSpan="6">車身外殼是否乾淨。</td><td><input type="radio" name="KD12_Item3_5" value="是" required onChange={handleChange} checked={formData.KD12_Item3_5 === '是'} /></td><td><input type="radio" name="KD12_Item3_5" value="否" onChange={handleChange} checked={formData.KD12_Item3_5 === '否'} /></td></tr>
            <tr><td>6</td><td colSpan="6">車身外殼、鐵管是否有刮傷、掉漆。</td><td><input type="radio" name="KD12_Item3_6" value="是" required onChange={handleChange} checked={formData.KD12_Item3_6 === '是'} /></td><td><input type="radio" name="KD12_Item3_6" value="否" onChange={handleChange} checked={formData.KD12_Item3_6 === '否'} /></td></tr>
            <tr><td>7</td><td colSpan="6">腳踏板是否破裂、髒污。</td><td><input type="radio" name="KD12_Item3_7" value="是" required onChange={handleChange} checked={formData.KD12_Item3_7 === '是'} /></td><td><input type="radio" name="KD12_Item3_7" value="否" onChange={handleChange} checked={formData.KD12_Item3_7 === '否'} /></td></tr>
            <tr><td>8</td><td colSpan="6">後視鏡、方向燈是否破裂。</td><td><input type="radio" name="KD12_Item3_8" value="是" required onChange={handleChange} checked={formData.KD12_Item3_8 === '是'} /></td><td><input type="radio" name="KD12_Item3_8" value="否" onChange={handleChange} checked={formData.KD12_Item3_8 === '否'} /></td></tr>
            <tr><td>9</td><td colSpan="6">其他配件是否齊全。</td><td><input type="radio" name="KD12_Item3_9" value="是" required onChange={handleChange} checked={formData.KD12_Item3_9 === '是'} /></td><td><input type="radio" name="KD12_Item3_9" value="否" onChange={handleChange} checked={formData.KD12_Item3_9 === '否'} /></td></tr>
          </tbody>
        </table>
      </div>
      <button type="submit" className="btn-primary">提交</button>
    </form>
  );
}

export default KD12;
