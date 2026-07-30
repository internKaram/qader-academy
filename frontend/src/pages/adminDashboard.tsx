import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: string | number;
}

interface ChartDataItem {
  _id: string;
  count: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, completionRate: '0%' });
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

      const statsRes = await fetch('http://localhost:5000/api/v1/admin/stats', { headers });
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.stats);
        setChartData(statsJson.chartData);
      }

      const usersRes = await fetch('http://localhost:5000/api/v1/admin/users', { headers });
      const usersJson = await usersRes.json();
      if (usersJson.success) {
        setUsers(usersJson.users);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف/تعليق هذا المستخدم؟')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم المشرف (Admin Dashboard)</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">إجمالي المستخدمين</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">إجمالي الكورسات</h3>
          <p className="text-2xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">إجمالي التسجيلات</h3>
          <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">معدل الإكمال</h3>
          <p className="text-2xl font-bold">{stats.completionRate}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">تسجيلات آخر 30 يوم</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">إدارة المستخدمين</h3>
          <input 
            type="text" 
            placeholder="بحث بالاسم أو البريد..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-2">الاسم</th>
                <th className="p-2">البريد الإلكتروني</th>
                <th className="p-2">الدور (Role)</th>
                <th className="p-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      تعليق / حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}