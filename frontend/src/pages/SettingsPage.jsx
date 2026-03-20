import React, { useContext, useState } from 'react';
import { Shield, Bell, Lock, Palette, Smartphone, CheckCircle, ChevronRight, Fingerprint } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(localStorage.getItem('biometricEnabled') === 'true');
  const [twoFactor, setTwoFactor] = useState(true);

  const toggleBiometrics = () => {
    const newVal = !biometrics;
    setBiometrics(newVal);
    if (newVal) {
      localStorage.setItem('biometricEnabled', 'true');
      localStorage.setItem('savedEmail', user.email);
    } else {
      localStorage.removeItem('biometricEnabled');
      localStorage.removeItem('savedEmail');
    }
  };

  if (!user) {
    return <div className="text-center mt-20 text-slate-500">Please login to view settings.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your security, privacy, and app preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Security Module */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl">
              <Shield className="h-6 w-6 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Auth</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <Lock className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500">Secure your account with 2FA.</p>
                </div>
              </div>
              <button 
                onClick={() => setTwoFactor(!twoFactor)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${twoFactor ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <Fingerprint className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Biometric Login</h3>
                  <p className="text-sm text-slate-500">Enable Touch/Face ID on supported devices.</p>
                </div>
              </div>
              <button 
                onClick={toggleBiometrics}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${biometrics ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${biometrics ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Module */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl">
              <Palette className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">App Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-slate-500">Receive alerts on transactions and limits.</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-not-allowed opacity-75">
              <div className="flex items-center gap-4">
                <Smartphone className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Theme</h3>
                  <p className="text-sm text-slate-500">System Default (Dark Mode active)</p>
                </div>
              </div>
              <div className="text-slate-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Active
              </div>
            </div>
          </div>
        </div>

        {/* Support & Legal Module */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About & Legal</h2>
          <div className="space-y-2">
            <a href="/legal" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500">Privacy Policy</span>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
            </a>
            <a href="/legal" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-500">Terms of Service</span>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
            </a>
            <div className="p-4 flex items-center justify-between">
               <span className="text-sm font-medium text-slate-500">App Version</span>
               <span className="text-sm font-bold text-slate-400">v2.4.0-Enterprise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
