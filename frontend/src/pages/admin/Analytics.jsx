import React, {useEffect,useState} from 'react';
import axios from 'axios';

const Analytics = ()=>{
  const [stats, setStats] = useState(null);
  useEffect(()=>{ fetch(); },[]);
  const fetch = async ()=>{ const {data} = await axios.get('/api/admin/dashboard', { headers:{ Authorization:`Bearer ${sessionStorage.getItem('token')}` } }); setStats(data.data || data); };
  if(!stats) return <div>Loading...</div>;
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Báo cáo nhanh</h2>
      <div className="grid grid-cols-6 gap-4">
        <div className="p-4 bg-white shadow">Tổng đơn: {stats.totalOrders}</div>
        <div className="p-4 bg-white shadow">Đang xử lý: {stats.counts.processing}</div>
        <div className="p-4 bg-white shadow">Đang giao: {stats.counts.shipped}</div>
        <div className="p-4 bg-white shadow">Đã giao: {stats.counts.delivered}</div>
        <div className="p-4 bg-white shadow">Đã hủy: {stats.counts.cancelled}</div>
        <div className="p-4 bg-white shadow">Doanh thu: {Number(stats.revenue).toLocaleString()} đ</div>
      </div>
      <h3 className="mt-6">Sản phẩm sắp hết</h3>
      <ul>{stats.lowStock.map(p=> <li key={p._id}>{p.name} — {p.stock}</li>)}</ul>
    </div>
  );
};
export default Analytics;
