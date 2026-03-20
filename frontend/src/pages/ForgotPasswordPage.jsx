import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '', previewUrl: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '', previewUrl: '' });
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      setStatus({ 
        type: 'success', 
        message: data.message || 'Password reset link sent to your email.',
        previewUrl: data.previewUrl || ''
      });
      setEmail('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-0"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        {status.message && (
          <div className={`p-4 rounded-xl flex items-start gap-3 mb-6 relative z-10 ${
            status.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col gap-2 w-full text-left">
              <p className="text-sm font-medium">{status.message}</p>
              {status.previewUrl && (
                <a 
                  href={status.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold bg-emerald-100 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-300 py-1.5 px-3 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-700 transition-colors max-w-max"
                >
                  View Reset Email (Development)
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed transform-none' : 'hover:-translate-y-0.5'}`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
