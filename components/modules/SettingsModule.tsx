import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useSettings, SUPPORTED_CURRENCIES } from '../../contexts/SettingsContext';

interface SettingsModuleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ theme, setTheme }) => {
  const { currentUser, authAvailable } = useAuth();
  const { currency, setCurrency } = useSettings();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleResetHabitData = () => {
    if (window.confirm("Are you sure you want to reset all habit tracker data? This action is irreversible.")) {
      localStorage.removeItem('secondbrain-habits');
      localStorage.removeItem('secondbrain-habit-logs');
      localStorage.removeItem('secondbrain-habit-notes');
      alert("Habit tracker data has been reset. The page will now reload.");
      window.location.reload();
    }
  };


  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
  
  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44.5 24.3c0-1.5-.1-3-.4-4.4H24v8.5h11.5c-.5 2.8-2 5.1-4.3 6.7v5.5h7c4.1-3.8 6.5-9.4 6.5-16.3z" fill="#4285F4"/><path d="M24 45c6.5 0 11.9-2.1 15.8-5.8l-7-5.5c-2.1 1.4-4.8 2.3-7.8 2.3-6 0-11.1-4-12.9-9.4h-7.2v5.7C8.1 39.1 15.5 45 24 45z" fill="#34A853"/><path d="M11.1 27.5c-.3-.9-.5-1.9-.5-2.9s.2-2 .5-2.9V16H3.9C2.1 19.5 1 23.6 1 28c0 4.4 1.1 8.5 3 12l7.2-5.7z" fill="#FBBC05"/><path d="M24 10.7c3.5 0 6.6 1.2 9.1 3.6l6.2-6.2C35.9 4.2 30.5 1 24 1 15.5 1 8.1 6.9 3.9 16l7.2 5.7c1.8-5.4 6.9-9.4 12.9-9.4z" fill="#EA4335"/></svg>
  );

  const activeClass = "bg-black text-white dark:bg-white dark:text-black";
  const inactiveClass = "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-white/50 dark:hover:text-white";

  return (
    <div className="max-w-xl space-y-8">
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold tracking-tight">Account Information</h3>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Manage your account details and sign-in status.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 p-6">
          {authAvailable ? (
            currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'User'} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-semibold text-black dark:text-white">{currentUser.displayName}</p>
                    <p className="text-sm text-gray-500 dark:text-white/50">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-gray-600 dark:text-white/60 mb-4">Sign in to sync your data across devices.</p>
                  <button
                      onClick={handleSignIn}
                      className="w-full max-w-xs bg-white dark:bg-black border border-gray-300 dark:border-white/20 text-black dark:text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
                  >
                      <GoogleIcon />
                      Sign in with Google
                  </button>
              </div>
            )
          ) : (
             <div className="text-center text-sm text-red-500 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-500/10">
                Authentication is unavailable. The application has not been configured correctly for Firebase.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold tracking-tight">General Settings</h3>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Customize the global look and feel of the application.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 p-6 flex justify-between items-center">
          <span className="font-medium text-black dark:text-white">
            Theme
          </span>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${theme === 'light' ? activeClass : inactiveClass}`}
            >
              <SunIcon />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${theme === 'dark' ? activeClass : inactiveClass}`}
            >
              <MoonIcon />
              Dark
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 p-6 flex justify-between items-center">
          <span className="font-medium text-black dark:text-white">
            Currency
          </span>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50"
          >
            {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold tracking-tight">Data Management</h3>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Perform actions like resetting module data to its initial state.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-white/10 p-6 flex justify-between items-center">
          <span className="font-medium text-black dark:text-white">
            Habit Tracker
          </span>
          <button
            onClick={handleResetHabitData}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-500 transition-colors"
          >
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;