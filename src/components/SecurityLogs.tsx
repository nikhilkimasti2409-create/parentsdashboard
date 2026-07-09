import React from 'react';
import { ShieldAlert, AlertTriangle, Trash2, ShieldCheck } from 'lucide-react';
import { FIREBASE_PROJECT_ID } from '../utils';
import type { SecurityViolation } from '../utils';

interface SecurityLogsProps {
  violations: SecurityViolation[];
  onRefresh: () => void;
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ violations, onRefresh }) => {
  const [clearing, setClearing] = React.useState(false);

  // Clear security logs from Firestore
  const handleClearLogs = async () => {
    if (!window.confirm("🚨 WARNING!\n\nAre you sure you want to clear all security violation logs from the database? This action is permanent!")) {
      return;
    }
    
    setClearing(true);
    try {
      // Loop over and delete documents
      for (const log of violations) {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/SecurityViolations/${log.id}`;
        await fetch(url, { method: 'DELETE' });
      }
      alert("✅ All security logs deleted successfully!");
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Failed to delete logs. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center pt-20 pb-12 px-5">
      <div className="w-full max-w-[800px]">
        
        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              Security Shield 🛡️
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Real-time alerts of child's rule infractions and study distractions.</p>
          </div>
          
          {violations.length > 0 && (
            <button
              onClick={handleClearLogs}
              disabled={clearing}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl flex items-center gap-1.5 font-mono cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
            >
              <Trash2 className="w-4 h-4" /> {clearing ? 'CLEARING...' : 'CLEAR LOGS'}
            </button>
          )}
        </div>

        {/* Violations Board */}
        <div className="bg-slate-950/40 border border-red-500/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden motionsite-card-shine">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Active Alert Board
            </h3>
            <span className="font-mono text-xs text-red-400 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full font-bold">
              {violations.length} INFRACTIONS DETECTED
            </span>
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1.5 scrollbar-thin">
            {violations.length === 0 ? (
              <div className="text-emerald-400 text-center py-16 font-mono text-sm border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/2 flex flex-col items-center gap-2">
                <ShieldCheck className="w-12 h-12 text-emerald-400 animate-bounce" />
                <span>Everything Secure. No distractions or safety bypasses detected!</span>
              </div>
            ) : (
              violations.map((violation) => {
                return (
                  <div
                    key={violation.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-red-950/5 p-4 border border-red-500/10 hover:border-red-500/25 rounded-2xl transition-all duration-300 gap-3"
                  >
                    <div className="flex items-start gap-4 text-left">
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-neutral-200 font-bold font-sans">
                          {violation.details}
                        </span>
                        <span className="text-[10px] text-red-400 font-mono bg-red-500/5 px-2 py-0.5 rounded-md border border-red-500/10 w-fit">
                          infraction type: {violation.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 font-mono text-xs text-neutral-400 shrink-0 select-none self-end sm:self-center">
                      <span className="text-red-400 font-bold">{violation.dateStr.replace(/-/g, '/')}</span>
                      <span>{new Date(violation.timestamp).toLocaleTimeString()}</span>
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

export default SecurityLogs;
