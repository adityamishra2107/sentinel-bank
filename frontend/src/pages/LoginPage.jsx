import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Fingerprint, ScanFace } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, failed
  
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/dashboard');
    }
    // Check if biometric is enabled for this device
    const bioEnabled = localStorage.getItem('biometricEnabled') === 'true';
    const savedEmail = localStorage.getItem('savedEmail');
    if (bioEnabled && savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // If login successful, ask to enable biometric if not already enabled
      if (localStorage.getItem('biometricEnabled') !== 'true') {
        if (window.confirm('Would you like to enable biometric login for future sessions?')) {
          localStorage.setItem('biometricEnabled', 'true');
          localStorage.setItem('savedEmail', email);
        }
      } else {
        // Update saved email just in case
        localStorage.setItem('savedEmail', email);
      }

      login(data);
    } catch (err) {
      if (!err.response) {
        setError('Banking server is currently unreachable. Please check your connection.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    const savedEmail = localStorage.getItem('savedEmail');
    const bioEnabled = localStorage.getItem('biometricEnabled') === 'true';

    if (!bioEnabled || !savedEmail) {
      setError('Biometric login is not enabled. Please log in with your password first to enable it.');
      return;
    }

    setShowBiometric(true);
    setScanStatus('scanning');
    
    // Simulate biometric scanning delay
    setTimeout(() => {
      setScanStatus('success');
      
      // Authenticate with stored credentials after successful scan
      setTimeout(async () => {
        try {
          // In a real app, this would use a biometric token. 
          // For this simulation, we use a special 'biometric' flag or just the stored email with a session token.
          // For now, we'll use a slightly modified login call that the backend could theoretically support
          const { data } = await api.post('/auth/login', { 
            email: savedEmail, 
            isBiometric: true // Simulated flag
          });
          login(data);
        } catch (loginErr) {
          setScanStatus('failed');
          setError('Biometric session expired. Please use your password.');
          setTimeout(() => setShowBiometric(false), 2000);
        }
      }, 1000);
    }, 2500);
  };


  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to your SentinelBank account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-secondary hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleBiometricLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <Fingerprint className="w-5 h-5 text-primary" />
            {localStorage.getItem('biometricEnabled') === 'true' 
              ? `Login as ${localStorage.getItem('savedEmail')?.split('@')[0]}` 
              : 'Sign in with Biometrics'}
          </button>
          
          {localStorage.getItem('biometricEnabled') === 'true' && (
            <button 
              onClick={() => {
                localStorage.removeItem('biometricEnabled');
                localStorage.removeItem('savedEmail');
                setEmail('');
                alert('Biometric link removed.');
              }}
              className="w-full mt-2 text-[10px] text-gray-400 hover:text-red-400 font-medium transition-colors"
            >
              Remove Biometric Link
            </button>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          First time here?{' '}
          <Link to="/register" className="font-bold text-secondary hover:text-indigo-500">
            Open an account
          </Link>
        </div>
      </div>

      {/* Biometric Overlay Simulation */}
      {showBiometric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center transform transition-all scale-100 relative overflow-hidden">
            {scanStatus === 'scanning' && (
              <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse"></div>
            )}
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
              {scanStatus === 'scanning' ? 'Verifying Identity' : scanStatus === 'success' ? 'Verified' : 'Verification Failed'}
            </h3>
            <p className="text-gray-500 text-sm mb-8 relative z-10">
              {scanStatus === 'scanning' ? 'Please position your face or finger' : scanStatus === 'success' ? 'Logging you in securely...' : 'Please try again'}
            </p>
            
            <div className="flex justify-center mb-8 relative z-10">
              <div className={`relative p-6 rounded-full ${
                scanStatus === 'scanning' ? 'bg-primary/10 text-primary animate-pulse' : 
                scanStatus === 'success' ? 'bg-emerald-100 text-emerald-500' : 
                'bg-red-100 text-red-500'
              }`}>
                {scanStatus === 'scanning' ? (
                  <ScanFace className="w-16 h-16 animate-bounce" />
                ) : scanStatus === 'success' ? (
                  <Fingerprint className="w-16 h-16" />
                ) : (
                  <AlertCircle className="w-16 h-16" />
                )}
                
                {/* Laser scan effect */}
                {scanStatus === 'scanning' && (
                  <div className="absolute left-0 right-0 h-1 bg-primary blur-[2px] rounded-full animate-[scan_2s_ease-in-out_infinite]" style={{ top: '50%' }}></div>
                )}
              </div>
            </div>

            {scanStatus === 'failed' && (
              <button 
                onClick={() => setShowBiometric(false)}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
