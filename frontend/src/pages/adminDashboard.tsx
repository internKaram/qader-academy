import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  ScrollText,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

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
  status?: string;
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "audit", label: "Audit log", icon: ScrollText },
];

const ROLES = ["student", "instructor", "admin"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // الحالة تبدأ بقيم فارغة تماماً لتعكس الداتا الحقيقية من الباك إند
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: "0%",
  });
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<Array<{ id: string; actor: string; text: string; time: string }>>([]);

  // جلب البيانات الحقيقية من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };

      // جلب الإحصائيات والرسوم البيانية من قاعدة البيانات
      const statsRes = await fetch("http://localhost:5000/api/v1/admin/stats", { headers });
      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStats(statsJson.stats);
        if (statsJson.chartData) {
          setChartData(statsJson.chartData);
        }
      }

      // جلب قائمة المستخدمين من قاعدة البيانات
      const usersRes = await fetch("http://localhost:5000/api/v1/admin/users", { headers });
      const usersJson = await usersRes.json();
      if (usersJson.success) {
        setUsers(usersJson.users);
      }
    } catch (err) {
      console.error("Error fetching database admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        setAuditLog((prev) => [
          {
            id: `a_${Date.now()}`,
            actor: "Admin",
            text: `updated user role to ${newRole}`,
            time: "Just now",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Error updating role in DB:", err);
    }
  };

  const handleSuspendToggle = async (userId: string) => {
    if (!window.confirm("هل أنت متأكد من تعليق / حذف هذا المستخدم من قاعدة البيانات؟")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
        setAuditLog((prev) => [
          {
            id: `a_${Date.now()}`,
            actor: "Admin",
            text: `deleted/suspended user ID ${userId}`,
            time: "Just now",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Error deleting user from DB:", err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        search.trim() === "" ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 font-medium">
        جاري جلب البيانات من قاعدة البيانات...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
      {/* Sidebar جانبي احترافي */}
      <aside className="w-64 shrink-0 bg-slate-900 min-h-screen flex flex-col text-white">
        <div className="px-6 py-7">
          <p className="text-xs font-medium uppercase tracking-wider text-red-400">Qader Academy</p>
          <h1 className="text-xl font-bold mt-1">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-red-600 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-6 py-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            DB Connected
          </div>
        </div>
      </aside>

      {/* محتوى الصفحة الرئيسي */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">لوحة تحكم المشرف (Admin Dashboard)</h2>
              <p className="text-gray-500 text-sm mt-1">إحصائيات مباشرة من قاعدة البيانات.</p>
            </div>

            {/* كروت الإحصائيات المستندة للبيانات الحقيقية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-500 text-sm">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-500 text-sm">إجمالي الكورسات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses?.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-500 text-sm">إجمالي التسجيلات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments?.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-gray-500 text-sm">معدل الإكمال</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}</p>
              </div>
            </div>

            {/* الرسم البياني من الـ DB */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تسجيلات آخر 30 يوم</h3>
              <div className="h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="_id" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                    لا توجد بيانات رسوم بيانية متاحة حالياً
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
              <p className="text-gray-500 text-sm mt-1">عرض وتعديل المستخدمين المسجلين في قاعدة البيانات.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث بالاسم أو البريد..."
                    className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm w-72 outline-none focus:border-red-600"
                  />
                </div>
                <span className="text-gray-500 text-sm">{filteredUsers.length} مستخدم</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="py-3 pr-4 font-semibold">الاسم</th>
                      <th className="py-3 pr-4 font-semibold">البريد الإلكتروني</th>
                      <th className="py-3 pr-4 font-semibold">الدور (Role)</th>
                      <th className="py-3 pr-4 font-semibold text-right">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-gray-100 last:border-0">
                          <td className="py-3 pr-4 font-medium text-gray-900">{user.name}</td>
                          <td className="py-3 pr-4 text-gray-500">{user.email}</td>
                          <td className="py-3 pr-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-xs capitalize outline-none bg-white"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <button
                              onClick={() => handleSuspendToggle(user._id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold hover:bg-red-50 text-red-600 transition-colors"
                            >
                              تعليق / حذف
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400">
                          لا يوجد مستخدمون مطابقون للبحث
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">سجل النشاطات (Audit Log)</h2>
              <p className="text-gray-500 text-sm mt-1">تتبع العمليات والأنشطة المحدثة.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {auditLog.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {auditLog.map((entry) => (
                    <li key={entry.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <ScrollText className="w-4 h-4 text-red-600" />
                        </span>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{entry.actor}</span> {entry.text}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{entry.time}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400 py-6 text-sm">لم يتم تسجيل أي عمليات تعديل حتى الآن</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}