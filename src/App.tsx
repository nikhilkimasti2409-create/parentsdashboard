import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { Lock, AlertTriangle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import History from './components/History';
import Analytics from './components/Analytics';
import SecurityLogs from './components/SecurityLogs';
import { db, auth, provider } from './firebase';
import { fetchLiveStatus, fetchHistory, fetchSecurityViolations } from './utils';
import type { LiveStatusData, HistoryRecord, SecurityViolation } from './utils';

// Parents Access List

const ALLOWED_EMAILS = ["dimplerjoshi2409@gmail.com", "tjangir2010@gmail.com", "kkrishnarjoshi0509@gmail.com", "nikhilkimasti2409@gmail.com"];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Firestore Data State
  const [liveStatus, setLiveStatus] = useState<LiveStatusData>({
    totalTimeMs: 0,
    streak: 0,
    isStudying: "None",
    screenTimeData: {},
    tasks: [],
    lastHeartbeatTime: 0
  });
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [securityViolations, setSecurityViolations] = useState<SecurityViolation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active status ticker: updates currentTime state every 5 seconds to re-evaluate presence
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

  // Monitor real-time database changes (low latency & offline support)
  useEffect(() => {
    if (!user) return;

    // 1. Listen to today's live status
    const unsubscribeLive = onSnapshot(doc(db, "LiveStatus", "MyData"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let screenTimeData = {};
        try {
          screenTimeData = JSON.parse(data.screenTimeJson || "{}");
        } catch {}

        let tasks = [];
        try {
          tasks = JSON.parse(data.tasksJson || "[]");
        } catch {}

        setLiveStatus({
          totalTimeMs: Number(data.totalTimeMs || 0),
          streak: Number(data.streak || 0),
          isStudying: data.isStudying || "None",
          screenTimeData,
          tasks,
          extensionActive: data.extensionActive || "disabled",
          lastHeartbeatTime: Number(data.lastHeartbeatTime || 0)
        });
      }
    }, (error) => {
      console.error("Live status listener error:", error);
    });

    // 2. Listen to history logs
    const unsubscribeHistory = onSnapshot(collection(db, "HistoryData"), (querySnapshot) => {
      const records: HistoryRecord[] = querySnapshot.docs.map((docSnap) => {
        const dateId = docSnap.id;
        const dateStr = dateId.replace(/-/g, '/');
        const data = docSnap.data();

        return {
          date: dateStr,
          totalTimeMs: Number(data.totalTimeMs || 0),
          streak: Number(data.streak || 0),
          physicsTime: Number(data.physicsTime || 0),
          chemTime: Number(data.chemTime || 0),
          mathsTime: Number(data.mathsTime || 0),
          studyLogs: data.studyLogs || []
        };
      });

      // Sort descending by date
      const sorted = records.sort((a, b) => {
        const [d1, m1, y1] = a.date.split('/');
        const [d2, m2, y2] = b.date.split('/');
        return new Date(`${y2}-${m2}-${d2}`).getTime() - new Date(`${y1}-${m1}-${d1}`).getTime();
      });
      setHistoryRecords(sorted);
    }, (error) => {
      console.error("History listener error:", error);
    });

    // 3. Listen to security violations (ordered descending by timestamp)
    const unsubscribeViolations = onSnapshot(collection(db, "SecurityViolations"), (querySnapshot) => {
      const violations: SecurityViolation[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type || "security_violation",
          details: data.details || "Unknown safety warning.",
          timestamp: data.timestamp || new Date().toISOString(),
          dateStr: data.dateStr || ""
        };
      });

      // Sort descending by timestamp
      const sorted = violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSecurityViolations(sorted);
    }, (error) => {
      console.error("Security violations listener error:", error);
    });

    return () => {
      unsubscribeLive();
      unsubscribeHistory();
      unsubscribeViolations();
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

  // Compute real-time presence based on heartbeat
  const isExtensionActive = liveStatus.lastHeartbeatTime && (currentTime - liveStatus.lastHeartbeatTime < 25000);
  const computedLiveStatus = {
    ...liveStatus,
    extensionActive: isExtensionActive ? 'running' : 'disabled'
  };

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
        extensionActive={computedLiveStatus.extensionActive}
      />

      {/* Main Page Area */}
      <main className="flex-1 min-h-screen ml-0 md:ml-[90px] pt-16 md:pt-0 pb-16 md:pb-0 relative">
        {currentTab === 'dashboard' && (
          <Dashboard
            liveStatus={computedLiveStatus}
            historyRecords={historyRecords}
            onNavigateTab={handleSelectHistoryDate}
          />
        )}
        {currentTab === 'tasks' && (
          <Tasks tasks={computedLiveStatus.tasks} />
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
            liveStatus={computedLiveStatus}
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
