
import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { Globe, Sparkles, ArrowRight, Mail, Lock, User, AtSign, ChevronLeft, Camera, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { registerUser, loginUser } from '../services/storageService';
import { AVATARS } from '../constants';

interface LandingProps {
  onLogin: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
  user?: UserProfile; // Current user state (guest data)
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onContinueAsGuest, user }) => {
  const [view, setView] = useState<'hero' | 'login' | 'signup_1' | 'signup_2'>('hero');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Avatar Selection State
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isCustomUpload, setIsCustomUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearForms = () => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setSelectedAvatar(AVATARS[0]);
    setIsCustomUpload(false);
    setError('');
  };

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
        setError("Please fill in all fields.");
        return;
    }

    // Trim inputs to avoid whitespace errors
    const result = loginUser(email.trim(), password.trim());
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
        setSelectedAvatar(reader.result as string);
        setIsCustomUpload(true);
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

    // Trim inputs to avoid whitespace errors
    // Pass current 'user' (Guest Data) to preserve progress
    const result = registerUser(email.trim(), password.trim(), name, username, selectedAvatar, user);
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
                <button 
                  onClick={onContinueAsGuest}
                  className="text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-xs mt-4 flex items-center gap-2 justify-center w-full transition-colors"
                >
                   <UserCircle size={16} /> Continue as Guest
                </button>
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
                            type="email" 
                            placeholder="Email" 
                            autoComplete="email"
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            autoComplete="current-password"
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
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
                            type="email" 
                            placeholder="Email" 
                            autoComplete="email"
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            autoComplete="new-password"
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
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
        <div className="max-w-lg w-full z-10 animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="bg-white/95 backdrop-blur border-2 border-gray-200 p-6 rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center mb-4">
                    <button onClick={() => setView('signup_1')} className="p-2 hover:bg-gray-100 rounded-full mr-2 text-gray-400">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-extrabold text-gray-800 text-center flex-1 mr-10">Create Profile</h2>
                </div>

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">{error}</div>}

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="relative col-span-2 sm:col-span-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none text-sm"
                        />
                    </div>
                    <div className="relative col-span-2 sm:col-span-1">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 rounded-xl border-2 border-gray-200 font-bold text-gray-900 bg-white focus:border-brand-blue outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-brand-blue bg-blue-50 flex items-center justify-center text-6xl overflow-hidden shadow-md mb-2">
                            {selectedAvatar.startsWith('data:') ? (
                                <img src={selectedAvatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                            ) : (
                                selectedAvatar
                            )}
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Preview</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                        <p className="text-sm font-extrabold text-gray-700 mb-3 text-center">Choose an Avatar</p>
                        
                        <div className="max-h-60 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                {AVATARS.map(av => (
                                    <button 
                                        key={av} 
                                        onClick={() => { setSelectedAvatar(av); setIsCustomUpload(false); }}
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition-all ${selectedAvatar === av && !isCustomUpload ? 'bg-white border-2 border-brand-blue shadow-sm scale-110' : 'hover:bg-gray-200 border border-transparent'}`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs font-bold text-gray-400">OR</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="mt-3 flex justify-center">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 bg-white border-2 border-gray-200 px-4 py-2 rounded-xl font-bold text-gray-600 hover:border-brand-blue hover:text-brand-blue transition-all text-sm shadow-sm"
                            >
                                <Camera size={16} /> Upload Photo
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAvatarUpload} 
                            />
                        </div>
                    </div>
                </div>

                <Button fullWidth size="lg" onClick={handleSignupFinal} className="bg-brand-green shadow-[0_4px_0_0_#46a302]">Start Learning!</Button>
            </div>
        </div>
      )}

      {/* Footer Badges */}
      <div className="absolute bottom-6 flex gap-4 opacity-50 pointer-events-none">
         <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
            <Sparkles size={14} /> AI Powered
         </div>
      </div>
    </div>
  );
};