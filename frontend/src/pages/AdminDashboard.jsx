import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Users, ShieldAlert, CheckCircle, XCircle, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, flagged
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    activeUsers: 0, 
    totalTransactions: 0, 
    totalMoneyVolume: 0,
    chartData: []
  });
  const [users, setUsers] = useState([]);
  const [flaggedTxs, setFlaggedTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [statsRes, usersRes, flaggedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/reports', config),
        axios.get('http://localhost:5000/api/admin/users', config),
        axios.get('http://localhost:5000/api/admin/transactions/flagged', config)
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFlaggedTxs(flaggedRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKYC = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/admin/kyc/${userId}/approve`, {}, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewTx = async (txId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/admin/transactions/${txId}/review`, { action }, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-gray-500">Loading Admin Data...</div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex gap-8 flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 space-y-2 shrink-0">
        <div className="bg-primary text-white p-6 rounded-3xl shadow-lg mb-6">
          <ShieldCheck className="w-12 h-12 mb-4 text-accent" />
          <h2 className="text-xl font-bold">Admin Portal</h2>
          <p className="text-primary-100 text-sm mt-1">Superuser Access</p>
        </div>
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
        >
          <TrendingUp className="w-5 h-5" /> Reports Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
        >
          <Users className="w-5 h-5" /> User Management
          {users.filter(u => !u.isActive).length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {users.filter(u => !u.isActive).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'flagged' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
        >
          <ShieldAlert className="w-5 h-5" /> Fraud Alerts
          {flaggedTxs.length > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {flaggedTxs.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 min-h-[600px] overflow-hidden">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">System Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <Users className="w-6 h-6 opacity-70 mb-3" />
                <p className="text-blue-100 font-medium text-sm">Total Users</p>
                <div className="flex items-end gap-2 mt-1">
                  <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
                  <span className="text-blue-200 text-sm mb-1">({stats.activeUsers} KYC)</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                <CheckCircle className="w-6 h-6 opacity-70 mb-3" />
                <p className="text-emerald-100 font-medium text-sm">Valid Transactions</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalTransactions}</h3>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg md:col-span-2">
                <TrendingUp className="w-6 h-6 opacity-70 mb-3" />
                <p className="text-amber-100 font-medium text-sm">Total Vault Volume (₹)</p>
                <h3 className="text-3xl font-bold mt-1">₹{stats.totalMoneyVolume?.toLocaleString() || 0}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">7-Day Trailing Volume</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTransfer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="Transferred" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTransfer)" />
                    <Area type="monotone" dataKey="Deposits" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDeposit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-0">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User KYC & Maintenance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{u.name}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Verified</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Pending KYC</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!u.isActive && (
                          <button onClick={() => handleApproveKYC(u.id)} className="text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 px-4 py-2 rounded-lg transition-colors">
                            Approve KYC
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Flagged Transactions Tab */}
        {activeTab === 'flagged' && (
          <div className="p-0">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <AlertTriangle className="text-amber-500 w-8 h-8" /> Suspicious Transactions
              </h2>
              <p className="text-gray-500 mt-2">Transactions flagged by Sentinel AI requiring manual review.</p>
            </div>
            
            {flaggedTxs.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-50" />
                <p className="text-lg">No flagged transactions. The system is secure.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {flaggedTxs.map((tx) => (
                  <div key={tx.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> High Risk
                        </span>
                        <span className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        Transfer of ₹{tx.amount.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-sm mt-1 font-mono">
                        From: <span className="font-bold">{tx.senderAccount}</span> → To: <span className="font-bold">{tx.receiverAccount}</span>
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => handleReviewTx(tx.id, 'APPROVE')} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                        <CheckCircle className="w-5 h-5" /> Allow
                      </button>
                      <button onClick={() => handleReviewTx(tx.id, 'REJECT')} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold transition-colors">
                        <XCircle className="w-5 h-5" /> Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
