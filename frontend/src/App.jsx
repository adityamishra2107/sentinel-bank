import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import TransferPage from './pages/TransferPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import LegalPage from './pages/LegalPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import KYCVerificationPage from './pages/KYCVerificationPage';
import CardsPage from './pages/CardsPage';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FinanceChatbot = lazy(() => import('./components/FinanceChatbot'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 relative overflow-hidden">
          {/* Global Enterprise Background Gradients */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="mx-auto w-full flex-grow">
              <Suspense fallback={
                <div className="flex h-[80vh] w-full items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                  <span className="text-emerald-600 font-bold tracking-wide">Loading Secure Dashboard...</span>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/transfer" element={<TransferPage />} />
                  <Route path="/cards" element={<CardsPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                  <Route path="/kyc" element={<KYCVerificationPage />} />
                </Routes>
                
                {/* Global AI Assistant */}
                <FinanceChatbot />
              </Suspense>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
