import React, {useEffect,useState} from 'react';
import axios from 'axios';

const CouponsList = ()=>{
  const [coupons, setCoupons] = useState([]);
  useEffect(()=>{ fetch(); },[]);
  const fetch = async ()=>{ const {data} = await axios.get('/api/coupons', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }); setCoupons(data.data || data); };
  const del = async id => { if(!confirm('Xóa coupon?')) return; await axios.delete(`/api/coupons/${id}`, { headers: { Authorization:`Bearer ${sessionStorage.getItem('token')}` }}); fetch(); };
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Quản lý mã giảm giá</h2>
      <table className="min-w-full bg-white">
        <thead><tr><th>Code</th><th>Discount</th><th>Expire</th><th>Active</th><th>Hành động</th></tr></thead>
        <tbody>
          {coupons.map(c=>(
            <tr key={c._id}>
              <td>{c.code}</td><td>{c.discountPercent}%</td><td>{c.expireAt?new Date(c.expireAt).toLocaleDateString():'--'}</td>
              <td>{c.active? 'Yes':'No'}</td>
              <td><button onClick={()=>del(c._id)} className="text-red-600">Xóa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CouponsList;
