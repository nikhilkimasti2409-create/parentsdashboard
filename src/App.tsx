import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Lock, AlertTriangle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import History from './components/History';
import Analytics from './components/Analytics';
import SecurityLogs from './components/SecurityLogs';
import { fetchLiveStatus, fetchHistory, fetchSecurityViolations } from './utils';
import type { LiveStatusData, HistoryRecord, SecurityViolation } from './utils';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHJte4EBZDE22L6RpDqn3qm3DUrY5Tkss",
  projectId: "my-dashboard-e2eb5",
  authDomain: "my-dashboard-e2eb5.firebaseapp.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const ALLOWED_EMAILS = ["dimplerjoshi2409@gmail.com", "tjangir2010@gmail.com", "kkrishnarjoshi0509@gmail.com", "nikhilkimasti2409@gmail.com"];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Firestore Data State
  const [liveStatus, setLiveStatus] = useState<LiveStatusData>({
    totalTimeMs: 0,
    streak: 0,
    isStudying: "None",
    screenTimeData: {},
    tasks: []
  });
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        if (firebaseUser.email && ALLOWED_EMAILS.includes(firebaseUser.email)) {
          setUser(firebaseUser);
          setLoginError(null);
          loadAllData();
        } else {
          // Reject unauthorized users
          signOut(auth).then(() => {
            setLoginError(`Access Denied! ${firebaseUser.email} is not authorized to view this dashboard.`);
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Poll live data every 5 seconds, poll historical data every 15 seconds
  useEffect(() => {
    if (!user) return;

    const liveInterval = setInterval(() => {
      fetchLiveStatus().then(setLiveStatus).catch(console.error);
    }, 5000);

    const historyInterval = setInterval(() => {
      fetchHistory().then(setHistoryRecords).catch(console.error);
      fetchSecurityViolations().then(setSecurityViolations).catch(console.error);
    }, 15000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(historyInterval);
    };
  }, [user]);

  const loadAllData = async () => {
    try {
      const [live, hist, sec] = await Promise.all([
        fetchLiveStatus(),
        fetchHistory(),
        fetchSecurityViolations()
      ]);
      setLiveStatus(live);
      setHistoryRecords(hist);
      setSecurityViolations(sec);
    } catch (e) {
      console.error("Data load error:", e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setLoginError("Login Failed: " + e.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleSelectHistoryDate = (date: string) => {
    setSelectedDate(date);
    setCurrentTab('analytics');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a11] flex items-center justify-center font-mono">
        <div className="text-red-400 text-sm animate-pulse">
          INITIALIZING SECURE LINK... 📡
        </div>
      </div>
    );
  }

  // Google Authentication Overlay Page
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080a11] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="w-full max-w-[420px] bg-slate-950/60 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative motionsite-card-shine text-center">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
          
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 mx-auto mb-6">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-extrabold text-white mb-2 font-display uppercase tracking-widest">
            JEE COMMAND CENTER
          </h1>
          <p className="text-xs text-neutral-400 font-mono mb-8">PARENTS ACCESS PORTAL ONLY 🔒</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm rounded-xl cursor-pointer shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="18" alt="Google" />
            Sign in with Google
          </button>

          {loginError && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-2.5 text-left leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Parents Dashboard Content Layout
  return (
    <div className="min-h-screen bg-[#080a11] text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'analytics') setSelectedDate(null);
        }}
        onLogout={handleSignOut}
        userEmail={user.email}
        extensionActive={liveStatus.extensionActive}
      />

      {/* Main Page Area */}
      <main className="flex-1 min-h-screen ml-[90px] relative">
        {currentTab === 'dashboard' && (
          <Dashboard
            liveStatus={liveStatus}
            historyRecords={historyRecords}
            onNavigateTab={handleSelectHistoryDate}
          />
        )}
        {currentTab === 'tasks' && (
          <Tasks tasks={liveStatus.tasks} />
        )}
        {currentTab === 'history' && (
          <History
            historyRecords={historyRecords}
            onSelectDate={handleSelectHistoryDate}
          />
        )}
        {currentTab === 'analytics' && (
          <Analytics
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            historyRecords={historyRecords}
            liveStatus={liveStatus}
          />
        )}
        {currentTab === 'security' && (
          <SecurityLogs
            violations={securityViolations}
            onRefresh={loadAllData}
          />
        )}
      </main>
    </div>
  );
};

export default App;
