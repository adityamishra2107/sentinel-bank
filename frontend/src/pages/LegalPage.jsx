import React from 'react';
import { ShieldAlert } from 'lucide-react';

const LegalPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-4">
           <ShieldAlert className="h-10 w-10 text-indigo-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Legal & Privacy Hub</h1>
        <p className="text-slate-500 font-medium">Your data security and rights are our top priority.</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Terms of Service</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            Welcome to SentinelBank. By opening an account, you agree to these terms. Our banking interfaces, APIs, and AI-driven insights are provided "as is". 
            <strong> You agree that you are solely responsible for keeping your credentials secure.</strong> 
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            SentinelBank reserves the right to freeze accounts automatically via our Real-Time Risk Engine if suspicious activity is detected. We are not liable for any simulated stock market or FD investment losses incurred through our platform.
          </p>
          
          <h3 className="text-xl font-bold mt-8 mb-4">1. Account Security</h3>
           <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
             <li>You must not share your OTPs or biometrics.</li>
             <li>All transactions are recorded on an immutable ledger database for auditing.</li>
           </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Privacy Policy</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            At SentinelBank, we collect data to provide you with Smart Spending Insights and predictive modeling. We collect:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 mb-6">
             <li>Transaction volumes and categorization matrices.</li>
             <li>Device IP, location, and hardware signatures for fraud prevention.</li>
             <li>Basic KYC documentation (PAN, Aadhaar mock data).</li>
           </ul>
           <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
             We <strong>do not sell</strong> your raw financial data to third parties. All AI modeling is done securely within our own tenant architecture. Data is encrypted at rest using AES-256 standards.
           </p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
