import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { CreditCard, Lock, ArrowRight } from 'lucide-react';

export const LoginView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError('Gagal masuk. Pastikan konfigurasi Firebase benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-bri-blue p-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
             <CreditCard size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">AgenLink Pro</h1>
          <p className="text-blue-100 text-sm">Sistem Pembukuan Cloud BRILink</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">Selamat Datang</h2>
            <p className="text-slate-500 text-sm mt-1">Silakan masuk untuk mengakses data pembukuan Anda secara realtime & aman.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-bri-blue hover:bg-blue-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-3 transition-all group"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-bri-blue"></span>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Masuk dengan Google</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-bri-blue group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock size={12} />
            <span>Enkripsi End-to-End oleh Google Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};