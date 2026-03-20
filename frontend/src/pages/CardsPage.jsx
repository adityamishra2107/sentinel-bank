import React, { useState, useContext } from 'react';
import { ArrowLeft, Snowflake, ShieldAlert, KeyRound, Globe, Smartphone, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import VirtualCard from '../components/VirtualCard';

const CardsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // For MVP, we assume the user has at least one account and fetch card for it
      const accRes = await axios.get('http://localhost:5000/api/accounts', config);
      if (accRes.data.length > 0) {
        const cardRes = await axios.get(`http://localhost:5000/api/cards/account/${accRes.data[0].id}`, config);
        setCard(cardRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch card', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCardData();
  }, [user]);

  const toggleFreeze = async () => {
    if (!card) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.patch(`http://localhost:5000/api/cards/${card.id}/freeze`, {}, config);
      setCard(data);
    } catch (error) {
      alert('Failed to update card status');
    }
  };

  const updateSetting = async (setting, value) => {
    if (!card) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.patch(`http://localhost:5000/api/cards/${card.id}/settings`, {
        [setting]: value
      }, config);
      setCard(data);
    } catch (error) {
      alert('Failed to update card settings');
    }
  };

  const issueNewCard = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const accRes = await axios.get('http://localhost:5000/api/accounts', config);
      if (accRes.data.length === 0) return alert('Please open an account first');
      
      const { data } = await axios.post('http://localhost:5000/api/cards/issue', {
        accountId: accRes.data[0].id
      }, config);
      setCard(data);
      alert('Virtual Card Issued Successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to issue card');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Virtual Cards</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-8 animate-fade-in-up">
        
        {!card ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4">No active card found</h2>
            <button 
              onClick={issueNewCard}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
            >
              Issue Virtual Card
            </button>
          </div>
        ) : (
          <>
            {/* Virtual Card Display */}
            <section className="flex flex-col items-center">
              <div className="w-full mb-6 relative">
                {!card.isFrozen && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/30 blur-[60px] rounded-full -z-10"></div>
                )}
                <VirtualCard 
                  cardholderName={user?.name || 'Valued Member'} 
                  cardNumber={card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
                  expiry={card.expiryDate}
                  cvv={card.cvv}
                  isFrozen={card.isFrozen}
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Tap the card to view CVV
              </p>
            </section>

            {/* Primary Card Controls */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
              
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.isFrozen ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    <Snowflake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Freeze Card</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Temporarily lock all transactions</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={card.isFrozen} onChange={toggleFreeze} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <button 
                onClick={() => alert(`Your PIN is current set to 1234 (Mocked)`)}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">View PIN</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">View secure 4-digit card PIN</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-slate-400 rotate-180" />
              </button>

            </section>

            {/* Usage Controls */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">Card Limits & Usage</h3>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-sm">Online Transactions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={card.onlineEnabled} disabled={card.isFrozen} onChange={() => updateSetting('onlineEnabled', !card.onlineEnabled)} />
                    <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${card.isFrozen ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700 peer-checked:bg-emerald-500 peer-checked:after:translate-x-full'}`}></div>
                  </label>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-semibold text-sm">ATM Withdrawals</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={card.atmEnabled} disabled={card.isFrozen} onChange={() => updateSetting('atmEnabled', !card.atmEnabled)} />
                    <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${card.isFrozen ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-slate-200 dark:bg-slate-700 peer-checked:bg-emerald-500 peer-checked:after:translate-x-full'}`}></div>
                  </label>
                </div>

              </div>
            </section>
          </>
        )}

        {/* Danger Zone */}
        <section>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400">Lost or Stolen?</h3>
                <p className="text-xs text-red-600 dark:text-red-300/80 mt-0.5">Block this card and request a replacement instantly.</p>
              </div>
            </div>
            <button className="w-full sm:w-auto shrink-0 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 font-bold py-2 px-4 rounded-xl transition-colors text-sm">
              Report Card
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default CardsPage;
