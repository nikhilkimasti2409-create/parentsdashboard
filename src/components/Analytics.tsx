import React, { useState, useEffect } from 'react';
import { Play, ShieldCheck, BookOpen, Clock } from 'lucide-react';
import { fetchDistractionLogs, formatMsToHrsMinsSecs } from '../utils';
import type { LiveStatusData, HistoryRecord, DistractionLog } from '../utils';

interface AnalyticsProps {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  historyRecords: HistoryRecord[];
  liveStatus: LiveStatusData;
}

const Analytics: React.FC<AnalyticsProps> = ({ selectedDate, setSelectedDate, historyRecords, liveStatus }) => {
  const [distractionLogs, setDistractionLogs] = useState<DistractionLog[]>([]);
  const [loadingDistractions, setLoadingDistractions] = useState(false);

  const todayStr = new Date().toLocaleDateString();
  const targetDateStr = selectedDate || todayStr;

  // Recess privacy window checker (8:00 PM to 9:30 PM)
  const isFreeTimeNow = () => {
    if (selectedDate) return false; // For past dates, show full logs
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const totalMins = (hours * 60) + mins;
    return totalMins >= 1200 && totalMins <= 1290;
  };
  const isFree = isFreeTimeNow();

  // Determine what numbers to render (Live vs Historical)
  let physicsTime = 0;
  let chemistryTime = 0;
  let mathsTime = 0;
  let totalTime = 0;
  let screenTimeData: Record<string, { time: number; url: string; notes?: string }> = {};

  if (!selectedDate) {
    // Live Mode
    totalTime = liveStatus.totalTimeMs;
    screenTimeData = liveStatus.screenTimeData || {};
    // Extract subject splits from live screenTimeData
    Object.values(screenTimeData).forEach((item) => {
      const u = item.url.toLowerCase();
      if (u.includes('physics')) physicsTime += item.time;
      else if (u.includes('chemistry')) chemistryTime += item.time;
      else if (u.includes('maths') || u.includes('mathematics')) mathsTime += item.time;
    });
  } else {
    // History Mode
    const hist = historyRecords.find(r => r.date === selectedDate);
    if (hist) {
      totalTime = hist.totalTimeMs;
      physicsTime = hist.physicsTime;
      chemistryTime = hist.chemTime;
      mathsTime = hist.mathsTime;
    }
  }

  // Load distraction logs for targeted date
  useEffect(() => {
    setLoadingDistractions(true);
    fetchDistractionLogs(targetDateStr)
      .then(logs => {
        setDistractionLogs(logs);
        setLoadingDistractions(false);
      })
      .catch(() => {
        setDistractionLogs([]);
        setLoadingDistractions(false);
      });
  }, [targetDateStr]);

  // Platform buckets
  const platformTotals: Record<string, number> = {
    'YouTube': 0,
    'Physics Wallah': 0,
    'Instagram': 0,
    'Gemini AI': 0,
    'Movies/Series': 0,
    'Other': 0,
  };

  const entries = Object.entries(screenTimeData);
  entries.forEach(([_, item]) => {
    const u = item.url.toLowerCase();
    if (u.includes('youtube.com')) platformTotals['YouTube'] += item.time;
    else if (u.includes('pw.live')) platformTotals['Physics Wallah'] += item.time;
    else if (u.includes('instagram.com')) platformTotals['Instagram'] += item.time;
    else if (u.includes('gemini.google')) platformTotals['Gemini AI'] += item.time;
    else if (u.includes('netmirror') || u.includes('tmovies') || u.includes('cineby'))
      platformTotals['Movies/Series'] += item.time;
    else platformTotals['Other'] += item.time;
  });

  const sortedEntries = [...entries].sort((a, b) => b[1].time - a[1].time);

  const totalSubjectsTime = physicsTime + chemistryTime + mathsTime;
  const physPercent = totalSubjectsTime > 0 ? (physicsTime / totalSubjectsTime) * 100 : 0;
  const chemPercent = totalSubjectsTime > 0 ? (chemistryTime / totalSubjectsTime) * 100 : 0;
  const mathPercent = totalSubjectsTime > 0 ? (mathsTime / totalSubjectsTime) * 100 : 0;

  const lectureTime = platformTotals['Physics Wallah'] + platformTotals['YouTube'];
  const lecturePercent = Math.min((lectureTime / 43200000) * 100, 100);

  const getPlatformColors = (plat: string) => {
    switch (plat) {
      case 'YouTube':
        return 'border-red-500/20 bg-red-950/20 text-red-400';
      case 'Physics Wallah':
        return 'border-amber-500/20 bg-amber-950/20 text-amber-400';
      case 'Instagram':
        return 'border-pink-500/20 bg-pink-950/20 text-pink-400';
      case 'Gemini AI':
        return 'border-cyan-500/20 bg-cyan-950/20 text-cyan-400';
      case 'Movies/Series':
        return 'border-purple-500/20 bg-purple-950/20 text-purple-400';
      default:
        return 'border-neutral-500/20 bg-neutral-900/40 text-neutral-400';
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center pt-20 pb-12 px-5">
      <div className="w-full max-w-[850px]">
        
        {/* Title */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-display premium-glow-text animate-gradient-shift uppercase tracking-wider">
              Analytics breakdown 📊
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1" id="currentDateDisplay">
              {selectedDate ? `⏳ Historical Data: ${selectedDate}` : `🟢 Live Mode: Today (${todayStr})`}
            </p>
          </div>
          
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold font-mono tracking-wider hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
            >
              🔄 SWITCH BACK TO LIVE TODAY
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Card 1: Subject Metrics */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md relative overflow-hidden motionsite-card-shine">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-[1px]" />
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" /> Subject Splits
            </h3>

            {/* Physics */}
            <div className="mb-5">
              <div className="flex justify-between font-bold text-xs mb-2 font-mono">
                <span className="text-[#4DA8FF] tracking-wider font-display">PHYSICS</span>
                <span className="text-neutral-400 font-normal">
                  {formatMsToHrsMinsSecs(physicsTime)} ({physPercent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 border border-white/5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${physPercent}%` }}
                  className="h-full rounded-full bg-[#4DA8FF] shadow-[0_0_10px_rgba(77,168,255,0.4)] transition-all duration-[1s]"
                />
              </div>
            </div>

            {/* Chemistry */}
            <div className="mb-5">
              <div className="flex justify-between font-bold text-xs mb-2 font-mono">
                <span className="text-[#3DFF8F] tracking-wider font-display">CHEMISTRY</span>
                <span className="text-neutral-400 font-normal">
                  {formatMsToHrsMinsSecs(chemistryTime)} ({chemPercent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 border border-white/5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${chemPercent}%` }}
                  className="h-full rounded-full bg-[#3DFF8F] shadow-[0_0_10px_rgba(61,255,143,0.4)] transition-all duration-[1s]"
                />
              </div>
            </div>

            {/* Maths */}
            <div className="mb-6">
              <div className="flex justify-between font-bold text-xs mb-2 font-mono">
                <span className="text-[#FF7B4D] tracking-wider font-display">MATHEMATICS</span>
                <span className="text-neutral-400 font-normal">
                  {formatMsToHrsMinsSecs(mathsTime)} ({mathPercent.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-950 border border-white/5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${mathPercent}%` }}
                  className="h-full rounded-full bg-[#FF7B4D] shadow-[0_0_10px_rgba(255,123,77,0.4)] transition-all duration-[1s]"
                />
              </div>
            </div>

            {/* Total Class/Lecture progress */}
            <div className="border-t border-white/5 pt-4 mt-6">
              <div className="flex justify-between items-center mb-2 font-mono">
                <span className="text-rose-500 font-bold text-xs uppercase tracking-wider">Video Lecture / Classes</span>
                <span className="text-neutral-300 text-sm font-bold">{formatMsToHrsMinsSecs(lectureTime)}</span>
              </div>
              <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${lecturePercent}%` }}
                  className="h-full bg-rose-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-500"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Total Session Output */}
          <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden motionsite-card-shine">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 font-display w-full text-left flex items-center gap-2">
              <Play className="w-5 h-5 text-red-400" /> Focus Session Output
            </h3>
            
            <div className="flex justify-center items-center py-6 w-full relative">
              <div className="w-48 h-48 rounded-full border border-red-500/20 flex flex-col justify-center items-center bg-slate-950/80 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative">
                <div className="absolute inset-2 rounded-full border border-dashed border-red-500/10 animate-[spin_40s_linear_infinite]" />
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-mono">Total Study Time</span>
                <span className="text-3xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {formatMsToHrsMinsSecs(totalTime)}
                </span>
                {totalTime >= 43200000 && (
                  <span className="absolute -bottom-2 px-3 py-1 bg-gradient-to-r from-red-500 to-amber-500 text-neutral-950 text-[10px] font-black font-mono rounded-full uppercase tracking-wider shadow">
                    🔥 12H REACHED
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Screen time details */}
        <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md relative overflow-hidden mb-8 motionsite-card-shine">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
          <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-550" /> Live Web Screen Time
          </h3>

          {/* Platform Summaries */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            {isFree ? (
              <div className="text-center py-6 text-xs font-mono font-bold text-cyan-400 border border-cyan-500/25 bg-cyan-950/20 rounded-2xl w-full select-none tracking-wide">
                🏖️ RECESS WINDOW ACTIVE (8:00 PM - 9:30 PM) — Activity breakdowns are hidden for student privacy.
              </div>
            ) : (
              Object.entries(platformTotals).map(([plat, ms]) => {
                if (ms === 0) return null;
                const colorTag = getPlatformColors(plat);
                return (
                  <div
                    key={plat}
                    className={`border py-3 px-5 rounded-2xl min-w-[150px] text-center flex flex-col gap-1 backdrop-blur-md ${colorTag}`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold">{plat}</span>
                    <strong className="text-xl font-bold font-mono">{formatMsToHrsMinsSecs(ms)}</strong>
                  </div>
                );
              })
            )}
          </div>

          {/* Detailed entries list */}
          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin">
            {isFree ? (
              <div className="text-neutral-500 text-center py-12 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10 select-none">
                🔒 Detailed screen time activity list is private during daily free time.
              </div>
            ) : sortedEntries.length === 0 ? (
              <div className="text-neutral-500 text-center py-12 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10">
                No active screen time logs recorded for this date.
              </div>
            ) : (
              sortedEntries.map(([title, data], index) => {
                return (
                  <div
                    key={index}
                    title={`${title}\nURL: ${data.url}`}
                    className="flex justify-between items-center bg-black/25 p-4 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col gap-1 max-w-[75%] text-left">
                      <span className="text-sm text-neutral-200 truncate font-semibold font-sans">
                        {title}
                      </span>
                      {data.notes && (
                        <span className="text-xs text-amber-400 font-mono italic leading-relaxed mt-0.5">
                          📝 Notes: {data.notes}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 truncate font-mono">{data.url}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        {formatMsToHrsMinsSecs(data.time)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audit Log: Clean Browser History */}
        <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md relative overflow-hidden motionsite-card-shine">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-[1px]" />
          <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 mb-6 font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Child's Browser Navigation History (Synced)
          </h3>

          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin">
            {isFree ? (
              <div className="text-neutral-500 text-center py-12 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10 select-none">
                🔒 Live browser navigation logs are private during daily free time (8:00 PM - 9:30 PM).
              </div>
            ) : loadingDistractions ? (
              <div className="text-red-400 text-center py-12 font-mono text-xs">
                Fetching browser history audit logs... ⏳
              </div>
            ) : distractionLogs.length === 0 ? (
              <div className="text-neutral-500 text-center py-12 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10">
                No synced browser navigation logs found for this date.
              </div>
            ) : (
              distractionLogs.map((log, index) => {
                return (
                  <div
                    key={index}
                    title={`${log.title}\nURL: ${log.url}`}
                    className="flex justify-between items-center bg-black/25 p-4 border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col gap-1 max-w-[80%] text-left">
                      <span className="text-sm text-neutral-200 truncate font-semibold font-sans">
                        {log.title || "No Title Page"}
                      </span>
                      <span className="text-[10px] text-neutral-500 truncate font-mono">{log.url}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 font-mono text-xs text-neutral-400 min-w-[120px]">
                      <span className="text-cyan-400">{new Date(log.lastVisitTime).toLocaleTimeString()}</span>
                      <span>Visits: {log.visitCount}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
