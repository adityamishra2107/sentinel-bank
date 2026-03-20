import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, CreditCard } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl mt-4 shadow-2xl relative overflow-hidden xl:mx-4 mx-2">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 relative z-10">
          Banking for the <span className="text-emerald-400 drop-shadow-lg">Future</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl relative z-10 font-light leading-relaxed">
          Secure, ultra-fast, and AI-powered. Experience seamless money transfers with military-grade encryption.
        </p>
        <div className="flex gap-4 relative z-10">
          <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]">
            Get Started Forever Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-slate-900 dark:text-white">Why Choose SentinelBank?</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="glass-panel p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="bg-blue-100 dark:bg-blue-900/40 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 text-blue-600 dark:text-blue-400 shadow-sm">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Lightning Fast</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Zero-delay transactions across the globe. We process payments natively at hardware speed.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">AI Fraud Detection</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our advanced ML models scan 100% of transactions in real-time to prevent unauthorized access.</p>
          </div>
          <div className="glass-panel p-8 rounded-2xl shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="bg-purple-100 dark:bg-purple-900/40 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 text-purple-600 dark:text-purple-400 shadow-sm">
              <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Bank-Grade Security</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Fully encrypted data at rest and in transit. Your privacy is mathematically guaranteed.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
