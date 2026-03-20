import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ShieldCheck, UploadCloud, CheckCircle2, AlertCircle, FileText, CreditCard } from 'lucide-react';

const KYCVerificationPage = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    pan: '',
    aadhaar: '',
    address: ''
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pan || !formData.aadhaar || !formData.address) {
      return setStatus({ type: 'error', message: 'Please fill all fields.' });
    }
    if (files.length === 0) {
       return setStatus({ type: 'error', message: 'Please upload at least one identifying document.' });
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // We simulate full KYC completion. The backend sets isActive to true if these 3 fields exist.
      const { data } = await axios.put('http://localhost:5000/api/users/profile', {
        pan: formData.pan,
        aadhaar: formData.aadhaar,
        address: formData.address,
      }, config);

      // Update the global user context with the new isActive status
      login({ ...user, ...data.user, isActive: true });
      
      setStatus({ type: 'success', message: 'KYC Documents Submitted! Your account is now fully verified.' });
      
      // Redirect after success
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to submit KYC. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <ShieldCheck className="w-16 h-16 mb-4 text-emerald-100" />
          <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Identity Verification</h2>
          <p className="mt-2 text-emerald-50 max-w-xl text-sm leading-relaxed">
            To unlock full transaction limits and premium SentinelBank features, please verify your identity under the RBI mandated KYC guidelines.
          </p>
        </div>

        <div className="p-8">
           {status.message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 mb-8 ${
              status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-medium text-sm">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Permanent Account Number (PAN)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="pan" 
                    placeholder="ABCDE1234F" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase placeholder:normal-case dark:text-white"
                    onChange={handleChange}
                    maxLength="10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Aadhaar Number</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="aadhaar" 
                    placeholder="1234 5678 9012" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white"
                    onChange={handleChange}
                    maxLength="12"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Residential Address</label>
              <textarea 
                name="address" 
                rows="3" 
                placeholder="Enter your full building, street, and city..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white resize-none"
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Required Documents (PAN & Aadhaar Scans)</label>
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 flex flex-col items-center justify-center min-h-[160px] ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
                    }
                  }} 
                />
                
                <UploadCloud className={`w-12 h-12 mb-3 ${dragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
                
                {files.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-center pointer-events-none">
                    {files.map((file, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Skip for now
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                {loading ? 'Verifying...' : 'Submit Documents'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationPage;
