import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Landmark, User, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-emerald-500/20 p-2 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                <Landmark className="h-7 w-7 text-emerald-400" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SentinelBank</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                    <ShieldCheck className="h-4 w-4" /> Admin
                  </Link>
                )}
                <Link to="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/settings" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Settings
                </Link>
                <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors">
                  <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 border border-slate-700 hover:border-red-500/50 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5">
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
