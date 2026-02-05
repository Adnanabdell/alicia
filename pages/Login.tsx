import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GraduationCap } from 'lucide-react';

export const Login = () => {
  const { login, t, language, setLanguage } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success) setError('Invalid credentials. Try: admin / admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full shadow-lg">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Al-Madrasa</h2>
        <p className="text-center text-gray-500 mb-8">{t.welcome}</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.username}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.password}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50"
              placeholder="••••••"
              required
            />
          </div>
          
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            {t.login}
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-6 border-t pt-6">
           <button className={`text-sm font-medium ${language === 'en' ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => setLanguage('en')}>English</button>
           <button className={`text-sm font-medium ${language === 'ar' ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => setLanguage('ar')}>العربية</button>
           <button className={`text-sm font-medium ${language === 'fr' ? 'text-blue-600' : 'text-gray-400'}`} onClick={() => setLanguage('fr')}>Français</button>
        </div>
      </div>
    </div>
  );
};