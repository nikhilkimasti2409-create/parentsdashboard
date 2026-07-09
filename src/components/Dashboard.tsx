import React, { useState, useEffect } from 'react';
import { formatToStopwatch } from '../utils';
import type { LiveStatusData, HistoryRecord } from '../utils';

interface DashboardProps {
  liveStatus: LiveStatusData;
  historyRecords: HistoryRecord[];
  onNavigateTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ liveStatus, historyRecords, onNavigateTab }) => {
  const [fireFrame, setFireFrame] = useState(1);

  // 140ms fire animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFireFrame((prev) => (prev === 10 ? 1 : prev + 1));
    }, 140);
    return () => clearInterval(interval);
  }, []);

  const frameStr = String(fireFrame).padStart(2, '0');
  const fireRedUrl = `https://assets.codepen.io/11339822/RED-${frameStr}.png`;
  const fireYellowUrl = `https://assets.codepen.io/11339822/YELLOW-${frameStr}.png`;

  // Constants
  const TWELVE_HOURS = 43200000;
  const progressPercent = Math.min((liveStatus.totalTimeMs / TWELVE_HOURS) * 100, 100);

  // Weekday Streak Indicators
  const weekdayCircles = () => {
    const circles = [];
    const weekdays = ['M', 'T', 'W', 'Th', 'F', 'S', 'S'];
    const today = new Date();
    const jsDay = today.getDay();
    const todayIndex = jsDay === 0 ? 6 : jsDay - 1; // 0 (Mon) to 6 (Sun)

    // Build history map
    const historyMap: Record<string, number> = {};
    historyRecords.forEach((doc) => {
      historyMap[doc.date] = doc.totalTimeMs;
    });

    for (let i = 0; i < 7; i++) {
      const loopDate = new Date(today);
      loopDate.setDate(today.getDate() - todayIndex + i);
      const loopStr = loopDate.toLocaleDateString();

      let circleClass = "w-9 h-9 rounded-full border-2 border-neutral-800 flex justify-center items-center bg-black/40 relative overflow-hidden";
      let hasFire = false;
      let hasMissed = false;

      if (i < todayIndex) {
        // Past days
        if (historyMap[loopStr] >= TWELVE_HOURS) {
          hasFire = true;
          circleClass = "w-9 h-9 rounded-full flex justify-center items-center bg-orange-500/10 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
        } else {
          hasMissed = true;
          circleClass = "w-9 h-9 rounded-full flex justify-center items-center bg-red-950/20 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        }
      } else if (i === todayIndex) {
        // Today
        circleClass = "w-9 h-9 rounded-full border-2 border-cyan-400 flex justify-center items-center bg-black/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]";
      }

      circles.push(
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 font-mono">{weekdays[i]}</span>
          <div className={circleClass}>
            {hasFire && <span className="text-sm drop-shadow-[0_0_5px_rgba(249,115,22,0.7)]">🔥</span>}
            {hasMissed && <span className="text-sm drop-shadow-[0_0_5px_rgba(239,68,68,0.7)] text-red-500 font-black">×</span>}
          </div>
        </div>
      );
    }
    return circles;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center pt-24 pb-12 px-5 select-none">
      
      {/* 1. TOP RIGHT STREAK WIDGET */}
      <div className="streak-widget-container group fixed top-6 right-6 w-36 h-14 z-[90] cursor-pointer">
        {/* Simple view */}
        <div className="widget-simple absolute inset-0 flex items-center justify-between px-4 bg-slate-950/80 border border-white/10 rounded-2xl shadow-xl transition-all duration-300 group-hover:opacity-0 group-hover:invisible">
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-neutral-500 tracking-widest font-mono">STREAK</span>
            <span className="text-xl font-black text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">{liveStatus.streak}</span>
          </div>
          <div className="w-10 h-10 relative">
            <div
              className="w-full h-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${fireRedUrl})` }}
            >
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat scale-90"
                style={{ backgroundImage: `url(${fireYellowUrl})` }}
              />
            </div>
          </div>
        </div>

        {/* Hover Hoverpopover View */}
        <div className="streak-popover-large absolute top-0 right-0 w-[320px] bg-slate-950 border border-white/15 rounded-3xl p-6 shadow-2xl z-[100] flex flex-col gap-5 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 cursor-default">
          <div className="flex items-center gap-4 bg-amber-500/5 p-4 border border-amber-500/10 rounded-2xl">
            <div className="text-4xl font-black bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              {liveStatus.streak}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">Daily Streak Active!</h3>
              <p className="text-[10px] text-neutral-400 leading-relaxed">Don't break the momentum! Padhai chalu rehni chahiye.</p>
            </div>
          </div>

          {/* Circles */}
          <div className="flex justify-between border-t border-b border-white/5 py-4">
            {weekdayCircles()}
          </div>

          <div className="text-left">
            <div className="flex justify-between font-mono text-[11px] font-bold mb-1.5">
              <span className="text-neutral-400">Watch Hours</span>
              <span className="text-neutral-200">
                {Math.floor(liveStatus.totalTimeMs / 3600000)}h {Math.floor((liveStatus.totalTimeMs % 3600000) / 60000)}m
                <span className="text-neutral-500 font-normal"> / 12h</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 border border-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Show Study Vault History
          </button>
        </div>
      </div>

      <div className="w-full max-w-[500px] flex flex-col items-center mt-6">
        
        {/* Streak glow indicator bar */}
        <div className="relative w-full max-w-[340px] h-[72px] mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-white/10 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-30" />
          <div className="flex justify-between items-center h-full px-6 relative z-10">
            <div className="text-left">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Today's Streak</span>
              <div className="text-xl font-extrabold text-amber-400 font-display uppercase tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                {liveStatus.streak} Days Streak
              </div>
            </div>
            
            {/* Animated fire widget inside card */}
            <div className="w-14 h-14 relative flex items-center justify-center">
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat scale-110"
                style={{ backgroundImage: `url(${fireRedUrl})` }}
              >
                <div
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat scale-90"
                  style={{ backgroundImage: `url(${fireYellowUrl})` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. SUBJECT BUTTONS SPLIT */}
        <div className="flex justify-center gap-3.5 mb-8 w-full">
          {['Physics', 'Chemistry', 'Maths'].map((sub) => {
            const isActive = liveStatus.isStudying.includes(sub);
            const btnColor = sub === 'Physics' ? 'text-[#4DA8FF]' : sub === 'Chemistry' ? 'text-[#3DFF8F]' : 'text-[#FF7B4D]';

            return (
              <div
                key={sub}
                className={`py-2.5 px-6 rounded-full border font-bold text-xs select-none transition-all duration-300 font-mono tracking-wider ${
                  isActive 
                    ? 'bg-white/5 border-white/20 text-white shadow-lg scale-102' 
                    : 'bg-black/40 border-white/5 text-neutral-500'
                }`}
              >
                <span className="flex items-center gap-1.5 justify-center">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-current animate-ping' : 'bg-neutral-700'} ${btnColor}`} />
                  {sub.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3. BIG TIME DISPLAY */}
        <div className="text-[76px] sm:text-[84px] font-black text-white leading-none font-mono tracking-wide drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-8">
          {formatToStopwatch(liveStatus.totalTimeMs)}
        </div>

        {/* 4. CURRENT ACTIVE LECTURE TARGET STATUS */}
        <div className="w-full bg-slate-950/40 border border-white/5 p-6 rounded-2xl flex flex-col gap-3 relative overflow-hidden backdrop-blur-md motionsite-card-shine">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20" />
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-mono">Current Live Session</span>
            <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-cyan-400 bg-cyan-400/5 px-2 py-0.5 rounded-full border border-cyan-400/10">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              ONLINE
            </span>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-xs text-neutral-400 font-mono">Current Focus Activity:</span>
            <span className="text-sm text-neutral-200 font-semibold leading-relaxed truncate">
              {liveStatus.isStudying.includes("None") || liveStatus.isStudying === ""
                ? "Relaxing / Idle" 
                : `Studying: ${liveStatus.isStudying}`}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
