'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProxyMonitor from './components/ProxyMonitor';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalEmailsVerified: number;
  totalRevenue: number;
  todayRevenue: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  _count?: {
    verificationJobs?: number;
    transactions?: number;
  };
}

interface PromoCode {
  id: string;
  code: string;
  credits: number;
  discountType?: string;
  discountValue?: number;
  maxUses?: number;
  currentUses?: number;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
  _count?: {
    usages?: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'proxies' | 'users' | 'promos'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Promo form
  const [promoForm, setPromoForm] = useState({
    code: '',
    credits: '',
    maxUses: '',
    expiresAt: ''
  });

  // Credit form
  const [creditForm, setCreditForm] = useState({
    amount: '',
    action: 'add'
  });

  useEffect(() => {
    // ensure this runs only in the browser
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchPromoCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats ?? response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error?.response?.status === 403) {
        alert('Access denied. Admin only.');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/users?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users ?? response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromoCodes(response.data.promoCodes ?? response.data);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/promo-codes`, {
        code: promoForm.code.toUpperCase(),
        credits: parseInt(promoForm.credits || '0', 10),
        maxUses: parseInt(promoForm.maxUses || '0', 10) || 0,
        expiresAt: promoForm.expiresAt || null,
        discountType: 'FIXED',
        discountValue: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Promo code created successfully!');
      setShowCreatePromo(false);
      setPromoForm({ code: '', credits: '', maxUses: '', expiresAt: '' });
      fetchPromoCodes();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Failed to create promo code');
    }
  };

  const togglePromoCode = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/admin/promo-codes/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPromoCodes();
    } catch (error) {
      console.error(error);
      alert('Failed to toggle promo code');
    }
  };

  const handleUpdateCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/admin/users/${selectedUser.id}/credits`, {
        credits: parseInt(creditForm.amount || '0', 10),
        action: creditForm.action
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Credits updated successfully!');
      setShowCreditModal(false);
      setCreditForm({ amount: '', action: 'add' });
      setSelectedUser(null);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error(error);
      alert('Failed to update credits');
    }
  };

  const toggleUserStatus = async (userId: string) => {
    // use browser confirm
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to change this user\'s status?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl" />
            <span className="font-bold text-xl">OnlyValidEmails</span>
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">ADMIN</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
              User Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="text-red-600 hover:text-red-700 transition-colors px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform management and analytics</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl ${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'bg-white border'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('proxies')}
            className={`px-4 py-2 rounded-xl ${activeTab === 'proxies' ? 'bg-purple-600 text-white' : 'bg-white border'}`}
          >
            Proxies
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'bg-white border'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2 rounded-xl ${activeTab === 'promos' ? 'bg-purple-600 text-white' : 'bg-white border'}`}
          >
            Promo Codes
          </button>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
              <div className="text-sm text-green-600">+{stats.recentSignups} this week</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-green-600">${stats.todayRevenue.toFixed(2)} today</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Emails Verified</div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.totalEmailsVerified.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{stats.completedJobs} jobs completed</div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Jobs</div>
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.pendingJobs}</div>
              <div className="text-sm text-gray-500">Pending verification</div>
            </div>
          </div>
        )}

        {/* Proxies */}
        {activeTab === 'proxies' && (
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <ProxyMonitor />
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email or name"
                className="px-4 py-2 border-2 border-gray-200 rounded-xl w-1/3"
              />
              <div className="text-sm text-gray-600">{users.length} users</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Credits</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No users found.</td>
                    </tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.name ?? '-'}</td>
                      <td className="px-4 py-3">{u.credits.toLocaleString()}</td>
                      <td className="px-4 py-3">{u.isActive ? 'Active' : 'Disabled'}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowCreditModal(true);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded-xl"
                        >
                          Credits
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="px-3 py-1 bg-gray-200 rounded-xl"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promos */}
        {activeTab === 'promos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreatePromo(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
                >
                  Create Promo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200">
              {promoCodes.length === 0 && <div className="text-gray-500">No promo codes yet.</div>}
              {promoCodes.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b py-3">
                  <div>
                    <div className="font-medium">{p.code}</div>
                    <div className="text-sm text-gray-600">Credits: {p.credits}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePromoCode(p.id)} className="px-3 py-1 bg-gray-200 rounded-xl">
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Create Promo Modal */}
      {showCreatePromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Create Promo Code</h3>
            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME2024"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                <input
                  type="number"
                  value={promoForm.credits}
                  onChange={(e) => setPromoForm({ ...promoForm, credits: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Uses (0 = unlimited)</label>
                <input
                  type="number"
                  value={promoForm.maxUses}
                  onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={promoForm.expiresAt}
                  onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreatePromo(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-2">Manage Credits</h3>
            <p className="text-gray-600 mb-6">{selectedUser.email}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-3xl font-bold">{selectedUser.credits.toLocaleString()}</div>
            </div>
            <form onSubmit={handleUpdateCredits} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={creditForm.action}
                  onChange={(e) => setCreditForm({ ...creditForm, action: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="add">Add Credits</option>
                  <option value="set">Set Credits</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={creditForm.amount}
                  onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreditModal(false);
                    setSelectedUser(null);
                    setCreditForm({ amount: '', action: 'add' });
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
