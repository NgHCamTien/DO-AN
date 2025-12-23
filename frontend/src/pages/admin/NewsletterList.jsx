import React, {useEffect,useState} from 'react';
import axios from 'axios';
const NewsletterList = ()=> {
  const [list, setList] = useState([]);
  useEffect(()=>{ fetch(); },[]);
  const fetch = async ()=>{ const {data} = await axios.get('/api/newsletter', { headers: { Authorization:`Bearer ${localStorage.getItem('token')}` } }); setList(data.data || data); };
  const del = async id => { if(!confirm('Xóa?')) return; await axios.delete(`/api/newsletter/${id}`, { headers: { Authorization:`Bearer ${localStorage.getItem('token')}` } }); fetch(); };
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Danh sách đăng ký nhận tin</h2>
      <ul>
        {list.map(n=> <li key={n._id} className="p-2 border-b flex justify-between">{n.email} <button className="text-red-600" onClick={()=>del(n._id)}>Xóa</button></li>)}
      </ul>
    </div>
  );
};
export default NewsletterList;
