import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password);
        if (result.data?.user && result.data.user.identities && result.data.user.identities.length === 0) {
           setError('User already exists');
           setLoading(false);
           return;
        }
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        throw result.error;
      }

      // Automatically redirects via auth state listener in App, but we can set view
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white/70 dark:bg-[#2A2E2C]/70 backdrop-blur-sm rounded-2xl border border-[#A599B5]/30 dark:border-[#A599B5]/10 shadow-xl">
      <h2 className="text-3xl font-serif font-bold mb-6 text-center text-[#56494C] dark:text-[#EAE7E1]">
        {isSignUp ? 'Create an Account' : 'Welcome Back'}
      </h2>
      
      {error && (
        <div className="mb-6 p-3 text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/40 dark:bg-[#2A2E2C]/40 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] rounded-lg focus:ring-2 focus:ring-[#007EA7]/40 dark:focus:ring-[#007EA7]/60 outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#5B7553] dark:text-[#7EA873] uppercase tracking-widest mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/40 dark:bg-[#2A2E2C]/40 border border-[#A599B5]/40 dark:border-[#A599B5]/20 text-[#56494C] dark:text-[#EAE7E1] rounded-lg focus:ring-2 focus:ring-[#007EA7]/40 dark:focus:ring-[#007EA7]/60 outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 text-white font-bold bg-[#007EA7] hover:bg-[#005A7A] dark:hover:bg-[#0092C4] rounded-full transition-colors disabled:opacity-50 shadow-md"
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-[#56494C]/70 dark:text-[#EAE7E1]/70">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-bold text-[#007EA7] dark:text-[#4DB8D9] hover:underline"
        >
          {isSignUp ? 'Log in' : 'Sign up'}
        </button>
      </div>
    </div>
  );
}
