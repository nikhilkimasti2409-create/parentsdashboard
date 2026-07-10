import React from 'react';
import { CheckCircle2, Circle, Calendar, CheckSquare } from 'lucide-react';

interface TasksProps {
  tasks: Array<{ text: string; completed: boolean }>;
}

const Tasks: React.FC<TasksProps> = ({ tasks }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="min-h-[calc(100dvh-80px)] w-full flex flex-col items-center pt-20 pb-12 px-5">
      <div className="w-full max-w-[650px]">
        
        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-4xl font-extrabold font-display premium-glow-text animate-gradient-shift uppercase tracking-wider">
              Student Tasks 📋
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">Read-only view of child's today's checklist.</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-neutral-400">
            <Calendar className="w-3.5 h-3.5" /> TODAY
          </div>
        </div>

        {/* Task Box Panel */}
        <div className="bg-slate-950/40 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden motionsite-card-shine">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[1px]" />
          
          {/* Header Stats */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-red-400" /> Daily Target Checklist
            </h3>
            <div className="flex gap-2">
              <span className="py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] font-mono">
                {completedCount} DONE
              </span>
              <span className="py-1 px-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] font-mono">
                {pendingCount} PENDING
              </span>
            </div>
          </div>

          {/* Checklist List */}
          <ul className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1.5 scrollbar-thin">
            {tasks.length === 0 ? (
              <div className="text-neutral-500 text-center py-12 font-mono text-xs border border-dashed border-white/5 rounded-2xl bg-black/10">
                Child has not added any targets for today yet.
              </div>
            ) : (
              tasks.map((task, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-4 bg-black/25 p-4 border rounded-2xl transition-all duration-300 ${
                    task.completed 
                      ? 'border-emerald-500/10 bg-emerald-500/2 opacity-75' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-600" />
                    )}
                  </div>
                  <span
                    className={`text-sm select-none break-words text-left font-sans flex-1 min-w-0 ${
                      task.completed 
                        ? 'line-through text-neutral-500 font-normal' 
                        : 'text-neutral-200 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Tasks;
