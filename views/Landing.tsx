
import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { Globe, Sparkles, ArrowRight, Mail, Lock, User, AtSign, ChevronLeft, Camera } from 'lucide-react';
import { UserProfile } from '../types';
import { AVATARS } from '../constants';
import { registerUser, loginUser } from '../services/storageService';

interface LandingProps {
  onLogin: (user: UserProfile) => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [view, setView] = useState<'hero' | 'login' | 'signup_1' | 'signup_2'>('hero');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearForms = () => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setAvatar(AVATARS[0]);
    setError('');
  };

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
        setError("Please fill in all fields.");
        return;
    }

    const result = loginUser(email, password);
    if (result.success && result.user) {
        onLogin(result.user);
    } else {
        setError(result.message || "Login failed");
    }
  };

  const handleSignupStep1 = () => {
    setError('');
    if (!email || !password) {
        setError("Please fill in all fields.");
        return;
    }
    if (!email.includes('@')) {
        setError("Please enter a valid email.");
        return;
    }
    setView('signup_2');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignupFinal = () => {
    setError('');
    if (!name || !username) {
        setError("Please tell us who you are!");
        return;
    }

    const result = registerUser(email, password, name, username, avatar);
    if (result.success && result.user) {
        onLogin(result.user);
    } else {
        setError(result.message || "Registration failed");
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-green/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl"></div>

      {view === 'hero' && (
        <div className="max-w-md w-full z-10 flex flex-col items-center text-center animate-in fade-in duration-700">
            <div className="mb-8 animate-bounce-short">
              <Globe size={80} className="text-brand-green" strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
              Lingo<span className="text-brand-green">Quest</span>
            </h1>
            <p className="text-xl text-gray-500 font-bold mb-12 max-w-xs mx-auto leading-relaxed">
              The free, fun, and effective way to learn a language!
            </p>
            <div className="w-full space-y-4">
                <Button fullWidth size="lg" onClick={() => { clearForms(); setView('signup_1'); }} className="text-lg h-14">
                  Get Started
                </Button>
                <Button fullWidth size="lg" variant="outline" onClick={() => { clearForms(); setView('login'); }} className="text-lg h-14 uppercase tracking-widest">
                  I already have an account
                </Button>
            </div>
        </div>
      )}

      {view === 'login' && (
        <div className="max-w-md w-full z-10 animate-in slide-in-from-bottom-10 fade-in duration-500">
             <div className="bg-white/90 backdrop-blur border-2 border-gray-200 p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Welcome Back</h2>
                
                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">{error}</div>}

                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                </div>

                <Button fullWidth size="lg" onClick={handleLogin}>Log In</Button>
             </div>
             <button onClick={() => setView('hero')} className="mt-6 w-full text-gray-500 font-bold text-sm uppercase tracking-wider hover:text-gray-800">Cancel</button>
        </div>
      )}

      {view === 'signup_1' && (
        <div className="max-w-md w-full z-10 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur border-2 border-gray-200 p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2 text-center">Create Account</h2>
                <p className="text-center text-gray-500 font-bold mb-6">Step 1 of 2</p>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">{error}</div>}

                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                </div>

                <Button fullWidth size="lg" onClick={handleSignupStep1}>Next <ArrowRight size={20} className="ml-2" /></Button>
            </div>
            <button onClick={() => setView('hero')} className="mt-6 w-full text-gray-500 font-bold text-sm uppercase tracking-wider hover:text-gray-800">Cancel</button>
        </div>
      )}

      {view === 'signup_2' && (
        <div className="max-w-md w-full z-10 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur border-2 border-gray-200 p-8 rounded-3xl shadow-xl">
                <div className="flex items-center mb-4">
                    <button onClick={() => setView('signup_1')} className="p-2 hover:bg-gray-100 rounded-full mr-2 text-gray-400">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-extrabold text-gray-800 text-center flex-1 mr-10">Profile Setup</h2>
                </div>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">{error}</div>}

                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-4 ml-1 text-center">Your Avatar</label>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div 
                                className="relative w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center text-5xl shadow-sm cursor-pointer overflow-hidden group hover:border-brand-blue transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatar.startsWith('data:') ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{avatar}</span>
                                )}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" />
                                </div>
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 text-sm font-bold text-brand-blue hover:underline"
                            >
                                Upload Photo
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAvatarUpload} 
                            />
                        </div>

                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Or choose a preset</label>
                        <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 rounded-xl border-2 border-gray-100">
                            {AVATARS.map(av => (
                                <button 
                                    key={av} 
                                    onClick={() => setAvatar(av)}
                                    className={`text-2xl p-2 rounded-lg hover:bg-white transition-all ${avatar === av ? 'bg-white shadow-md scale-110 ring-2 ring-brand-blue' : 'opacity-70'}`}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button fullWidth size="lg" onClick={handleSignupFinal} className="bg-brand-green shadow-[0_4px_0_0_#46a302]">Start Learning!</Button>
            </div>
        </div>
      )}

      {/* Footer Badges */}
      <div className="absolute bottom-6 flex gap-4 opacity-50">
         <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
            <Sparkles size={14} /> AI Powered
         </div>
      </div>
    </div>
  );
};
