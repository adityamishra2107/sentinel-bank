import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { 
  ArrowUpRight, ArrowDownLeft, QrCode, CreditCard, 
  Settings, User, PieChart as PieChartIcon, Activity,
  ShieldCheck, Wallet, ChevronRight, Bell, Plus, MoreHorizontal
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, LineChart, Line, XAxis, YAxis as import_recharts_YAxis } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const fetchData = async () => {
    try {
      const [accountsRes, insightsRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions/insights').catch(() => ({ data: null }))
      ]);

      const accountsData = accountsRes.data;
      setAccounts(accountsData);
      if (accountsData.length > 0) setSelectedAccountId(accountsData[0].id);

      setInsights(insightsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!amountToAdd || !selectedAccountId) return;

    try {
      const res = await api.post('/payments/create-order', {
        amount: parseFloat(amountToAdd),
        accountId: selectedAccountId
      });

      const { order, depositId } = res.data;

      const options = {
        key: 'rzp_test_YourTestKeyId',
        amount: order.amount,
        currency: order.currency,
        name: 'SentinelBank',
        description: 'Account Deposit',
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              depositId
            });
            
            alert('Deposit Successful!');
            setShowAddMoney(false);
            setAmountToAdd('');
            fetchData();
          } catch (error) {
            alert('Payment Verification Failed!');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#4F46E5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert('Failed to initiate payment.');
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center cursor-pointer border border-indigo-200 dark:border-indigo-800 overflow-hidden shadow-sm"
              onClick={() => navigate('/profile')}
            >
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome back,</p>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'User'}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Total Balance Card */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-800 text-white shadow-xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <p className="text-indigo-100 font-medium flex items-center gap-2 text-sm sm:text-base">
                Total Balance <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-indigo-200 text-sm mt-2 font-medium">
                across {accounts.length} account{accounts.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/transfer')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
              >
                <ArrowUpRight className="w-5 h-5" /> Transfer
              </button>
              <button 
                onClick={() => setShowAddMoney(!showAddMoney)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-400/30 text-white px-5 py-3 rounded-xl font-bold transition backdrop-blur-sm"
              >
                {showAddMoney ? <MoreHorizontal className="w-5 h-5" /> : <Plus className="w-5 h-5" />} Add Funds
              </button>
            </div>
          </div>
        </section>

        {/* Add Money Form Expansion */}
        {showAddMoney && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 fade-in">
            <h3 className="text-sm font-bold mb-4 text-slate-800 dark:text-slate-100">Deposit Funds via Razorpay</h3>
            <form onSubmit={handleAddMoney} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Select Account</label>
                <select 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.accountType} (..{acc.accountNumber.slice(-4)}) - ₹{acc.balance.toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Amount (₹)</label>
                <input 
                  type="number" min="10" placeholder="1000" required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition">
                Proceed
              </button>
            </form>
          </div>
        )}

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 sm:gap-4">
            <ActionCard icon={<ArrowUpRight className="w-6 h-6 text-emerald-500" />} label="Send Money" onClick={() => navigate('/transfer')} bg="bg-emerald-50 dark:bg-emerald-500/10" />
            <ActionCard icon={<QrCode className="w-6 h-6 text-indigo-500" />} label="Scan QR" onClick={() => alert('QR Scanner feature coming soon!')} bg="bg-indigo-50 dark:bg-indigo-500/10" />
            <ActionCard icon={<CreditCard className="w-6 h-6 text-violet-500" />} label="Cards" onClick={() => navigate('/cards')} bg="bg-violet-50 dark:bg-violet-500/10" />
            <ActionCard icon={<Activity className="w-6 h-6 text-orange-500" />} label="History" onClick={() => navigate('/profile')} bg="bg-orange-50 dark:bg-orange-500/10" />
          </div>
        </section>

        {/* Two Column Layout for Desktop */}
        <div className="grid sm:grid-cols-2 gap-6 pb-8">
          
          {/* My Accounts List */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" /> Accounts
              </h3>
              <button onClick={() => navigate('/transfer')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer" onClick={() => navigate('/transfer')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                      {acc.accountType[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{acc.accountType}</p>
                      <p className="text-xs text-slate-500">****{acc.accountNumber.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">₹{acc.balance.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block mt-0.5">Active</p>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">No accounts found.</div>
              )}
            </div>
          </section>

          {/* Financial Analytics & AI Insights Grid */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mt-6 col-span-1 sm:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-500" /> Advanced Analytics
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Monthly Spending Bar Chart */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 px-2">Monthly Spending</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights?.barChart?.length > 0 ? insights.barChart : [
                      { month: 'No Data', spent: 0 }
                    ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <import_recharts_YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                      <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Income vs Expense Line Chart */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 px-2">Cashflow Trend</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights?.cashflowChart?.length > 0 ? insights.cashflowChart : [
                      { month: 'No Data', income: 0, expense: 0 }
                    ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <import_recharts_YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Insights Below Charts */}
            {insights && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-500" /> Category Breakdown
                  </h4>
                  {insights.pieChart && insights.pieChart.length > 0 ? (
                    <div className="h-44 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={insights.pieChart}
                            cx="50%" cy="50%" 
                            innerRadius={50} outerRadius={70} 
                            paddingAngle={5} dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {insights.pieChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`} 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-sm text-slate-500">Not enough data for chart</div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center space-y-4">
                   <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Smart Savings Area</p>
                      <span className="text-xs bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded font-bold">AI</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">You spent 40% on Food this month. Consider cooking at home to increase your <strong className="text-emerald-500">Savings Rate of {insights.savingRate}%</strong>.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">AI Risk Profile Assessment</p>
                    <p className={`font-extrabold text-lg ${insights.riskProfile === 'Safe' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {insights.riskProfile || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Based on predictive analysis of your transactions.</p>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

const ActionCard = ({ icon, label, onClick, bg }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
  </button>
);

export default Dashboard;
