import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      return setError('You must agree to the Terms of Service & Privacy Policy.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      login(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join SentinelBank today</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" name="name" required className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none dark:text-white" placeholder="John Doe" onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" name="email" required className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none dark:text-white" placeholder="you@domain.com" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input type="tel" name="phone" required className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none dark:text-white" placeholder="+1234567890" onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" name="password" required className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none dark:text-white" placeholder="••••••••" onChange={handleChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" name="confirmPassword" required className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none dark:text-white" placeholder="••••••••" onChange={handleChange} />
              </div>
            </div>
          </div>
          
          <div className="flex items-start mt-2 mb-2">
            <div className="flex items-center h-5 mt-0.5">
              <input 
                id="terms" type="checkbox" required
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                checked={agree} onChange={(e) => setAgree(e.target.checked)}
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              I agree to SentinelBank's <Link to="/legal" target="_blank" className="font-bold text-emerald-500 hover:text-emerald-400">Terms of Service</Link> and <Link to="/legal" target="_blank" className="font-bold text-emerald-500 hover:text-emerald-400">Privacy Policy</Link>.
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-emerald-500 transition-colors mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-secondary hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
