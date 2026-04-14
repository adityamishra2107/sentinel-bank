import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { Send, Clock, ArrowUpRight, ArrowDownLeft, Search, QrCode as QrIcon, User as UserIcon, X, UserPlus, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';

const TransferPage = () => {
  const { user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    senderAccountNum: '', receiverAccountNum: '', amount: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', accountNumber: '', nickname: '' });
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [accRes, txRes, contactRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions/history'),
        api.get('/contacts')
      ]);
      setAccounts(accRes.data);
      if (accRes.data.length > 0 && !formData.senderAccountNum) {
        setFormData(prev => ({ ...prev, senderAccountNum: accRes.data[0].accountNumber }));
      }
      setTransactions(txRes.data);
      setContacts(contactRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await api.post(
        '/transactions/transfer',
        {
          senderAccountNum: formData.senderAccountNum,
          receiverAccountNum: formData.receiverAccountNum,
          amount: parseFloat(formData.amount)
        }
      );
      
      setStatus({ type: 'success', message: data.message });
      setFormData({ ...formData, receiverAccountNum: '', amount: '' });
      fetchData(); // Refresh balances and history
    } catch (error) {
      if (error.response?.status === 403) {
        setStatus({ type: 'warning', message: error.response.data.message });
      } else {
        setStatus({ type: 'error', message: error.response?.data?.message || 'Transfer failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectContact = (accountNum) => {
    setFormData(prev => ({ ...prev, receiverAccountNum: accountNum }));
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!contactForm.email && !contactForm.accountNumber) {
      setContactStatus({ type: 'error', message: 'Please provide an email or account number.' });
      return;
    }
    setContactLoading(true);
    setContactStatus({ type: '', message: '' });
    try {
      await api.post('/contacts', {
        email: contactForm.email || undefined,
        accountNumber: contactForm.accountNumber || undefined,
        nickname: contactForm.nickname || undefined,
      });
      setContactStatus({ type: 'success', message: 'Contact added successfully!' });
      setContactForm({ email: '', accountNumber: '', nickname: '' });
      fetchData();
      setTimeout(() => setShowAddContact(false), 1000);
    } catch (err) {
      setContactStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add contact.' });
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Remove this contact?')) return;
    try {
      await api.delete(`/contacts/${contactId}`);
      fetchData();
    } catch (err) {
      console.error('Delete contact failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 grid xl:grid-cols-5 gap-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Transfer Panel */}
      <div className="xl:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Send Money</h1>
            <p className="text-slate-500 mt-1">Instant, secure, zero-fee transfers.</p>
          </div>
          <button 
            onClick={() => setShowQr(!showQr)}
            className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-200 transition-colors"
            title="My QR Code"
          >
            <QrIcon className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code Modal/Display */}
        {showQr && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4">
              <h3 className="font-bold">Receive Money</h3>
              <button onClick={() => setShowQr(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 bg-white rounded-2xl mb-4">
              <QRCode value={formData.senderAccountNum || 'No Account Selected'} size={180} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-1">{formData.senderAccountNum}</p>
          </div>
        )}

        {/* Contacts (Dynamic) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">My Contacts</h3>
            <button onClick={() => { setShowAddContact(!showAddContact); setContactStatus({ type: '', message: '' }); }} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" /> Add Contact
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <form onSubmit={handleAddContact} className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              {contactStatus.message && (
                <p className={`text-xs font-medium ${contactStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>{contactStatus.message}</p>
              )}
              <input
                type="text"
                placeholder="Nickname (optional)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={contactForm.nickname}
                onChange={e => setContactForm(p => ({ ...p, nickname: e.target.value }))}
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={contactForm.email}
                onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
              />
              <p className="text-[10px] text-slate-400 text-center font-medium">— or —</p>
              <input
                type="text"
                placeholder="Account number"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono"
                value={contactForm.accountNumber}
                onChange={e => setContactForm(p => ({ ...p, accountNumber: e.target.value }))}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 rounded-lg transition disabled:opacity-60"
                >
                  {contactLoading ? 'Saving...' : 'Save Contact'}
                </button>
                <button type="button" onClick={() => setShowAddContact(false)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No contacts yet. Add them to send money faster!</p>
            ) : (
              contacts.map((contact, i) => (
                <div
                  key={contact.id}
                  className="flex flex-col items-center gap-2 group min-w-[66px] relative"
                >
                  <div
                    onClick={() => selectContact(contact.accountNumber)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm cursor-pointer group-hover:scale-105 transition-transform bg-gradient-to-br ${
                      ['from-emerald-400 to-emerald-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-rose-400 to-rose-600', 'from-amber-400 to-amber-600'][i % 5]
                    }`}>
                    {contact.name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[60px]">{contact.name}</span>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-100 dark:bg-red-900/40 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove contact"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
            <div className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]" onClick={() => { setShowAddContact(true); setContactStatus({ type: '', message: '' }); }}>
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">Add New</span>
            </div>
          </div>
        </div>

        {/* Main Transfer Form */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-700 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
              status.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {status.type === 'success' && <span className="text-lg">✅</span>}
              {status.type === 'error' && <span className="text-lg">❌</span>}
              <p className="mt-0.5">{status.message}</p>
            </div>
          )}

          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button className="flex-1 py-2 text-sm font-bold bg-white dark:bg-slate-800 shadow-sm rounded-lg text-indigo-600 dark:text-indigo-400">
              Bank Account
            </button>
            <button className="flex-1 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 transition" onClick={() => alert("UPI scanning coming soon!")}>
              Scan Card
            </button>
          </div>

          <form onSubmit={handleTransfer} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Transfer From</label>
              <select
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all appearance-none font-semibold text-sm"
                value={formData.senderAccountNum}
                onChange={(e) => setFormData({ ...formData, senderAccountNum: e.target.value })}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.accountNumber}>
                    {acc.accountType} (••{acc.accountNumber.slice(-4)}) - Balance: ₹{acc.balance.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Receiver Account Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-mono tracking-widest text-lg placeholder-slate-300 dark:placeholder-slate-700 transition-all"
                  placeholder="0000 0000 0000"
                  value={formData.receiverAccountNum}
                  onChange={(e) => setFormData({ ...formData, receiverAccountNum: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Amount</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-slate-500 font-medium text-xl">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full pl-9 px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white font-extrabold text-3xl transition-shadow shadow-inner"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || accounts.length === 0}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-indigo-500/20 flex justify-center items-center gap-2 mt-6 ${
                (loading || accounts.length === 0) ? 'opacity-70 cursor-not-allowed transform-none hover:shadow-md' : ''
              }`}
            >
              {loading ? 'Processing Protocol...' : <><Send className="w-5 h-5" /> Send Securely</>}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <p className="text-gray-500 text-sm mt-1">Transaction history and insights.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none w-48" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {transactions.map((tx) => {
                const isDebit = accounts.some(acc => acc.accountNumber === tx.senderAccount);
                return (
                  <div key={tx.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isDebit ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {isDebit ? `Transfer to ${tx.receiverAccount.slice(-4)}` : `Received from ${tx.senderAccount.slice(-4)}`}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(tx.timestamp).toLocaleDateString()} • {tx.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isDebit ? 'text-gray-900 dark:text-white' : 'text-emerald-600'}`}>
                        {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${tx.status === 'SUCCESS' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-amber-500 bg-amber-50'}`}>
                        {tx.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
