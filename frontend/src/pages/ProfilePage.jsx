import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { User, FileText, Calendar, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', dob: '', address: '', pan: '', aadhaar: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          address: data.address || '',
          pan: data.pan || '',
          aadhaar: data.aadhaar || ''
        });
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/users/profile', formData);
      setMessage('Profile updated successfully!');
      setProfile({ ...profile, ...formData, isActive: data.user.isActive });
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Update failed. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & KYC</h1>
          <p className="text-gray-500 mt-1">Manage your personal information and account status.</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-medium text-sm ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-primary-light to-primary p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-primary-100">{profile.email}</p>
              <div className="mt-2 flex items-center gap-2">
                {profile.isActive ? (
                  <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> KYC Verified
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-100 border border-amber-500/50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> KYC Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                  <input type="text" name="pan" value={formData.pan} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar / ID Number</label>
                  <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary dark:text-white" />
                </div>
              </div>
              <button type="submit" className="w-full bg-accent hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors">
                Save Changes & Submit KYC
              </button>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"><User className="text-primary w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"><Calendar className="text-primary w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.dob ? profile.dob.split('T')[0] : 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"><MapPin className="text-primary w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">KYC Documents</h3>
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg"><FileText className="text-indigo-600 dark:text-indigo-400 w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500">PAN Card</p>
                    <p className="font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{profile.pan || '--'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg"><FileText className="text-indigo-600 dark:text-indigo-400 w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar/ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white tracking-wider">{profile.aadhaar || '--'}</p>
                  </div>
                </div>
                {!profile.isActive && profile.pan && profile.aadhaar && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium flex gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    Pending admin approval. You will be notified once verified.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
