import React from 'react';
import { BarChart3, Search } from 'lucide-react';
import { formatMsToHrsMinsSecs } from '../utils';
import type { HistoryRecord } from '../utils';

interface HistoryProps {
  historyRecords: HistoryRecord[];
  onSelectDate: (date: string) => void;
}

const History: React.FC<HistoryProps> = ({ historyRecords, onSelectDate }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

  const filteredRecords = historyRecords.filter(r => r.date.includes(searchQuery));

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center pt-20 pb-12 px-5">
      <div className="w-full max-w-[850px]">
        
        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-display premium-glow-text animate-gradient-shift uppercase tracking-wider">
              Study Vault 🗄️
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Review historical focus records, streak counts, and class logs.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-neutral-400">
            {historyRecords.length} RECORDS
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full mb-8 shadow-2xl">
          <Search className="absolute left-5 top-4.5 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search dates (e.g., DD/MM/YYYY)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-950/60 border border-white/15 rounded-2xl text-white text-base font-mono outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 backdrop-blur-md"
          />
        </div>

        {/* History List */}
        <ul className="flex flex-col gap-4">
          {filteredRecords.length === 0 ? (
            <div className="text-neutral-500 text-center py-16 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10">
              No historical records found.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const pTime = record.physicsTime || 0;
              const cTime = record.chemTime || 0;
              const mTime = record.mathsTime || 0;
              const subTotal = pTime + cTime + mTime || 1;

                const isExpanded = expandedDate === record.date;

                return (
                  <li
                    key={record.date}
                    className={`group relative bg-slate-950/40 border rounded-2xl overflow-hidden backdrop-blur-md flex flex-col transition-all duration-500 ${
                      isExpanded
                        ? 'border-red-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.5)] bg-slate-950/80 scale-[1.01]'
                        : 'border-white/5 hover:border-white/10 hover:bg-slate-950/60'
                    }`}
                  >
                    {/* Subtle background glow on card hover */}
                    <div className="absolute top-[-30px] right-[-20px] w-[140px] h-[140px] bg-red-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                    
                    {/* Header (Always Visible) */}
                    <div 
                      onClick={() => setExpandedDate(isExpanded ? null : record.date)}
                      className={`relative z-10 p-5 px-6 flex justify-between items-center cursor-pointer border-b transition-all duration-500 ${
                        isExpanded ? 'border-white/5' : 'border-transparent group-hover:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="font-display font-bold text-lg text-white">{record.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-base text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]">
                          {formatMsToHrsMinsSecs(record.totalTimeMs)}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 group-hover:text-red-400 transition-colors">
                          {isExpanded ? 'TAP TO COLLAPSE ▴' : 'TAP TO EXPLAIN ▾'}
                        </span>
                      </div>
                    </div>

                    {/* Accordion Details (Expands on Tap) */}
                    <div className={`relative z-10 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isExpanded
                        ? 'max-h-[500px] opacity-100 p-5 sm:p-6'
                        : 'max-h-0 opacity-0 px-5 sm:px-6'
                    }`}>
                      <div className="flex flex-col md:flex-row gap-6 items-stretch pt-2">
                      
                      {/* Left Column: Stats & Button */}
                      <div className="flex flex-col justify-between gap-4 md:w-[40%]">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Streak Output</span>
                          <span className="py-2.5 px-3 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5 font-mono">
                            🔥 {record.streak} DAYS STREAK
                          </span>
                        </div>

                        {/* Study Notes Logs */}
                        {record.studyLogs && record.studyLogs.length > 0 && (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Lecture Study Logs</span>
                            <div className="flex flex-col gap-1.5 max-h-[90px] overflow-y-auto pr-1 scrollbar-thin">
                              {record.studyLogs.map((log: string, idx: number) => (
                                <div key={idx} className="text-[11px] font-mono text-amber-400/90 bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl leading-relaxed">
                                  📖 {log}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aesthetic View Details Button */}
                        <button
                          onClick={() => onSelectDate(record.date)}
                          className="relative bg-slate-900 border border-white/10 hover:border-red-500/50 hover:bg-slate-950 text-neutral-200 py-3.5 px-4 font-bold text-xs rounded-xl overflow-hidden cursor-pointer w-full text-center transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider font-display shadow-md active:scale-95 group/btn"
                        >
                          <BarChart3 className="w-4 h-4 text-red-450 group-hover/btn:scale-110 transition-transform" />
                          View Detailed Analysis
                        </button>
                      </div>

                      {/* Right Column: Subjects Breakdown */}
                      <div className="flex-1 flex flex-col gap-4 bg-black/40 border border-white/5 p-5 rounded-2xl">
                        <span className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Subject Breakdown</span>
                        
                        {/* Physics */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-mono text-xs text-neutral-300">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded bg-[#4DA8FF] shadow-[0_0_8px_rgba(77,168,255,0.4)]" /> 
                              Physics
                            </span>
                            <span>{formatMsToHrsMinsSecs(pTime)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                            <div className="h-full bg-[#4DA8FF] rounded-full" style={{ width: `${(pTime / subTotal) * 100}%` }} />
                          </div>
                        </div>

                        {/* Chemistry */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-mono text-xs text-neutral-300">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded bg-[#3DFF8F] shadow-[0_0_8px_rgba(61,255,143,0.4)]" /> 
                              Chemistry
                            </span>
                            <span>{formatMsToHrsMinsSecs(cTime)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                            <div className="h-full bg-[#3DFF8F] rounded-full" style={{ width: `${(cTime / subTotal) * 100}%` }} />
                          </div>
                        </div>

                        {/* Maths */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-mono text-xs text-neutral-300">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded bg-[#FF7B4D] shadow-[0_0_8px_rgba(255,123,77,0.4)]" /> 
                              Maths
                            </span>
                            <span>{formatMsToHrsMinsSecs(mTime)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF7B4D] rounded-full" style={{ width: `${(mTime / subTotal) * 100}%` }} />
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default History;
