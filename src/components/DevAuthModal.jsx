import React, { useState } from 'react';
import { Lock, KeyRound, X, ShieldAlert, Unlock } from 'lucide-react';

// Precomputed SHA-256 digest of the authorized developer password
// Guarantees zero raw plaintext credentials in client source code
const AUTH_HASH_DIGEST = '10a16d834f9b1e4068b25c4c46fe0284e99e44dceaf08098fc83925ba6310ff5';

export default function DevAuthModal({ isOpen, onClose, onUnlockSuccess }) {
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputPassword.trim()) return;

    setIsVerifying(true);
    setError(false);

    try {
      // Compute cryptographic SHA-256 hash using native Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(inputPassword.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (computedHash === AUTH_HASH_DIGEST) {
        setInputPassword('');
        setError(false);
        onUnlockSuccess();
        onClose();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Developer access</h3>
              <p className="text-xs text-slate-400">Enter password to unlock developer tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter developer password"
                autoFocus
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  error
                    ? 'border-rose-500/80 focus:border-rose-500 ring-1 ring-rose-500/30'
                    : 'border-slate-800 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Invalid password</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !inputPassword.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-900/30"
            >
              <Unlock className="w-3.5 h-3.5" />
              {isVerifying ? 'Verifying' : 'Unlock tools'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
